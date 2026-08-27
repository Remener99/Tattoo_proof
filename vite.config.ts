import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Dev mock for /api/lead when VITE_API_BASE is not set.
 * Lets the form work locally without Cloudflare Pages Function.
 * Logs payload to console and returns {ok:true} after a short delay.
 */
function devLeadMock(): Plugin {
  return {
    name: "skinvault-dev-lead-mock",
    configureServer(server) {
      // Only activate if no real backend proxy is configured
      if (process.env.VITE_API_BASE) return;

      server.middlewares.use("/api/lead", async (req, res, next) => {
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
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
            console.log("\n[DEV MOCK] /api/lead received:");
            console.log(JSON.stringify(data, null, 2));
            if (!tg || tg.length < 4) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: false, error: "invalid_telegram" }));
              return;
            }
            // Simulate network latency
            setTimeout(() => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.end(JSON.stringify({ ok: true, mock: true }));
            }, 600);
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: false, error: "invalid_json" }));
          }
        });
      });

      console.log("[DEV] /api/lead mock enabled — no VITE_API_BASE, using local mock");
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
    // Allow the sandbox preview host (and any other) to reach the dev server.
    allowedHosts: true,
    // In dev, proxy /api to the deployed site (set VITE_API_BASE) so the
    // form can be tested against the real Pages Function.
    proxy: process.env.VITE_API_BASE
      ? { "/api": { target: process.env.VITE_API_BASE, changeOrigin: true } }
      : undefined,
  },
});
