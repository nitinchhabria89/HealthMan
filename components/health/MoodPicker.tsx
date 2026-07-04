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
    <div className="bg-surface border border-border rounded-card shadow-card p-4">
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
                borderColor: active ? "#16A34A" : "#EDF1F5",
                background: active ? "rgba(22,163,74,0.1)" : "#F1F5F9",
                color: active ? "#16A34A" : "#94A3B8",
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
