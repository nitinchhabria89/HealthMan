"use client";

import { useState } from "react";
import type { Workout } from "@/lib/types";
import { estimateCaloriesBurned } from "@/lib/utils";

const TYPES = [
  "Walking",
  "Running",
  "Cycling",
  "Swimming",
  "Yoga",
  "Strength",
  "HIIT",
  "Cardio",
  "Pilates",
  "Sports",
  "Dance",
  "Other",
];
const INTENSITIES = ["Light", "Moderate", "Intense", "Max effort"];

export default function WorkoutLogger({
  workout,
  onChange,
  readonly,
}: {
  workout: Workout;
  onChange: (patch: Partial<Workout>) => void;
  readonly: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const duration = Number(workout.duration) || 0;
  const estimatedBurn = workout.type ? estimateCaloriesBurned(workout.type, duration) : 0;

  function save() {
    onChange({ caloriesBurned: estimatedBurn });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="bg-surface border border-border rounded-card p-4 space-y-4">
      <div className="flex gap-2">
        <button
          disabled={readonly}
          onClick={() => onChange({ done: true })}
          className="flex-1 rounded-btn py-3 text-sm font-medium border"
          style={{
            background: workout.done ? "rgba(74,222,128,0.15)" : "#0B1626",
            borderColor: workout.done ? "#4ADE80" : "#1E3050",
            color: workout.done ? "#4ADE80" : "#8A9AB0",
          }}
        >
          Workout Day
        </button>
        <button
          disabled={readonly}
          onClick={() => onChange({ done: false })}
          className="flex-1 rounded-btn py-3 text-sm font-medium border"
          style={{
            background: !workout.done ? "rgba(251,191,36,0.15)" : "#0B1626",
            borderColor: !workout.done ? "#FBBF24" : "#1E3050",
            color: !workout.done ? "#FBBF24" : "#8A9AB0",
          }}
        >
          Rest Day
        </button>
      </div>

      {workout.done && (
        <>
          <div>
            <span className="label mb-1 block">Type</span>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => {
                const active = workout.type === t;
                return (
                  <button
                    key={t}
                    disabled={readonly}
                    onClick={() => onChange({ type: t })}
                    className="text-xs rounded-btn px-3 py-1.5 border"
                    style={{
                      borderColor: active ? "#4ADE80" : "#1E3050",
                      background: active ? "rgba(74,222,128,0.15)" : "#0B1626",
                      color: active ? "#4ADE80" : "#8A9AB0",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <span className="label mb-1 block">Duration (min)</span>
              <input
                type="number"
                disabled={readonly}
                value={workout.duration}
                onChange={(e) => onChange({ duration: e.target.value })}
                className="w-full bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue"
              />
            </div>
            <div className="flex-1">
              <span className="label mb-1 block">Intensity</span>
              <select
                disabled={readonly}
                value={workout.intensity}
                onChange={(e) => onChange({ intensity: e.target.value })}
                className="w-full bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none"
              >
                <option value="">Select</option>
                {INTENSITIES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="label mb-1 block">Notes</span>
            <textarea
              disabled={readonly}
              value={workout.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              rows={2}
              className="w-full bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue"
            />
          </div>

          {estimatedBurn > 0 && (
            <div className="flex items-center justify-between bg-innerBg border border-borderLight rounded-input px-3 py-2">
              <span className="label">Est. burn</span>
              <span className="text-green text-sm font-medium">{estimatedBurn} kcal</span>
            </div>
          )}

          {!readonly && (
            <button
              onClick={save}
              className="w-full bg-green text-bg rounded-btn py-2.5 text-sm font-medium"
            >
              {saved ? "Saved ✓" : "Save Workout"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
