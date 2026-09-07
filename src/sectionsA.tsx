import { useMemo, useState } from "react";
import {
  ArrowRight, CheckCircle2, CircleDashed, Crosshair, ExternalLink, Flag, Flame,
  Gauge, Plus, ScanLine, Store as StoreIcon, Users, ChevronDown, Zap, ShieldCheck, X,
} from "lucide-react";
import { BLOCKS, STATUS_META, STUDIO_META, uid, type TaskStatus } from "./store";
import type { Store as StoreT } from "./store";
import { Btn, Card, FieldArea, FieldInput, MicroLabel, ProgressBar, Ring, Spark, StatusPill, Tick, DelBtn, Empty } from "./ui";
import { cn } from "./utils/cn";

/* ================= OVERVIEW ================= */
export function Overview({ store }: { store: StoreT }) {
  const { state, update, derived, presentMode } = store;
  const gateInfo = {
    idle: { label: "Ожидание трафика", color: "#9aa0b2", text: "Начни вводить сканы и ники — гейт оживёт автоматически." },
    fail: { label: "Ниже порога — риск PIVOT", color: "#fb7185", text: `Прогноз ${derived.weeklyProj.toFixed(0)} ников/нед при цели ${state.targetMin}–${state.targetMax}. Усиль точки контакта или меняй оффер.` },
    pass: { label: "В ЦЕЛИ — ищем команду", color: "#c8ff2e", text: `Прогноз ${derived.weeklyProj.toFixed(0)} ников/нед. Порог ${state.targetMin}–${state.targetMax} выполняется. Готовь команду под MVP.` },
    over: { label: "Перевыполнение — SCALE", color: "#22d3ee", text: `Прогноз ${derived.weeklyProj.toFixed(0)} ников/нед — выше ${state.targetMax}. Спрос доказан, ускоряйся.` },
  }[derived.gate];

  const nicksSeries = state.metrics.map((m) => Number(m.nicks) || 0);
  const scansSeries = state.metrics.map((m) => Number(m.scans) || 0);

  return (
    <div className="space-y-5">
      {/* hypothesis + gate */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="corner rise lg:col-span-2" glow="rgba(139,92,246,.25)">
          <div className="flex items-start justify-between gap-4">
            <div>
              <MicroLabel>Гипотеза Phase 1 · фальсифицируемая</MicroLabel>
              {presentMode ? (
                <p className="mt-2 max-w-2xl text-lg font-semibold leading-snug text-white">«{state.hypothesis}»</p>
              ) : (
                <FieldArea value={state.hypothesis} rows={2} onChange={(v) => update({ hypothesis: v })} className="mt-2 max-w-2xl !bg-transparent !text-base font-semibold leading-snug" placeholder="Сформулируй гипотезу в 1–2 предложениях…" />
              )}
            </div>
            <Crosshair className="hidden shrink-0 text-violet-400 sm:block" size={28} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <MicroLabel>North Star</MicroLabel>
              <div className="mt-1 font-mono text-lg font-bold text-[#c8ff2e] tabular">50–100 <span className="text-xs font-medium text-white/50">ников / нед</span></div>
              {!presentMode && (
                <div className="mt-2 flex items-center gap-2">
                  <input type="number" value={state.targetMin} onChange={(e) => update({ targetMin: Number(e.target.value) || 0 })} className="field w-16 px-2 py-1 font-mono text-xs" />
                  <span className="text-white/30">—</span>
                  <input type="number" value={state.targetMax} onChange={(e) => update({ targetMax: Number(e.target.value) || 0 })} className="field w-16 px-2 py-1 font-mono text-xs" />
                </div>
              )}
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <MicroLabel>Правило гейта</MicroLabel>
              <div className="mt-1 text-sm font-semibold text-white">≥ {state.targetMin} → команда MVP</div>
              <div className="text-sm text-white/45">&lt; {state.targetMin} → pivot / закрытие</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <MicroLabel>Статус гейта · live</MicroLabel>
              <div className="mt-1 text-sm font-bold" style={{ color: gateInfo.color }}>{gateInfo.label}</div>
              <div className="mt-0.5 text-xs leading-snug text-white/45">{gateInfo.text}</div>
            </div>
          </div>
        </Card>

        <Card className="rise rise-1 flex flex-col items-center justify-center text-center" glow="rgba(200,255,46,.15)">
          <MicroLabel>Прогресс Phase 1</MicroLabel>
          <div className="my-3"><Ring value={derived.progress} size={150} stroke={12}>
            <div><div className="font-display text-3xl font-800 font-extrabold text-white tabular">{derived.progress}<span className="text-base text-white/40">%</span></div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">{derived.done}/12 этапов</div></div>
          </Ring></div>
          {derived.nextTask && (
            <div className="w-full rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] p-3 text-left">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-cyan-300"><Zap size={12} /> Следующее действие</div>
              <div className="mt-1 text-sm font-bold text-white">{derived.nextTask.num} · {derived.nextTask.title}</div>
              <div className="text-xs text-white/50">{derived.nextTask.short}</div>
            </div>
          )}
        </Card>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi icon={<ScanLine size={16} />} label="Сканы QR" value={String(derived.totalScans)} sub={`${derived.avgScans.toFixed(1)} / день`} color="#22d3ee" delay="rise-1" />
        <Kpi icon={<Users size={16} />} label="TG-ники" value={String(derived.totalNicks)} sub={`цель ${state.targetMin}–${state.targetMax}/нед`} color="#c8ff2e" delay="rise-2" />
        <Kpi icon={<Gauge size={16} />} label="Конверсия" value={`${derived.conv.toFixed(1)}%`} sub={convHint(derived.conv)} color="#8b5cf6" delay="rise-3" />
        <Kpi icon={<StoreIcon size={16} />} label="Студии live" value={`${derived.liveStudios}/${state.studios.length}`} sub={`${derived.activeStudios} в воронке`} color="#fb923c" delay="rise-2" />
        <Kpi icon={<Flame size={16} />} label="Прогноз / нед" value={derived.weeklyProj.toFixed(0)} sub={`${derived.days} дн. данных`} color="#f472b6" delay="rise-3" />
        <Kpi icon={<Flag size={16} />} label="CustDev" value={`${derived.interviews}/100`} sub={derived.interviews ? `avg ★ ${derived.avgScore.toFixed(1)}` : "0 интервью"} color="#fbbf24" delay="rise-4" />
      </div>

      {/* pipeline + dynamics */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="rise rise-2 lg:col-span-3">
          <div className="flex items-center justify-between">
            <MicroLabel>Pipeline Phase 1 · 5 блоков</MicroLabel>
            <span className="font-mono text-[10px] text-white/30">клик — фильтр roadmap</span>
          </div>
          <Pipeline store={store} />
          <BlockStats store={store} />
        </Card>
        <Card className="rise rise-3 lg:col-span-2">
          <MicroLabel>Динамика · ники по дням</MicroLabel>
          <div className="mt-3"><Spark data={nicksSeries} color="#c8ff2e" /></div>
          <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-white/40">
            <span>сканов: <b className="text-cyan-300">{derived.totalScans}</b></span>
            <span>ников: <b className="text-[#c8ff2e]">{derived.totalNicks}</b></span>
            <span>дней: <b className="text-white">{derived.days}</b></span>
          </div>
          <div className="mt-3 border-t border-white/10 pt-3">
            <MicroLabel>Сканы по дням</MicroLabel>
            <div className="mt-2"><Spark data={scansSeries} color="#22d3ee" /></div>
          </div>
          {derived.days > 0 && derived.weeklyProj < state.targetMin && (
            <div className="mt-3 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-3 text-xs leading-relaxed text-amber-200">
              Нужно <b>{neededScans(state, derived)}</b> сканов/день при текущей конверсии, чтобы выйти на {state.targetMin} ников/нед. Сейчас {derived.avgScans.toFixed(1)}/день.
            </div>
          )}
        </Card>
      </div>

      {/* founder strip */}
      <div className="rise rise-4 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-violet-600/20 via-transparent to-cyan-400/10">
        <div className="flex items-center gap-4 px-5 py-4">
          <ShieldCheck className="shrink-0 text-[#c8ff2e]" size={26} />
          <div className="text-sm leading-relaxed">
            <b className="text-white">Для показа команде:</b> <span className="text-white/60">этот экран — 60-секундный питч фазы. Гипотеза → North Star → живой гейт → следующее действие. Всё остальное — доказательства ниже по вкладкам. Включи <b className="text-white">«Презентация»</b> в шапке, чтобы скрыть редактирование.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function convHint(c: number) {
  if (c === 0) return "пока нет данных";
  if (c < 3) return "низкая — чини оффер";
  if (c < 10) return "норма для офлайна";
  if (c < 25) return "сильная — держи темп";
  return "огонь — масштабируй";
}
function neededScans(state: StoreT["state"], d: { conv: number }) {
  if (d.conv <= 0) return "—";
  return Math.ceil(state.targetMin / 7 / (d.conv / 100));
}

function Kpi({ icon, label, value, sub, color, delay }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string; delay?: string }) {
  return (
    <div className={cn("glass rise rounded-2xl p-4", delay)} style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,.06)` }}>
      <div className="flex items-center gap-2" style={{ color }}>
        {icon}<MicroLabel className="!text-white/45">{label}</MicroLabel>
      </div>
      <div className="mt-1 font-display text-2xl font-extrabold text-white tabular">{value}</div>
      <div className="font-mono text-[11px] text-white/40">{sub}</div>
    </div>
  );
}

function Pipeline({ store }: { store: StoreT }) {
  const { state } = store;
  const [tip, setTip] = useState<string | null>(null);
  return (
    <div className="mt-4">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {BLOCKS.map((b, i) => {
          const tasks = state.tasks.filter((t) => t.block === b.id);
          const done = tasks.filter((t) => t.status === "done").length;
          const pct = tasks.length ? Math.round(tasks.reduce((a, t) => a + t.progress, 0) / tasks.length) : 0;
          const full = done === tasks.length;
          return (
            <div key={b.id} className="flex min-w-0 flex-1 items-center gap-1.5">
              <button
                onClick={() => { setTip(b.id); document.getElementById("roadmap-block-" + b.id)?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
                className={cn("group min-w-[110px] flex-1 rounded-xl border p-2.5 text-left transition-all hover:-translate-y-0.5",
                  tip === b.id ? "border-white/40" : "border-white/10 bg-white/[0.03]")}
                style={full ? { borderColor: b.color + "55", background: b.color + "10" } : undefined}>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: b.color, boxShadow: `0 0 8px ${b.color}` }} />
                  <span className="truncate text-xs font-bold text-white">{b.label}</span>
                </div>
                <div className="mt-1.5"><ProgressBar value={pct} color={b.color} h={5} /></div>
                <div className="mt-1 font-mono text-[10px] text-white/40 tabular">{done}/{tasks.length} · {pct}%</div>
              </button>
              {i < BLOCKS.length - 1 && <ArrowRight size={14} className="shrink-0 text-white/20" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BlockStats({ store }: { store: StoreT }) {
  const { state } = store;
  const rows = useMemo(() => state.tasks.map((t) => t), [state.tasks]);
  return (
    <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
      {rows.map((t) => (
        <button key={t.id} onClick={() => document.getElementById("task-" + t.id)?.scrollIntoView({ behavior: "smooth", block: "center" })}
          className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-left transition-all hover:border-white/20 hover:bg-white/[0.05]">
          {t.status === "done" ? <CheckCircle2 size={14} className="shrink-0 text-[#c8ff2e]" /> : t.status === "in_progress" ? <span className="h-3.5 w-3.5 shrink-0 animate-pulse rounded-full border-2 border-cyan-400 border-t-transparent" /> : t.status === "blocked" ? <X size={14} className="shrink-0 text-rose-400" /> : <CircleDashed size={14} className="shrink-0 text-white/25" />}
          <span className="font-mono text-[10px] text-white/35">{t.num}</span>
          <span className="truncate text-xs font-medium text-white/80">{t.title}</span>
          <span className="ml-auto font-mono text-[10px] text-white/35 tabular">{t.progress}%</span>
        </button>
      ))}
    </div>
  );
}

/* ================= ROADMAP ================= */
export function Roadmap({ store }: { store: StoreT }) {
  const { state, update, presentMode } = store;
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");
  const [open, setOpen] = useState<string | null>("studios");
  const [q, setQ] = useState("");

  const visible = state.tasks.filter((t) =>
    (filter === "all" || t.status === filter) &&
    (!q || (t.title + t.short + t.detail).toLowerCase().includes(q.toLowerCase()))
  );

  const patchTask = (id: string, patch: Partial<StoreT["state"]["tasks"][number]>) => {
    update((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t)) }));
  };

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="glass no-print sticky top-[64px] z-20 rounded-2xl p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1.5">
            {(["all", "done", "in_progress", "todo", "blocked"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn("rounded-lg px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-all",
                  filter === f ? "bg-[#c8ff2e] text-black" : "border border-white/10 text-white/50 hover:text-white")}>
                {f === "all" ? `Все ${state.tasks.length}` : STATUS_META[f].label}
              </button>
            ))}
          </div>
          <div className="ml-auto w-full sm:w-64">
            <FieldInput value={q} onChange={setQ} placeholder="Поиск по этапам…" />
          </div>
        </div>
      </div>

      {BLOCKS.map((b) => {
        const btasks = visible.filter((t) => t.block === b.id);
        if (!btasks.length) return null;
        const done = state.tasks.filter((t) => t.block === b.id && t.status === "done").length;
        const total = state.tasks.filter((t) => t.block === b.id).length;
        return (
          <div key={b.id} id={"roadmap-block-" + b.id} className="scroll-mt-40">
            <div className="mb-2 flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.color, boxShadow: `0 0 10px ${b.color}` }} />
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white">{b.label}</h3>
              <span className="font-mono text-[11px] text-white/35">{b.desc}</span>
              <span className="ml-auto rounded-full border border-white/10 px-2.5 py-0.5 font-mono text-[11px] text-white/50 tabular">{done}/{total}</span>
            </div>
            <div className="relative space-y-3 pl-5 before:absolute before:bottom-4 before:left-[7px] before:top-4 before:w-px before:bg-gradient-to-b before:from-white/20 before:via-white/10 before:to-transparent">
              {btasks.map((t) => (
                <TaskCard key={t.id} taskId={t.id} store={store} open={open === t.id} onToggle={() => setOpen(open === t.id ? null : t.id)} patchTask={patchTask} presentMode={presentMode} color={b.color} />
              ))}
            </div>
          </div>
        );
      })}
      {!visible.length && <Empty title="Ничего не найдено" hint="Попробуй другой фильтр или поисковый запрос." />}
    </div>
  );
}

function TaskCard({ taskId, store, open, onToggle, patchTask, presentMode, color }: {
  taskId: string; store: StoreT; open: boolean; onToggle: () => void;
  patchTask: (id: string, p: Partial<StoreT["state"]["tasks"][number]>) => void;
  presentMode: boolean; color: string;
}) {
  const t = store.state.tasks.find((x) => x.id === taskId)!;
  const [newCheck, setNewCheck] = useState("");
  const m = STATUS_META[t.status];
  const checksDone = t.checklist.filter((c) => c.done).length;

  const addCheck = () => {
    if (!newCheck.trim()) return;
    patchTask(t.id, { checklist: [...t.checklist, { id: uid(), label: newCheck.trim(), done: false }] });
    setNewCheck("");
  };
  const autoProgress = () => {
    if (!t.checklist.length) return;
    const pct = Math.round((checksDone / t.checklist.length) * 100);
    patchTask(t.id, { progress: pct, status: pct === 100 ? "done" : pct > 0 ? "in_progress" : t.status });
  };

  return (
    <div id={"task-" + t.id} className="scroll-mt-40 rounded-2xl border border-white/10 bg-[#0b0d14]/90 transition-all hover:border-white/20" style={open ? { borderColor: color + "55", boxShadow: `0 0 40px -18px ${color}` } : undefined}>
      {/* head */}
      <button onClick={onToggle} className="flex w-full items-center gap-3 p-4 text-left">
        <span className="absolute -ml-5 hidden" />
        <span className="font-mono text-xs font-bold text-white/30">{t.num}</span>
        <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: m.color, boxShadow: `0 0 10px ${m.color}66` }} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-bold text-white">{t.title}</span>
          <span className="block truncate text-xs text-white/45">{t.short}</span>
        </span>
        <span className="hidden w-28 shrink-0 sm:block"><ProgressBar value={t.progress} color={m.color} h={6} /></span>
        <span className="hidden font-mono text-xs text-white/40 tabular sm:block">{t.progress}%</span>
        <span className="hidden shrink-0 md:inline"><StatusPill status={t.status} readonly /></span>
        <ChevronDown size={18} className={cn("shrink-0 text-white/40 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-white/[0.07] p-4 sm:p-5">
          <p className="max-w-3xl text-sm leading-relaxed text-white/60">{t.detail}</p>

          {/* status + progress + meta */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <div>
                <MicroLabel className="mb-2">Статус</MicroLabel>
                {presentMode ? <StatusPill status={t.status} readonly /> : <StatusPill status={t.status} onChange={(s) => patchTask(t.id, { status: s, progress: s === "done" ? 100 : s === "todo" ? 0 : t.progress })} />}
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <MicroLabel>Прогресс · {t.progress}%</MicroLabel>
                  {!presentMode && t.checklist.length > 0 && (
                    <button onClick={autoProgress} className="font-mono text-[10px] text-cyan-300 hover:text-cyan-200">⌁ из чек-листа ({checksDone}/{t.checklist.length})</button>
                  )}
                </div>
                {presentMode ? <ProgressBar value={t.progress} color={m.color} /> : (
                  <input type="range" min={0} max={100} value={t.progress} onChange={(e) => patchTask(t.id, { progress: Number(e.target.value) })} className="w-full" style={{ ["--fill" as string]: `${t.progress}%` }} />
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><MicroLabel className="mb-1">Владелец</MicroLabel>
                  {presentMode ? <div className="text-sm text-white">{t.owner || "—"}</div> : <FieldInput value={t.owner} onChange={(v) => patchTask(t.id, { owner: v })} placeholder="Founder" />}</div>
                <div><MicroLabel className="mb-1">Дедлайн</MicroLabel>
                  {presentMode ? <div className="font-mono text-sm text-white">{t.deadline || "—"}</div> : <FieldInput type="date" value={t.deadline} onChange={(v) => patchTask(t.id, { deadline: v })} mono />}</div>
              </div>
              <div><MicroLabel className="mb-1">Доказательство / ссылка</MicroLabel>
                {presentMode ? (t.evidence ? <a href={t.evidence} target="_blank" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:underline"><ExternalLink size={13} /> {t.evidence}</a> : <div className="text-sm text-white/30">—</div>)
                  : <FieldInput value={t.evidence} onChange={(v) => patchTask(t.id, { evidence: v })} placeholder="https://…лендинг / фото тента / таблица" mono />}</div>
            </div>

            {/* checklist */}
            <div className="rounded-xl border border-white/[0.08] bg-black/25 p-3">
              <div className="mb-2 flex items-center justify-between">
                <MicroLabel>Чек-лист · {checksDone}/{t.checklist.length}</MicroLabel>
                <ProgressBar value={t.checklist.length ? (checksDone / t.checklist.length) * 100 : 0} color={color} h={4} />
              </div>
              <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
                {t.checklist.map((c) => (
                  <div key={c.id} className="group flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                    {presentMode ? <span className={cn("tick", c.done && "on")}>{c.done ? "✓" : ""}</span> : <Tick on={c.done} onClick={() => patchTask(t.id, { checklist: t.checklist.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x)) })} />}
                    {presentMode ? <span className={cn("text-sm", c.done ? "text-white/85 line-through decoration-white/30" : "text-white/60")}>{c.label}</span> : (
                      <>
                        <input value={c.label} onChange={(e) => patchTask(t.id, { checklist: t.checklist.map((x) => (x.id === c.id ? { ...x, label: e.target.value } : x)) })}
                          className={cn("w-full bg-transparent text-sm outline-none", c.done ? "text-white/45 line-through" : "text-white/90")} />
                        <span className="opacity-0 transition-opacity group-hover:opacity-100"><DelBtn onClick={() => patchTask(t.id, { checklist: t.checklist.filter((x) => x.id !== c.id) })} /></span>
                      </>
                    )}
                  </div>
                ))}
                {!t.checklist.length && <div className="py-4 text-center font-mono text-xs text-white/25">чек-лист пуст</div>}
              </div>
              {!presentMode && (
                <div className="mt-2 flex gap-2">
                  <FieldInput value={newCheck} onChange={setNewCheck} placeholder="Новый пункт…" className="!py-1.5 text-xs" />
                  <Btn small onClick={addCheck}><Plus size={14} /></Btn>
                </div>
              )}
            </div>
          </div>

          {/* foundation extras */}
          <FoundationExtra taskId={t.id} store={store} presentMode={presentMode} patchTask={patchTask} />

          {/* result + notes */}
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-[#c8ff2e]/20 bg-[#c8ff2e]/[0.04] p-3">
              <MicroLabel className="!text-[#c8ff2e]">▣ Зафиксированный результат</MicroLabel>
              {presentMode ? <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-white">{t.result || <span className="text-white/30">Пока не зафиксирован.</span>}</div>
                : <FieldArea value={t.result} onChange={(v) => patchTask(t.id, { result: v })} rows={3} className="mt-2 !border-[#c8ff2e]/20" placeholder="Что именно сделано / какие цифры / какой вывод. Пиши так, чтобы показать команде без пояснений." />}
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
              <MicroLabel>Заметки фаундера</MicroLabel>
              {presentMode ? <div className="mt-1 whitespace-pre-wrap text-sm text-white/60">{t.notes || "—"}</div>
                : <FieldArea value={t.notes} onChange={(v) => patchTask(t.id, { notes: v })} rows={3} className="mt-2" placeholder="Риски, блокеры, кому позвонить, что проверить…" />}
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] text-white/25">
            <span>обновлено: {t.updatedAt ? new Date(t.updatedAt).toLocaleString("ru-RU") : "—"}</span>
            {!presentMode && (
              <button onClick={() => { patchTask(t.id, { status: "done", progress: 100, checklist: t.checklist.map((c) => ({ ...c, done: true })) }); }}
                className="rounded-lg border border-[#c8ff2e]/30 px-2.5 py-1 font-bold uppercase tracking-wider text-[#c8ff2e] hover:bg-[#c8ff2e]/10">✓ закрыть этап</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* foundation structured extras for tasks 01–04 */
function FoundationExtra({ taskId, store, presentMode, patchTask }: { taskId: string; store: StoreT; presentMode: boolean; patchTask: (id: string, p: Partial<StoreT["state"]["tasks"][number]>) => void }) {
  const t = store.state.tasks.find((x) => x.id === taskId)!;
  const set = (k: string, v: string) => patchTask(t.id, { extra: { ...t.extra, [k]: v } });
  const X = ({ k, label, ph, area }: { k: string; label: string; ph: string; area?: boolean }) => (
    <div>
      <MicroLabel className="mb-1">{label}</MicroLabel>
      {presentMode
        ? <div className={cn("text-sm", t.extra[k] ? "text-white" : "text-white/25")}>{t.extra[k] || "—"}</div>
        : area ? <FieldArea value={t.extra[k] || ""} onChange={(v) => set(k, v)} rows={2} placeholder={ph} />
        : <FieldInput value={t.extra[k] || ""} onChange={(v) => set(k, v)} placeholder={ph} />}
    </div>
  );

  if (t.id === "idea") return (
    <div className="rounded-xl border border-violet-400/20 bg-violet-500/[0.05] p-3">
      <MicroLabel className="!text-violet-300">Рынок и аналитика · цифры для питча</MicroLabel>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <X k="tam" label="TAM" ph="напр. $2.1B — глобальный рынок тату" />
        <X k="sam" label="SAM" ph="напр. $180M — RU+СНГ, 18–35" />
        <X k="som" label="SOM" ph="напр. $4M — 3 города, год 1" />
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <X k="swot_s" label="S · сильные" ph="…" area />
        <X k="swot_w" label="W · слабые" ph="…" area />
        <X k="swot_o" label="O · возможности" ph="…" area />
        <X k="swot_t" label="T · угрозы" ph="…" area />
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <X k="pest" label="PEST · ключевое" ph="Политика / экономика / соц / техно — 1 строка на фактор" area />
        <X k="verdict" label="Вывод о целесообразности" ph="Идём / идём с условиями / нет — почему" area />
      </div>
    </div>
  );
  if (t.id === "product") return (
    <div className="rounded-xl border border-violet-400/20 bg-violet-500/[0.05] p-3">
      <MicroLabel className="!text-violet-300">Blue Ocean · ERAC-сетка</MicroLabel>
      <div className="mt-2"><X k="uvp" label="Ценностное предложение · 1 предложение" ph="Skinvault — …" /></div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <X k="eliminate" label="Устранить" ph="Что убираем из отрасли?" area />
        <X k="reduce" label="Снизить" ph="Что снижаем ниже стандарта?" area />
        <X k="raise" label="Повысить" ph="Что поднимаем выше?" area />
        <X k="create" label="Создать" ph="Чего не было? (NFT-QR…)" area />
      </div>
    </div>
  );
  if (t.id === "brand") return (
    <div className="rounded-xl border border-violet-400/20 bg-violet-500/[0.05] p-3">
      <MicroLabel className="!text-violet-300">Бренд · фиксация</MicroLabel>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <X k="brand" label="Финальное название" ph="Skinvault" />
        <X k="alt" label="Альтернативы" ph="…" />
        <X k="patent" label="Патентная проверка" ph="Роспатент / Madrid — статус" />
        <X k="domain" label="Домен / TG-ник" ph="skinvault… занят/свободен" />
      </div>
    </div>
  );
  if (t.id === "fakedoor-make") return (
    <div className="rounded-xl border border-violet-400/20 bg-violet-500/[0.05] p-3">
      <MicroLabel className="!text-violet-300">Fake Door · артефакты</MicroLabel>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <X k="landing" label="URL лендинга" ph="https://…" />
        <X k="qr_target" label="QR ведёт на" ph="UTM / короткая ссылка" />
        <X k="tent_file" label="Файл тента / фото" ph="Ссылка на макет или фото" />
      </div>
    </div>
  );
  return null;
}

export function StudioMini({ store }: { store: StoreT }) {
  const { state } = store;
  return (
    <div className="flex flex-wrap gap-2">
      {state.studios.map((s) => (
        <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: STUDIO_META[s.status].color }} />
          <b className="text-white">{s.name || "Без названия"}</b>
          <span className="text-white/40">{STUDIO_META[s.status].label}</span>
        </span>
      ))}
    </div>
  );
}
