"use client";

import type { Workout } from "@/lib/types";

export default function WorkoutLogger({
  workout,
  onChange,
  readonly,
}: {
  workout: Workout;
  onChange: (patch: Partial<Workout>) => void;
  readonly: boolean;
}) {
  return (
    <div className="bg-surface border border-border rounded-card shadow-card p-4 space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="label">Walk</span>
        </div>
        <div className="flex gap-2">
          <button
            disabled={readonly}
            onClick={() => onChange({ walk: true })}
            className="flex-1 rounded-btn py-2.5 text-sm font-medium border disabled:opacity-50"
            style={{
              background: workout.walk ? "rgba(22,163,74,0.1)" : "#F1F5F9",
              borderColor: workout.walk ? "#16A34A" : "#EDF1F5",
              color: workout.walk ? "#16A34A" : "#94A3B8",
            }}
          >
            Yes
          </button>
          <button
            disabled={readonly}
            onClick={() => onChange({ walk: false, steps: null })}
            className="flex-1 rounded-btn py-2.5 text-sm font-medium border disabled:opacity-50"
            style={{
              background: !workout.walk ? "rgba(217,119,6,0.1)" : "#F1F5F9",
              borderColor: !workout.walk ? "#D97706" : "#EDF1F5",
              color: !workout.walk ? "#D97706" : "#94A3B8",
            }}
          >
            No
          </button>
        </div>
        {workout.walk && (
          <input
            type="number"
            disabled={readonly}
            value={workout.steps ?? ""}
            onChange={(e) => onChange({ steps: e.target.value ? Number(e.target.value) : null })}
            placeholder="Steps (optional)"
            className="w-full mt-2 bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue disabled:opacity-50"
          />
        )}
      </div>

      <div>
        <span className="label mb-2 block">Yoga</span>
        <div className="flex gap-2">
          <button
            disabled={readonly}
            onClick={() => onChange({ yoga: true })}
            className="flex-1 rounded-btn py-2.5 text-sm font-medium border disabled:opacity-50"
            style={{
              background: workout.yoga ? "rgba(22,163,74,0.1)" : "#F1F5F9",
              borderColor: workout.yoga ? "#16A34A" : "#EDF1F5",
              color: workout.yoga ? "#16A34A" : "#94A3B8",
            }}
          >
            Yes
          </button>
          <button
            disabled={readonly}
            onClick={() => onChange({ yoga: false })}
            className="flex-1 rounded-btn py-2.5 text-sm font-medium border disabled:opacity-50"
            style={{
              background: !workout.yoga ? "rgba(217,119,6,0.1)" : "#F1F5F9",
              borderColor: !workout.yoga ? "#D97706" : "#EDF1F5",
              color: !workout.yoga ? "#D97706" : "#94A3B8",
            }}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
