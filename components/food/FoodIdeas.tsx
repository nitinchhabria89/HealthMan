"use client";

import { useState } from "react";
import type { MealType } from "@/lib/types";
import { FOOD_OPTIONS, type FoodOptionMeal } from "@/lib/foodOptions";

type AnalysisResult = { analysis: string; estimatedCalories: number };
type FilterMeal = "any" | FoodOptionMeal;
const MEAL_FILTERS: { label: string; value: FilterMeal }[] = [
  { label: "Any", value: "any" },
  { label: "Breakfast", value: "breakfast" },
  { label: "Lunch", value: "lunch" },
  { label: "Dinner", value: "dinner" },
];
const TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack", "drink"];

export default function FoodIdeas({
  calorieTarget,
  onConfirm,
}: {
  calorieTarget: number;
  onConfirm: (name: string, calories: number, type: MealType) => void;
}) {
  const [mealFilter, setMealFilter] = useState<FilterMeal>("any");
  const [keyword, setKeyword] = useState("");
  const [showList, setShowList] = useState(false);

  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [type, setType] = useState<MealType>("lunch");
  const [calories, setCalories] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pool = FOOD_OPTIONS.filter((f) => mealFilter === "any" || f.mealType === mealFilter);
  const filtered = keyword.trim()
    ? pool.filter((f) => f.name.toLowerCase().includes(keyword.trim().toLowerCase()))
    : pool;

  function reset() {
    setSelected(null);
    setResult(null);
    setError("");
  }

  async function pickDish(name: string, mealType: FoodOptionMeal) {
    setSelected(name);
    setResult(null);
    setError("");
    setType(mealType);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: name, calorieTarget }),
      });
      if (!res.ok) throw new Error("failed");
      const data: AnalysisResult = await res.json();
      setResult(data);
      setCalories(data.estimatedCalories);
    } catch {
      setError("Couldn't estimate calories. Set them manually below.");
    } finally {
      setLoading(false);
    }
  }

  function surpriseMe() {
    if (filtered.length === 0) return;
    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    pickDish(pick.name, pick.mealType);
  }

  return (
    <div className="bg-surface border border-border rounded-card shadow-card p-4 space-y-3">
      <span className="label">Food Ideas</span>

      <div className="flex gap-2 bg-innerBg border border-borderLight rounded-input p-1">
        {MEAL_FILTERS.map((m) => {
          const active = mealFilter === m.value;
          return (
            <button
              key={m.value}
              onClick={() => setMealFilter(m.value)}
              className="flex-1 text-xs font-medium rounded-btn py-1.5"
              style={{
                background: active ? "#0056D2" : "transparent",
                color: active ? "#FFFFFF" : "#94A3B8",
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          onClick={surpriseMe}
          className="flex-1 bg-blue text-white rounded-btn py-2 text-sm font-medium"
        >
          🎲 Surprise Me
        </button>
        <button
          onClick={() => setShowList((s) => !s)}
          className="shrink-0 border border-borderLight rounded-btn px-3 text-textMuted text-sm"
        >
          {showList ? "Hide list" : "Browse"}
        </button>
      </div>

      {showList && (
        <div className="space-y-2">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search dish or ingredient (e.g. paneer)"
            className="w-full bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue"
          />
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-textDim text-sm">No dishes match.</p>
            )}
            {filtered.map((f) => (
              <button
                key={f.name}
                onClick={() => pickDish(f.name, f.mealType)}
                className="text-xs border border-borderLight rounded-btn px-3 py-1.5 text-text"
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="text-textDim text-sm">Estimating {selected}...</p>}

      {error && (
        <div>
          <p className="text-red text-sm">{error}</p>
          <button onClick={() => selected && pickDish(selected, type as FoodOptionMeal)} className="text-blue text-xs mt-1">
            Retry
          </button>
        </div>
      )}

      {result && selected && (
        <div className="space-y-3 pt-1">
          <p className="text-text text-sm font-medium">{selected}</p>
          <p className="text-textMuted text-sm whitespace-pre-wrap">{result.analysis}</p>
          <div className="flex gap-2">
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              className="w-24 bg-innerBg border border-borderLight rounded-input px-2 py-1.5 text-text text-sm"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MealType)}
              className="flex-1 min-w-0 bg-innerBg border border-borderLight rounded-input px-2 py-1.5 text-text text-sm"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onConfirm(selected, calories, type);
                reset();
              }}
              className="flex-1 bg-green text-bg rounded-btn py-2 text-sm font-medium"
            >
              Add to log
            </button>
            <button
              onClick={reset}
              className="px-4 border border-borderLight rounded-btn text-textMuted text-sm"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
