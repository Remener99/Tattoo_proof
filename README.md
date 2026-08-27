# Tattoo_proof

**SKINVAULT** — лендинг сервиса цифровых сертификатов уникальности («паспортов подлинности») для авторских татуировок.

Стек: React 19 + TypeScript + Vite 7 + Tailwind CSS 4. Сборка — в один самодостаточный HTML (`vite-plugin-singlefile`). Бэкенд — Cloudflare Pages Functions (`/api/lead`), заявки пишутся в любой бэкенд без Google.

## Запуск

```bash
npm install
npm run dev       # dev-сервер с моком /api/lead (работает без бэкенда)
npm run build     # production-сборка в dist/ (один index.html)
npm run preview   # превью собранного билда
```

## Архитектура сбора заявок (без Google Sheets)

```
Форма (LeadForm.tsx)
   │  POST /api/lead (JSON, same-origin)
   ▼
Pages Function  functions/api/lead.ts — мульти-бэкенд, срабатывает первый успешный:
   ├─ Telegram Bot (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID) — RECOMMENDED
   ├─ Generic Webhook (LEADS_WEBHOOK_URL) — Make.com / n8n / Zapier / Slack
   ├─ Cloudflare KV (LEADS_KV binding)
   ├─ Cloudflare D1 (LEADS_DB binding)
   ├─ Google Sheets Apps Script (GOOGLE_SHEET_WEBHOOK_URL) — опционально
   └─ Google Sheets API (service account) — legacy
   ▼
Если ни один бэкенд не настроен → {ok:true, mock:true} — форма не ломается
```

## Telegram Mini App

- `src/lib/telegram.ts` — безопасная обёртка над SDK `telegram-web-app.js` (все вызовы no-op вне Telegram);
- в `index.html` подключён скрипт `https://telegram.org/js/telegram-web-app.js`;
- `initTelegramApp()` в `src/main.tsx` вызывает `ready()`, `expand()` и синхронизирует тёмный цвет шапки/фона (`#0A0A0A`);
- форма автоматически подставляет username из `initDataUnsafe.user`.

### Регистрация Mini App (BotFather)

1. @BotFather → `/newbot` — создать бота, получить токен.
2. @BotFather → `/newapp` (или Bot Settings → Mini App Mode) — привязать бота, указать URL (HTTPS!), название, иконку и заглушку.
3. Токен бота во фронтенд **не попадает** — он нужен только в Cloudflare env для отправки лидов.

---

## ✅ Рекомендуемая настройка БЕЗ Google — Telegram Bot (2 минуты)

Самая простая альтернатива Google Sheets, работает из РФ без VPN.

1. **Создай бота:** @BotFather → `/newbot` → получи `TELEGRAM_BOT_TOKEN` вида `123456:ABC...`
2. **Узнай свой chat_id:**
   - Напиши боту любое сообщение
   - Открой в браузере: `https://api.telegram.org/bot<TOKEN>/getUpdates`
   - Найди `"chat":{"id": 123456789}` — это твой `TELEGRAM_CHAT_ID`
   - Или используй @userinfobot для личного ID, @getidsbot для группы/канала
3. **Cloudflare Pages:** Settings → Environment variables → Production:
   | Имя | Значение |
   |---|---|
   | `TELEGRAM_BOT_TOKEN` | `123456:ABC...` |
   | `TELEGRAM_CHAT_ID` | `123456789` или `@your_channel` |
4. Передеплой. Готово — лиды будут приходить в Telegram:

```
🔥 SKINVAULT — новый лид
👤 Telegram: @Remener
🆔 Vault: SV-1234-063 | Slot: #063
⏰ 2026-08-27T...
```

> Можно добавить бота в приватный канал/группу и указать ID канала как CHAT_ID — тогда вся команда видит лиды.

---

## Другие альтернативы без Google

### A) Generic Webhook (Make.com / n8n / Zapier / любой URL)

Подходит если хочешь слать в Slack, Notion, Airtable, Email и т.д.

- `LEADS_WEBHOOK_URL` = `https://hook.make.com/...` или твой n8n webhook
- `LEADS_SECRET` — опционально, уйдёт в поле `secret`
- В Cloudflare добавь эту переменную, передеплой

Payload:
```json
{
  "telegram": "Remener",
  "vaultId": "SV-1234-063",
  "slot": "63",
  "timestamp": "2026-08-27T...",
  "source": "skinvault"
}
```

