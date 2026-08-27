import { getTelegramUser, getWebApp } from "@/lib/telegram";

/**
 * Client-side lead submission.
 *
 * Posts to the same origin (`/api/lead`) so it works in production without
 * CORS. During local development set VITE_API_BASE to your deployed origin
 * (e.g. https://your-project.pages.dev) to test against the real endpoint.
 *
 * In dev without VITE_API_BASE, vite.config.ts provides a mock handler that
 * returns {ok:true} so you can test the UI flow locally.
 */

const API_BASE: string = (import.meta.env.VITE_API_BASE as string | undefined) ?? "/api";

export type LeadPayload = {
  telegram: string;
  vaultId: string;
  slot: string;
  userId?: number;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  startParam?: string;
};

export type LeadErrorCode =
  | "invalid_telegram"
  | "invalid_json"
  | "missing_env"
  | "bad_secret"
  | "sheet_error"
  | "sheet_unreachable"
  | "internal"
  | "empty_body"
  | "network"
  | "not_found";

export class LeadSubmitError extends Error {
  code: LeadErrorCode;
  constructor(code: LeadErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export async function submitLead(payload: LeadPayload): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[leads] fetch failed", err);
    throw new LeadSubmitError("network", "network");
  }

  if (res.ok) {
    // Try to validate that body is actually {ok:true}, because Apps Script
    // sometimes returns 200 with ok:false
    try {
      const data = (await res.clone().json()) as { ok?: boolean; error?: string };
      if (data && data.ok === false && data.error) {
        throw new LeadSubmitError(data.error as LeadErrorCode, data.error);
      }
    } catch (e) {
      if (e instanceof LeadSubmitError) throw e;
      // if not JSON, ignore — treat as ok if HTTP ok
    }
    return;
  }

  // HTTP error path
  if (res.status === 404) {
    // Happens in dev when /api not proxied and no mock
    throw new LeadSubmitError(
      "not_found",
      "API not found — set VITE_API_BASE or run with mock enabled",
    );
  }

  let code: LeadErrorCode = `HTTP_${res.status}` as any;
  let message = `HTTP ${res.status}`;
  try {
    const data = (await res.json()) as { error?: string; hint?: string };
    if (data.error) {
      message = data.error;
      code = data.error as LeadErrorCode;
    }
  } catch {
    // keep generic
  }
  throw new LeadSubmitError(code, message);
}

/** Builds the payload, enriching it with the Telegram user from the Mini App. */
export function buildLeadPayload(telegram: string, vaultId: string, slot: string): LeadPayload {
  const user = getTelegramUser();
  return {
    telegram,
    vaultId,
    slot,
    userId: user?.id,
    firstName: user?.first_name,
    lastName: user?.last_name,
    languageCode: user?.language_code,
    startParam: getWebApp()?.initDataUnsafe?.start_param,
  };
}
