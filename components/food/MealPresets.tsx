import type { MealPreset } from "@/lib/types";

export default function MealPresets({
  presets,
  onAdd,
  onRemove,
  readonly,
}: {
  presets: MealPreset[];
  onAdd: (preset: MealPreset) => void;
  onRemove: (id: string) => void;
  readonly: boolean;
}) {
  if (presets.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-card shadow-card p-4">
      <span className="label">Presets</span>
      <div className="flex flex-wrap gap-2 mt-3">
        {presets.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-2 border border-borderLight rounded-btn pl-3 pr-2 py-1.5"
          >
            <button onClick={() => onAdd(p)} className="text-sm text-text">
              {p.name} <span className="text-textDim">· {p.calories} kcal</span>
            </button>
            {!readonly && (
              <button onClick={() => onRemove(p.id)} className="text-red text-xs">
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
