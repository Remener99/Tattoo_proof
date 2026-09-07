import React from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { STATUS_META, type TaskStatus } from "./store";
import { cn } from "./utils/cn";

/* ---------- primitives ---------- */
export function Card({ className, children, glow }: { className?: string; children: React.ReactNode; glow?: string }) {
  return (
    <div
      className={cn("glass rounded-2xl p-5", className)}
      style={glow ? { boxShadow: `0 0 60px -20px ${glow}` } : undefined}
    >
      {children}
    </div>
  );
}

export function MicroLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40", className)}>
      {children}
    </div>
  );
}

export function Btn({
  children, onClick, variant = "ghost", className, small,
}: { children: React.ReactNode; onClick?: () => void; variant?: "neon" | "ghost" | "danger" | "violet"; className?: string; small?: boolean }) {
  const v = {
    neon: "bg-[#c8ff2e] text-black hover:bg-[#d8ff5c] font-bold shadow-[0_0_24px_rgba(200,255,46,.3)]",
    ghost: "border border-white/12 bg-white/[0.04] text-white/80 hover:border-white/25 hover:text-white",
    danger: "border border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
    violet: "bg-violet-500/20 border border-violet-400/30 text-violet-200 hover:bg-violet-500/30",
  }[variant];
  return (
    <button onClick={onClick} className={cn("inline-flex items-center gap-1.5 rounded-xl transition-all active:scale-95", small ? "px-2.5 py-1.5 text-xs" : "px-4 py-2.5 text-sm", v, className)}>
      {children}
    </button>
  );
}

export function FieldInput({ value, onChange, placeholder, className, mono, type = "text" }: {
  value: string | number; onChange: (v: string) => void; placeholder?: string; className?: string; mono?: boolean; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn("field w-full px-3 py-2 text-sm text-white placeholder:text-white/25", mono && "font-mono", className)}
    />
  );
}

export function FieldArea({ value, onChange, placeholder, className, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string; rows?: number;
}) {
  return (
    <textarea
      value={value} rows={rows} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn("field w-fullresize-y px-3 py-2 text-sm leading-relaxed text-white placeholder:text-white/25", className)}
    />
  );
}

export function ProgressBar({ value, color = "#c8ff2e", h = 8 }: { value: number; color?: string; h?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-full bg-white/10" style={{ height: h }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color, boxShadow: `0 0 12px ${color}` }} />
    </div>
  );
}