### B) Cloudflare KV (бесплатно, без внешних сервисов)

1. Cloudflare Dashboard → Workers & Pages → KV → Create namespace `LEADS`
2. Pages → твой проект → Settings → Functions → KV namespace bindings → Add: Variable `LEADS_KV` → выбери namespace
3. Передеплой. Лиды хранятся в KV, посмотреть можно в Dashboard → KV → Browse или через `GET /api/leads` (если реализуешь)

### C) Cloudflare D1 (SQLite, бесплатно)

1. Dashboard → D1 → Create database `skinvault_leads`
2. Pages → Settings → Functions → D1 bindings → Variable `LEADS_DB` → выбери базу
3. Код сам создаёт таблицу `leads` при первом запросе (`CREATE TABLE IF NOT EXISTS`)
4. Лиды можно смотреть через D1 Console: `SELECT * FROM leads ORDER BY id DESC`

### D) Можно комбинировать

Можно включить сразу несколько: Telegram + KV + Webhook. `functions/api/lead.ts` попробует все и вернёт `ok:true` если хотя бы один сработал.

---

## Настройка заявок в Google Sheets — способ A: Apps Script (если нужен)

Если Apps Script у тебя открывается, старый способ всё ещё работает (опционален).

1. Создай Google-таблицу.
2. В ней: **Расширения → Apps Script**. Вставь код из `google/appsscript.gs`.
3. Задай `SCRIPT_SECRET` и `SHEET_ID` (пустой = привязанная таблица).
4. **Deploy → New deployment → Web app**: Execute as Me, Who has access Anyone → скопируй `/exec` URL.
5. Cloudflare env:
   | `GOOGLE_SHEET_WEBHOOK_URL` | `https://script.google.com/macros/s/.../exec` |
   | `LEADS_SECRET` | тот же `SCRIPT_SECRET` |
6. Передеплой.

> Если Apps Script не открывается из твоей страны — используй Telegram способ выше, Google не нужен.

---

## Настройка заявок — способ B: сервисный аккаунт (legacy)

1. Таблица: заголовки `timestamp | telegram | vault_id | slot | user_id | first_name | last_name | language | start_param`.
2. Google Cloud Console → включи Sheets API → Service Account → Keys → JSON.
3. Расшарь таблицу на `client_email` (Editor).
4. Cloudflare: `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_SHEET_ID`, опц. `GOOGLE_SHEET_RANGE`.

---

## Локальная разработка

- **Без бэкенда:** `npm run dev` — встроенный мок в `vite.config.ts` возвращает `{ok:true}` и логирует лиды в консоль сервера. Форма работает сразу.
- **С реальным бэкендом:**
```bash
VITE_API_BASE=https://твой-проект.pages.dev npm run dev
```

---

## Диагностика: почему «Не удалось отправить заявку»

Старый код требовал Google Sheets и падал с `missing_env` если env не заданы. Сейчас исправлено:

- Если ни один бэкенд не настроен → возвращается `{ok:true, mock:true}` — форма показывает «Место закреплено», а в логах Cloudflare предупреждение `No backend configured`.
- Если Telegram/Webhook/KV/D1 настроен но падает → возвращается конкретная ошибка `telegram_error`, `webhook_error` и т.д., фронтенд показывает её.
- Проверь `GET https://твой-проект.pages.dev/api/lead` — он покажет какие бэкенды настроены: `{"configured":{"telegram":true,...}}`

Частые причины раньше:
- `VITE_API_BASE` не задан локально → 404 → теперь мок
- `GOOGLE_SHEET_WEBHOOK_URL` не задан → теперь не ошибка, а mock
- Apps Script деплой не `Anyone` → возвращал HTML → теперь `sheet_error`
- `LEADS_SECRET != SCRIPT_SECRET` → `bad_secret`

После фикса: `npm run build` + redeploy.

## Структура

```
index.html               HTML-оболочка
src/
  main.tsx               вход + initTelegramApp()
  App.tsx                композиция страницы
  lib/telegram.ts        обёртка Telegram WebApp SDK
  lib/leads.ts           клиент с кодами ошибок (telegram_error, webhook_error...)
  components/LeadForm    форма с детальными сообщениями
functions/api/lead.ts    мульти-бэкенд: Telegram / Webhook / KV / D1 / Google Sheets
google/appsscript.gs     опционально, если нужен Google
vite.config.ts           dev-мок /api/lead + прокси
```
