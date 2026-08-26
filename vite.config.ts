import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
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
