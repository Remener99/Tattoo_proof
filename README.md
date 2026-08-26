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
   │  OAuth2 JWT (сервисный аккаунт Google, подпись RS256)
   ▼
Google Sheets API  →  строка в твоей таблице
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

## Настройка заявок в Google Sheets (один раз)

### 1. Таблица

1. Создай Google-таблицу, в первой строке напиши заголовки:
   `timestamp | telegram | vault_id | slot | user_id | first_name | last_name | language | start_param`
2. Скопируй **ID таблицы** из URL: `https://docs.google.com/spreadsheets/d/ВОТ_ЭТО_ИД/edit`

### 2. Сервисный аккаунт Google (ключ для доступа к API)

1. Открой [Google Cloud Console](https://console.cloud.google.com/) → создай проект (или выбери существующий).
2. **APIs & Services → Library** → найди **Google Sheets API** → **Enable**.
3. **APIs & Services → Credentials → Create Credentials → Service Account** — создай аккаунт (имя любое, например `skinvaul-leads`).
4. В списке сервисных аккаунтов нажми на созданный → вкладка **Keys → Add Key → Create New Key** → формат **JSON** → скачай файл. Это твой `GOOGLE_SERVICE_ACCOUNT_JSON`.
5. Вернись в Google-таблицу → **Share / Доступ** → вставь **email сервисного аккаунта** (из скачанного JSON, поле `client_email`) → права **Editor / Редактор**.

### 3. Переменные окружения в Cloudflare Pages

Проект на Cloudflare Pages → **Settings → Environment variables → Production** → добавить:

| Имя | Значение |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | весь содержимое скачанного JSON-ключа (вставить целиком, как есть) |
| `GOOGLE_SHEET_ID` | ID таблицы из шага 1 |
| `GOOGLE_SHEET_RANGE` | *(опционально)* диапазон, по умолчанию `Лист1!A1` (если лист называется иначе — укажи свой, например `Sheet1!A1`) |

> ⚠️ `GOOGLE_SERVICE_ACCOUNT_JSON` — секрет. Хранится только в настройках Cloudflare, в код и в git не попадает.

### 4. Передеплой

- Если Pages подключён к репозиторию (Git integration): запуши изменения на ветку, с которой собирается проект (`functions/api/lead.ts` подхватится автоматически).
- Если деплой через CLI: `wrangler pages deploy dist --project-name=<имя-проекта>`.

Готово — отправка формы теперь пишет строку в таблицу.

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
```
