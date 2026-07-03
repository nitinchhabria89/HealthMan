"use client";

import { useState } from "react";
import type { MealType } from "@/lib/types";

const TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack", "drink"];

export default function AddMealForm({
  onAdd,
}: {
  onAdd: (name: string, calories: number, type: MealType) => void;
}) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [type, setType] = useState<MealType>("snack");

  function submit() {
    if (!name || !calories) return;
    onAdd(name, Number(calories), type);
    setName("");
    setCalories("");
  }

  return (
    <div className="bg-surface border border-border rounded-card p-4 space-y-3">
      <span className="label">Add Meal Manually</span>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Meal name"
        className="w-full bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue"
      />
      <div className="flex gap-2">
        <input
          type="number"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="kcal"
          className="flex-1 bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as MealType)}
          className="flex-1 bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={submit}
        disabled={!name || !calories}
        className="w-full bg-green text-bg rounded-btn py-2 text-sm font-medium disabled:opacity-50"
      >
        Add Meal
      </button>
    </div>
  );
}
