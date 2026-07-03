import type { CountItem } from "@/hooks/useReportData";

function colorFor(count: number): string {
  if (count >= 5) return "#EF4444";
  if (count >= 3) return "#FBBF24";
  return "#4ADE80";
}

export default function SymptomFrequency({ items }: { items: CountItem[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-card p-4">
        <span className="label">Symptom Frequency</span>
        <p className="text-textDim text-sm mt-3">No symptoms logged</p>
      </div>
    );
  }

  const max = items[0].count;

  return (
    <div className="bg-surface border border-border rounded-card p-4">
      <span className="label">Symptom Frequency</span>
      <div className="mt-3 space-y-2.5">
        {items.map((item) => {
          const color = colorFor(item.count);
          const pct = max > 0 ? (item.count / max) * 100 : 0;
          return (
            <div key={item.name}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text">{item.name}</span>
                <span style={{ color }} className="text-xs font-medium">
                  {item.count}
                </span>
              </div>
              <div className="h-1.5 bg-innerBg rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
