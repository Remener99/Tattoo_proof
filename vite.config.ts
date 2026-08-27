import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Dev mock for /api/lead + /api/leads when VITE_API_BASE is not set.
 * Simulates D1 behavior in-memory so you can test the full flow locally
 * without Cloudflare. Logs payloads and keeps them in memory.
 */
function devLeadMock(): Plugin {
  const memoryLeads: any[] = [];

  return {
    name: "skinvault-dev-lead-mock",
    configureServer(server) {
      if (process.env.VITE_API_BASE) return;

      // POST /api/lead
      server.middlewares.use("/api/lead", async (req, res, next) => {
        const url = new URL(req.url || "/", `http://${req.headers.host}`);

        // GET /api/lead — health check
        if (req.method === "GET") {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.end(
            JSON.stringify({
              ok: true,
              mock: true,
              primary: "d1-memory",
              configured: { d1: true, kv: false, telegram: false, webhook: false },
              memoryCount: memoryLeads.length,
              hint: "DEV mock active — leads stored in memory, logged to console",
            }),
          );
          return;
        }

        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.end();
          return;
        }

        if (req.method !== "POST") {
          next();
          return;
        }

        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          try {
            const data = JSON.parse(body || "{}");
            const tg = String(data.telegram || "").trim();
            console.log("\n[DEV MOCK D1] /api/lead received:");
            console.log(JSON.stringify(data, null, 2));

            if (!tg || tg.length < 4) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: false, error: "invalid_telegram" }));
              return;
            }

            // Store in memory like D1 would
            const lead = {
              id: memoryLeads.length + 1,
              timestamp: new Date().toISOString(),
              telegram: tg,
              vault_id: data.vaultId || "",
              slot: data.slot || "",
              user_id: String(data.userId || ""),
              first_name: data.firstName || "",
              last_name: data.lastName || "",
              language: data.languageCode || "",
              start_param: data.startParam || "",
              ip: "127.0.0.1",
              user_agent: req.headers["user-agent"] || "",
            };
            memoryLeads.unshift(lead);
            if (memoryLeads.length > 200) memoryLeads.pop();

            setTimeout(() => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify({ ok: true, mock: true, d1: true, id: lead.id }));
            }, 400);
          } catch (e) {
            console.error("[DEV MOCK] parse error", e);
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: false, error: "invalid_json" }));
          }
        });
      });

      // GET /api/leads
      server.middlewares.use("/api/leads", async (req, res) => {
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.end();
          return;
        }

        const url = new URL(req.url || "/", `http://${req.headers.host}`);
        const format = url.searchParams.get("format") || "json";
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "50") || 50, 200);
        const q = url.searchParams.get("q")?.trim().replace(/^@/, "") || "";

        let filtered = memoryLeads;
        if (q) {
          filtered = memoryLeads.filter((l) =>
            l.telegram.toLowerCase().includes(q.toLowerCase()),
          );
        }

        const slice = filtered.slice(0, limit);

        if (format === "csv") {
          const headers = ["id", "timestamp", "telegram", "vault_id", "slot", "user_id"];
          const rows = slice.map((l) => headers.map((h) => l[h] || "").join(","));
          const csv = [headers.join(","), ...rows].join("\n");
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/csv");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.end(csv);
          return;
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end(
          JSON.stringify({
            ok: true,
            mock: true,
            count: slice.length,
            total: memoryLeads.length,
            configured: { d1: true, kv: false },
            leads: slice,
          }),
        );
      });

      console.log("[DEV] D1 mock enabled — no VITE_API_BASE");
      console.log("[DEV] POST /api/lead → in-memory D1, GET /api/leads → list");
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile(), devLeadMock()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,
    allowedHosts: true,
    proxy: process.env.VITE_API_BASE
      ? { "/api": { target: process.env.VITE_API_BASE, changeOrigin: true } }
      : undefined,
  },
});
