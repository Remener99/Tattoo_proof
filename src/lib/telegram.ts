/**
 * Thin, safe wrapper around the Telegram WebApp SDK (telegram-web-app.js).
 *
 * Every function degrades gracefully: when the page is opened in a regular
 * browser (or the SDK hasn't loaded yet), calls simply no-op, so the landing
 * keeps working as a plain website.
 */

export type TelegramUser = {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
};

export type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  close?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  disableVerticalSwipes?: () => void;
  sendData?: (data: string) => void;
  initData?: string;
  initDataUnsafe?: {
    user?: TelegramUser;
    start_param?: string;
  };
};

type TelegramGlobal = {
  Telegram?: { WebApp?: TelegramWebApp };
};

/** Returns the WebApp SDK object, or `undefined` when running outside Telegram. */
export function getWebApp(): TelegramWebApp | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as TelegramGlobal).Telegram?.WebApp;
}

/** True when the page is running inside a Telegram client with real init data. */
export function isTelegram(): boolean {
  return Boolean(getWebApp()?.initData);
}

/**
 * One-time bootstrap: marks the app as ready, expands it to full screen and
 * syncs Telegram chrome (header/background) with the landing's dark palette.
 */
export function initTelegramApp(): void {
  const app = getWebApp();
  if (!app) return;

  app.ready();
  app.expand();

  // Match Telegram chrome with the landing's palette (#0A0A0A).
  app.setHeaderColor?.("#0A0A0A");
  app.setBackgroundColor?.("#0A0A0A");
  // Prevent pull-to-refresh / vertical swipes from fighting the scroll.
  app.disableVerticalSwipes?.();
}

/** The Telegram user that opened the Mini App (from initDataUnsafe). */
export function getTelegramUser(): TelegramUser | undefined {
  return getWebApp()?.initDataUnsafe?.user;
}

/** Sends a payload straight to the bot (closes the Mini App afterwards). */
export function sendTelegramData(data: string): void {
  getWebApp()?.sendData?.(data);
}
