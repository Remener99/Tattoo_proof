/**
 * SKINVAULT — lead receiver (Google Apps Script web app)
 *
 * What this is: a small web app that lives inside your Google account (no
 * Google Cloud, no service account, no billing) and appends each lead from the
 * landing form as a new row in your spreadsheet.
 *
 * HOW TO SET UP (5 minutes):
 *
 * 1. Open your spreadsheet in Google Sheets.
 * 2. Menu: Extensions → Apps Script (Расширения → Apps Script).
 * 3. Replace the default content with THIS FILE (copy-paste the code below).
 * 4. Set SCRIPT_SECRET below to a random string, e.g. "k9f2...". Remember it —
 *    the same value must go to Cloudflare as the LEADS_SECRET env var.
 *    (Leave SHEET_ID empty to use the spreadsheet the script is bound to.)
 * 5. Deploy: Deploy → New deployment → type "Web app":
 *      - Execute as:  Me
 *      - Who has access: Anyone
 *    → Deploy → copy the URL (ends with /exec).
 * 6. In Cloudflare Pages: add env vars
 *      GOOGLE_SHEET_WEBHOOK_URL = that /exec URL
 *      LEADS_SECRET             = SCRIPT_SECRET
 *    and redeploy.
 *
 * Note: after editing the script, redeploy (Deploy → Manage deployments →
 * Edit → New version) so changes go live.
 */

const SHEET_ID = ""; // optional; empty = use the sheet this script is bound to
const SCRIPT_SECRET = "change-me"; // MUST match LEADS_SECRET in Cloudflare

const HEADERS = [
  "timestamp",
  "telegram",
  "vault_id",
  "slot",
  "user_id",
  "first_name",
  "last_name",
  "language",
  "start_param",
];

function getTargetSheet_() {
  if (SHEET_ID) {
    return SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("No active spreadsheet — bind script to sheet or set SHEET_ID");
  return ss.getActiveSheet() || ss.getSheets()[0];
}

function respond_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return respond_({ ok: false, error: "empty_body" });
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      return respond_({ ok: false, error: "invalid_json" });
    }

    // Shared-secret check: rejects direct spam to this URL.
    // Trim both sides to avoid accidental whitespace mismatch.
    const incomingSecret = String(data.secret || "").trim();
    const expectedSecret = String(SCRIPT_SECRET || "").trim();
    if (!expectedSecret || expectedSecret === "change-me") {
      // Fail open with warning? No — better to error clearly so user fixes it.
      // But we still allow if both are change-me for initial testing.
      if (incomingSecret !== expectedSecret) {
        return respond_({ ok: false, error: "bad_secret", hint: "SCRIPT_SECRET is still default change-me" });
      }
    } else if (incomingSecret !== expectedSecret) {
      return respond_({ ok: false, error: "bad_secret" });
    }

    const telegram = String(data.telegram || "").trim().replace(/^@/, "");
    if (telegram.length < 4 || /\s/.test(telegram)) {
      return respond_({ ok: false, error: "invalid_telegram" });
    }

    const sheet = getTargetSheet_();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    sheet.appendRow([
      new Date().toISOString(),
      telegram,
      data.vaultId || "",
      data.slot || "",
      data.userId || "",
      data.firstName || "",
      data.lastName || "",
      data.languageCode || "",
      data.startParam || "",
    ]);

    return respond_({ ok: true });
  } catch (err) {
    return respond_({ ok: false, error: "internal", message: String(err) });
  }
}

/** GET / used to sanity-check the deployment in a browser. */
function doGet() {
  return ContentService.createTextOutput(
    "SKINVAULT lead receiver is up. Use POST with a JSON body. Secret set: " +
      (SCRIPT_SECRET && SCRIPT_SECRET !== "change-me" ? "yes" : "NO - change it!"),
  );
}
