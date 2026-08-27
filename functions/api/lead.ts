/**
 * Cloudflare Pages Function: POST /api/lead
 * SKINVAULT — D1-first version (no Google required)
 *
 * Supported backends (any combination, at least one must succeed):
 *  1) D1 (LEADS_DB) — PRIMARY for this setup
 *  2) KV (LEADS_KV)
 *  3) Telegram (TELEGRAM_BOT_TOKEN + CHAT_ID)
 *  4) Generic webhook (LEADS_WEBHOOK_URL)
 *  5) Google Sheets (optional legacy)
 *
 * If no backend configured → {ok:true, mock:true} so form never breaks.
 */

type KVNamespace = {
  put: (key: string, value: string) => Promise<void>;
  get: (key: string) => Promise<string | null>;
  list?: (opts?: any) => Promise<any>;
};

type D1Database = {
  prepare: (query: string) => {
    bind: (...values: any[]) => {
      run: () => Promise<any>;
      first: () => Promise<any>;
      all: () => Promise<any>;
    };
  };
  exec: (query: string) => Promise<any>;
};

type Env = {
  // Primary — D1
  LEADS_DB?: D1Database;
  LEADS_KV?: KVNamespace;

  // Telegram (optional notification)
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;

  // Generic webhook
  LEADS_WEBHOOK_URL?: string;
  LEADS_SECRET?: string;

  // Google (optional legacy)
  GOOGLE_SHEET_WEBHOOK_URL?: string;
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
  // enriched server-side
  ip?: string;
  userAgent?: string;
};

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

/* ---------------------- D1 — PRIMARY ------------------------------- */

async function sendToD1(
  lead: Lead,
  env: Env,
  request: Request,
): Promise<{ ok: boolean; error?: string }> {
  if (!env.LEADS_DB) return { ok: false, error: "not_configured" };

  try {
    // Ensure table exists with full schema (idempotent)
    await env.LEADS_DB.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        telegram TEXT NOT NULL,
        vault_id TEXT,
        slot TEXT,
        user_id TEXT,
        first_name TEXT,
        last_name TEXT,
        language TEXT,
        start_param TEXT,
        ip TEXT,
        user_agent TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );
      CREATE INDEX IF NOT EXISTS idx_leads_telegram ON leads(telegram);
      CREATE INDEX IF NOT EXISTS idx_leads_timestamp ON leads(timestamp DESC);
    `);

    // Cloudflare request properties
    const ip =
      (request.headers.get("CF-Connecting-IP") ||
        request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
        "") as string;
    const ua = request.headers.get("User-Agent") || "";

    const ts = new Date().toISOString();

    await env.LEADS_DB.prepare(
      `INSERT INTO leads (timestamp, telegram, vault_id, slot, user_id, first_name, last_name, language, start_param, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        ts,
        lead.telegram ?? "",
        lead.vaultId ?? "",
        lead.slot ?? "",
        String(lead.userId ?? ""),
        lead.firstName ?? "",
        lead.lastName ?? "",
        lead.languageCode ?? "",
        lead.startParam ?? "",
        ip,
        ua.slice(0, 500),
      )
      .run();

    return { ok: true };
  } catch (err) {
    console.error("D1 insert failed", err);
    return { ok: false, error: "d1_error" };
  }
}

/* ---------------------- KV ----------------------------------------- */

async function sendToKV(lead: Lead, env: Env): Promise<{ ok: boolean; error?: string }> {
  if (!env.LEADS_KV) return { ok: false, error: "not_configured" };
  try {
    const key = `lead:${Date.now()}:${lead.telegram}`;
    const value = JSON.stringify({
      timestamp: new Date().toISOString(),
      telegram: lead.telegram,
      vaultId: lead.vaultId,
      slot: lead.slot,
      userId: lead.userId,
      firstName: lead.firstName,
      lastName: lead.lastName,
      languageCode: lead.languageCode,
      startParam: lead.startParam,
    });
    await env.LEADS_KV.put(key, value);
    return { ok: true };
  } catch (err) {
    console.error("KV put failed", err);
    return { ok: false, error: "kv_error" };
  }
}

/* ---------------------- Telegram (optional notify) ------------------ */

async function sendToTelegram(lead: Lead, env: Env): Promise<{ ok: boolean; error?: string }> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return { ok: false, error: "not_configured" };
  }

  const text = [
    `🔥 <b>SKINVAULT — новый лид (D1)</b>`,
    ``,
    `👤 Telegram: @${lead.telegram}`,
    `🆔 Vault: <code>${lead.vaultId || "-"}</code> | Slot: #${lead.slot || "-"}`,
    lead.userId ? `👤 User ID: ${lead.userId}` : null,
    lead.firstName ? `📛 Name: ${[lead.firstName, lead.lastName].filter(Boolean).join(" ")}` : null,
    lead.languageCode ? `🌐 Lang: ${lead.languageCode}` : null,
    lead.startParam ? `🚀 Start param: ${lead.startParam}` : null,
    ``,
    `⏰ ${new Date().toISOString()}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    const data = (await res.json()) as { ok?: boolean; description?: string };
    if (!res.ok || !data.ok) {
      console.error("Telegram API error", res.status, data);
      return { ok: false, error: data.description || `telegram_${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("Telegram fetch failed", err);
    return { ok: false, error: "telegram_unreachable" };
  }
}

/* ---------------------- Generic webhook ---------------------------- */

