import { useInView } from "@/lib/useInView";
import { cn } from "@/utils/cn";
import { GradientDivider, HudLabel } from "./Hud";
import { ScannerVisual } from "./ScannerVisual";

export function Hero() {
  const { ref, inView } = useInView(0.05);

  return (
    <section id="top" ref={ref} className="relative pt-28 pb-16 sm:pt-32 lg:pt-32 lg:pb-20">
      <div className="mx-auto grid max-w-[1560px] grid-cols-1 items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1.06fr_0.94fr] lg:gap-14 lg:px-14 xl:gap-20">
        {/* ---------------- LEFT: messaging ---------------- */}
        <div className={cn("reveal relative", inView && "reveal-in")}>
          {/* section marker */}
          <div className="absolute -top-4 -left-5 hidden h-[112%] w-px bg-gradient-to-b from-blood via-blood/20 to-transparent lg:block" />

          {/* category badge */}
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-chalk/12 bg-graphite/60 py-2 pr-4 pl-3 backdrop-blur-sm">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M7 0v14M0 7h14" stroke="#CC0000" strokeWidth="1.2" />
              <circle cx="7" cy="7" r="3" stroke="#7B2FBE" strokeWidth="1" />
            </svg>
            <span className="font-mono text-[9px] leading-none tracking-[0.26em] text-chalk/85 uppercase sm:text-[10px]">
              Цифровой сертификат уникальности
            </span>
          </div>

          {/* headline */}
          <h1 className="font-display leading-[0.84] font-black tracking-[-0.035em] uppercase">
            <span className="block text-[clamp(3.1rem,9.4vw,8.25rem)] text-chalk">Got</span>
            <span
              className="block text-[clamp(3.1rem,9.4vw,8.25rem)]"
              style={{
                backgroundImage: "linear-gradient(96deg, #CC0000 0%, #F5F5F5 38%, #9d5df0 74%, #0066FF 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 0 42px rgba(123,47,190,0.35))",
              }}
            >
              Proof?
            </span>
          </h1>

          {/* sub-headline */}
          <h2 className="font-display mt-7 max-w-[22ch] text-[clamp(1.05rem,2.15vw,1.85rem)] leading-[1.18] font-extrabold tracking-[-0.01em] text-chalk uppercase">
            Твоя тату — <span className="text-blood-soft">единственная в мире</span>. И это можно доказать.
          </h2>

          <div className="mt-8 flex items-start gap-5">
            <span className="mt-2 hidden h-16 w-px shrink-0 bg-gradient-to-b from-uv to-transparent sm:block" />
            <p className="max-w-[46ch] text-[15px] leading-relaxed text-ash sm:text-base">
              Мы создаём цифровые паспорта подлинности для авторских татуировок. Гарантия того, что твой эскиз
              никогда не повторится.
            </p>
          </div>

          {/* CTA row */}
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
            <a
              href="#claim"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-chalk px-7 py-4 font-mono text-[11px] font-semibold tracking-[0.2em] text-void uppercase transition-transform duration-300 hover:scale-[1.02]"
              style={{ boxShadow: "0 0 40px -10px rgba(245,245,245,0.7)" }}
            >
              <span className="relative z-10">Получить доступ</span>
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
              <span
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: "linear-gradient(96deg, #ff3b3b 0%, #f5f5f5 50%, #4d8bff 100%)" }}
              />
            </a>

            <div className="min-w-[190px]">
              <div className="flex items-baseline justify-between gap-4">
                <HudLabel dot="red">Свободно мест</HudLabel>
                <span className="font-mono text-[11px] text-chalk">37 / 100</span>
              </div>
              <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-chalk/10">
                <div
                  className="h-full w-[63%] rounded-full"
                  style={{
                    background: "linear-gradient(90deg,#cc0000,#7b2fbe 70%,#0066ff)",
                    boxShadow: "0 0 14px 1px rgba(204,0,0,0.6)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* micro stats */}
          <GradientDivider className="mt-12 opacity-50" />
          <dl className="mt-5 grid grid-cols-3 gap-4">
            {[
              { k: "1 / 1", v: "уникальность" },
              { k: "QR", v: "верификация" },
              { k: "24ч", v: "выпуск паспорта" },
            ].map((s) => (
              <div key={s.k}>
                <dt className="font-display text-lg font-extrabold tracking-tight text-chalk sm:text-xl">{s.k}</dt>
                <dd className="mt-1 font-mono text-[9px] tracking-[0.2em] text-ash/70 uppercase">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ---------------- RIGHT: scanner visual ---------------- */}
        <div
          className={cn("reveal relative", inView && "reveal-in")}
          style={{ transitionDelay: "160ms" }}
        >
          <ScannerVisual />
        </div>
      </div>
    </section>
  );
}
