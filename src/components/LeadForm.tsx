import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useInView } from "@/lib/useInView";
import { buildLeadPayload, submitLead, LeadSubmitError } from "@/lib/leads";
import { getTelegramUser } from "@/lib/telegram";
import { cn } from "@/utils/cn";
import { FocusBrackets, HudLabel } from "./Hud";

type Status = "idle" | "loading" | "error" | "done";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_telegram: "⚠ введите корректный telegram — например @skinvault",
  invalid_json: "⚠ ошибка формата — обновите страницу",
  missing_env:
    "⚠ сервер не настроен (нет GOOGLE_SHEET_WEBHOOK_URL) — проверьте env в Cloudflare",
  bad_secret: "⚠ несовпадение секретов LEADS_SECRET / SCRIPT_SECRET",
  sheet_error: "⚠ не удалось записать в таблицу — проверьте Apps Script деплой",
  sheet_unreachable: "⚠ Apps Script недоступен — проверьте URL /exec",
  internal: "⚠ внутренняя ошибка сервера — попробуйте позже",
  empty_body: "⚠ пустой запрос — попробуйте ещё раз",
  network: "⚠ нет сети — проверьте соединение",
  not_found:
    "⚠ /api/lead не найден — локально установите VITE_API_BASE или включите мок",
};

