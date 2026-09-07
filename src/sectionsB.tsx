import { useMemo, useState } from "react";
import {
  AlertTriangle, Bot, Building2, CalendarDays, CheckCircle2, Download, FlaskConical,
  Globe, MapPin, Monitor, Phone, Plus, QrCode, Target, TrendingUp, Trophy, Zap,
} from "lucide-react";
import { STUDIO_META, uid, type StudioStatus } from "./store";
import type { Store as StoreT } from "./store";
import { AddRow, Bars, Btn, Card, DelBtn, Empty, FieldArea, FieldInput, Funnel, MicroLabel, ProgressBar } from "./ui";
import { cn } from "./utils/cn";

const STATUS_ORDER: StudioStatus[] = ["lead", "talks", "agreed", "placed", "live", "rejected"];

/* ================= FAKE DOOR LAB ================= */
export function FakeDoorLab({ store }: { store: StoreT }) {
  const { state, update, derived, presentMode } = store;
  const [newDay, setNewDay] = useState({ date: new Date().toISOString().slice(0, 10), scans: "", nicks: "", note: "" });

  const sorted = useMemo(() => [...state.metrics].sort((a, b) => a.date.localeCompare(b.date)), [state.metrics]);
  const last7 = sorted.slice(-7);
  const last7Nicks = last7.reduce((a, m) => a + (Number(m.nicks) || 0), 0);
  const dayNum = Math.min(7, Math.max(0, sorted.length));
  const needPerDay = Math.max(0, (state.targetMin - totalWindowNicks(sorted)) / Math.max(1, 7 - sorted.length));

  const patchStudio = (id: string, patch: Partial<StoreT["state"]["studios"][number]>) =>
    update((s) => ({ studios: s.studios.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));

  const addMetric = () => {
    if (!newDay.date) return;
    const existing = state.metrics.find((m) => m.date === newDay.date);
    if (existing) {
      update((s) => ({ metrics: s.metrics.map((m) => (m.id === existing.id ? { ...m, scans: Number(newDay.scans) || 0, nicks: Number(newDay.nicks) || 0, note: newDay.note } : m)) }));
    } else {
      update((s) => ({ metrics: [...s.metrics, { id: uid(), date: newDay.date, scans: Number(newDay.scans) || 0, nicks: Number(newDay.nicks) || 0, note: newDay.note }] }));
    }
    setNewDay({ date: new Date().toISOString().slice(0, 10), scans: "", nicks: "", note: "" });
  };

  const bumpToday = (field: "scans" | "nicks", delta: number) => {
    const today = new Date().toISOString().slice(0, 10);
    const existing = state.metrics.find((m) => m.date === today);
    if (existing) {
      update((s) => ({ metrics: s.metrics.map((m) => (m.id === existing.id ? { ...m, [field]: Math.max(0, (Number(m[field]) || 0) + delta) } : m)) }));
    } else {
      update((s) => ({ metrics: [...s.metrics, { id: uid(), date: today, scans: field === "scans" ? Math.max(0, delta) : 0, nicks: field === "nicks" ? Math.max(0, delta) : 0, note: "" }] }));
    }
  };

  const exportCSV = () => {
    const rows = ["date,scans,nicks,conv_pct,note", ...sorted.map((m) => `${m.date},${m.scans},${m.nicks},${m.scans ? ((m.nicks / m.scans) * 100).toFixed(1) : 0},"${(m.note || "").replace(/"/g, "")}"`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "skinvault-fakedoor.csv";
    a.click();
  };

  const fillDemo = () => {
    if (!confirm("Загрузить демо-данные за 5 дней? Текущие метрики сохранятся.")) return;
    const base = new Date();
    const demo = [4, 3, 2, 1, 0].map((ago, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() - ago);
      const scans = [18, 24, 31, 27, 22][i];
      const nicks = [2, 3, 5, 4, 3][i];
      return { id: uid(), date: d.toISOString().slice(0, 10), scans, nicks, note: "демо" };
    });
    update((s) => {
      const dates = new Set(s.metrics.map((m) => m.date));
      return { metrics: [...s.metrics, ...demo.filter((d) => !dates.has(d.date))] };
    });
  };

  return (
    <div className="space-y-5">
      {/* experiment window banner */}
      <div className="corner glass flex flex-wrap items-center gap-4 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-400/15 text-cyan-300"><QrCode size={22} /></div>
          <div>
            <MicroLabel>Экспериментальное окно · Fake Door</MicroLabel>
            <div className="text-lg font-extrabold text-white">День {dayNum || "—"} из 7 <span className="text-sm font-medium text-white/40">· последние 7 дней: <b className="text-[#c8ff2e]">{last7Nicks}</b> ников</span></div>
          </div>
        </div>
        <div className="flex min-w-[200px] flex-1 items-center gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-2.5 flex-1 rounded-full" style={{
              background: i < sorted.length ? "linear-gradient(90deg,#22d3ee,#c8ff2e)" : "rgba(255,255,255,.08)",
              boxShadow: i < sorted.length ? "0 0 10px rgba(34,211,238,.4)" : undefined,
            }} />
          ))}
        </div>
        {!presentMode && (
          <div className="flex gap-2">
            <Btn small onClick={exportCSV}><Download size={13} /> CSV</Btn>
            {!state.metrics.length && <Btn small variant="violet" onClick={fillDemo}><Zap size={13} /> Демо-данные</Btn>}
          </div>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* STUDIOS CRM */}
        <Card className="rise">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={17} className="text-orange-300" />
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white">Студии · {state.studios.filter((s) => s.status === "live").length} live</h3>
            </div>
            {!presentMode && (
              <button onClick={() => update((s) => ({ studios: [...s.studios, { id: uid(), name: "", contact: "", address: "", status: "lead", tents: 1, scans: 0, nicks: 0, lastTouch: "", comment: "" }] }))}
                className="flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1.5 font-mono text-[11px] text-white/60 hover:border-[#c8ff2e]/50 hover:text-[#c8ff2e]">
                <Plus size={13} /> студия</button>
            )}
          </div>
          <div className="space-y-3">
            {state.studios.map((s, idx) => (
              <div key={s.id} className="rounded-xl border border-white/10 bg-black/25 p-3.5 transition-all hover:border-white/20">
                <div className="flex items-start gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg font-display text-sm font-extrabold" style={{ background: STUDIO_META[s.status].color + "1e", color: STUDIO_META[s.status].color, border: `1px solid ${STUDIO_META[s.status].color}44` }}>
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-2">
                    {presentMode ? (
                      <div className="text-[15px] font-bold text-white">{s.name || "Без названия"} <span className="ml-2 rounded-full px-2 py-0.5 font-mono text-[10px]" style={{ background: STUDIO_META[s.status].color + "1e", color: STUDIO_META[s.status].color }}>{STUDIO_META[s.status].label}</span></div>
                    ) : (
                      <>
                        <FieldInput value={s.name} onChange={(v) => patchStudio(s.id, { name: v })} placeholder="Название студии…" className="font-bold" />
                        <div className="flex flex-wrap gap-1.5">
                          {STATUS_ORDER.map((st) => (
                            <button key={st} onClick={() => patchStudio(s.id, { status: st })}
                              className={cn("rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-all",
                                s.status === st ? "" : "border border-white/10 text-white/30 hover:text-white/70")}
                              style={s.status === st ? { color: STUDIO_META[st].color, background: STUDIO_META[st].color + "1c", border: `1px solid ${STUDIO_META[st].color}55` } : undefined}>
                              {STUDIO_META[st].label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2 py-1.5">
                        <Phone size={12} className="shrink-0 text-white/30" />
                        {presentMode ? <span className="truncate text-xs text-white/70">{s.contact || "—"}</span>
                          : <input value={s.contact} onChange={(e) => patchStudio(s.id, { contact: e.target.value })} placeholder="Контакт / TG" className="w-full bg-transparent text-xs text-white placeholder:text-white/25" />}
                      </label>
                      <label className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2 py-1.5">
                        <MapPin size={12} className="shrink-0 text-white/30" />
                        {presentMode ? <span className="truncate text-xs text-white/70">{s.address || "—"}</span>
                          : <input value={s.address} onChange={(e) => patchStudio(s.id, { address: e.target.value })} placeholder="Адрес" className="w-full bg-transparent text-xs text-white placeholder:text-white/25" />}
                      </label>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-white/50">
                        <span className="text-[10px] uppercase tracking-wider text-white/30">Тенты</span>
                        {presentMode ? <b className="text-white">{s.tents}</b> : (
                          <span className="flex items-center gap-1">
                            <button onClick={() => patchStudio(s.id, { tents: Math.max(0, s.tents - 1) })} className="grid h-6 w-6 place-items-center rounded-md border border-white/15 text-white/60 hover:text-white">−</button>
                            <b className="w-5 text-center text-white">{s.tents}</b>
                            <button onClick={() => patchStudio(s.id, { tents: s.tents + 1 })} className="grid h-6 w-6 place-items-center rounded-md border border-white/15 text-white/60 hover:text-white">+</button>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-xs text-white/50">
                        <CalendarDays size={12} className="text-white/30" />
                        {presentMode ? <span>{s.lastTouch || "—"}</span>
                          : <input type="date" value={s.lastTouch} onChange={(e) => patchStudio(s.id, { lastTouch: e.target.value })} className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[11px] text-white" />}
                      </div>
                      {!presentMode && <span className="ml-auto"><DelBtn onClick={() => update((st) => ({ studios: st.studios.filter((x) => x.id !== s.id) }))} /></span>}
                    </div>
                    {presentMode
                      ? s.comment && <div className="text-xs italic text-white/50">«{s.comment}»</div>
                      : <FieldInput value={s.comment} onChange={(v) => patchStudio(s.id, { comment: v })} placeholder="Комментарий: о чём договорились, кто ЛПР…" className="!py-1.5 !text-xs" />}
                  </div>
                </div>
              </div>
            ))}
            {!state.studios.length && <Empty title="Нет студий" hint="Добавь первую студию для переговоров." />}
          </div>
          {/* funnel mini */}
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
            {STATUS_ORDER.map((st) => {
              const n = state.studios.filter((s) => s.status === st).length;
              return <span key={st} className="rounded-lg px-2 py-1 font-mono text-[10px]" style={{ background: STUDIO_META[st].color + "14", color: STUDIO_META[st].color }}>{STUDIO_META[st].label}: {n}</span>;
            })}
          </div>
        </Card>

        {/* METRICS */}
        <div className="space-y-4">
          <Card className="rise rise-1">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={17} className="text-[#c8ff2e]" />
                <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white">Трафик · ввод</h3>
              </div>
              <span className="font-mono text-[11px] text-white/35">всего: {derived.totalScans} → {derived.totalNicks}</span>
            </div>

            {!presentMode && (
              <>
                <div className="mb-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/[0.06] p-3 text-center">
                    <MicroLabel>Сегодня · сканы</MicroLabel>
                    <div className="mt-1 font-display text-2xl font-extrabold text-cyan-300 tabular">{todayVal(state, "scans")}</div>
                    <div className="mt-2 flex justify-center gap-2">
                      <button onClick={() => bumpToday("scans", -1)} className="grid h-8 w-10 place-items-center rounded-lg border border-white/15 text-lg text-white/70 hover:text-white">−</button>
                      <button onClick={() => bumpToday("scans", 1)} className="grid h-8 w-10 place-items-center rounded-lg bg-cyan-400 font-bold text-black hover:brightness-110">+</button>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#c8ff2e]/25 bg-[#c8ff2e]/[0.06] p-3 text-center">
                    <MicroLabel>Сегодня · ники</MicroLabel>
                    <div className="mt-1 font-display text-2xl font-extrabold text-[#c8ff2e] tabular">{todayVal(state, "nicks")}</div>
                    <div className="mt-2 flex justify-center gap-2">
                      <button onClick={() => bumpToday("nicks", -1)} className="grid h-8 w-10 place-items-center rounded-lg border border-white/15 text-lg text-white/70 hover:text-white">−</button>
                      <button onClick={() => bumpToday("nicks", 1)} className="grid h-8 w-10 place-items-center rounded-lg bg-[#c8ff2e] font-bold text-black hover:brightness-110">+</button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_90px_90px_auto] items-end gap-2">
                  <div><MicroLabel className="mb-1">Дата</MicroLabel><FieldInput type="date" mono value={newDay.date} onChange={(v) => setNewDay({ ...newDay, date: v })} /></div>
                  <div><MicroLabel className="mb-1">Сканы</MicroLabel><FieldInput type="number" mono value={newDay.scans} onChange={(v) => setNewDay({ ...newDay, scans: v })} placeholder="0" /></div>
                  <div><MicroLabel className="mb-1">Ники</MicroLabel><FieldInput type="number" mono value={newDay.nicks} onChange={(v) => setNewDay({ ...newDay, nicks: v })} placeholder="0" /></div>
                  <Btn variant="neon" onClick={addMetric}><Plus size={15} /></Btn>
                </div>
              </>
            )}

            <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-white/[0.07]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#0b0d14] font-mono text-[10px] uppercase tracking-widest text-white/35">
                  <tr><th className="px-3 py-2 text-left">Дата</th><th className="px-2 py-2 text-right">Сканы</th><th className="px-2 py-2 text-right">Ники</th><th className="px-2 py-2 text-right">Конв.</th>{!presentMode && <th className="w-10" />}</tr>
                </thead>
                <tbody>
                  {[...sorted].reverse().map((m) => (
                    <tr key={m.id} className="border-t border-white/[0.06] font-mono text-[13px] tabular hover:bg-white/[0.03]">
                      <td className="px-3 py-2 text-white/70">{fmtDate(m.date)}</td>
                      <td className="px-2 py-2 text-right">
                        {presentMode ? <span className="text-cyan-300">{m.scans}</span>
                          : <input type="number" value={m.scans} onChange={(e) => update((s) => ({ metrics: s.metrics.map((x) => (x.id === m.id ? { ...x, scans: Number(e.target.value) || 0 } : x)) }))} className="w-16 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-right text-cyan-300" />}
                      </td>
                      <td className="px-2 py-2 text-right">
                        {presentMode ? <b className="text-[#c8ff2e]">{m.nicks}</b>
                          : <input type="number" value={m.nicks} onChange={(e) => update((s) => ({ metrics: s.metrics.map((x) => (x.id === m.id ? { ...x, nicks: Number(e.target.value) || 0 } : x)) }))} className="w-16 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-right font-bold text-[#c8ff2e]" />}
                      </td>
                      <td className="px-2 py-2 text-right text-white/50">{m.scans ? ((m.nicks / m.scans) * 100).toFixed(0) + "%" : "—"}</td>
                      {!presentMode && <td className="px-1 text-center"><DelBtn onClick={() => update((s) => ({ metrics: s.metrics.filter((x) => x.id !== m.id) }))} /></td>}
                    </tr>
                  ))}
                  {!sorted.length && <tr><td colSpan={5} className="px-3 py-8 text-center font-sans text-sm text-white/30">Пока пусто — введи первый день или нажми «+» для сегодняшнего.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="rise rise-2">
            <div className="mb-2 flex items-center gap-2">
              <Target size={16} className="text-fuchsia-300" />
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white">Аналитика гейта</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Funnel scans={derived.totalScans} nicks={derived.totalNicks} />
              <div className="space-y-2.5 text-sm">
                <StatRow label="Среднее сканов / день" value={derived.avgScans.toFixed(1)} />
                <StatRow label="Среднее ников / день" value={derived.avgNicks.toFixed(1)} />
                <StatRow label="Прогноз на неделю" value={derived.weeklyProj.toFixed(0) + " ников"} hot />
                <StatRow label={`Нужно ников/день до ${state.targetMin}`} value={needPerDay.toFixed(1)} />
                <StatRow label="Скорость (посл. 3 дн.)" value={velocity(sorted)} />
              </div>
            </div>
            <div className="mt-3">
              <MicroLabel className="mb-2">Ники по дням · пунктир — цель {Math.ceil(state.targetMin / 7)}/день</MicroLabel>
              <Bars data={sorted.map((m) => ({ label: m.date.slice(5), value: Number(m.nicks) || 0 }))} color="#c8ff2e" target={state.targetMin / 7} />
            </div>
            <GateVerdict store={store} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function totalWindowNicks(sorted: { nicks: number }[]) {
  return sorted.slice(-7).reduce((a, m) => a + (Number(m.nicks) || 0), 0);
}
function todayVal(state: StoreT["state"], f: "scans" | "nicks") {
  const t = new Date().toISOString().slice(0, 10);
  return state.metrics.find((m) => m.date === t)?.[f] ?? 0;
}
function fmtDate(d: string) {
  try { return new Date(d + "T12:00").toLocaleDateString("ru-RU", { day: "2-digit", month: "short" }); } catch { return d; }
}
function velocity(sorted: { nicks: number }[]) {
  if (sorted.length < 2) return "—";
  const last3 = sorted.slice(-3).reduce((a, m) => a + (Number(m.nicks) || 0), 0) / Math.min(3, sorted.length);
  const prev = sorted.slice(-6, -3);
  if (!prev.length) return `${last3.toFixed(1)}/день`;
  const p = prev.reduce((a, m) => a + (Number(m.nicks) || 0), 0) / prev.length;
  const d = last3 - p;
  return `${last3.toFixed(1)}/день ${d > 0.2 ? "↗ растёт" : d < -0.2 ? "↘ падает" : "→ плато"}`;
}
function StatRow({ label, value, hot }: { label: string; value: string; hot?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between rounded-lg border px-3 py-2", hot ? "border-[#c8ff2e]/30 bg-[#c8ff2e]/[0.06]" : "border-white/[0.07] bg-white/[0.02]")}>
      <span className="text-xs text-white/50">{label}</span>
      <b className={cn("font-mono tabular", hot ? "text-[#c8ff2e]" : "text-white")}>{value}</b>
    </div>
  );
}
function GateVerdict({ store }: { store: StoreT }) {
  const { state, derived } = store;
  if (!state.metrics.length) return null;
  const ok = derived.weeklyProj >= state.targetMin;
  return (
    <div className={cn("mt-3 flex items-start gap-2.5 rounded-xl border p-3 text-sm leading-relaxed",
      ok ? "border-[#c8ff2e]/30 bg-[#c8ff2e]/[0.05]" : "border-rose-400/30 bg-rose-500/[0.06]")}>
      {ok ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#c8ff2e]" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-300" />}
      <div>
        {ok
          ? <><b className="text-white">Гейт проходится.</b> <span className="text-white/60">Прогноз {derived.weeklyProj.toFixed(0)} ников/нед при пороге {state.targetMin}. Фиксируй неделю в этапе 08 и начинай поиск команды. Не останавливай сбор — каждый лишний ник усиливает позицию.</span></>
          : <><b className="text-white">Пока ниже порога.</b> <span className="text-white/60">Прогноз {derived.weeklyProj.toFixed(0)} при цели {state.targetMin}–{state.targetMax}. Проверь: видимость тента → оффер на тенте → скорость формы → напоминание от админа. Дай окну полные 7 дней до выводов.</span></>}
      </div>
    </div>
  );
}

/* ================= MVP LAB ================= */
const FORMATS = [
  { id: "tg", icon: Bot, label: "TG-бот", color: "#22d3ee", desc: "Максимальная скорость и дистрибуция по собранным никам" },
  { id: "web", icon: Globe, label: "Web-сервис", color: "#c8ff2e", desc: "Лучший UX для загрузки и проверки уникальности" },
  { id: "desktop", icon: Monitor, label: "Desktop", color: "#8b5cf6", desc: "Мощность обработки, но тяжёлая дистрибуция" },
] as const;

export function MvpLab({ store }: { store: StoreT }) {
  const { state, update, derived, presentMode } = store;
  const winner = derived.mvpWinner;

  const setScore = (criterion: string, k: "tg" | "web" | "desktop", v: number) =>
    update((s) => ({ mvpScores: s.mvpScores.map((r) => (r.criterion === criterion ? { ...r, [k]: Math.min(5, Math.max(1, v)) } : r)) }));

  const doneFuncs = state.funcs.filter((f) => f.status === "done").length;
  const t = state.testing;
  const testPct = t.goalUsers ? Math.round((t.tested / t.goalUsers) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* format matrix */}
      <Card className="corner rise" glow="rgba(200,255,46,.12)">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <FlaskConical size={17} className="text-[#c8ff2e]" />
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white">Формат MVP · матрица решения</h3>
          </div>
          <span className="ml-auto flex items-center gap-1.5 rounded-full border border-[#c8ff2e]/30 bg-[#c8ff2e]/10 px-3 py-1 font-mono text-[11px] font-bold text-[#c8ff2e]">
            <Trophy size={12} /> лидер: {FORMATS.find((f) => f.id === winner)?.label} · {derived.mvpTotals[winner]} баллов
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {FORMATS.map((f) => {
            const active = state.mvpFormat === f.id;
            return (
              <button key={f.id} disabled={presentMode} onClick={() => update({ mvpFormat: state.mvpFormat === f.id ? "undecided" : f.id })}
                className={cn("rounded-xl border p-3.5 text-left transition-all", active ? "border-transparent" : "border-white/10 bg-white/[0.02] hover:border-white/25")}
                style={active ? { background: f.color + "12", borderColor: f.color + "66", boxShadow: `0 0 30px -12px ${f.color}` } : undefined}>
                <f.icon size={22} style={{ color: f.color }} />
                <div className="mt-1.5 text-[15px] font-extrabold text-white">{f.label}</div>
                <div className="text-xs leading-snug text-white/50">{f.desc}</div>
                <div className="mt-2 font-mono text-xs tabular" style={{ color: f.color }}>{derived.mvpTotals[f.id]} / {state.mvpScores.length * 5}</div>
                {active && <div className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: f.color }}>● выбран</div>}
              </button>
            );
          })}
        </div>

        <div className="mt-3 overflow-x-auto rounded-xl border border-white/[0.07]">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="bg-black/40 font-mono text-[10px] uppercase tracking-widest text-white/40">
                <th className="px-3 py-2.5 text-left">Критерий · 1–5</th>
                <th className="px-2 py-2.5 text-center text-cyan-300">TG-бот</th>
                <th className="px-2 py-2.5 text-center text-[#c8ff2e]">Web</th>
                <th className="px-2 py-2.5 text-center text-violet-300">Desktop</th>
              </tr>
            </thead>
            <tbody>
              {state.mvpScores.map((r) => (
                <tr key={r.criterion} className="border-t border-white/[0.06]">
                  <td className="px-3 py-2 text-[13px] text-white/75">{r.criterion}</td>
                  {(["tg", "web", "desktop"] as const).map((k) => (
                    <td key={k} className="px-2 py-1.5 text-center">
                      {presentMode ? <b className="font-mono tabular text-white">{r[k]}</b> : (
                        <span className="inline-flex items-center gap-1">
                          <button onClick={() => setScore(r.criterion, k, r[k] - 1)} className="grid h-6 w-6 place-items-center rounded-md border border-white/12 text-white/50 hover:text-white">−</button>
                          <b className="w-5 font-mono tabular text-white">{r[k]}</b>
                          <button onClick={() => setScore(r.criterion, k, r[k] + 1)} className="grid h-6 w-6 place-items-center rounded-md border border-white/12 text-white/50 hover:text-white">+</button>
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-white/15 bg-white/[0.03] font-mono tabular">
                <td className="px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-white/50">Итого</td>
                {(["tg", "web", "desktop"] as const).map((k) => (
                  <td key={k} className={cn("px-2 py-2.5 text-center text-lg font-extrabold", k === winner ? "text-[#c8ff2e]" : "text-white/60")}>{derived.mvpTotals[k]}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3">
          <MicroLabel>Обоснование выбора · для команды</MicroLabel>
          {presentMode ? <div className="mt-1 whitespace-pre-wrap text-sm text-white/80">{state.mvpRationale || "—"}</div>
            : <FieldArea value={state.mvpRationale} onChange={(v) => update({ mvpRationale: v })} rows={2} className="mt-2"
              placeholder="Почему этот формат: скорость, стоимость, риски, что откладываем. 3–4 предложения — и разработчик поймёт всё без созвона." />}
        </div>
        {!presentMode && (
          <div className="mt-2 flex gap-2">
            <Btn small variant={state.mvpFormat === "hybrid" ? "neon" : "ghost"} onClick={() => update({ mvpFormat: "hybrid" })}><Zap size={13} /> Гибрид: TG-вход + Web-ядро</Btn>
            {state.mvpFormat !== "undecided" && <Btn small onClick={() => update({ mvpFormat: "undecided" })}>Сбросить выбор</Btn>}
          </div>
        )}
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* stack */}
        <Card className="rise rise-1">
          <MicroLabel>Архитектура и стек · фиксируй решения</MicroLabel>
          <div className="mt-2 space-y-2">
            {state.stack.map((s) => (
              <div key={s.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-28 shrink-0 font-mono text-[11px] font-bold uppercase tracking-wider text-white/50">{s.layer}</span>
                  {presentMode ? <b className="flex-1 text-sm text-white">{s.choice || <span className="font-normal text-white/25">не выбрано</span>}</b>
                    : <input value={s.choice} onChange={(e) => update((st) => ({ stack: st.stack.map((x) => (x.id === s.id ? { ...x, choice: e.target.value } : x)) }))}
                      placeholder="Выбор…" className="field flex-1 px-2.5 py-1.5 text-[13px]" />}
                  {presentMode ? (
                    <span className={cn("rounded-full px-2 py-0.5 font-mono text-[10px]", s.status === "decided" ? "bg-[#c8ff2e]/15 text-[#c8ff2e]" : s.status === "research" ? "bg-cyan-400/15 text-cyan-300" : "bg-white/10 text-white/50")}>
                      {s.status === "decided" ? "решено" : s.status === "research" ? "ресёрч" : "TBD"}</span>
                  ) : (
                    <select value={s.status} onChange={(e) => update((st) => ({ stack: st.stack.map((x) => (x.id === s.id ? { ...x, status: e.target.value as typeof s.status } : x)) }))}
                      className="rounded-lg border border-white/12 bg-[#12141d] px-2 py-1.5 font-mono text-[11px] text-white">
                      <option value="decided">решено</option><option value="research">ресёрч</option><option value="tbd">TBD</option>
                    </select>
                  )}
                  {!presentMode && <DelBtn onClick={() => update((st) => ({ stack: st.stack.filter((x) => x.id !== s.id) }))} />}
                </div>
                {(s.note || !presentMode) && (
                  presentMode ? <div className="mt-1 pl-[120px] text-xs text-white/40">{s.note}</div>
                    : <input value={s.note} onChange={(e) => update((st) => ({ stack: st.stack.map((x) => (x.id === s.id ? { ...x, note: e.target.value } : x)) }))}
                      placeholder="Заметка: альтернатива, риск, стоимость…" className="mt-1.5 w-full bg-transparent pl-[120px] text-xs text-white/60 placeholder:text-white/20" />
                )}
              </div>
            ))}
          </div>
          {!presentMode && <div className="mt-2"><AddRow label="Добавить слой" onAdd={() => update((s) => ({ stack: [...s.stack, { id: uid(), layer: "Новый слой", choice: "", status: "tbd", note: "" }] }))} /></div>}
        </Card>

        {/* funcs + testing */}
        <div className="space-y-4">
          <Card className="rise rise-2">
            <div className="mb-2 flex items-center justify-between">
              <MicroLabel>Функции · MVP vs V2 — {doneFuncs}/{state.funcs.length} готово</MicroLabel>
              <ProgressBar value={state.funcs.length ? (doneFuncs / state.funcs.length) * 100 : 0} color="#8b5cf6" h={5} />
            </div>
            <div className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
              {(["mvp", "v2"] as const).map((scope) => (
                <div key={scope}>
                  <div className={cn("mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em]", scope === "mvp" ? "text-[#c8ff2e]" : "text-violet-300")}>
                    {scope === "mvp" ? "▣ MVP — must ship" : "▢ V2 — после валидации"}
                  </div>
                  {state.funcs.filter((f) => f.scope === scope).map((f) => (
                    <div key={f.id} className="mb-1.5 flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-2">
                      {!presentMode ? (
                        <button onClick={() => {
                          const order = ["planned", "doing", "done", "cut"] as const;
                          const next = order[(order.indexOf(f.status) + 1) % order.length];
                          update((s) => ({ funcs: s.funcs.map((x) => (x.id === f.id ? { ...x, status: next } : x)) }));
                        }} className={cn("shrink-0 rounded-md px-2 py-1 font-mono text-[10px] font-bold uppercase",
                          f.status === "done" ? "bg-[#c8ff2e] text-black" : f.status === "doing" ? "bg-cyan-400/20 text-cyan-300" : f.status === "cut" ? "bg-rose-500/20 text-rose-300 line-through" : "bg-white/10 text-white/50")}>
                          {f.status === "planned" ? "план" : f.status === "doing" ? "dev" : f.status === "done" ? "done" : "cut"}
                        </button>
                      ) : (
                        <span className={cn("shrink-0 rounded-md px-2 py-1 font-mono text-[10px] font-bold uppercase",
                          f.status === "done" ? "bg-[#c8ff2e] text-black" : f.status === "doing" ? "bg-cyan-400/20 text-cyan-300" : f.status === "cut" ? "bg-rose-500/20 text-rose-300" : "bg-white/10 text-white/50")}>
                          {f.status === "planned" ? "план" : f.status === "doing" ? "dev" : f.status === "done" ? "done" : "cut"}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        {presentMode ? <div className={cn("truncate text-[13px] font-medium", f.status === "cut" ? "text-white/30 line-through" : "text-white/85")}>{f.name}</div>
                          : <input value={f.name} onChange={(e) => update((s) => ({ funcs: s.funcs.map((x) => (x.id === f.id ? { ...x, name: e.target.value } : x)) }))} className="w-full bg-transparent text-[13px] font-medium text-white/90" />}
                        {f.note && <div className="truncate text-[11px] text-white/35">{f.note}</div>}
                      </div>
                      <span className={cn("shrink-0 font-mono text-[10px]", f.priority === "must" ? "text-rose-300" : f.priority === "should" ? "text-amber-300" : "text-white/30")}>
                        {f.priority === "must" ? "P0" : f.priority === "should" ? "P1" : "P2"}</span>
                      {!presentMode && <DelBtn onClick={() => update((s) => ({ funcs: s.funcs.filter((x) => x.id !== f.id) }))} />}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {!presentMode && <div className="mt-2"><AddRow label="Добавить функцию" onAdd={() => update((s) => ({ funcs: [...s.funcs, { id: uid(), name: "Новая функция", scope: "mvp", priority: "should", status: "planned", note: "" }] }))} /></div>}
          </Card>

          <Card className="rise rise-3" glow="rgba(251,146,60,.15)">
            <MicroLabel>Протокол теста · цель {t.goalUsers} пользователей</MicroLabel>
            <div className="mt-2 flex items-center gap-3">
              <ProgressBar value={testPct} color="#fb923c" />
              <b className="font-mono text-sm text-white tabular">{t.tested}/{t.goalUsers}</b>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Counter label="Протестировано" value={t.tested} set={(v) => update((s) => ({ testing: { ...s.testing, tested: v } }))} ro={presentMode} />
              <Counter label="Эскизов собрано" value={t.sketches} set={(v) => update((s) => ({ testing: { ...s.testing, sketches: v } }))} ro={presentMode} />
              <Counter label="Уникальность ✓" value={t.uniquePassed} set={(v) => update((s) => ({ testing: { ...s.testing, uniquePassed: v } }))} ro={presentMode} />
              <Counter label="Сертификатов" value={t.certs} set={(v) => update((s) => ({ testing: { ...s.testing, certs: v } }))} ro={presentMode} />
            </div>
            <div className="mt-2 font-mono text-[11px] text-white/40">конвейер: эскиз → база → проверка уникальности → NFT → QR → финальный сертификат</div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Counter({ label, value, set, ro }: { label: string; value: number; set: (v: number) => void; ro?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-2.5 text-center">
      <div className="font-mono text-[9px] uppercase tracking-wider text-white/35">{label}</div>
      <div className="font-display text-xl font-extrabold text-white tabular">{value}</div>
      {!ro && (
        <div className="mt-1 flex justify-center gap-1.5">
          <button onClick={() => set(Math.max(0, value - 1))} className="grid h-6 w-7 place-items-center rounded-md border border-white/15 text-white/60 hover:text-white">−</button>
          <button onClick={() => set(value + 1)} className="grid h-6 w-7 place-items-center rounded-md border border-white/15 text-white/60 hover:text-white">+</button>
          <button onClick={() => set(value + 10)} className="grid h-6 w-8 place-items-center rounded-md border border-[#c8ff2e]/30 font-mono text-[10px] text-[#c8ff2e] hover:bg-[#c8ff2e]/10">+10</button>
        </div>
      )}
    </div>
  );
}
