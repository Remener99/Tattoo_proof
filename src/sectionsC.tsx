import { useMemo, useState } from "react";
import {
  Copy, Download, FileDown, Gavel, MessagesSquare, Mic, Pin, Plus, RotateCcw,
  Star, Upload, Wallet, ClipboardList, Terminal,
} from "lucide-react";
import { uid } from "./store";
import type { Store as StoreT } from "./store";
import { AddRow, Btn, Card, DelBtn, Empty, FieldArea, FieldInput, MicroLabel, ProgressBar } from "./ui";
import { cn } from "./utils/cn";

/* ================= CUSTDEV + VERDICT ================= */
export function CustDev({ store }: { store: StoreT }) {
  const { state, update, derived, presentMode } = store;
  const [draft, setDraft] = useState({ nick: "", role: "client" as "client" | "master" | "studio", pain: "", quote: "", payWilling: "maybe" as "yes" | "no" | "maybe", score: 7, insight: "" });

  const payStats = useMemo(() => ({
    yes: state.interviews.filter((i) => i.payWilling === "yes").length,
    maybe: state.interviews.filter((i) => i.payWilling === "maybe").length,
    no: state.interviews.filter((i) => i.payWilling === "no").length,
  }), [state.interviews]);

  const addInterview = () => {
    if (!draft.nick.trim()) return;
    update((s) => ({ interviews: [...s.interviews, { id: uid(), nick: draft.nick.trim(), date: new Date().toISOString().slice(0, 10), role: draft.role, pain: draft.pain, quote: draft.quote, payWilling: draft.payWilling, score: draft.score, insight: draft.insight }] }));
    setDraft({ nick: "", role: "client", pain: "", quote: "", payWilling: "maybe", score: 7, insight: "" });
  };

  return (
    <div className="space-y-4">
      {/* stats strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat icon={<Mic size={15} />} label="Интервью" value={`${state.interviews.length}/100`} color="#fbbf24" pct={(state.interviews.length / 100) * 100} />
        <MiniStat icon={<Star size={15} />} label="Средняя оценка" value={state.interviews.length ? derived.avgScore.toFixed(1) + " / 10" : "—"} color="#c8ff2e" pct={derived.avgScore * 10} />
        <MiniStat icon={<Wallet size={15} />} label="Готовы платить" value={state.interviews.length ? `${Math.round((payStats.yes / state.interviews.length) * 100)}%` : "—"} color="#22d3ee" pct={state.interviews.length ? (payStats.yes / state.interviews.length) * 100 : 0} />
        <MiniStat icon={<MessagesSquare size={15} />} label="Да / Думают / Нет" value={`${payStats.yes} / ${payStats.maybe} / ${payStats.no}`} color="#f472b6" pct={0} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* questions */}
        <Card className="rise">
          <div className="mb-2 flex items-center gap-2">
            <ClipboardList size={16} className="text-amber-300" />
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white">Гайд · вопросы фаундера</h3>
          </div>
          <div className="space-y-2">
            {state.questions.map((qq, i) => (
              <div key={qq.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                <div className="flex items-start gap-2.5">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-amber-300/15 font-mono text-[11px] font-bold text-amber-300">Q{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    {presentMode ? (
                      <>
                        <div className="text-sm font-semibold text-white">{qq.q}</div>
                        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-white/35">цель: {qq.goal}</div>
                      </>
                    ) : (
                      <>
                        <input value={qq.q} onChange={(e) => update((s) => ({ questions: s.questions.map((x) => (x.id === qq.id ? { ...x, q: e.target.value } : x)) }))} className="w-full bg-transparent text-sm font-semibold text-white placeholder:text-white/25" placeholder="Вопрос…" />
                        <input value={qq.goal} onChange={(e) => update((s) => ({ questions: s.questions.map((x) => (x.id === qq.id ? { ...x, goal: e.target.value } : x)) }))} className="mt-1 w-full bg-transparent font-mono text-[11px] text-white/45 placeholder:text-white/20" placeholder="Что проверяем этим вопросом…" />
                      </>
                    )}
                  </div>
                  {!presentMode && <DelBtn onClick={() => update((s) => ({ questions: s.questions.filter((x) => x.id !== qq.id) }))} />}
                </div>
              </div>
            ))}
          </div>
          {!presentMode && <div className="mt-2"><AddRow label="Добавить вопрос" onAdd={() => update((s) => ({ questions: [...s.questions, { id: uid(), q: "", goal: "" }] }))} /></div>}
        </Card>

        {/* interview log */}
        <div className="space-y-4">
          {!presentMode && (
            <Card className="rise rise-1 border-amber-300/20">
              <MicroLabel className="!text-amber-300">+ Новое интервью · 60 секунд на запись</MicroLabel>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <FieldInput value={draft.nick} onChange={(v) => setDraft({ ...draft, nick: v })} placeholder="@ник в TG" mono />
                <div className="flex gap-1">
                  {(["client", "master", "studio"] as const).map((r) => (
                    <button key={r} onClick={() => setDraft({ ...draft, role: r })}
                      className={cn("flex-1 rounded-lg px-2 py-2 font-mono text-[11px] font-bold uppercase", draft.role === r ? "bg-amber-300 text-black" : "border border-white/12 text-white/50")}>
                      {r === "client" ? "Клиент" : r === "master" ? "Мастер" : "Студия"}</button>
                  ))}
                </div>
              </div>
              <div className="mt-2 grid gap-2">
                <FieldInput value={draft.pain} onChange={(v) => setDraft({ ...draft, pain: v })} placeholder="Главная боль — 1 фраза" />
                <FieldInput value={draft.quote} onChange={(v) => setDraft({ ...draft, quote: v })} placeholder="Дословная цитата…" />
                <FieldInput value={draft.insight} onChange={(v) => setDraft({ ...draft, insight: v })} placeholder="Инсайт для продукта…" />
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <MicroLabel>Готов платить</MicroLabel>
                  {(["yes", "maybe", "no"] as const).map((p) => (
                    <button key={p} onClick={() => setDraft({ ...draft, payWilling: p })}
                      className={cn("rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-bold", draft.payWilling === p ? (p === "yes" ? "bg-[#c8ff2e] text-black" : p === "maybe" ? "bg-amber-300 text-black" : "bg-rose-400 text-black") : "border border-white/12 text-white/50")}>
                      {p === "yes" ? "Да" : p === "maybe" ? "ХЗ" : "Нет"}</button>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <MicroLabel>Оценка {draft.score}</MicroLabel>
                  <input type="range" min={1} max={10} value={draft.score} onChange={(e) => setDraft({ ...draft, score: Number(e.target.value) })} className="w-24" style={{ ["--fill" as string]: `${draft.score * 10}%` }} />
                </div>
              </div>
              <Btn variant="neon" className="mt-3 w-full justify-center" onClick={addInterview}><Plus size={15} /> Записать интервью #{state.interviews.length + 1}</Btn>
            </Card>
          )}

          <Card className="rise rise-2">
            <MicroLabel>Лента интервью · {state.interviews.length}</MicroLabel>
            <div className="mt-2 max-h-[480px] space-y-2 overflow-y-auto pr-1">
              {[...state.interviews].reverse().map((iv) => (
                <div key={iv.id} className="rounded-xl border border-white/[0.07] bg-black/25 p-3">
                  <div className="flex items-center gap-2">
                    <b className="font-mono text-[13px] text-cyan-300">{iv.nick}</b>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/50">{iv.role === "client" ? "клиент" : iv.role === "master" ? "мастер" : "студия"}</span>
                    <span className="font-mono text-[10px] text-white/30">{iv.date}</span>
                    <span className={cn("ml-auto rounded px-1.5 py-0.5 font-mono text-[10px] font-bold",
                      iv.payWilling === "yes" ? "bg-[#c8ff2e]/15 text-[#c8ff2e]" : iv.payWilling === "no" ? "bg-rose-500/15 text-rose-300" : "bg-amber-300/15 text-amber-300")}>
                      {iv.payWilling === "yes" ? "$ да" : iv.payWilling === "no" ? "$ нет" : "$ хз"}</span>
                    <span className="font-mono text-xs font-bold text-white">★{iv.score}</span>
                    {!presentMode && <DelBtn onClick={() => update((s) => ({ interviews: s.interviews.filter((x) => x.id !== iv.id) }))} />}
                  </div>
                  {iv.pain && <div className="mt-1.5 text-[13px] text-white/80"><span className="font-mono text-[10px] uppercase text-white/30">боль: </span>{iv.pain}</div>}
                  {iv.quote && <div className="mt-1 text-[13px] italic text-white/55">«{iv.quote}»</div>}
                  {iv.insight && <div className="mt-1 rounded-lg border border-violet-400/20 bg-violet-500/[0.07] px-2.5 py-1.5 text-[13px] text-violet-200">→ {iv.insight}</div>}
                </div>
              ))}
              {!state.interviews.length && <Empty title="Интервью пока нет" hint="Проведи первые 5 разговоров сразу после теста MVP — выводы появятся сами." />}
            </div>
          </Card>
        </div>
      </div>

      {/* VERDICT */}
      <Card className="corner rise rise-3" glow="rgba(244,114,182,.2)">
        <div className="flex items-center gap-2">
          <Gavel size={18} className="text-pink-300" />
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white">Вердикт Phase 1 · Pivot или Scale</h3>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr]">
          <div>
            <MicroLabel className="mb-2">Решение</MicroLabel>
            {presentMode ? (
              <div className="text-xl font-extrabold" style={{ color: verdictColor(state.verdict.choice) }}>{verdictLabel(state.verdict.choice)}</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {(["scale", "pivot", "iterate", "undecided"] as const).map((v) => (
                  <button key={v} onClick={() => update((s) => ({ verdict: { ...s.verdict, choice: v, date: v === "undecided" ? s.verdict.date : new Date().toISOString().slice(0, 10) } }))}
                    className={cn("rounded-xl border px-3 py-3 text-left transition-all active:scale-95",
                      state.verdict.choice === v ? "border-transparent" : "border-white/10 bg-white/[0.02] hover:border-white/25")}
                    style={state.verdict.choice === v ? { background: verdictColor(v) + "14", borderColor: verdictColor(v) + "66", boxShadow: `0 0 24px -8px ${verdictColor(v)}` } : undefined}>
                    <div className="text-sm font-extrabold" style={{ color: state.verdict.choice === v ? verdictColor(v) : "#fff" }}>{verdictLabel(v)}</div>
                    <div className="text-[11px] text-white/45">{verdictHint(v)}</div>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 font-mono text-[11px] leading-relaxed text-white/50">
              <div className="mb-1 text-white/30">— автосводка на момент решения —</div>
              <div>прогресс фазы: <b className="text-white">{derived.progress}%</b> · этапов done: <b className="text-white">{derived.done}/12</b></div>
              <div>fake door: <b className="text-cyan-300">{derived.totalScans} сканов</b> → <b className="text-[#c8ff2e]">{derived.totalNicks} ников</b> · конв. <b className="text-white">{derived.conv.toFixed(1)}%</b></div>
              <div>тест mvp: <b className="text-white">{state.testing.tested}/{state.testing.goalUsers}</b> · сертов: <b className="text-white">{state.testing.certs}</b> · формат: <b className="text-white">{state.mvpFormat}</b></div>
              <div>custdev: <b className="text-white">{state.interviews.length} инт.</b> · avg ★<b className="text-white">{derived.avgScore.toFixed(1)}</b> · платят: <b className="text-white">{derived.interviews ? Math.round((derived.payYes / derived.interviews) * 100) : 0}%</b></div>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <MicroLabel className="mb-1">Обоснование · 3–5 предложений для команды</MicroLabel>
              {presentMode ? <div className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">{state.verdict.reasoning || "—"}</div>
                : <FieldArea value={state.verdict.reasoning} onChange={(v) => update((s) => ({ verdict: { ...s.verdict, reasoning: v } }))} rows={4}
                  placeholder="Какие цифры и цитаты легли в основу. Что именно масштабируем / что пивотим. Без этого команда не поверит решению." />}
            </div>
            <div>
              <MicroLabel className="mb-1">Следующие 30 дней · конкретные шаги</MicroLabel>
              {presentMode ? <div className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">{state.verdict.nextSteps || "—"}</div>
                : <FieldArea value={state.verdict.nextSteps} onChange={(v) => update((s) => ({ verdict: { ...s.verdict, nextSteps: v } }))} rows={3}
                  placeholder="1. … 2. … 3. … — с именами и датами" />}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function verdictColor(v: string) {
  return v === "scale" ? "#c8ff2e" : v === "pivot" ? "#fb923c" : v === "iterate" ? "#22d3ee" : "#9aa0b2";
}
function verdictLabel(v: string) {
  return v === "scale" ? "🚀 SCALE" : v === "pivot" ? "🔄 PIVOT" : v === "iterate" ? "🔁 ITERATE" : "◌ Не решено";
}
function verdictHint(v: string) {
  return v === "scale" ? "Спрос доказан — строим платформу" : v === "pivot" ? "Меняем гипотезу / аудиторию" : v === "iterate" ? "Ещё один виток проверки" : "Рано решать";
}
function MiniStat({ icon, label, value, color, pct }: { icon: React.ReactNode; label: string; value: string; color: string; pct: number }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2" style={{ color }}>{icon}<MicroLabel className="!text-white/45">{label}</MicroLabel></div>
      <div className="mt-1 font-display text-xl font-extrabold text-white tabular">{value}</div>
      <div className="mt-2"><ProgressBar value={pct} color={color} h={5} /></div>
    </div>
  );
}

/* ================= OPS: LOG + EXPORT ================= */
const TAG_META = {
  win: { label: "Победа", color: "#c8ff2e" },
  insight: { label: "Инсайт", color: "#8b5cf6" },
  decision: { label: "Решение", color: "#22d3ee" },
  blocker: { label: "Блокер", color: "#fb7185" },
  todo: { label: "Сделать", color: "#fbbf24" },
} as const;

export function Ops({ store }: { store: StoreT }) {
  const { state, update, derived, presentMode, exportJSON, resetAll } = store;
  const [draft, setDraft] = useState("");
  const [tag, setTag] = useState<keyof typeof TAG_META>("insight");
  const [copied, setCopied] = useState(false);

  const addLog = () => {
    if (!draft.trim()) return;
    update((s) => ({ log: [{ id: uid(), date: new Date().toISOString().slice(0, 10), tag, text: draft.trim(), pinned: false }, ...s.log] }));
    setDraft("");
  };

  const onepager = useMemo(() => buildOnepager(state, derived), [state, derived]);

  const copyOnepager = async () => {
    try { await navigator.clipboard.writeText(onepager); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { /* clipboard unavailable */ }
  };
  const downloadMd = () => {
    const blob = new Blob([onepager], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "skinvault-phase1-onepager.md";
    a.click();
  };
  const importJSON = (f: File) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(String(r.result));
        if (!data.tasks) throw new Error("bad");
        if (confirm("Заменить текущие данные импортированным файлом?")) update(data);
      } catch { alert("Не получилось прочитать файл — это не экспорт Skinvault."); }
    };
    r.readAsText(f);
  };

  const sortedLog = [...state.log].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {/* founder log */}
      <Card className="rise">
        <div className="mb-2 flex items-center gap-2">
          <Terminal size={16} className="text-[#c8ff2e]" />
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white">Журнал фаундера · {state.log.length}</h3>
        </div>
        {!presentMode && (
          <div className="mb-3 rounded-xl border border-white/10 bg-black/25 p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {(Object.keys(TAG_META) as (keyof typeof TAG_META)[]).map((k) => (
                <button key={k} onClick={() => setTag(k)}
                  className={cn("rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider",
                    tag === k ? "" : "border border-white/10 text-white/35")}
                  style={tag === k ? { background: TAG_META[k].color + "1e", color: TAG_META[k].color, border: `1px solid ${TAG_META[k].color}55` } : undefined}>
                  {TAG_META[k].label}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <FieldInput value={draft} onChange={setDraft} placeholder="Что произошло / решил / понял…" />
              <Btn variant="neon" onClick={addLog}><Plus size={15} /></Btn>
            </div>
          </div>
        )}
        <div className="max-h-[460px] space-y-2 overflow-y-auto pr-1">
          {sortedLog.map((l) => (
            <div key={l.id} className={cn("rounded-xl border p-3", l.pinned ? "border-[#c8ff2e]/30 bg-[#c8ff2e]/[0.04]" : "border-white/[0.07] bg-white/[0.02]")}>
              <div className="flex items-center gap-2">
                <span className="rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase" style={{ background: TAG_META[l.tag].color + "1a", color: TAG_META[l.tag].color }}>{TAG_META[l.tag].label}</span>
                <span className="font-mono text-[10px] text-white/30">{l.date}</span>
                {l.pinned && <Pin size={11} className="text-[#c8ff2e]" />}
                {!presentMode && (
                  <span className="ml-auto flex items-center gap-1">
                    <button onClick={() => update((s) => ({ log: s.log.map((x) => (x.id === l.id ? { ...x, pinned: !x.pinned } : x)) }))}
                      className="rounded-md p-1.5 text-white/25 hover:text-[#c8ff2e]"><Pin size={13} /></button>
                    <DelBtn onClick={() => update((s) => ({ log: s.log.filter((x) => x.id !== l.id) }))} />
                  </span>
                )}
              </div>
              <div className="mt-1.5 text-sm leading-relaxed text-white/85">{l.text}</div>
            </div>
          ))}
          {!state.log.length && <Empty title="Журнал пуст" hint="Фиксируй решения и инсайты — через месяц скажешь себе спасибо." />}
        </div>
      </Card>

      {/* export center */}
      <div className="space-y-4">
        <Card className="rise rise-1">
          <MicroLabel>Центр экспорта · всё хранится в LocalStorage</MicroLabel>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Btn variant="neon" onClick={copyOnepager} className="justify-center"><Copy size={14} /> {copied ? "Скопировано!" : "One-pager для команды"}</Btn>
            <Btn onClick={downloadMd} className="justify-center"><FileDown size={14} /> Скачать .md</Btn>
            <Btn onClick={exportJSON} className="justify-center"><Download size={14} /> Бэкап JSON</Btn>
            {!presentMode ? (
              <label className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm text-white/80 transition-all hover:border-white/25 hover:text-white">
                <Upload size={14} /> Импорт JSON
                <input type="file" accept=".json" className="hidden" onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])} />
              </label>
            ) : <Btn className="justify-center opacity-40"><Upload size={14} /> Импорт JSON</Btn>}
          </div>
          {!presentMode && (
            <button onClick={resetAll} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-rose-400/25 py-2.5 text-xs text-white/35 hover:border-rose-400/50 hover:text-rose-300">
              <RotateCcw size={13} /> Сбросить все данные Phase 1
            </button>
          )}
          <div className="mt-3 rounded-xl border border-white/[0.07] bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-white/45">
            <div>ключ: <span className="text-white/70">skinvault_phase1_v3</span> · автосохранение при каждом изменении</div>
            <div>обновлено: <span className="text-white/70">{new Date(state.updatedAt).toLocaleString("ru-RU")}</span></div>
            <div>размер данных: <span className="text-white/70">{(JSON.stringify(state).length / 1024).toFixed(1)} KB</span></div>
          </div>
        </Card>

        <Card className="rise rise-2">
          <div className="mb-2 flex items-center justify-between">
            <MicroLabel>Предпросмотр one-pager · живой, из твоих данных</MicroLabel>
            <span className="rounded bg-[#c8ff2e]/15 px-2 py-0.5 font-mono text-[10px] text-[#c8ff2e]">markdown</span>
          </div>
          <pre className="max-h-[380px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/[0.07] bg-black/40 p-4 font-mono text-[11.5px] leading-relaxed text-white/65">{onepager}</pre>
        </Card>
      </div>
    </div>
  );
}

type D = { progress: number; done: number; totalScans: number; totalNicks: number; conv: number; weeklyProj: number; avgScore: number; interviews: number; payYes: number; mvpWinner: string };

export function buildOnepager(state: StoreT["state"], d: D): string {
  const taskLine = (id: string) => {
    const t = state.tasks.find((x) => x.id === id);
    return t ? `${t.status === "done" ? "✓" : t.status === "in_progress" ? "◐" : "○"} ${t.num} ${t.title} — ${t.progress}%` : "";
  };
  const idea = state.tasks.find((x) => x.id === "idea");
  return `# SKINVAULT · Phase 1 — статус ${new Date().toLocaleDateString("ru-RU")}

## Гипотеза
${state.hypothesis || "—"}

## North Star
**${state.targetMin}–${state.targetMax} TG-ников / неделю** · сейчас: ${d.totalNicks} ников, ${d.totalScans} сканов, конверсия ${d.conv.toFixed(1)}%, прогноз ${d.weeklyProj.toFixed(0)}/нед.

## Прогресс: ${d.progress}% (${d.done}/12 этапов)
${state.tasks.map((t) => `- ${t.status === "done" ? "[x]" : "[ ]"} ${t.num} ${t.title} — ${t.progress}%`).join("\n")}

## Fake Door
${state.studios.map((s) => `- ${s.name || "Студия без названия"}: ${s.status}, тентов ${s.tents}${s.comment ? ` — ${s.comment}` : ""}`).join("\n") || "- студии не добавлены"}

## Рынок (этап 01)
TAM: ${idea?.extra.tam || "—"} · SAM: ${idea?.extra.sam || "—"} · SOM: ${idea?.extra.som || "—"}
Вывод: ${idea?.extra.verdict || "—"}

## MVP (этап 09)
Формат: ${state.mvpFormat} · матрица: TG ${0} / Web / Desktop — лидер: ${d.mvpWinner}
${state.mvpRationale || "Обоснование не записано."}
Тест: ${state.testing.tested}/${state.testing.goalUsers} польз., эскизов ${state.testing.sketches}, сертов ${state.testing.certs}.

## CustDev (этап 11)
Интервью: ${d.interviews} · средняя оценка ${d.avgScore.toFixed(1)}/10 · готовы платить ${d.interviews ? Math.round((d.payYes / d.interviews) * 100) : 0}%.

## Вердикт (этап 12)
${state.verdict.choice.toUpperCase()} ${state.verdict.date ? `· ${state.verdict.date}` : ""}
${state.verdict.reasoning || "Решение пока не принято."}
Следующие 30 дней: ${state.verdict.nextSteps || "—"}

---
_Собрано в Skinvault Phase 1 Command Center · ${taskLine("gate")}_`;
}
