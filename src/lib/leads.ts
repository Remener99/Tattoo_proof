import { getTelegramUser, getWebApp } from "@/lib/telegram";

/**
 * Client-side lead submission.
 *
 * Posts to the same origin (`/api/lead`) so it works in production without
 * CORS. During local development set VITE_API_BASE to your deployed origin
 * (e.g. https://your-project.pages.dev) to test against the real endpoint.
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

export async function submitLead(payload: LeadPayload): Promise<void> {
  const res = await fetch(`${API_BASE}/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // keep the generic message
    }
    throw new Error(message);
  }
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
