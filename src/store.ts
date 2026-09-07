import { useCallback, useEffect, useMemo, useState } from "react";

/* ============ TYPES ============ */
export type TaskStatus = "done" | "in_progress" | "todo" | "blocked";
export type BlockId = "foundation" | "validation" | "build" | "test" | "verdict";

export interface CheckItem { id: string; label: string; done: boolean; }
export interface Task {
  id: string; block: BlockId; num: string; title: string; short: string;
  detail: string; status: TaskStatus; progress: number;
  owner: string; deadline: string; result: string; evidence: string; notes: string;
  checklist: CheckItem[]; extra: Record<string, string>;
  updatedAt: string;
}

export type StudioStatus = "lead" | "talks" | "agreed" | "placed" | "live" | "rejected";
export interface Studio {
  id: string; name: string; contact: string; address: string;
  status: StudioStatus; tents: number; scans: number; nicks: number;
  lastTouch: string; comment: string;
}

export interface DayMetric { id: string; date: string; scans: number; nicks: number; note: string; }

export interface MvpScore { criterion: string; tg: number; web: number; desktop: number; }
export interface StackItem { id: string; layer: string; choice: string; status: "decided" | "tbd" | "research"; note: string; }
export interface FuncItem { id: string; name: string; scope: "mvp" | "v2"; priority: "must" | "should" | "nice"; status: "planned" | "doing" | "done" | "cut"; note: string; }

export interface CustQuestion { id: string; q: string; goal: string; }
export interface Interview {
  id: string; nick: string; date: string; role: "client" | "master" | "studio";
  pain: string; quote: string; payWilling: "yes" | "no" | "maybe"; score: number; insight: string;
}
export interface LogEntry { id: string; date: string; tag: "win" | "insight" | "decision" | "blocker" | "todo"; text: string; pinned: boolean; }

export interface AppState {
  version: number;
  updatedAt: string;
  founderName: string;
  hypothesis: string;
  targetMin: number; targetMax: number;
  tasks: Task[];
  studios: Studio[];
  metrics: DayMetric[];
  mvpFormat: "undecided" | "tg" | "web" | "desktop" | "hybrid";
  mvpRationale: string;
  mvpScores: MvpScore[];
  stack: StackItem[];
  funcs: FuncItem[];
  testing: { goalUsers: number; tested: number; sketches: number; uniquePassed: number; certs: number };
  questions: CustQuestion[];
  interviews: Interview[];
  verdict: { choice: "undecided" | "scale" | "pivot" | "iterate"; reasoning: string; date: string; nextSteps: string };
  log: LogEntry[];
}

export const BLOCKS: { id: BlockId; label: string; color: string; desc: string }[] = [
  { id: "foundation", label: "Фундамент", color: "#8b5cf6", desc: "Аналитика · Продукт · Бренд · Fake Door продакшн" },
  { id: "validation", label: "Валидация спроса", color: "#22d3ee", desc: "Студии · Table tents · Трафик · Go/No-Go" },
  { id: "build", label: "Сборка MVP", color: "#c8ff2e", desc: "Формат · Архитектура · Реализация функций" },
  { id: "test", label: "Тест + CustDev", color: "#fb923c", desc: "100 пользователей · Сертификаты · Интервью" },
  { id: "verdict", label: "Вердикт", color: "#f472b6", desc: "Pivot или Scale — решение с цифрами" },
];

export const STATUS_META: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  done: { label: "Готово", color: "#c8ff2e", bg: "rgba(200,255,46,.12)" },
  in_progress: { label: "В работе", color: "#22d3ee", bg: "rgba(34,211,238,.12)" },
  todo: { label: "Ожидает", color: "#9aa0b2", bg: "rgba(255,255,255,.07)" },
  blocked: { label: "Блокер", color: "#fb7185", bg: "rgba(251,113,133,.12)" },
};

