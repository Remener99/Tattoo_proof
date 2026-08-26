/**
 * Cloudflare Pages Function: POST /api/lead
 *
 * Receives a lead from the SKINVAULT landing form and writes it to a Google
 * Spreadsheet. Two modes (no bot token is ever needed):
 *
 *  A) Apps Script webhook — RECOMMENDED (no Google Cloud / service account):
 *     GOOGLE_SHEET_WEBHOOK_URL — deployed Apps Script "/exec" URL (see google/appsscript.gs)
 *     LEADS_SECRET              — shared secret, must match SCRIPT_SECRET in the script
 *
 *  B) Direct Google Sheets API (service account) — legacy fallback:
 *     GOOGLE_SERVICE_ACCOUNT_JSON — service-account key JSON
 *     GOOGLE_SHEET_ID             — spreadsheet id from the sheet URL
 *     GOOGLE_SHEET_RANGE          — optional, default "Лист1!A1"
 *
 * Env vars are set in the Pages project → Settings → Environment variables.
 */

type Env = {
  GOOGLE_SHEET_WEBHOOK_URL?: string;
  LEADS_SECRET?: string;
  GOOGLE_SERVICE_ACCOUNT_JSON?: string;
  GOOGLE_SHEET_ID?: string;
  GOOGLE_SHEET_RANGE?: string;
};

type Lead = {
  telegram?: string;
  vaultId?: string;
  slot?: string;
  userId?: number | string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  startParam?: string;
};

/* ------------------------------ responses ------------------------------ */

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

/* ---------------------- mode A: Apps Script webhook --------------------- */

async function sendToWebhook(lead: Lead, env: Env): Promise<Response> {
  const res = await fetch(env.GOOGLE_SHEET_WEBHOOK_URL as string, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      telegram: lead.telegram,
      vaultId: lead.vaultId ?? "",
      slot: lead.slot ?? "",
      userId: lead.userId ?? "",
      firstName: lead.firstName ?? "",
      lastName: lead.lastName ?? "",
      languageCode: lead.languageCode ?? "",
      startParam: lead.startParam ?? "",
      secret: env.LEADS_SECRET ?? "",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Apps Script webhook error", res.status, text.slice(0, 300));
    return json({ ok: false, error: "sheet_error" }, 502);
  }
  return json({ ok: true });
}

/* ------------------- mode B: Google Sheets API (legacy) ------------------ */

let cachedToken: { value: string; expiresAt: number } | null = null;

function base64UrlEncode(input: string | Uint8Array): string {
  const binary = typeof input === "string" ? btoa(input) : btoa(String.fromCharCode(...input));
  return binary.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToBytes(pem: string): Uint8Array {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "pkcs8",
    pemToBytes(pem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

/** Returns a Google OAuth2 access token for the spreadsheets scope (cached). */
async function getAccessToken(env: Env): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const creds = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON as string) as {
    client_email: string;
    private_key: string;
  };

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: creds.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const unsigned =
    base64UrlEncode(JSON.stringify(header)) + "." + base64UrlEncode(JSON.stringify(claims));
  const key = await importPrivateKey(creds.private_key);
  const sig = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    new TextEncoder().encode(unsigned),
  );
  const jwt = unsigned + "." + base64UrlEncode(new Uint8Array(sig));

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    throw new Error(`oauth2 token error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in?: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

async function sendToSheetsApi(lead: Lead, env: Env): Promise<Response> {
  const row = [
    new Date().toISOString(),
    lead.telegram,
    lead.vaultId ?? "",
    lead.slot ?? "",
    lead.userId ?? "",
    lead.firstName ?? "",
    lead.lastName ?? "",
    lead.languageCode ?? "",
    lead.startParam ?? "",
  ];

  const token = await getAccessToken(env);
  const range = env.GOOGLE_SHEET_RANGE || "Лист1!A1";
  const url =
    "https://sheets.googleapis.com/v4/spreadsheets/" +
    encodeURIComponent(env.GOOGLE_SHEET_ID as string) +
    "/values/" +
    encodeURIComponent(range) +
    ":append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Sheets API error", res.status, text.slice(0, 500));
    return json({ ok: false, error: "sheet_error" }, 502);
  }
  return json({ ok: true });
}

/* ------------------------------ handler --------------------------------- */

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // 1. Parse + validate the payload.
  let lead: Lead;
  try {
    lead = (await request.json()) as Lead;
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  if (!lead || typeof lead !== "object") {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const telegram =
    typeof lead.telegram === "string" ? lead.telegram.trim().replace(/^@/, "") : "";
  if (telegram.length < 4 || /\s/.test(telegram)) {
    return json({ ok: false, error: "invalid_telegram" }, 400);
  }
  lead.telegram = telegram;

  // 2. Route to the configured backend.
  try {
    if (env.GOOGLE_SHEET_WEBHOOK_URL) {
      return await sendToWebhook(lead, env);
    }
    if (env.GOOGLE_SERVICE_ACCOUNT_JSON && env.GOOGLE_SHEET_ID) {
      return await sendToSheetsApi(lead, env);
    }
    return json({ ok: false, error: "missing_env" }, 500);
  } catch (err) {
    console.error("append failed", err);
    return json({ ok: false, error: "internal" }, 500);
  }
}
