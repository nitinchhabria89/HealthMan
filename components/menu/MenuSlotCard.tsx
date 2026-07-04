"use client";

import { useState } from "react";
import type { MenuMealType, MenuSlot } from "@/lib/types";
import { FOOD_OPTIONS } from "@/lib/foodOptions";

const LABELS: Record<MenuMealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export default function MenuSlotCard({
  mealType,
  slot,
  onSet,
  onClear,
  onLogEaten,
  readonly,
}: {
  mealType: MenuMealType;
  slot: MenuSlot;
  onSet: (name: string, calories: number | null) => void;
  onClear: () => void;
  onLogEaten: () => void;
  readonly: boolean;
}) {
  const [showList, setShowList] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pool = FOOD_OPTIONS.filter((f) => f.mealType === mealType);
  const filtered = keyword.trim()
    ? pool.filter((f) => f.name.toLowerCase().includes(keyword.trim().toLowerCase()))
    : pool;

  async function pick(name: string) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: name }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      onSet(name, data.estimatedCalories ?? null);
      setShowList(false);
      setKeyword("");
    } catch {
      setError("Couldn't estimate calories, but you can still decide on the dish.");
      onSet(name, null);
      setShowList(false);
      setKeyword("");
    } finally {
      setLoading(false);
    }
  }

  function surpriseMe() {
    if (pool.length === 0) return;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    pick(choice.name);
  }

  return (
    <div className="bg-surface border border-border rounded-card shadow-card p-4 space-y-3">
      <span className="label">{LABELS[mealType]}</span>

      {slot ? (
        <div className="space-y-3">
          <div>
            <p className="text-text text-base font-medium">{slot.name}</p>
            {slot.calories != null && (
              <p className="text-textMuted text-sm">{slot.calories} kcal (estimated)</p>
            )}
          </div>
          <div className="flex gap-2">
            {slot.logged ? (
              <span className="flex-1 text-center text-green text-sm font-medium py-2">
                ✓ Logged
              </span>
            ) : (
              !readonly && (
                <button
                  onClick={onLogEaten}
                  className="flex-1 bg-green text-bg rounded-btn py-2 text-sm font-medium"
                >
                  Log as eaten
                </button>
              )
            )}
            {!readonly && (
              <button
                onClick={onClear}
                className="px-4 border border-borderLight rounded-btn text-textMuted text-sm"
              >
                Change
              </button>
            )}
          </div>
        </div>
      ) : readonly ? (
        <p className="text-textDim text-sm">Not decided yet</p>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={surpriseMe}
              disabled={loading}
              className="flex-1 bg-blue text-white rounded-btn py-2 text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Thinking..." : "🎲 Surprise Me"}
            </button>
            <button
              onClick={() => setShowList((s) => !s)}
              className="shrink-0 border border-borderLight rounded-btn px-3 text-textMuted text-sm"
            >
              {showList ? "Hide list" : "Browse"}
            </button>
          </div>

          {error && <p className="text-red text-xs">{error}</p>}

          {showList && (
            <div className="space-y-2">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search dish or ingredient"
                className="w-full bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue"
              />
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {filtered.length === 0 && (
                  <p className="text-textDim text-sm">No dishes match.</p>
                )}
                {filtered.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => pick(f.name)}
                    disabled={loading}
                    className="text-xs border border-borderLight rounded-btn px-3 py-1.5 text-text disabled:opacity-50"
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
