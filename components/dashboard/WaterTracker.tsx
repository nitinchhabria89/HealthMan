"use client";

import Card from "@/components/ui/Card";

export default function WaterTracker({
  water,
  targetGlasses,
  glassSizeMl,
  onChange,
  readonly,
}: {
  water: number;
  targetGlasses: number;
  glassSizeMl: number;
  onChange: (n: number) => void;
  readonly?: boolean;
}) {
  const liters = (water * glassSizeMl) / 1000;
  const goalLiters = (targetGlasses * glassSizeMl) / 1000;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <span className="label">Water</span>
        <span className="text-sm text-textMuted">
          {water}/{targetGlasses} glasses · {liters.toFixed(2)}L / {goalLiters.toFixed(1)}L
        </span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: targetGlasses }).map((_, i) => {
          const filled = i < water;
          return (
            <button
              key={i}
              disabled={readonly}
              onClick={() => onChange(filled && i === water - 1 ? water - 1 : i + 1)}
              className="aspect-square rounded-input border flex items-center justify-center transition-colors disabled:opacity-50"
              style={{
                background: filled ? "rgba(0,86,210,0.1)" : "#F1F5F9",
                borderColor: filled ? "#0056D2" : "#EDF1F5",
              }}
            >
              <span style={{ color: filled ? "#0056D2" : "#94A3B8", fontSize: 17 }}>💧</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
