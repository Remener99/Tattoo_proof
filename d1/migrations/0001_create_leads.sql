-- Migration 0001: initial leads table
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
  ip TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_leads_telegram ON leads(telegram);
CREATE INDEX IF NOT EXISTS idx_leads_timestamp ON leads(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_leads_vault_id ON leads(vault_id);
