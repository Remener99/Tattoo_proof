import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

const SWATCHES = [
  { hex: "#0A0A0A", name: "void" },
  { hex: "#F5F5F5", name: "chalk" },
  { hex: "#CC0000", name: "blood" },
  { hex: "#7B2FBE", name: "uv" },
  { hex: "#0066FF", name: "electric" },
];

/** Figma-style measurement guides, type spec and colour legend. Toggle with "G". */
export function SpecOverlay() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (e.key.toLowerCase() === "g") setOn((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setOn((v) => !v)}
        className={cn(
          "fixed right-5 bottom-5 z-[60] inline-flex items-center gap-2.5 rounded-full border px-4 py-2.5 font-mono text-[9px] tracking-[0.24em] uppercase backdrop-blur-md transition-all duration-300",
          on
            ? "border-electric/70 bg-electric/12 text-chalk"
            : "border-chalk/15 bg-void/70 text-ash hover:border-chalk/35 hover:text-chalk",
        )}
        style={on ? { boxShadow: "0 0 30px -8px rgba(0,102,255,0.9)" } : undefined}
        aria-pressed={on}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", on ? "bg-electric" : "bg-ash/60")} />
        spec {on ? "on" : "off"}
        <span className="hidden text-ash/50 sm:inline">[g]</span>
      </button>

      <div
        className={cn(
          "pointer-events-none fixed inset-0 z-[55] transition-opacity duration-500",
          on ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      >
        {/* layout gutters */}
        {["3.5rem", "50%", "calc(100% - 3.5rem)"].map((left, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px"
            style={{
              left,
              backgroundImage: "linear-gradient(to bottom, rgba(123,47,190,0.85) 55%, transparent 55%)",
              backgroundSize: "1px 9px",
            }}
          />
        ))}

        {/* top ruler */}
        <div className="absolute inset-x-0 top-[70px] h-6 border-y border-blood/40 bg-blood/[0.05]">
          <div className="flex h-full items-center justify-between px-3">
            <span className="font-mono text-[8px] tracking-[0.24em] text-blood-soft/90 uppercase">
              header · h 70
            </span>
            <span className="font-mono text-[8px] tracking-[0.24em] text-blood-soft/90 uppercase">
              max-w 1560 · gutter 56
            </span>
          </div>
        </div>

        {/* type spec card */}
        <div className="absolute top-[110px] left-6 hidden w-[210px] border border-electric/40 bg-void/85 p-3 backdrop-blur-md md:block">
          <div className="mb-2 font-mono text-[8px] tracking-[0.26em] text-electric uppercase">type scale</div>
          {[
            ["H1 · GOT PROOF?", "Unbounded 900 / 152"],
            ["H2 · RU HEADLINE", "Unbounded 800 / 30"],
            ["BODY", "Inter 400 / 16"],
            ["HUD", "JB Mono 400 / 10 · ls .3em"],
          ].map(([a, b]) => (
            <div key={a} className="flex items-baseline justify-between gap-2 py-[3px]">
              <span className="font-mono text-[8px] text-chalk/80">{a}</span>
              <span className="font-mono text-[8px] text-ash/60">{b}</span>
            </div>
          ))}
        </div>

        {/* palette */}
        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-3 border border-chalk/15 bg-void/85 px-4 py-3 backdrop-blur-md sm:flex">
          {SWATCHES.map((s) => (
            <div key={s.hex} className="flex items-center gap-2">
              <span
                className="h-3.5 w-3.5 rounded-[2px] ring-1 ring-chalk/25"
                style={{ background: s.hex }}
              />
              <span className="font-mono text-[8px] tracking-[0.16em] text-ash/80 uppercase">{s.hex}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
