"use client";

import type { ReactNode } from "react";
import type { Workout } from "@/lib/types";

function ActivityToggle({
  label,
  value,
  onYes,
  onNo,
  readonly,
  extra,
}: {
  label: string;
  value: boolean;
  onYes: () => void;
  onNo: () => void;
  readonly: boolean;
  extra?: ReactNode;
}) {
  return (
    <div>
      <span className="label mb-2 block">{label}</span>
      <div className="flex gap-2">
        <button
          disabled={readonly}
          onClick={onYes}
          className="flex-1 rounded-btn py-2.5 text-sm font-medium border disabled:opacity-50"
          style={{
            background: value ? "rgba(22,163,74,0.1)" : "#F1F5F9",
            borderColor: value ? "#16A34A" : "#EDF1F5",
            color: value ? "#16A34A" : "#94A3B8",
          }}
        >
          Yes
        </button>
        <button
          disabled={readonly}
          onClick={onNo}
          className="flex-1 rounded-btn py-2.5 text-sm font-medium border disabled:opacity-50"
          style={{
            background: !value ? "rgba(217,119,6,0.1)" : "#F1F5F9",
            borderColor: !value ? "#D97706" : "#EDF1F5",
            color: !value ? "#D97706" : "#94A3B8",
          }}
        >
          No
        </button>
      </div>
      {extra}
    </div>
  );
}

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
      <ActivityToggle
        label="Walk"
        value={workout.walk}
        onYes={() => onChange({ walk: true })}
        onNo={() => onChange({ walk: false, steps: null })}
        readonly={readonly}
        extra={
          workout.walk && (
            <input
              type="number"
              disabled={readonly}
              value={workout.steps ?? ""}
              onChange={(e) => onChange({ steps: e.target.value ? Number(e.target.value) : null })}
              placeholder="Steps (optional)"
              className="w-full mt-2 bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue disabled:opacity-50"
            />
          )
        }
      />

      <ActivityToggle
        label="Yoga"
        value={workout.yoga}
        onYes={() => onChange({ yoga: true })}
        onNo={() => onChange({ yoga: false })}
        readonly={readonly}
      />

      <ActivityToggle
        label="Gym"
        value={workout.gym}
        onYes={() => onChange({ gym: true })}
        onNo={() => onChange({ gym: false })}
        readonly={readonly}
      />

      <ActivityToggle
        label="Running"
        value={workout.running}
        onYes={() => onChange({ running: true })}
        onNo={() => onChange({ running: false, runningKm: null })}
        readonly={readonly}
        extra={
          workout.running && (
            <input
              type="number"
              step="0.1"
              disabled={readonly}
              value={workout.runningKm ?? ""}
              onChange={(e) =>
                onChange({ runningKm: e.target.value ? Number(e.target.value) : null })
              }
              placeholder="Distance in km (optional)"
              className="w-full mt-2 bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue disabled:opacity-50"
            />
          )
        }
      />

      <ActivityToggle
        label="Tennis"
        value={workout.tennis}
        onYes={() => onChange({ tennis: true })}
        onNo={() => onChange({ tennis: false })}
        readonly={readonly}
      />

      <ActivityToggle
        label="Badminton"
        value={workout.badminton}
        onYes={() => onChange({ badminton: true })}
        onNo={() => onChange({ badminton: false })}
        readonly={readonly}
      />

      <ActivityToggle
        label="Pickleball"
        value={workout.pickleball}
        onYes={() => onChange({ pickleball: true })}
        onNo={() => onChange({ pickleball: false })}
        readonly={readonly}
      />
    </div>
  );
}
