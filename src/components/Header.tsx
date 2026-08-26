import { GradientDivider } from "./Hud";

export function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50">
      <div className="bg-void/55 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1560px] items-center justify-between px-5 sm:px-8 lg:px-14">
          {/* logo */}
          <a href="#top" className="group flex items-baseline gap-3">
            <span
              className="font-display text-[19px] leading-none font-extrabold tracking-[0.26em] text-chalk uppercase sm:text-[22px]"
              style={{ textShadow: "0 0 26px rgba(245,245,245,0.28)" }}
            >
              Skinvault
            </span>
            <span className="hidden font-mono text-[9px] tracking-[0.3em] text-ash/70 uppercase sm:inline">
              ®
            </span>
          </a>

          {/* center telemetry */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-3 lg:flex">
            <span className="h-px w-8 bg-blood/70" />
            <span className="font-mono text-[10px] tracking-[0.34em] text-ash/70 uppercase">
              sys.status — pre-launch
            </span>
            <span className="h-px w-8 bg-electric/70" />
          </div>

          {/* early access badge */}
          <div
            className="relative flex items-center gap-2.5 rounded-full border border-chalk/12 px-3.5 py-1.5 sm:px-4 sm:py-2"
            style={{
              background:
                "linear-gradient(100deg, rgba(204,0,0,0.14) 0%, rgba(18,18,18,0.9) 50%, rgba(123,47,190,0.18) 100%)",
              boxShadow: "0 0 24px -6px rgba(123,47,190,0.65), inset 0 1px 0 0 rgba(245,245,245,0.07)",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blood-soft opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blood-soft" />
            </span>
            <span className="font-mono text-[9px] leading-none tracking-[0.2em] text-chalk uppercase sm:text-[10px]">
              Early Access <span className="text-ash/60">/</span> Ранний доступ
            </span>
          </div>
        </div>
        <GradientDivider className="opacity-60" />
      </div>
    </header>
  );
}
