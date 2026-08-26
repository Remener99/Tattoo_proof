import { useEffect, useState } from "react";
import heroTattoo from "@/assets/hero-tattoo.jpg";
import scanDetail from "@/assets/scan-detail.jpg";
import { AxisTicks, Crosshair, FocusBrackets, VerifiedBadge } from "./Hud";

const COORDS = ["0.00", "0.24", "0.48", "0.72", "0.96"];

export function ScannerVisual() {
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((p) => (p >= 100 ? 4 : p + 1));
    }, 46);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[540px] lg:mr-0 lg:ml-auto lg:max-w-[580px]">
      {/* outer glow */}
      <div
        className="pointer-events-none absolute -inset-10 opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(50% 50% at 12% 20%, rgba(204,0,0,0.30), transparent 70%), radial-gradient(50% 50% at 88% 82%, rgba(123,47,190,0.34), transparent 72%)",
        }}
      />

      {/* axis coordinates — top */}
      <div className="mb-2 flex items-end justify-between pr-6 pl-6">
        <span className="font-mono text-[9px] tracking-[0.3em] text-ash/60 uppercase">x-axis</span>
        <div className="flex flex-1 justify-between px-6">
          {COORDS.map((c) => (
            <span key={c} className="font-mono text-[9px] tracking-[0.16em] text-ash/40">
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {/* axis ruler — left */}
        <div className="hidden w-4 flex-col items-center justify-between py-4 sm:flex">
          <AxisTicks count={18} className="h-full" />
        </div>

        {/* scanner frame */}
        <div
          className="relative aspect-[4/5] w-full overflow-hidden rounded-[3px] border border-chalk/12 bg-ink"
          style={{ boxShadow: "0 40px 120px -30px rgba(0,0,0,0.95), inset 0 0 0 1px rgba(245,245,245,0.03)" }}
        >
          <img
            src={heroTattoo}
            alt="Макро-съёмка авторской татуировки — маска Ханья, чёрная тушь"
            className="absolute inset-0 h-full w-full scale-[1.02] object-cover"
            style={{ filter: "contrast(1.12) saturate(1.05) brightness(0.96)" }}
          />

          {/* ink-black gradient wash */}
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-void/45" />
          <div className="hud-grid-fine absolute inset-0 opacity-30 mix-blend-overlay" />

          {/* scanning laser */}
          <div className="animate-scanline pointer-events-none absolute inset-x-0 top-0 h-24">
            <div
              className="h-full w-full"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,102,255,0) 0%, rgba(0,102,255,0.10) 62%, rgba(123,47,190,0.22) 92%, rgba(245,245,245,0.9) 100%)",
              }}
            />
            <div
              className="h-px w-full"
              style={{ boxShadow: "0 0 22px 3px rgba(0,102,255,0.9), 0 0 60px 10px rgba(123,47,190,0.5)" }}
            />
          </div>

          {/* focus brackets */}
          <FocusBrackets size={34} inset={14} />

          {/* tracking box on the ink */}
          <div className="absolute top-[26%] left-[22%] h-[34%] w-[52%]">
            <div className="absolute inset-0 border border-chalk/25" />
            <FocusBrackets size={12} />
            <span className="absolute -top-[18px] left-0 font-mono text-[9px] tracking-[0.22em] text-chalk/70 uppercase">
              ink_pattern
            </span>
            <span className="absolute -right-1 -bottom-[18px] font-mono text-[9px] tracking-[0.22em] text-electric/80 uppercase">
              lock
            </span>
          </div>

          <Crosshair className="top-[62%] left-[70%]" size={16} color="rgba(204,0,0,0.7)" />
          <Crosshair className="top-[18%] left-[76%]" size={11} />

          {/* top telemetry bar */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3.5">
            <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.26em] text-chalk/80 uppercase">
              <span className="animate-blink inline-block h-1.5 w-1.5 rounded-full bg-blood-soft" />
              rec
            </span>
            <span className="font-mono text-[9px] tracking-[0.26em] text-chalk/60 uppercase">
              scan {progress.toString().padStart(3, "0")}%
            </span>
          </div>

          {/* progress line */}
          <div className="absolute inset-x-4 top-9 h-px bg-chalk/10">
            <div
              className="h-full transition-[width] duration-75 ease-linear"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #cc0000, #7b2fbe 60%, #0066ff)",
                boxShadow: "0 0 12px 1px rgba(123,47,190,0.8)",
              }}
            />
          </div>

          {/* bottom data strip */}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
            <div className="mb-3 h-px w-full bg-gradient-to-r from-blood/70 via-uv/60 to-electric/70" />
            <div className="flex flex-wrap items-end justify-between gap-y-1 font-mono text-[9px] tracking-[0.2em] text-ash/80 uppercase">
              <span>id: sv-0001</span>
              <span className="hidden sm:inline">pigment: black</span>
              <span className="text-chalk/85">match: 0 similar</span>
            </div>
          </div>

          {/* sample chip */}
          <div className="absolute right-4 bottom-14 hidden h-16 w-16 overflow-hidden rounded-[2px] border border-chalk/20 sm:block">
            <img src={scanDetail} alt="Фрагмент линий тату" className="h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-void/80 to-transparent" />
            <span className="absolute bottom-1 left-1.5 font-mono text-[7px] tracking-[0.2em] text-chalk/70 uppercase">
              sample
            </span>
          </div>
        </div>
      </div>

      {/* floating hologram tag */}
      <div className="animate-float-y absolute -bottom-5 left-2 z-20 sm:-bottom-6 sm:left-8">
        <VerifiedBadge />
      </div>

      {/* right side vertical caption */}
      <div className="absolute top-1/2 -right-8 hidden -translate-y-1/2 rotate-90 lg:block">
        <span className="font-mono text-[9px] tracking-[0.42em] text-ash/50 uppercase">skin scan / 8k</span>
      </div>
    </div>
  );
}
