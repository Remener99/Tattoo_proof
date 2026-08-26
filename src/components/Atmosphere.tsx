import { useEffect, useState } from "react";

/**
 * Full-page environment: pitch-black base, dual edge lighting (blood red left /
 * ultraviolet right), HUD grid, film grain and vignette.
 */
export function Atmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* base */}
      <div className="absolute inset-0 bg-void" />

      {/* blood red edge light — LEFT */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 46% at -6% 26%, rgba(204,0,0,0.32) 0%, rgba(204,0,0,0.08) 42%, transparent 72%)",
        }}
      />
      {/* ultraviolet / electric edge light — RIGHT */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(56% 46% at 106% 58%, rgba(123,47,190,0.30) 0%, rgba(0,102,255,0.12) 40%, transparent 74%)",
        }}
      />
      {/* deep low glow */}
      <div
        className="absolute inset-x-0 bottom-0 h-[45vh]"
        style={{
          background:
            "radial-gradient(70% 100% at 50% 130%, rgba(123,47,190,0.16) 0%, transparent 70%)",
        }}
      />

      {/* HUD grid */}
      <div
        className="hud-grid absolute inset-0 opacity-70"
        style={{
          maskImage: "radial-gradient(120% 90% at 50% 20%, #000 0%, rgba(0,0,0,0.35) 55%, transparent 88%)",
        }}
      />

      {/* fixed edge light bars */}
      <div
        className="animate-flicker absolute top-0 bottom-0 left-0 w-px"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, #cc0000 22%, rgba(204,0,0,0.25) 62%, transparent 100%)",
          boxShadow: "0 0 26px 2px rgba(204,0,0,0.55)",
        }}
      />
      <div
        className="animate-flicker absolute top-0 right-0 bottom-0 w-px"
        style={{
          background: "linear-gradient(to bottom, transparent 4%, rgba(0,102,255,0.28) 34%, #7b2fbe 74%, transparent 100%)",
          boxShadow: "0 0 26px 2px rgba(123,47,190,0.5)",
        }}
      />

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(105% 78% at 50% 42%, transparent 38%, rgba(5,5,5,0.72) 100%)",
        }}
      />

      {/* film grain */}
      <div className="grain-layer animate-grain absolute -inset-24 opacity-[0.22] mix-blend-soft-light" />
    </div>
  );
}

/** Thin viewport crosshair that tracks the pointer + live coordinate readout. */
export function CursorHud() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setActive(true);
    const onMove = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  if (!active) return null;

  const pad = (n: number) => Math.max(0, Math.round(n)).toString().padStart(4, "0");

  return (
    <div className="pointer-events-none fixed inset-0 z-40 hidden md:block" aria-hidden>
      <div
        className="absolute top-0 bottom-0 w-px transition-opacity duration-300"
        style={{ left: pos.x, background: "linear-gradient(to bottom, transparent, rgba(204,0,0,0.28), transparent)" }}
      />
      <div
        className="absolute right-0 left-0 h-px"
        style={{ top: pos.y, background: "linear-gradient(to right, transparent, rgba(0,102,255,0.26), transparent)" }}
      />
      <div
        className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-chalk/30"
        style={{ left: pos.x, top: pos.y }}
      />
      <div className="fixed bottom-5 left-6 font-mono text-[10px] tracking-[0.3em] text-chalk/30 uppercase">
        X:{pad(pos.x)} / Y:{pad(pos.y)}
      </div>
    </div>
  );
}
