import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/utils/cn";

/* ------------------------------------------------------------------ */
/*  Camera focus brackets — dual lit (blood red left / ultraviolet right)
/* ------------------------------------------------------------------ */
export function FocusBrackets({
  size = 26,
  thickness = 1,
  inset = 0,
  className,
}: {
  size?: number;
  thickness?: number;
  inset?: number;
  className?: string;
}) {
  const common = "absolute pointer-events-none";
  const s: CSSProperties = { width: size, height: size, borderWidth: thickness };
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      <span
        className={cn(common, "border-t border-l border-blood")}
        style={{ ...s, top: inset, left: inset, boxShadow: "-6px -6px 22px -6px rgba(204,0,0,0.85)" }}
      />
      <span
        className={cn(common, "border-t border-r border-electric")}
        style={{ ...s, top: inset, right: inset, boxShadow: "6px -6px 22px -6px rgba(0,102,255,0.8)" }}
      />
      <span
        className={cn(common, "border-b border-l border-uv")}
        style={{ ...s, bottom: inset, left: inset, boxShadow: "-6px 6px 22px -6px rgba(123,47,190,0.85)" }}
      />
      <span
        className={cn(common, "border-r border-b border-blood")}
        style={{ ...s, right: inset, bottom: inset, boxShadow: "6px 6px 22px -6px rgba(204,0,0,0.75)" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small mono HUD label
/* ------------------------------------------------------------------ */
export function HudLabel({
  children,
  className,
  dot,
}: {
  children: ReactNode;
  className?: string;
  dot?: "red" | "blue" | "none";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.34em] text-ash uppercase",
        className,
      )}
    >
      {dot && dot !== "none" && (
        <span
          className={cn(
            "animate-blink inline-block h-[5px] w-[5px] rounded-full",
            dot === "red" ? "bg-blood-soft" : "bg-electric",
          )}
        />
      )}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Thin red → violet gradient divider
/* ------------------------------------------------------------------ */
export function GradientDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-px w-full", className)}
      style={{
        background:
          "linear-gradient(90deg, rgba(204,0,0,0) 0%, rgba(204,0,0,0.85) 12%, rgba(123,47,190,0.75) 52%, rgba(0,102,255,0.85) 84%, rgba(0,102,255,0) 100%)",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Crosshair marker (+)
/* ------------------------------------------------------------------ */
export function Crosshair({
  className,
  size = 14,
  color = "rgba(245,245,245,0.35)",
}: {
  className?: string;
  size?: number;
  color?: string;
}) {
  return (
    <svg
      className={cn("pointer-events-none absolute", className)}
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
    >
      <path d="M7 0v14M0 7h14" stroke={color} strokeWidth="1" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Vertical axis ruler with coordinate ticks
/* ------------------------------------------------------------------ */
export function AxisTicks({
  orientation = "vertical",
  count = 14,
  className,
}: {
  orientation?: "vertical" | "horizontal";
  count?: number;
  className?: string;
}) {
  const vertical = orientation === "vertical";
  return (
    <div
      className={cn(
        "pointer-events-none flex justify-between",
        vertical ? "h-full w-3 flex-col items-end" : "w-full flex-row items-start",
        className,
      )}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "bg-chalk/25",
            vertical ? "h-px" : "w-px",
            i % 5 === 0 ? (vertical ? "w-3" : "h-3") : vertical ? "w-1.5" : "h-1.5",
          )}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Verified hologram badge  (✓) ONE OF ONE — VERIFIED
/* ------------------------------------------------------------------ */
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <div className={cn("relative inline-flex", className)}>
      <span className="animate-pulse-ring absolute inset-0 rounded-full border border-electric/50" />
      <span
        className="relative inline-flex items-center gap-2.5 rounded-full border border-chalk/15 px-4 py-2 backdrop-blur-md"
        style={{
          background: "linear-gradient(100deg, rgba(204,0,0,0.16) 0%, rgba(10,10,10,0.72) 45%, rgba(0,102,255,0.18) 100%)",
          boxShadow: "0 0 30px -8px rgba(0,102,255,0.6), inset 0 1px 0 0 rgba(245,245,245,0.09)",
        }}
      >
        <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-electric/20 ring-1 ring-electric/70">
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M1 5.2 3.6 8 9 1.8" stroke="#7fb2ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="font-mono text-[10px] leading-none font-medium tracking-[0.22em] text-chalk uppercase">
          One of One — Verified
        </span>
      </span>
    </div>
  );
}
