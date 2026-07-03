const PERIODS = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
];

export default function PeriodSelector({
  period,
  onChange,
}: {
  period: number;
  onChange: (p: number) => void;
}) {
  return (
    <div className="flex gap-2 bg-innerBg border border-borderLight rounded-input p-1">
      {PERIODS.map((p) => {
        const active = period === p.value;
        return (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className="flex-1 text-xs font-medium rounded-btn py-2 transition-colors"
            style={{
              background: active ? "#4ADE80" : "transparent",
              color: active ? "#08111E" : "#8A9AB0",
            }}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
