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
  return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID).getSheets()[0] : SpreadsheetApp.getActiveSheet();
}

function respond_(obj, status) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return respond_({ ok: false, error: "empty_body" }, 400);
    }

    const data = JSON.parse(e.postData.contents);

    // Shared-secret check: rejects direct spam to this URL.
    if (data.secret !== SCRIPT_SECRET) {
      return respond_({ ok: false, error: "bad_secret" }, 403);
    }

    const telegram = String(data.telegram || "").trim().replace(/^@/, "");
    if (telegram.length < 4) {
      return respond_({ ok: false, error: "invalid_telegram" }, 400);
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

    return respond_({ ok: true }, 200);
  } catch (err) {
    return respond_({ ok: false, error: String(err) }, 500);
  }
}

/** GET / used to sanity-check the deployment in a browser. */
function doGet() {
  return ContentService.createTextOutput(
    "SKINVAULT lead receiver is up. Use POST with a JSON body.",
  );
}
