import { useInView } from "@/lib/useInView";
import { cn } from "@/utils/cn";
import { Crosshair, FocusBrackets, HudLabel } from "./Hud";

type Step = {
  num: string;
  title: string;
  en: string;
  desc: string;
  color: string;
  glow: string;
  icon: "select" | "claim" | "proof";
};

const STEPS: Step[] = [
  {
    num: "01",
    title: "Выбери",
    en: "select",
    desc: "Авторский эскиз у проверенного мастера.",
    color: "#CC0000",
    glow: "rgba(204,0,0,0.55)",
    icon: "select",
  },
  {
    num: "02",
    title: "Claim",
    en: "lock",
    desc: "Эскиз закрепляется только за тобой.",
    color: "#7B2FBE",
    glow: "rgba(123,47,190,0.55)",
    icon: "claim",
  },
  {
    num: "03",
    title: "Get Proof",
    en: "verify",
    desc: "Цифровой паспорт с QR-кодом верификации.",
    color: "#0066FF",
    glow: "rgba(0,102,255,0.55)",
    icon: "proof",
  },
];

function StepIcon({ type, color }: { type: Step["icon"]; color: string }) {
  if (type === "select")
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 3h6M3 3v6M21 21h-6M21 21v-6" stroke={color} strokeWidth="1.3" />
        <circle cx="12" cy="12" r="4.5" stroke="#F5F5F5" strokeWidth="1.1" opacity="0.75" />
      </svg>
    );
  if (type === "claim")
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="4" y="10" width="16" height="11" rx="1.5" stroke={color} strokeWidth="1.3" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#F5F5F5" strokeWidth="1.1" opacity="0.75" />
        <circle cx="12" cy="15.5" r="1.4" fill={color} />
      </svg>
    );
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="7" height="7" stroke={color} strokeWidth="1.3" />
      <rect x="14" y="3" width="7" height="7" stroke="#F5F5F5" strokeWidth="1.1" opacity="0.6" />
      <rect x="3" y="14" width="7" height="7" stroke="#F5F5F5" strokeWidth="1.1" opacity="0.6" />
      <path d="M14 14h3v3h-3zM19 19h2v2h-2zM14 19h2v2h-2zM19 14h2v2h-2z" fill={color} />
    </svg>
  );
}

export function Process() {
  const { ref, inView } = useInView(0.12);

  return (
    <section id="how" ref={ref} className="relative scroll-mt-24 px-5 py-20 sm:px-8 lg:px-14 lg:py-28">
      <div className="mx-auto max-w-[1560px]">
        {/* header */}
        <div className={cn("reveal flex flex-col gap-6 md:flex-row md:items-end md:justify-between", inView && "reveal-in")}>
          <div>
            <HudLabel dot="red" className="mb-5">
              process / 03 steps
            </HudLabel>
            <h2 className="font-display text-[clamp(2rem,6vw,4.6rem)] leading-[0.9] font-black tracking-[-0.03em] text-chalk uppercase">
              Как это работает
            </h2>
          </div>
          <p className="max-w-[38ch] text-sm leading-relaxed text-ash md:text-right">
            Три шага от эскиза до цифрового паспорта подлинности. Без бумаг, без посредников, без копий.
          </p>
        </div>

        {/* steps */}
        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden border border-chalk/10 bg-chalk/10 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <article
              key={s.num}
              className={cn(
                "reveal group relative overflow-hidden bg-[#0b0b0b] px-7 py-12 transition-colors duration-500 hover:bg-[#101010] sm:px-9 sm:py-14",
                inView && "reveal-in",
              )}
              style={{ transitionDelay: `${120 + i * 130}ms` }}
            >
              {/* hover glow */}
              <div
                className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                style={{ background: `radial-gradient(circle, ${s.glow}, transparent 70%)` }}
              />
              <div className="hud-grid-fine pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-[0.13]" />
              <FocusBrackets size={14} inset={10} className="opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative flex items-start justify-between">
                <span
                  className="font-display text-[clamp(3.4rem,7vw,5.6rem)] leading-[0.8] font-black tracking-[-0.05em]"
                  style={{ color: s.color, textShadow: `0 0 46px ${s.glow}` }}
                >
                  {s.num}
                </span>
                <StepIcon type={s.icon} color={s.color} />
              </div>

              <div className="relative mt-10">
                <h3 className="font-display text-xl leading-tight font-extrabold tracking-[0.01em] text-chalk uppercase sm:text-2xl">
                  {s.title}
                </h3>
                <span className="mt-2 block font-mono text-[9px] tracking-[0.3em] text-ash/60 uppercase">
                  {s.en}
                </span>
                <div
                  className="mt-6 h-px w-full origin-left scale-x-[0.3] transition-transform duration-700 group-hover:scale-x-100"
                  style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }}
                />
                <p className="mt-6 max-w-[30ch] text-[15px] leading-relaxed text-ash">{s.desc}</p>
              </div>

              <Crosshair className="right-5 bottom-5" size={10} color="rgba(245,245,245,0.22)" />
            </article>
          ))}
        </div>

        {/* footnote rail */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <HudLabel>skinvault protocol — v1.0</HudLabel>
          <a
            href="#claim"
            className="group inline-flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] text-chalk uppercase"
          >
            <span className="border-b border-chalk/30 pb-1 transition-colors group-hover:border-blood">
              забронировать место
            </span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
