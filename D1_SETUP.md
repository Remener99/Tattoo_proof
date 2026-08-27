# Cloudflare D1 Setup — SKINVAULT (без Google Sheets)

D1 — это SQLite база от Cloudflare, бесплатная, работает из РФ, не требует Google.

## Вариант 1: Через Dashboard (самый простой, без CLI)

### 1. Создай базу
1. Зайди в https://dash.cloudflare.com → Workers & Pages → D1 SQL Database
2. Create database → Name: `skinvault_leads` → Create
3. Скопируй `Database ID` (понадобится для wrangler, но для Pages не обязателен)

### 2. Создай таблицу
1. Внутри базы → Console → вставь содержимое `d1/schema.sql` → Execute
   Или просто ничего не делай — код сам создаст таблицу при первом лиде (`CREATE TABLE IF NOT EXISTS`)

### 3. Привяжи базу к Pages проекту
1. Workers & Pages → твой Pages проект (Tattoo_proof) → Settings → Functions
2. Раздел **D1 database bindings** → Add binding
   - Variable name: `LEADS_DB`
   - D1 database: выбери `skinvault_leads`
3. Save

### 4. Добавь секрет для защиты /api/leads
1. Settings → Environment variables → Production → Add variable
   - `LEADS_SECRET` = придумай случайную строку, например `k9f2x8pLq1...`
2. Save → Redeploy (Retry deployment или новый коммит)

### 5. Проверь
- Открой `https://твой-проект.pages.dev/api/lead` → должен показать `{"configured":{"d1":true,...}}`
- Отправь тестовую заявку с ленда
- Посмотри лиды:
  - D1 → Console → `SELECT * FROM leads ORDER BY id DESC LIMIT 20;`
  - Или через API: `https://твой-проект.pages.dev/api/leads?secret=ТВОЙ_LEADS_SECRET`
  - CSV: `https://твой-проект.pages.dev/api/leads?secret=...&format=csv`

---

## Вариант 2: Через Wrangler CLI (для локальной разработки)

```bash
npm install -g wrangler
wrangler login

# 1. Создать базу
npm run d1:create
# Скопируй database_id из вывода и вставь в wrangler.toml

# 2. Применить схему
npm run d1:schema

# 3. Проверить что таблица создалась
wrangler d1 execute skinvault_leads --command="SELECT name FROM sqlite_master WHERE type='table';"

# 4. Локально запустить Pages с D1
npm run build
npm run pages:dev
# Теперь http://localhost:8788/api/lead будет писать в локальную D1

# 5. Посмотреть лиды
npm run d1:list
```

---

## Схема

См. `d1/schema.sql`:

```sql
CREATE TABLE leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT,
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
  created_at INTEGER DEFAULT (unixepoch())
);
```

## API

- `POST /api/lead` — принимает `{telegram, vaultId, slot, userId, firstName, ...}` → пишет в D1
- `GET /api/lead` — health check, показывает какие бэкенды настроены
- `GET /api/leads?secret=XXX&limit=50&format=json|csv&q=search` — список лидов, защищено секретом

## Лимиты D1 (бесплатный тариф)

- 5 GB storage
- 5M строк читается в день
- 100k строк пишется в день
- Для ленда на 100-10000 лидов — более чем достаточно

## Миграция с Google Sheets

Если раньше использовал Google Sheets — просто переключи биндинг на D1, Google переменные можно удалить. Код поддерживает оба бэкенда одновременно — можно включить D1 + Telegram для уведомлений.

## Бэкап

```bash
# Экспорт в SQL
wrangler d1 export skinvault_leads --output=backup.sql

# Экспорт в CSV через API
curl "https://твой-проект.pages.dev/api/leads?secret=XXX&format=csv" -o leads.csv
```
