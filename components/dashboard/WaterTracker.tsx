"use client";

import Card from "@/components/ui/Card";

export default function WaterTracker({
  water,
  onChange,
  readonly,
}: {
  water: number;
  onChange: (n: number) => void;
  readonly?: boolean;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <span className="label">Water</span>
        <span className="text-sm text-textMuted">{water} / 8 glasses</span>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 8 }).map((_, i) => {
          const filled = i < water;
          return (
            <button
              key={i}
              disabled={readonly}
              onClick={() => onChange(filled && i === water - 1 ? water - 1 : i + 1)}
              className="flex-1 aspect-square rounded-input border flex items-center justify-center transition-colors disabled:opacity-50"
              style={{
                background: filled ? "rgba(56,189,248,0.15)" : "#0B1626",
                borderColor: filled ? "#38BDF8" : "#1E3050",
              }}
            >
              <span style={{ color: filled ? "#38BDF8" : "#4B6080", fontSize: 14 }}>💧</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