export function StatusPill({ status, onChange, readonly }: { status: TaskStatus; onChange?: (s: TaskStatus) => void; readonly?: boolean }) {
  if (readonly) {
    const m = STATUS_META[status];
    return <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider" style={{ color: m.color, background: m.bg, border: `1px solid ${m.color}44` }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />{m.label}</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.keys(STATUS_META) as TaskStatus[]).map((k) => {
        const m = STATUS_META[k];
        const active = k === status;
        return (
          <button key={k} onClick={() => onChange?.(k)}
            className={cn("rounded-full px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95",
              active ? "" : "border border-white/10 bg-white/[0.03] text-white/35 hover:text-white/70")}
            style={active ? { color: m.color, background: m.bg, border: `1px solid ${m.color}66`, boxShadow: `0 0 12px ${m.color}33` } : undefined}>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

export function Tick({ on, onClick }: { on: boolean; onClick?: () => void }) {
  return <button onClick={onClick} className={cn("tick", on && "on")}>{on && <Check size={13} strokeWidth={3.5} />}</button>;
}

export function Empty({ title, hint, action }: { title: string; hint: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-10 text-center">
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#c8ff2e]">∅ пусто</div>
      <div className="mt-2 text-lg font-bold text-white">{title}</div>
      <div className="mx-auto mt-1 max-w-sm text-sm text-white/45">{hint}</div>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function AddRow({ onAdd, label }: { onAdd: () => void; label: string }) {
  return (
    <button onClick={onAdd} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] py-2.5 text-sm text-white/50 transition-all hover:border-[#c8ff2e]/50 hover:text-[#c8ff2e]">
      <Plus size={15} /> {label}
    </button>
  );
}

export function DelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg p-1.5 text-white/25 transition-all hover:bg-rose-500/15 hover:text-rose-300">
      <Trash2 size={14} />
    </button>
  );
}

/* ---------- SVG charts ---------- */
export function Spark({ data, w = 260, h = 64, color = "#c8ff2e", fill = true }: { data: number[]; w?: number; h?: number; color?: string; fill?: boolean }) {
  if (!data.length) return <div className="grid h-16 place-items-center font-mono text-xs text-white/25">нет данных</div>;
  const max = Math.max(...data, 1), min = Math.min(...data, 0);
  const px = (i: number) => (i / Math.max(1, data.length - 1)) * (w - 8) + 4;
  const py = (v: number) => h - 6 - ((v - min) / Math.max(1, max - min)) * (h - 14);
  const pts = data.map((v, i) => `${px(i)},${py(v)}`).join(" ");
  const gid = React.useId().replace(/:/g, "");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="overflow-visible">
      {fill && (
        <>
          <defs>
            <linearGradient id={gidx(gid)} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`4,${h} ${pts} ${w - 4},${h}`} fill={`url(#${gidx(gid)})`} />
        </>
      )}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      {data.map((v, i) => (<circle key={i} cx={px(i)} cy={py(v)} r="3" fill="#0b0d14" stroke={color} strokeWidth="2" />))}
    </svg>
  );
}
function gidx(id: string) { return "g" + id; }

export function Bars({ data, color = "#8b5cf6", h = 90, target }: { data: { label: string; value: number }[]; color?: string; h?: number; target?: number }) {
  if (!data.length) return <div className="grid place-items-center py-8 font-mono text-xs text-white/25">нет данных — добавь дни в таблицу</div>;
  const max = Math.max(...data.map((d) => d.value), target || 0, 1);
  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height: h }}>
        {data.map((d, i) => (
          <div key={i} className="group relative flex flex-1 flex-col items-center justify-end gap-1" style={{ height: "100%" }}>
            <span className="font-mono text-[10px] font-bold text-white/70">{d.value || ""}</span>
            <div className="w-full rounded-t-md transition-all group-hover:brightness-125"
              style={{ height: `${Math.max(4, (d.value / max) * (h - 24))}px`, background: `linear-gradient(180deg, ${color}, ${color}55)`, boxShadow: d.value > 0 ? `0 0 12px ${color}44` : undefined }} />
            {target !== undefined && (
              <div className="absolute left-0 right-0 border-t border-dashed border-[#c8ff2e]/60" style={{ bottom: `${(target / max) * (h - 24)}px` }} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1.5">
        {data.map((d, i) => (<div key={i} className="flex-1 truncate text-center font-mono text-[9px] text-white/30">{d.label}</div>))}
      </div>
    </div>
  );
}

export function Ring({ value, size = 120, stroke = 10, color = "#c8ff2e", children }: { value: number; size?: number; stroke?: number; color?: string; children?: React.ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (Math.min(100, value) / 100) * c}
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dashoffset .8s cubic-bezier(.22,1,.36,1)" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export function Funnel({ scans, nicks }: { scans: number; nicks: number }) {
  const conv = scans ? (nicks / scans) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-widest text-cyan-300">Сканы QR</span>
          <span className="font-mono text-xl font-bold text-white tabular">{scans}</span>
        </div>
        <ProgressBar value={100} color="#22d3ee" h={6} />
      </div>
      <div className="flex justify-center"><div className="font-mono text-white/25">▼</div></div>
      <div className="rounded-xl border border-[#c8ff2e]/25 bg-[#c8ff2e]/[.07] px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#c8ff2e]">TG-ники</span>
          <span className="font-mono text-xl font-bold text-white tabular">{nicks}</span>
        </div>
        <ProgressBar value={conv} color="#c8ff2e" h={6} />
      </div>
      <div className="text-center font-mono text-xs text-white/50">конверсия <span className="font-bold text-white">{conv.toFixed(1)}%</span></div>
    </div>
  );
}