export function LeadForm() {
  const { ref, inView } = useInView(0.15);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [focused, setFocused] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [errorText, setErrorText] = useState(ERROR_MESSAGES.invalid_telegram);

  // Inside Telegram: prefill the form with the user's handle from the Mini App.
  useEffect(() => {
    const user = getTelegramUser();
    if (user?.username) {
      setValue(`@${user.username}`);
      setPrefilled(true);
    }
  }, []);

  const slot = useMemo(() => 63 + Math.floor(Math.random() * 5), []);
  const vaultId = useMemo(
    () => `SV-${(Math.floor(Math.random() * 8999) + 1000).toString()}-${slot.toString().padStart(3, "0")}`,
    [slot],
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const clean = value.trim().replace(/^@/, "");
    if (clean.length < 4 || /\s/.test(clean)) {
      setErrorText(ERROR_MESSAGES.invalid_telegram);
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      await submitLead(buildLeadPayload(clean, vaultId, slot.toString()));
      setStatus("done");
      // dev helper: log success
      if (import.meta.env.DEV) {
        console.log(`[LeadForm] lead submitted: @${clean} ${vaultId} #${slot}`);
      }
    } catch (err) {
      console.error("[LeadForm] submit failed", err);
      if (err instanceof LeadSubmitError) {
        setErrorText(ERROR_MESSAGES[err.code] ?? `⚠ ${err.message} — попробуйте ещё раз`);
      } else if (err instanceof Error) {
        const msg = err.message;
        // Map raw HTTP messages to friendly if known
        setErrorText(ERROR_MESSAGES[msg] ?? `⚠ не удалось отправить заявку (${msg}) — попробуйте ещё раз`);
      } else {
        setErrorText("⚠ не удалось отправить заявку — попробуйте ещё раз");
      }
      setStatus("error");
    }
  };

  return (
    <section id="claim" ref={ref} className="relative scroll-mt-24 px-5 py-16 sm:px-8 lg:px-14 lg:py-24">
      <div className={cn("reveal mx-auto max-w-[820px]", inView && "reveal-in")}>
        {/* glow behind card */}
        <div
          className="pointer-events-none absolute inset-x-8 top-10 bottom-10 opacity-80 blur-[90px]"
          style={{
            background:
              "radial-gradient(45% 60% at 8% 40%, rgba(204,0,0,0.30), transparent 70%), radial-gradient(45% 60% at 92% 60%, rgba(123,47,190,0.34), transparent 72%)",
          }}
        />

        {/* gradient border shell */}
        <div
          className="relative rounded-[10px] p-px"
          style={{
            background:
              "linear-gradient(135deg, #CC0000 0%, rgba(204,0,0,0.35) 22%, rgba(123,47,190,0.55) 55%, #0066FF 100%)",
            boxShadow: "0 40px 120px -40px rgba(123,47,190,0.75)",
          }}
        >
          <div className="relative overflow-hidden rounded-[9px] bg-[#0b0b0b]/95 px-6 py-10 backdrop-blur-2xl sm:px-12 sm:py-14">
            <div className="hud-grid-fine pointer-events-none absolute inset-0 opacity-[0.16]" />
            <FocusBrackets size={20} inset={12} />

            {/* top rail */}
            <div className="relative mb-9 flex items-center justify-between">
              <HudLabel dot="blue">form.claim_access</HudLabel>
              <HudLabel className="hidden sm:inline-flex">encrypted / v1.0</HudLabel>
            </div>

            {status !== "done" ? (
              <div className="relative">
                <h2 className="font-display text-[clamp(1.6rem,4.2vw,2.9rem)] leading-[1.02] font-black tracking-[-0.02em] text-chalk uppercase">
                  Получи <span className="text-blood-soft">Proof</span> для своей тату
                </h2>
                <p className="mt-5 max-w-[54ch] text-[15px] leading-relaxed text-ash">
                  Запустимся совсем скоро. Оставь Telegram, чтобы получить свой первый сертификат бесплатно.
                </p>

                <form onSubmit={onSubmit} className="mt-9">
                  <label htmlFor="tg" className="sr-only">
                    Ваш Telegram
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div
                      className="relative flex-1 rounded-[6px] p-px transition-all duration-300"
                      style={{
                        background: focused
                          ? "linear-gradient(96deg,#CC0000,#7B2FBE 55%,#0066FF)"
                          : status === "error"
                            ? "rgba(204,0,0,0.6)"
                            : "rgba(245,245,245,0.12)",
                        boxShadow: focused ? "0 0 34px -6px rgba(123,47,190,0.85)" : "none",
                      }}
                    >
                      <div className="flex items-center gap-3 rounded-[5px] bg-graphite px-4 py-4">
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <path
                            d="M14.6 2.3 1.9 7.2c-.7.3-.7.8 0 1l3.2 1 1.2 3.7c.2.5.4.6.8.2l1.9-1.7 3.4 2.5c.6.3 1 .1 1.2-.6l2.2-10c.2-.8-.3-1.2-1.2-1z"
                            fill={focused ? "#9d5df0" : status === "error" ? "#CC0000" : "#6c6c6c"}
                          />
                        </svg>
                        <input
                          id="tg"
                          value={value}
                          onChange={(e) => {
                            setValue(e.target.value);
                            if (status === "error") setStatus("idle");
                          }}
                          onFocus={() => setFocused(true)}
                          onBlur={() => setFocused(false)}
                          placeholder="@username в Telegram"
                          autoComplete="off"
                          spellCheck={false}
                          className="w-full bg-transparent font-mono text-[13px] tracking-[0.04em] text-chalk placeholder:text-ash/55 focus:outline-none"
                        />
                        {status === "loading" && (
                          <span className="font-mono text-[9px] tracking-[0.2em] text-electric uppercase">
                            sync…
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-[6px] bg-chalk px-7 py-4 font-mono text-[11px] font-semibold tracking-[0.2em] text-void uppercase transition-transform duration-300 hover:scale-[1.015] disabled:cursor-wait disabled:opacity-70"
                      style={{ boxShadow: "0 0 46px -12px rgba(245,245,245,0.85)" }}
                    >
                      <span className="relative z-10 whitespace-nowrap">
                        {status === "loading" ? "Проверяем…" : "Получить доступ"}
                      </span>
                      <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                      <span
                        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ background: "linear-gradient(96deg,#ff3b3b,#f5f5f5 52%,#4d8bff)" }}
                      />
                    </button>
                  </div>

                  <div className="mt-4 flex min-h-[18px] items-center gap-2" aria-live="polite">
                    {status === "error" ? (
                      <span className="font-mono text-[10px] tracking-[0.16em] text-blood-soft uppercase">
                        {errorText}
                      </span>
                    ) : prefilled ? (
                      <span className="font-mono text-[10px] tracking-[0.16em] text-electric uppercase">
                        ✓ telegram подтянут из mini app — можно изменить
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] tracking-[0.16em] text-ash/70">
                        Первые 100 пользователей получат PRO-статус при запуске.
                      </span>
                    )}
                  </div>

                  {import.meta.env.DEV && !import.meta.env.VITE_API_BASE && (
                    <div className="mt-3 font-mono text-[9px] tracking-[0.12em] text-ash/50 uppercase">
                      DEV: мок /api/lead активен — заявки логируются в консоль, не в Google Sheets.
                      Установите VITE_API_BASE=https://ваш-проект.pages.dev для теста реального бэкенда.
                    </div>
                  )}
                </form>
              </div>
            ) : (
              <div className="relative py-2 text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-electric/60 bg-electric/10">
                  <svg width="20" height="20" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path
                      d="M1 5.2 3.6 8 9 1.8"
                      stroke="#9dc0ff"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-[clamp(1.5rem,3.6vw,2.4rem)] leading-tight font-black tracking-[-0.02em] text-chalk uppercase">
                  Место закреплено
                </h2>
                <p className="mx-auto mt-4 max-w-[46ch] text-[15px] leading-relaxed text-ash">
                  Мы напишем тебе в Telegram <span className="text-chalk">@{value.trim().replace(/^@/, "")}</span> в
                  день запуска. Твой первый сертификат — бесплатно.
                </p>
                <div className="mx-auto mt-8 grid max-w-[440px] grid-cols-2 gap-px overflow-hidden rounded-[6px] border border-chalk/12 bg-chalk/10">
                  <div className="bg-[#0d0d0d] px-5 py-5">
                    <div className="font-mono text-[9px] tracking-[0.24em] text-ash/70 uppercase">vault id</div>
                    <div className="font-display mt-2 text-sm font-bold tracking-[0.08em] text-chalk">{vaultId}</div>
                  </div>
                  <div className="bg-[#0d0d0d] px-5 py-5">
                    <div className="font-mono text-[9px] tracking-[0.24em] text-ash/70 uppercase">место в очереди</div>
                    <div className="font-display mt-2 text-sm font-bold tracking-[0.08em] text-blood-soft">
                      #{slot.toString().padStart(3, "0")} / 100
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setStatus("idle");
                    setValue("");
                  }}
                  className="mt-7 font-mono text-[10px] tracking-[0.22em] text-ash/70 uppercase underline-offset-4 transition-colors hover:text-chalk hover:underline"
                >
                  ← добавить другой аккаунт
                </button>
              </div>
            )}

            {/* bottom shimmer rail */}
            <div
              className="animate-sweep pointer-events-none absolute inset-x-0 bottom-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(204,0,0,0.9) 18%, rgba(245,245,245,0.9) 50%, rgba(0,102,255,0.9) 82%, transparent 100%)",
                backgroundSize: "60% 100%",
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>
        </div>

        {/* trust row */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <HudLabel dot="red">без спама</HudLabel>
          <HudLabel dot="blue">данные шифруются</HudLabel>
          <HudLabel dot="red">отписка в 1 клик</HudLabel>
        </div>
      </div>
    </section>
  );
}
