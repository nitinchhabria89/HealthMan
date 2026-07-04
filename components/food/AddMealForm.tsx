"use client";

import { useState } from "react";
import type { MealType } from "@/lib/types";

const TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack", "drink"];

export default function AddMealForm({
  calorieTarget,
  onAdd,
  onSavePreset,
}: {
  calorieTarget: number;
  onAdd: (name: string, calories: number, type: MealType) => void;
  onSavePreset?: (name: string, calories: number, type: MealType) => void;
}) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [type, setType] = useState<MealType>("snack");
  const [estimating, setEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState("");

  function submit() {
    if (!name || !calories) return;
    onAdd(name, Number(calories), type);
    setName("");
    setCalories("");
  }

  function savePreset() {
    if (!name || !calories || !onSavePreset) return;
    onSavePreset(name, Number(calories), type);
  }

  async function estimate() {
    if (!name.trim()) return;
    setEstimating(true);
    setEstimateError("");
    try {
      const res = await fetch("/api/ai/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: name, calorieTarget }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setCalories(String(data.estimatedCalories));
    } catch {
      setEstimateError("Couldn't estimate. Enter calories manually.");
    } finally {
      setEstimating(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-card shadow-card p-4 space-y-3">
      <span className="label">Add Meal</span>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Meal name or description"
        className="w-full bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue"
      />
      <div className="flex gap-2">
        <input
          type="number"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="kcal"
          className="w-24 bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue"
        />
        <button
          onClick={estimate}
          disabled={!name.trim() || estimating}
          className="shrink-0 text-blue text-xs border border-blue rounded-btn px-3 disabled:opacity-50"
        >
          {estimating ? "Estimating..." : "Estimate"}
        </button>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as MealType)}
          className="flex-1 min-w-0 bg-innerBg border border-borderLight rounded-input px-2 py-2 text-text text-sm outline-none"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      {estimateError && <p className="text-red text-xs">{estimateError}</p>}
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={!name || !calories}
          className="flex-1 bg-green text-bg rounded-btn py-2 text-sm font-medium disabled:opacity-50"
        >
          Add Meal
        </button>
        {onSavePreset && (
          <button
            onClick={savePreset}
            disabled={!name || !calories}
            className="shrink-0 border border-borderLight rounded-btn px-3 text-textMuted text-sm disabled:opacity-50"
          >
            ☆ Save
          </button>
        )}
      </div>
    </div>
  );
}
