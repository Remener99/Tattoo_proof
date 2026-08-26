import { GradientDivider, HudLabel } from "./Hud";

export function Footer() {
  return (
    <footer className="relative z-10 px-5 pt-10 pb-12 sm:px-8 lg:px-14">
      <div className="mx-auto max-w-[1560px]">
        <GradientDivider className="opacity-60" />
        <div className="flex flex-col items-center gap-6 pt-8 sm:flex-row sm:justify-between">
          <HudLabel className="order-2 sm:order-1">lat 55.7558 / lon 37.6173</HudLabel>

          <p
            className="font-display order-1 text-center text-[11px] font-bold tracking-[0.32em] text-chalk/85 uppercase sm:order-2 sm:text-[13px]"
            style={{ textShadow: "0 0 30px rgba(245,245,245,0.22)" }}
          >
            Skinvault <span className="text-blood">•</span> Your skin. Your vault.{" "}
            <span className="text-electric">•</span> 2025
          </p>

          <HudLabel className="order-3" dot="blue">
            build 1.0.0
          </HudLabel>
        </div>
      </div>
    </footer>
  );
}
