import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { initTelegramApp } from "@/lib/telegram";

// Telegram Mini App bootstrap: ready()/expand() + dark chrome colors.
// Safe no-op when opened as a regular web page.
initTelegramApp();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