export const STUDIO_META: Record<StudioStatus, { label: string; color: string }> = {
  lead: { label: "Лид", color: "#9aa0b2" },
  talks: { label: "Переговоры", color: "#fbbf24" },
  agreed: { label: "Согласовано", color: "#22d3ee" },
  placed: { label: "Тент размещён", color: "#8b5cf6" },
  live: { label: "Трафик идёт", color: "#c8ff2e" },
  rejected: { label: "Отказ", color: "#fb7185" },
};

/* ============ SEED ============ */
const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 9);

function seedTasks(): Task[] {
  const t = (id: string, block: BlockId, num: string, title: string, short: string, detail: string,
    status: TaskStatus, progress: number, checks: string[], extra: Record<string, string> = {}, checklistDone = false): Task => ({
    id, block, num, title, short, detail, status, progress,
    owner: "Founder", deadline: "", result: "", evidence: "", notes: "",
    checklist: checks.map((label) => ({ id: uid() + label.slice(0, 3), label, done: checklistDone })),
    extra, updatedAt: now(),
  });
  return [
    t("idea", "foundation", "01", "Анализ идеи", "TAM · SAM · SOM · SWOT · PEST",
      "Доказать, что рынок существует и идея целесообразна. Зафиксировать цифры TAM/SAM/SOM и выводы SWOT/PEST — это первый слайд для команды и инвесторов.",
      "done", 100, ["TAM рассчитан", "SAM рассчитан", "SOM рассчитан", "SWOT собран", "PEST собран", "Вывод о целесообразности записан"],
      { tam: "", sam: "", som: "", swot_s: "", swot_w: "", swot_o: "", swot_t: "", pest: "", verdict: "" }, true),
    t("product", "foundation", "02", "Формирование продукта", "Blue Ocean · MVP-функции · V2",
      "Сформулировать идею по принципам голубого океана: что устраняем / снижаем / повышаем / создаём. Разделить функции на MVP и V2, чтобы не раздувать скоуп.",
      "done", 100, ["ERAC-сетка Blue Ocean заполнена", "Функции MVP зафиксированы", "Функции V2 зафиксированы", "Ценностное предложение в 1 предложении"],
      { eliminate: "", reduce: "", raise: "", create: "", uvp: "Skinvault — цифровой паспорт тату-эскиза: проверка уникальности + NFT-сертификат с QR." }, true),
    t("brand", "foundation", "03", "Формирование бренда", "Нейминг · патентная проверка",
      "Выбрать и проверить название: поиск, патентная чистота, домен и TG-ник. Skinvault — рабочий вариант: vault = сейф авторства эскиза.",
      "done", 100, ["Шорт-лист названий", "Патентная проверка Skinvault", "Проверка домена / TG-ника", "Финальное название утверждено"],
      { brand: "Skinvault", alt: "", patent: "", domain: "" }, true),
    t("fakedoor-make", "foundation", "04", "Fake Door: продакшн", "Лендинг · Table tent · QR · Печать",
      "Собрать минимальный артефакт проверки спроса: лендинг со сбором TG-ников + Table tent с QR для ресепшн. Без кода продукта — только спрос.",
      "done", 100, ["Лендинг создан", "Визуал Table tent готов", "QR сгенерирован и вставлен", "Печать + сборка тентов"],
      { landing: "", tent_file: "", qr_target: "" }, true),
    t("studios", "validation", "05", "Договорённости со студиями", "3 студии · бесплатный тест",
      "Договориться с тремя тату-студиями о бесплатном размещении Table tents. Фиксировать статусы: лид → переговоры → согласовано → размещено.",
      "in_progress", 15, ["Список из 5–7 студий-кандидатов", "Студия 1: согласие", "Студия 2: согласие", "Студия 3: согласие", "Условия размещения зафиксированы"]),
    t("placement", "validation", "06", "Размещение Table tents", "Ресепшн · видимость · фото-фиксация",
      "Физически разместить тенты на ресепшн. Критично: видимость для ожидающих, фото-подтверждение размещения, инструктаж администратора.",
      "todo", 0, ["Тенты в студии 1 + фото", "Тенты в студии 2 + фото", "Тенты в студии 3 + фото", "Администраторы проинструктированы"]),
    t("analytics", "validation", "07", "Анализ активности лендинга", "Сканы · Ники · Конверсия · Динамика",
      "Ежедневно фиксировать: сканы QR, оставленные TG-ники, конверсию, скорость поступления ников, среднее в день. Данные — в Fake Door Lab.",
      "todo", 0, ["Счётчик сканов подключён", "Форма ника работает + лог", "Ежедневный ввод данных", "Недельный срез посчитан", "Вывод по динамике записан"]),
    t("gate", "validation", "08", "Go / No-Go решение", "50–100 ников / неделю",
      "Жёсткое правило: 50–100 ников за неделю → ищем команду под MVP. Ниже порога → pivot или закрытие. Никаких «давайте ещё подождём» без цифр.",
      "todo", 0, ["Недельный итог зафиксирован", "Конверсия vs бенчмарк", "Решение принято и записано", "Команда / pivot-план запущен"]),
    t("mvp-build", "build", "09", "Разработка MVP", "Формат · Стек · Реализация",
      "Выбрать формат (TG-бот / сайт / десктоп), зафиксировать архитектуру и стек, реализовать заявленные функции. Формат выбирается матрицей в MVP Lab.",
      "todo", 0, ["Формат MVP выбран + обоснование", "Архитектура и стек зафиксированы", "Проверка уникальности работает", "NFT-сертификат + QR работает", "Генерация финального сертификата"]),
    t("mvp-test", "test", "10", "Тест MVP на 100 пользователях", "Эскизы · Уникальность · NFT · QR",
      "Прогнать 100 оставивших ники через MVP: сбор эскизов (на старте — выделение эскиза из фото тату через ИИ), база, проверка уникальности, NFT + QR-сертификат.",
      "todo", 0, ["100 пользователей приглашены", "Эскизы собраны (цель: 100)", "База + проверка уникальности", "NFT-сертификаты сгенерированы", "QR + финальный формат сертификата"]),
    t("custdev", "test", "11", "CustDev на тех же 100", "Вопросы фаундера · свободная форма",
      "Сразу после теста — интервью: личный пул вопросов фаундера + свободные ответы. Цель: понять боль, готовность платить и что докрутить.",
      "todo", 0, ["Гайд вопросов готов", "30+ интервью проведено", "60+ интервью проведено", "100 интервью / репрезентативный срез", "Инсайты кластеризованы"]),
    t("verdict", "verdict", "12", "Финальный вердикт", "Pivot или Scale",
      "На основе цифр Fake Door + теста MVP + CustDev принять решение: масштабировать платформу или пивотить. Решение фиксируется публично для команды.",
      "todo", 0, ["Сводка метрик готова", "Инсайты CustDev учтены", "Pivot / Scale выбран", "Следующие 30 дней спланированы"]),
  ];
}

