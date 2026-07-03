const MOODS = ["Great", "Good", "Okay", "Meh", "Low", "Stressed", "Tired"];

export default function MoodPicker({
  mood,
  onChange,
  readonly,
}: {
  mood: string;
  onChange: (m: string) => void;
  readonly: boolean;
}) {
  return (
    <div className="bg-surface border border-border rounded-card p-4">
      <span className="label">Mood</span>
      <div className="flex flex-wrap gap-2 mt-3">
        {MOODS.map((m) => {
          const active = mood === m;
          return (
            <button
              key={m}
              disabled={readonly}
              onClick={() => onChange(m)}
              className="text-xs rounded-btn px-3 py-1.5 border"
              style={{
                borderColor: active ? "#4ADE80" : "#1E3050",
                background: active ? "rgba(74,222,128,0.15)" : "#0B1626",
                color: active ? "#4ADE80" : "#8A9AB0",
              }}
            >
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );
}
