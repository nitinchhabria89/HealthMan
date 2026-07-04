"use client";

export default function CalorieRing({
  consumed,
  target,
}: {
  consumed: number;
  target: number;
}) {
  const size = 180;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const ratio = target > 0 ? consumed / target : 0;
  const pct = Math.min(ratio, 1);
  const offset = c * (1 - pct);
  const color = ratio >= 1 ? "#DC2626" : ratio >= 0.8 ? "#D97706" : "#16A34A";

  return (
    <div className="relative flex items-center justify-center mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#E2E8F0" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-semibold text-text">{consumed}</span>
        <span className="label mt-1">of {target} kcal</span>
      </div>
    </div>
  );
}