export function defaultState(): AppState {
  return {
    version: 1,
    updatedAt: now(),
    founderName: "Founder",
    hypothesis: "Клиенты и мастера готовы фиксировать авторство эскиза через цифровой сертификат с QR и проверкой уникальности — и оставляют контакт ради раннего доступа.",
    targetMin: 50, targetMax: 100,
    tasks: seedTasks(),
    studios: [
      { id: "st1", name: "", contact: "", address: "", status: "lead", tents: 1, scans: 0, nicks: 0, lastTouch: "", comment: "" },
      { id: "st2", name: "", contact: "", address: "", status: "lead", tents: 1, scans: 0, nicks: 0, lastTouch: "", comment: "" },
      { id: "st3", name: "", contact: "", address: "", status: "lead", tents: 1, scans: 0, nicks: 0, lastTouch: "", comment: "" },
    ],
    metrics: [],
    mvpFormat: "undecided",
    mvpRationale: "",
    mvpScores: [
      { criterion: "Скорость до первого теста", tg: 5, web: 3, desktop: 2 },
      { criterion: "Стоимость разработки", tg: 5, web: 3, desktop: 2 },
      { criterion: "Дистрибуция (уже есть TG-ники)", tg: 5, web: 3, desktop: 1 },
      { criterion: "Проверка уникальности эскиза", tg: 3, web: 5, desktop: 5 },
      { criterion: "NFT + QR-сертификат", tg: 4, web: 5, desktop: 4 },
      { criterion: "UX загрузки / съёмки эскиза", tg: 3, web: 5, desktop: 3 },
      { criterion: "Масштабирование в платформу", tg: 3, web: 5, desktop: 2 },
    ],
    stack: [
      { id: "s1", layer: "Client", choice: "", status: "tbd", note: "TG-бот / Web / Desktop — после матрицы" },
      { id: "s2", layer: "Backend / API", choice: "", status: "tbd", note: "" },
      { id: "s3", layer: "База эскизов", choice: "", status: "tbd", note: "Хранение + метаданные + автор" },
      { id: "s4", layer: "AI: эскиз из фото", choice: "", status: "research", note: "Временный мост: выделение эскиза из фото тату" },
      { id: "s5", layer: "Проверка уникальности", choice: "", status: "research", note: "pHash / CLIP-эмбеддинги / поиск по базе" },
      { id: "s6", layer: "NFT-сертификат", choice: "", status: "tbd", note: "Сеть, стандарт, стоимость минта" },
      { id: "s7", layer: "QR + PDF сертификата", choice: "", status: "tbd", note: "Генерация финального формата" },
    ],
    funcs: [
      { id: "f1", name: "Сбор эскизов от пользователей", scope: "mvp", priority: "must", status: "planned", note: "" },
      { id: "f2", name: "AI-выделение эскиза из фото тату (временно)", scope: "mvp", priority: "must", status: "planned", note: "Мост до прямых загрузок от мастеров" },
      { id: "f3", name: "База эскизов + карточки", scope: "mvp", priority: "must", status: "planned", note: "" },
      { id: "f4", name: "Проверка эскиза на уникальность", scope: "mvp", priority: "must", status: "planned", note: "Ключевая функция MVP" },
      { id: "f5", name: "Генерация NFT-сертификата", scope: "mvp", priority: "must", status: "planned", note: "" },
      { id: "f6", name: "Встраивание NFT в QR + финальный сертификат", scope: "mvp", priority: "must", status: "planned", note: "Эскиз + QR в одном формате" },
      { id: "f7", name: "Кабинет мастера / студии", scope: "v2", priority: "should", status: "planned", note: "" },
      { id: "f8", name: "Маркет / витрина уникальных эскизов", scope: "v2", priority: "nice", status: "planned", note: "" },
    ],
    testing: { goalUsers: 100, tested: 0, sketches: 0, uniquePassed: 0, certs: 0 },
    questions: [
      { id: "q1", q: "Как сейчас фиксируешь, что эскиз твой / уникальный?", goal: "Текущее поведение" },
      { id: "q2", q: "Бывало, что твою тату / эскиз копировали? Что делал?", goal: "Боль и острота" },
      { id: "q3", q: "Что для тебя значит «уникальная тату» — насколько готов за это платить?", goal: "WTP" },
      { id: "q4", q: "Покажи, как ты проверял бы уникальность в нашем MVP. Что неудобно?", goal: "Юзабилити" },
      { id: "q5", q: "Кому бы показал QR-сертификат первым? Зачем?", goal: "Ценность / виральность" },
      { id: "q6", q: "Что должно случиться, чтобы ты посоветовал Skinvault мастеру?", goal: "Активация" },
      { id: "q7", q: "За что бы ты НЕ стал платить в таком сервисе?", goal: "Анти-фичи" },
    ],
    interviews: [],
    verdict: { choice: "undecided", reasoning: "", date: "", nextSteps: "" },
    log: [
      { id: "log0", date: new Date().toISOString().slice(0, 10), tag: "insight", pinned: true, text: "Фаза 1 оцифрована. Следующий рубеж — 3 студии + первые сканы. Всё, что вводится здесь, сохраняется локально и готово к показу команде." },
    ],
  };
}

