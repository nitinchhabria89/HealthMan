"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/ui/Header";
import AddMealForm from "@/components/food/AddMealForm";
import PhotoUpload from "@/components/food/PhotoUpload";
import MealList from "@/components/food/MealList";
import MealPresets from "@/components/food/MealPresets";
import FoodIdeas from "@/components/food/FoodIdeas";
import { useDay } from "@/hooks/useDay";
import { useProfile } from "@/hooks/useProfile";
import { useMealPresets } from "@/hooks/useMealPresets";
import { todayStr } from "@/lib/utils";
import type { Meal, MealPreset, MealType } from "@/lib/types";

export default function FoodPage() {
  const date = useMemo(() => todayStr(), []);
  const { day, loading, error, update } = useDay(date);
  const { profile } = useProfile();
  const { presets, addPreset, removePreset } = useMealPresets();
  const { data: session } = useSession();
  const readonly = session?.user?.role === "readonly";

  const target = day.calorieTarget ?? profile.calorieTarget ?? 2000;
  const consumed = day.meals.reduce((sum, m) => sum + m.calories, 0);
  const ratio = target > 0 ? consumed / target : 0;
  const color = ratio >= 1 ? "text-red" : ratio >= 0.8 ? "text-amber" : "text-green";

  function addMeal(name: string, calories: number, type: MealType) {
    const meal: Meal = {
      id: crypto.randomUUID(),
      name,
      calories,
      type,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    update((prev) => ({ meals: [...prev.meals, meal] }));
  }

  function addPhotoMeal(name: string, calories: number, type: MealType) {
    const meal: Meal = {
      id: crypto.randomUUID(),
      name,
      calories,
      type,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      photoAnalyzed: true,
    };
    update((prev) => ({ meals: [...prev.meals, meal] }));
  }

  function deleteMeal(id: string) {
    update((prev) => ({ meals: prev.meals.filter((m) => m.id !== id) }));
  }

  function savePreset(name: string, calories: number, type: MealType) {
    addPreset({ id: crypto.randomUUID(), name, calories, type });
  }

  function addFromPreset(preset: MealPreset) {
    addMeal(preset.name, preset.calories, preset.type);
  }

  if (loading) return <p className="text-textDim text-sm pt-6">Loading...</p>;

  return (
    <div>
      <Header title="Food" error={error} />

      <div className="space-y-4">
        <div className="bg-surface border border-border rounded-card shadow-card p-4 flex items-center justify-between">
          <span className="label">Today&apos;s Total</span>
          <span className={`text-lg font-semibold ${color}`}>
            {consumed} / {target} kcal
          </span>
        </div>

        <MealPresets
          presets={presets}
          onAdd={addFromPreset}
          onRemove={removePreset}
          readonly={readonly}
        />

        {!readonly && <FoodIdeas calorieTarget={target} onConfirm={addMeal} />}

        {!readonly && (
          <AddMealForm calorieTarget={target} onAdd={addMeal} onSavePreset={savePreset} />
        )}
        {!readonly && <PhotoUpload calorieTarget={target} onConfirm={addPhotoMeal} />}

        <MealList meals={day.meals} onDelete={readonly ? () => {} : deleteMeal} />
      </div>
    </div>
  );
}
