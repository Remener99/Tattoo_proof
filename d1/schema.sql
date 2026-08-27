-- SKINVAULT D1 schema
-- Cloudflare D1 SQLite — бесплатно, без Google, работает из РФ

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
  -- доп поля для аналитики
  ip TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_leads_telegram ON leads(telegram);
CREATE INDEX IF NOT EXISTS idx_leads_timestamp ON leads(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_leads_vault_id ON leads(vault_id);

-- Пример просмотра:
-- SELECT * FROM leads ORDER BY id DESC LIMIT 50;
-- SELECT telegram, COUNT(*) as cnt FROM leads GROUP BY telegram;
-- SELECT date(timestamp) as day, COUNT(*) FROM leads GROUP BY day ORDER BY day DESC;
