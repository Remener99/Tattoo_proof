# Tattoo_proof

**SKINVAULT** — лендинг сервиса цифровых сертификатов уникальности («паспортов подлинности») для авторских татуировок.

Стек: React 19 + TypeScript + Vite 7 + Tailwind CSS 4. Сборка — в один самодостаточный HTML (`vite-plugin-singlefile`). Бэкенд — Cloudflare Pages Functions (`/api/lead`), заявки пишутся в Google Sheets.

## Запуск

```bash
npm install
npm run dev       # dev-сервер
npm run build     # production-сборка в dist/ (один index.html)
npm run preview   # превью собранного билда
```

## Архитектура сбора заявок

```
Форма (LeadForm.tsx)
   │  POST /api/lead (JSON, same-origin — без CORS в проде)
   ▼
Pages Function  functions/api/lead.ts
   │  режим A: POST на Apps Script web app (рекомендуется)
   │  режим B (legacy): OAuth2 JWT сервисного аккаунта → Sheets API
   ▼
Google Sheets  →  новая строка в твоей таблице
```

## Telegram Mini App

- `src/lib/telegram.ts` — безопасная обёртка над SDK `telegram-web-app.js` (все вызовы no-op вне Telegram);
- в `index.html` подключён скрипт `https://telegram.org/js/telegram-web-app.js`;
- `initTelegramApp()` в `src/main.tsx` вызывает `ready()`, `expand()` и синхронизирует тёмный цвет шапки/фона (`#0A0A0A`);
- форма автоматически подставляет username из `initDataUnsafe.user`.

### Регистрация Mini App (BotFather)

1. @BotFather → `/newbot` — создать бота, получить токен.
2. @BotFather → `/newapp` (или Bot Settings → Mini App Mode) — привязать бота, указать URL (HTTPS!), название, иконку и заглушку.
3. Токен бота во фронтенд **не попадает и не нужен** для работы заявок в Google Sheets.

---

## Настройка заявок в Google Sheets — способ A: Apps Script (рекомендуется)

Не требует Google Cloud, сервисных аккаунтов и биллинга — работает на обычном Google-аккаунте. Подходит, если Cloud Console в твоей стране недоступна.

1. Создай Google-таблицу.
2. В ней: **Расширения → Apps Script**. Вставь код из файла `google/appsscript.gs` (или создай новый проект и скопируй).
3. В начале скрипта задай:
   - `SCRIPT_SECRET` — любая случайная строка (пароль между скриптом и Cloudflare);
   - `SHEET_ID` — оставь пустым, если таблица привязана к скрипту.
4. **Deploy → New deployment → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy → скопируй URL (заканчивается на `/exec`).
5. В Cloudflare Pages: **Settings → Environment variables → Production**:

   | Имя | Значение |
   |---|---|
   | `GOOGLE_SHEET_WEBHOOK_URL` | URL вида `https://script.google.com/macros/s/.../exec` |
   | `LEADS_SECRET` | та же строка, что и `SCRIPT_SECRET` в скрипте |

6. Передеплой (слить PR или `wrangler pages deploy dist`).

> При изменении скрипта не забывай перевыпускать версию: Deploy → Manage deployments → Edit → New version.

---

## Настройка заявок — способ B: сервисный аккаунт (legacy)

Используется, только если режим A недоступен/нежелателен. Требует Google Cloud Console:

1. Таблица: заголовки в первой строке: `timestamp | telegram | vault_id | slot | user_id | first_name | last_name | language | start_param`.
2. [Google Cloud Console](https://console.cloud.google.com/) → включить **Google Sheets API** → **Credentials → Service Account** → создать → **Keys → Add Key → JSON**.
3. Расшарить таблицу на `client_email` из ключа (Editor).
4. Переменные Cloudflare: `GOOGLE_SERVICE_ACCOUNT_JSON` (весь JSON-ключ), `GOOGLE_SHEET_ID`, опц. `GOOGLE_SHEET_RANGE` (по умолчанию `Лист1!A1`).

---

## Локальная разработка с реальным эндпоинтом

В проде форма шлёт на `/api/lead` (тот же origin — CORS не нужен). Локально dev-сервер не имеет этого эндпоинта, поэтому:

```bash
VITE_API_BASE=https://твой-проект.pages.dev npm run dev
```

Vite будет проксировать `/api` на деплой, и форму можно тестировать против реального эндпоинта.

## Структура

```
index.html               HTML-оболочка (точка входа, шрифты, telegram-web-app.js)
src/
  main.tsx               вход в React + initTelegramApp()
  App.tsx                корневая композиция страницы
  index.css              тема, утилиты, анимации (Tailwind 4)
  lib/telegram.ts        обёртка Telegram WebApp SDK
  lib/leads.ts           клиент отправки заявок
  lib/useInView.ts       хук reveal-анимаций (IntersectionObserver)
  utils/cn.ts            cn() = clsx + tailwind-merge
  components/            Header, Hero, ScannerVisual, Ticker, LeadForm,
                         Process, Footer, Atmosphere, SpecOverlay, Hud
functions/api/lead.ts    Pages Function: приём заявки → Google Sheets
google/appsscript.gs     Apps Script web app (режим A, рекомендуется)
```
