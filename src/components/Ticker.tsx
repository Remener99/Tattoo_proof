import { GradientDivider } from "./Hud";

const ITEMS = [
  "GOT PROOF?",
  "ONE OF ONE",
  "ТВОЯ ТАТУ — ТОЛЬКО ТВОЯ",
  "VERIFIED INK",
  "YOUR SKIN. YOUR VAULT.",
  "NO COPIES. EVER.",
];

export function Ticker() {
  const row = [...ITEMS, ...ITEMS];

  return (
    <div className="relative py-6">
      <GradientDivider className="opacity-45" />
      <div className="mask-fade-x overflow-hidden py-6" aria-hidden>
        <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap">
          {row.map((item, i) => (
            <span key={`${item}-${i}`} className="flex items-center gap-10">
              <span
                className={
                  i % 2 === 0
                    ? "font-display text-[clamp(1.1rem,2.4vw,1.9rem)] font-extrabold tracking-[0.02em] text-chalk/90 uppercase"
                    : "font-display text-stroke-thin text-[clamp(1.1rem,2.4vw,1.9rem)] font-extrabold tracking-[0.02em] uppercase"
                }
              >
                {item}
              </span>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M7 0v14M0 7h14" stroke={i % 2 === 0 ? "#CC0000" : "#0066FF"} strokeWidth="1.2" />
              </svg>
            </span>
          ))}
        </div>
      </div>
      <GradientDivider className="opacity-45" />
    </div>
  );
}
