import { useEffect, useState } from "react";
import {
  Bot, Download, Eye, LayoutDashboard, ListOrdered, PencilLine,
  QrCode, RotateCcw, Vault, MessagesSquare, Terminal, ChevronRight,
} from "lucide-react";
import { useStore } from "./store";
import { Overview, Roadmap } from "./sectionsA";
import { FakeDoorLab, MvpLab } from "./sectionsB";
import { CustDev, Ops } from "./sectionsC";
import { ProgressBar } from "./ui";
import { cn } from "./utils/cn";

const TABS = [
  { id: "overview", label: "Обзор", icon: LayoutDashboard },
  { id: "roadmap", label: "Roadmap 12", icon: ListOrdered },
  { id: "fakedoor", label: "Fake Door Lab", icon: QrCode },
  { id: "mvp", label: "MVP Lab", icon: Bot },
  { id: "custdev", label: "CustDev + Вердикт", icon: MessagesSquare },
  { id: "ops", label: "Журнал + Экспорт", icon: Terminal },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function App() {
  const store = useStore();
  const { state, update, derived, presentMode, setPresentMode, exportJSON, resetAll } = store;
  const [tab, setTab] = useState<TabId>(() => (localStorage.getItem("skinvault_tab") as TabId) || "overview");
  useEffect(() => { localStorage.setItem("skinvault_tab", tab); window.scrollTo({ top: 0 }); }, [tab]);

  return (
    <div className="relative min-h-screen">
      {/* bg layers */}
      <div className="pointer-events-none fixed inset-0 bg-grid" />
      <div className="pointer-events-none fixed inset-0 bg-noise" />
      <div className="pointer-events-none fixed -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />
      <div className="pointer-events-none fixed right-[-200px] top-1/3 h-[400px] w-[400px] rounded-full bg-cyan-400/10 blur-[120px]" />
      <div className="pointer-events-none fixed left-[-200px] top-2/3 h-[400px] w-[400px] rounded-full bg-[#c8ff2e]/[.06] blur-[120px]" />

      {/* header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#05060a]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 via-[#8b5cf6] to-cyan-400 shadow-[0_0_24px_rgba(139,92,246,.5)]">
              <Vault size={20} className="text-white" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-[pulseDot_2s_ease-in-out_infinite] rounded-full bg-[#c8ff2e]" />
            </div>
            <div>
              <div className="font-display text-[15px] font-extrabold leading-none tracking-wide text-white">
                SKIN<span className="text-[#c8ff2e]">VAULT</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-white/70">Phase 01</span>
                <span className="hidden sm:inline">Fake Door → MVP → Verdict</span>
              </div>
            </div>
          </div>

          <div className="ml-4 hidden min-w-[140px] flex-1 items-center gap-2 lg:flex">
            <ProgressBar value={derived.progress} h={6} />
            <span className="font-mono text-xs text-white/50 tabular">{derived.progress}%</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {!presentMode && (
              <input value={state.founderName} onChange={(e) => update({ founderName: e.target.value })}
                placeholder="Founder" title="Имя фаундера"
                className="hidden w-28 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 font-mono text-xs text-white placeholder:text-white/25 md:block" />
            )}
            <button onClick={() => setPresentMode(!presentMode)} title="Режим презентации: скрыть редактирование"
              className={cn("flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all active:scale-95",
                presentMode ? "bg-[#c8ff2e] text-black shadow-[0_0_20px_rgba(200,255,46,.4)]" : "border border-white/15 text-white/70 hover:border-[#c8ff2e]/50 hover:text-white")}>
              {presentMode ? <Eye size={14} /> : <PencilLine size={14} />}
              <span className="hidden sm:inline">{presentMode ? "Презентация" : "Редактор"}</span>
            </button>
            <button onClick={exportJSON} title="Скачать бэкап JSON"
              className="hidden items-center gap-1.5 rounded-xl border border-white/15 px-3.5 py-2 text-xs font-bold text-white/70 transition-all hover:border-white/30 hover:text-white sm:flex">
              <Download size={14} />
            </button>
            {!presentMode && (
              <button onClick={resetAll} title="Сбросить данные"
                className="hidden items-center gap-1.5 rounded-xl border border-white/15 px-3.5 py-2 text-xs font-bold text-white/40 transition-all hover:border-rose-400/40 hover:text-rose-300 sm:flex">
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* tabs */}
        <div className="border-t border-white/[0.06]">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2">
            {TABS.map((t) => {
              const active = tab === t.id;
              const badge = t.id === "roadmap" ? `${derived.done}/12` : t.id === "fakedoor" ? String(derived.totalNicks) : t.id === "custdev" ? String(derived.interviews) : null;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={cn("flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all active:scale-95",
                    active ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,.2)]" : "text-white/50 hover:bg-white/[0.06] hover:text-white")}>
                  <t.icon size={15} />
                  {t.label}
                  {badge && <span className={cn("rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold tabular", active ? "bg-black/10" : "bg-white/10")}>{badge}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* hero */}
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="scanline absolute inset-0" />
        <div className="absolute left-0 top-0 h-full w-full animate-[gridPan_24s_linear_infinite] bg-grid opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:py-10">
          <div className="rise flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[#c8ff2e]">
            <span className="h-1.5 w-1.5 animate-[pulseDot_2s_ease-in-out_infinite] rounded-full bg-[#c8ff2e]" />
            {presentMode ? "Презентация для команды · только факты" : "Command Center · данные сохраняются локально"}
          </div>
          <h1 className="rise rise-1 mt-2 max-w-4xl font-display text-3xl font-extrabold leading-[1.05] text-white sm:text-5xl">
            {tab === "overview" && <>Phase 1: доказать спрос <span className="bg-gradient-to-r from-[#c8ff2e] to-cyan-300 bg-clip-text text-transparent text-glow-green">до первой строки кода.</span></>}
            {tab === "roadmap" && <>12 этапов. <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">Каждый — с результатом.</span></>}
            {tab === "fakedoor" && <>Fake Door Lab: <span className="bg-gradient-to-r from-cyan-300 to-[#c8ff2e] bg-clip-text text-transparent">сканы → ники → решение.</span></>}
            {tab === "mvp" && <>MVP Lab: <span className="bg-gradient-to-r from-[#c8ff2e] to-amber-300 bg-clip-text text-transparent">формат, стек и скоуп.</span></>}
            {tab === "custdev" && <>100 голосов правды: <span className="bg-gradient-to-r from-amber-300 to-pink-400 bg-clip-text text-transparent">CustDev и вердикт.</span></>}
            {tab === "ops" && <>Журнал и экспорт: <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">всё для команды.</span></>}
          </h1>
          <p className="rise rise-2 mt-3 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-[15px]">
            {tab === "overview" && "Цифровой паспорт тату-эскиза: проверка уникальности + NFT-сертификат с QR. Ниже — живая картина фазы: гипотеза, North Star, гейт и следующее действие."}
            {tab === "roadmap" && "Нажми на этап, чтобы раскрыть детали. Статусы, чек-листы, результаты и доказательства — всё редактируется и сохраняется."}
            {tab === "fakedoor" && "Слева — CRM студий, справа — ежедневный учёт трафика. Внизу гейт сам посчитает прогноз и скажет, проходишь ли ты порог."}
            {tab === "mvp" && "Сначала матрица формата — потом стек, потом функции. Порядок важен: он защищает от стройки ради стройки."}
            {tab === "custdev" && "Те же 100 пользователей, что прошли тест. Короткие интервью, честные цитаты — и вердикт, за который не стыдно."}
            {tab === "ops" && "Фиксируй решения по ходу, а когда придёт время — нажми одну кнопку и получи one-pager для команды или сооснователей."}
          </p>
          {/* breadcrumb stats */}
          <div className="rise rise-3 mt-4 flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <Crumb label="этапы" value={`${derived.done}/12`} />
            <Crumb label="ники" value={String(derived.totalNicks)} hot={derived.totalNicks >= state.targetMin} />
            <Crumb label="конверсия" value={`${derived.conv.toFixed(1)}%`} />
            <Crumb label="студии live" value={`${derived.liveStudios}/${state.studios.length}`} />
            <Crumb label="интервью" value={`${derived.interviews}/100`} />
            <span className="flex items-center gap-1 text-white/30"><ChevronRight size={12} /> {state.founderName || "Founder"} · {new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</span>
          </div>
        </div>
        {/* marquee */}
        <div className="relative overflow-hidden border-t border-white/[0.06] bg-black/40 py-2">
          <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-8 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">
            {[0, 1].map((k) => (
              <span key={k} className="flex gap-8">
                <span>TAM → SAM → SOM <b className="text-[#c8ff2e]/70">✓</b></span>
                <span>Blue Ocean <b className="text-[#c8ff2e]/70">✓</b></span>
                <span>Skinvault™ <b className="text-[#c8ff2e]/70">✓</b></span>
                <span>Table Tent + QR <b className="text-[#c8ff2e]/70">✓</b></span>
                <span>3 студии <b className="text-cyan-300/80">◐ в работе</b></span>
                <span>50–100 ников/нед <b className="text-white/60">цель</b></span>
                <span>MVP: TG / Web / Desktop <b className="text-white/60">решение</b></span>
                <span>NFT + QR сертификат <b className="text-white/60">тест</b></span>
                <span>CustDev ×100 <b className="text-white/60">план</b></span>
                <span>Pivot / Scale <b className="text-pink-300/80">вердикт</b></span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* content */}
      <main className="relative mx-auto max-w-7xl px-4 py-6">
        {tab === "overview" && <Overview store={store} />}
        {tab === "roadmap" && <Roadmap store={store} />}
        {tab === "fakedoor" && <FakeDoorLab store={store} />}
        {tab === "mvp" && <MvpLab store={store} />}
        {tab === "custdev" && <CustDev store={store} />}
        {tab === "ops" && <Ops store={store} />}
      </main>

      <footer className="border-t border-white/[0.06] bg-black/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-5 font-mono text-[11px] text-white/30">
          <span className="flex items-center gap-1.5"><Vault size={12} /> SKINVAULT · PHASE 01 COMMAND CENTER</span>
          <span className="ml-auto">LocalStorage · без сервера · твои данные принадлежат только тебе</span>
        </div>
      </footer>
    </div>
  );
}

function Crumb({ label, value, hot }: { label: string; value: string; hot?: boolean }) {
  return (
    <span className={cn("rounded-lg border px-2.5 py-1.5", hot ? "border-[#c8ff2e]/40 bg-[#c8ff2e]/10" : "border-white/10 bg-white/[0.03]")}>
      <span className="text-white/35">{label}: </span>
      <b className={hot ? "text-[#c8ff2e]" : "text-white"}>{value}</b>
    </span>
  );
}
