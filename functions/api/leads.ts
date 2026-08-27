/**
 * GET /api/leads?secret=LEADS_SECRET
 * Returns stored leads from KV or D1 for admin viewing.
 * Protected by LEADS_SECRET (same secret used for Google webhook).
 *
 * Query params:
 *   secret — must match LEADS_SECRET env
 *   limit  — optional, default 50, max 200
 *   format — json (default) or csv
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

  // If LEADS_SECRET is set, require it. If not set, allow in dev but warn.
  if (env.LEADS_SECRET && secret !== env.LEADS_SECRET) {
    return json({ ok: false, error: "bad_secret", hint: "Pass ?secret=LEADS_SECRET" }, 403);
  }
  if (!env.LEADS_SECRET) {
    console.warn("[leads] LEADS_SECRET not set — /api/leads is unprotected");
  }

  const allLeads: any[] = [];

  // Try KV first
  if (env.LEADS_KV) {
    try {
      const list = await env.LEADS_KV.list({ prefix: "lead:", limit });
      // Fetch each key (in parallel, but limited)
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
      allLeads.push(...values);
    } catch (err) {
      console.error("KV list failed", err);
    }
  }

  // Try D1
  if (env.LEADS_DB) {
    try {
      await env.LEADS_DB.exec(
        `CREATE TABLE IF NOT EXISTS leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TEXT,
          telegram TEXT,
          vault_id TEXT,
          slot TEXT,
          user_id TEXT,
          first_name TEXT,
          last_name TEXT,
          language TEXT,
          start_param TEXT
        )`,
      );
      const { results } = await env.LEADS_DB.prepare(
        `SELECT * FROM leads ORDER BY id DESC LIMIT ?`,
      )
        .bind(limit)
        .all();
      if (results?.length) {
        allLeads.push(...results);
      }
    } catch (err) {
      console.error("D1 query failed", err);
    }
  }

  // Sort by timestamp desc if possible
  allLeads.sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return tb - ta;
  });

  if (format === "csv") {
    const headers = [
      "timestamp",
      "telegram",
      "vault_id",
      "slot",
      "user_id",
      "first_name",
      "last_name",
      "language",
      "start_param",
    ];
    const rows = allLeads.map((l) =>
      headers.map((h) => csvEscape(l[h] ?? l[h.replace("_", "")] ?? "")).join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Content-Disposition": `attachment; filename=\"leads_${new Date().toISOString().slice(0, 10)}.csv\"`,
      },
    });
  }

  return json({
    ok: true,
    count: allLeads.length,
    configured: {
      kv: Boolean(env.LEADS_KV),
      d1: Boolean(env.LEADS_DB),
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