async function sendToGenericWebhook(
  lead: Lead,
  env: Env,
): Promise<{ ok: boolean; error?: string }> {
  if (!env.LEADS_WEBHOOK_URL) return { ok: false, error: "not_configured" };
  try {
    const res = await fetch(env.LEADS_WEBHOOK_URL, {
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
        timestamp: new Date().toISOString(),
        secret: env.LEADS_SECRET ?? "",
        source: "skinvault",
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.error("Webhook error", res.status, t.slice(0, 500));
      return { ok: false, error: "webhook_error" };
    }
    return { ok: true };
  } catch (err) {
    console.error("Webhook fetch failed", err);
    return { ok: false, error: "webhook_unreachable" };
  }
}

/* ---------------------- Google Sheets (legacy, optional) ----------- */

async function sendToGoogleWebhook(
  lead: Lead,
  env: Env,
): Promise<{ ok: boolean; error?: string }> {
  if (!env.GOOGLE_SHEET_WEBHOOK_URL) return { ok: false, error: "not_configured" };
  const payload = {
    telegram: lead.telegram,
    vaultId: lead.vaultId ?? "",
    slot: lead.slot ?? "",
    userId: lead.userId ?? "",
    firstName: lead.firstName ?? "",
    lastName: lead.lastName ?? "",
    languageCode: lead.languageCode ?? "",
    startParam: lead.startParam ?? "",
    secret: env.LEADS_SECRET ?? "",
  };
  try {
    const res = await fetch(env.GOOGLE_SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    const text = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Apps Script non-JSON", res.status, text.slice(0, 500));
      return { ok: false, error: "sheet_error" };
    }
    if (!res.ok || (data && data.ok === false)) {
      console.error("Apps Script error", data);
      return { ok: false, error: (data?.error as string) || "sheet_error" };
    }
    return { ok: true };
  } catch (err) {
    console.error("Apps Script fetch failed", err);
    return { ok: false, error: "sheet_unreachable" };
  }
}

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
async function getAccessToken(env: Env): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
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
  if (!res.ok) throw new Error(`oauth2 token error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as { access_token: string; expires_in?: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}
async function sendToSheetsApi(lead: Lead, env: Env): Promise<{ ok: boolean; error?: string }> {
  if (!env.GOOGLE_SERVICE_ACCOUNT_JSON || !env.GOOGLE_SHEET_ID)
    return { ok: false, error: "not_configured" };
  try {
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
      encodeURIComponent(env.GOOGLE_SHEET_ID) +
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
      return { ok: false, error: "sheet_error" };
    }
    return { ok: true };
  } catch (err) {
    console.error("Sheets API failed", err);
    return { ok: false, error: "sheet_error" };
  }
}

/* ------------------------------ handler ------------------------------- */

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  let lead: Lead;
  try {
    lead = (await request.json()) as Lead;
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  if (!lead || typeof lead !== "object") return json({ ok: false, error: "invalid_json" }, 400);

  const telegram =
    typeof lead.telegram === "string" ? lead.telegram.trim().replace(/^@/, "") : "";
  if (telegram.length < 4 || /\s/.test(telegram)) {
    return json({ ok: false, error: "invalid_telegram" }, 400);
  }
  lead.telegram = telegram;

  // Try backends in priority: D1 first (primary), then KV, Telegram, webhook, Google
  const results: { backend: string; result: { ok: boolean; error?: string } }[] = [];
  const backends: { name: string; fn: () => Promise<{ ok: boolean; error?: string }> }[] = [
    { name: "d1", fn: () => sendToD1(lead, env, request) },
    { name: "kv", fn: () => sendToKV(lead, env) },
    { name: "telegram", fn: () => sendToTelegram(lead, env) },
    { name: "webhook", fn: () => sendToGenericWebhook(lead, env) },
    { name: "google_webhook", fn: () => sendToGoogleWebhook(lead, env) },
    { name: "google_api", fn: () => sendToSheetsApi(lead, env) },
  ];

  let successCount = 0;
  let configuredCount = 0;

  for (const b of backends) {
    const r = await b.fn();
    if (r.error !== "not_configured") {
      configuredCount++;
      results.push({ backend: b.name, result: r });
      if (r.ok) successCount++;
    }
  }

  console.log(
    `[lead] @${lead.telegram} vault=${lead.vaultId} slot=${lead.slot} configured=${configuredCount} success=${successCount}`,
    results,
  );

  if (successCount > 0) {
    return json({ ok: true, backends: results.filter((r) => r.result.ok).map((r) => r.backend) });
  }

  if (configuredCount === 0) {
    console.warn("[lead] No backend configured — returning mock success. Bind D1 as LEADS_DB.");
    return json({ ok: true, mock: true, warning: "no_backend_configured — bind D1 LEADS_DB" });
  }

  const firstError = results.find((r) => !r.result.ok)?.result.error || "internal";
  const status =
    firstError === "invalid_telegram" ? 400 : firstError === "bad_secret" ? 403 : 502;

  return json({ ok: false, error: firstError, details: results }, status);
}

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  const { env } = context;
  const configured = {
    d1: Boolean(env.LEADS_DB),
    kv: Boolean(env.LEADS_KV),
    telegram: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
    webhook: Boolean(env.LEADS_WEBHOOK_URL),
    google_webhook: Boolean(env.GOOGLE_SHEET_WEBHOOK_URL),
    google_api: Boolean(env.GOOGLE_SERVICE_ACCOUNT_JSON && env.GOOGLE_SHEET_ID),
  };
  return json({
    ok: true,
    primary: "d1",
    configured,
    hint: "POST {telegram, vaultId, slot} to this endpoint. For D1, bind LEADS_DB in Pages → Settings → Functions → D1 bindings",
  });
}