/* ============ STORE HOOK ============ */
const KEY = "skinvault_phase1_v3";

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as AppState;
    const d = defaultState();
    // shallow-merge to survive schema changes
    return { ...d, ...parsed, tasks: parsed.tasks?.length ? parsed.tasks : d.tasks };
  } catch { return defaultState(); }
}

export function useStore() {
  const [state, setState] = useState<AppState>(load);
  const [presentMode, setPresentMode] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...state, updatedAt: now() }));
    } catch { /* quota */ }
  }, [state]);

  const update = useCallback((patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => {
    setState((s) => ({ ...s, ...(typeof patch === "function" ? (patch as (s: AppState) => Partial<AppState>)(s) : patch) }));
  }, []);

  const derived = useMemo(() => {
    const totalScans = state.metrics.reduce((a, m) => a + (Number(m.scans) || 0), 0);
    const totalNicks = state.metrics.reduce((a, m) => a + (Number(m.nicks) || 0), 0);
    const conv = totalScans > 0 ? (totalNicks / totalScans) * 100 : 0;
    const days = state.metrics.length || 0;
    const avgScans = days ? totalScans / days : 0;
    const avgNicks = days ? totalNicks / days : 0;
    const weeklyProj = avgNicks * 7;
    const done = state.tasks.filter((t) => t.status === "done").length;
    const progress = Math.round(state.tasks.reduce((a, t) => a + t.progress, 0) / state.tasks.length);
    const activeStudios = state.studios.filter((s) => ["placed", "live", "agreed"].includes(s.status)).length;
    const liveStudios = state.studios.filter((s) => s.status === "live").length;
    const interviews = state.interviews.length;
    const payYes = state.interviews.filter((i) => i.payWilling === "yes").length;
    const avgScore = interviews ? state.interviews.reduce((a, i) => a + i.score, 0) / interviews : 0;
    // gate status
    let gate: "idle" | "fail" | "pass" | "over" = "idle";
    if (days >= 7 || totalNicks > 0) {
      // evaluate last 7 days window
      const last7 = [...state.metrics].slice(-7);
      const w = last7.reduce((a, m) => a + (Number(m.nicks) || 0), 0);
      if (days >= 7) {
        if (w < state.targetMin) gate = "fail";
        else if (w <= state.targetMax) gate = "pass";
        else gate = "over";
      } else if (totalNicks > 0) {
        if (weeklyProj < state.targetMin) gate = "fail";
        else if (weeklyProj <= state.targetMax * 1.6) gate = "pass";
        else gate = "over";
      }
    }
    const nextTask = state.tasks.find((t) => t.status === "in_progress") || state.tasks.find((t) => t.status !== "done");
    // mvp totals
    const tot = (k: "tg" | "web" | "desktop") => state.mvpScores.reduce((a, r) => a + r[k], 0);
    const mvpTotals = { tg: tot("tg"), web: tot("web"), desktop: tot("desktop") };
    const mvpWinner = (Object.entries(mvpTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "tg") as "tg" | "web" | "desktop";
    return {
      totalScans, totalNicks, conv, days, avgScans, avgNicks, weeklyProj,
      done, progress, activeStudios, liveStudios, interviews, payYes, avgScore,
      gate, nextTask, mvpTotals, mvpWinner,
    };
  }, [state]);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `skinvault-phase1-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }, [state]);

  const resetAll = useCallback(() => {
    if (confirm("Сбросить все данные Phase 1? Это удалит введённые результаты.")) {
      localStorage.removeItem(KEY);
      setState(defaultState());
    }
  }, []);

  return { state, setState, update, derived, presentMode, setPresentMode, exportJSON, resetAll };
}

export type Store = ReturnType<typeof useStore>;
export { uid, now };
