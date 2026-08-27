/**
 * GET /api/leads?secret=LEADS_SECRET
 * D1-first admin endpoint for SKINVAULT
 *
 * Returns stored leads from D1 (primary) and KV (optional)
 * Protected by LEADS_SECRET
 *
 * Query:
 *   secret — must match LEADS_SECRET (if LEADS_SECRET set)
 *   limit  — default 50, max 200
 *   format — json (default) or csv
 *   q      — optional search filter by telegram
 */

type KVNamespace = {
  list: (opts?: { prefix?: string; limit?: number }) => Promise<{
    keys: { name: string }[];
    list_complete: boolean;
    cursor?: string;
  }>;
  get: (key: string) => Promise<string | null>;
};

type D1Database = {
  prepare: (query: string) => {
    bind: (...values: any[]) => {
      all: () => Promise<{ results: any[] }>;
      first: () => Promise<any>;
    };
  };
  exec: (query: string) => Promise<any>;
};

type Env = {
  LEADS_SECRET?: string;
  LEADS_KV?: KVNamespace;
  LEADS_DB?: D1Database;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}

function csvEscape(v: any): string {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret") || "";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 200);
  const format = url.searchParams.get("format") || "json";
  const q = url.searchParams.get("q")?.trim().replace(/^@/, "") || "";

  if (env.LEADS_SECRET && secret !== env.LEADS_SECRET) {
    return json({ ok: false, error: "bad_secret", hint: "Pass ?secret=LEADS_SECRET" }, 403);
  }
  if (!env.LEADS_SECRET) {
    console.warn("[leads] LEADS_SECRET not set — /api/leads is unprotected");
  }

  const allLeads: any[] = [];

  // D1 — primary
  if (env.LEADS_DB) {
    try {
      await env.LEADS_DB.exec(`
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
      `);

      let query = `SELECT * FROM leads`;
      const binds: any[] = [];

      if (q) {
        query += ` WHERE telegram LIKE ?`;
        binds.push(`%${q}%`);
      }

      query += ` ORDER BY id DESC LIMIT ?`;
      binds.push(limit);

      const { results } = await env.LEADS_DB.prepare(query)
        .bind(...binds)
        .all();

      if (results?.length) allLeads.push(...results);
    } catch (err) {
      console.error("D1 query failed", err);
      return json({ ok: false, error: "d1_error", details: String(err) }, 500);
    }
  }

  // KV — secondary
  if (env.LEADS_KV) {
    try {
      const list = await env.LEADS_KV.list({ prefix: "lead:", limit });
      const values = await Promise.all(
        list.keys.slice(0, limit).map(async (k) => {
          const v = await env.LEADS_KV!.get(k.name);
          try {
            return v ? JSON.parse(v) : { _key: k.name, _raw: v };
          } catch {
            return { _key: k.name, _raw: v };
          }
        }),
      );
      // Only add KV if D1 empty (avoid duplicates) or if D1 not configured
      if (!env.LEADS_DB || allLeads.length === 0) {
        allLeads.push(...values);
      }
    } catch (err) {
      console.error("KV list failed", err);
    }
  }

  if (allLeads.length === 0 && !env.LEADS_DB && !env.LEADS_KV) {
    return json({
      ok: true,
      count: 0,
      warning: "No D1 or KV binding configured. Bind LEADS_DB in Pages → Settings → Functions → D1",
      configured: { d1: false, kv: false },
      leads: [],
    });
  }

  allLeads.sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : a.created_at ? a.created_at * 1000 : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : b.created_at ? b.created_at * 1000 : 0;
    return tb - ta;
  });

  if (format === "csv") {
    const headers = [
      "id",
      "timestamp",
      "telegram",
      "vault_id",
      "slot",
      "user_id",
      "first_name",
      "last_name",
      "language",
      "start_param",
      "ip",
    ];
    const rows = allLeads.map((l) =>
      headers.map((h) => csvEscape(l[h] ?? "")).join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Content-Disposition": `attachment; filename="leads_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return json({
    ok: true,
    count: allLeads.length,
    configured: {
      d1: Boolean(env.LEADS_DB),
      kv: Boolean(env.LEADS_KV),
      protected: Boolean(env.LEADS_SECRET),
    },
    leads: allLeads.slice(0, limit),
  });
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
