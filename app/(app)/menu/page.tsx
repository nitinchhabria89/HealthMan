"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/ui/Header";
import MenuSlotCard from "@/components/menu/MenuSlotCard";
import { useDay } from "@/hooks/useDay";
import { todayStr } from "@/lib/utils";
import type { Meal, MenuMealType, MenuPlan } from "@/lib/types";

const MEAL_TYPES: MenuMealType[] = ["breakfast", "lunch", "dinner"];
const EMPTY_PLAN: MenuPlan = { breakfast: null, lunch: null, dinner: null };

export default function MenuPage() {
  const date = useMemo(() => todayStr(), []);
  const { day, loading, error, update } = useDay(date);
  const { data: session } = useSession();
  const readonly = session?.user?.role === "readonly";

  if (loading) return <p className="text-textDim text-sm pt-6">Loading...</p>;

  const menuPlan: MenuPlan = day.menuPlan ?? EMPTY_PLAN;

  function setSlot(mealType: MenuMealType, name: string, calories: number | null) {
    update((prev) => ({
      menuPlan: {
        ...(prev.menuPlan ?? EMPTY_PLAN),
        [mealType]: { name, calories, logged: false },
      },
    }));
  }

  function clearSlot(mealType: MenuMealType) {
    update((prev) => ({
      menuPlan: {
        ...(prev.menuPlan ?? EMPTY_PLAN),
        [mealType]: null,
      },
    }));
  }

  function logSlotAsEaten(mealType: MenuMealType) {
    update((prev) => {
      const plan = prev.menuPlan ?? EMPTY_PLAN;
      const slot = plan[mealType];
      if (!slot) return {};
      const meal: Meal = {
        id: crypto.randomUUID(),
        name: slot.name,
        calories: slot.calories ?? 0,
        type: mealType,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      return {
        meals: [...prev.meals, meal],
        menuPlan: { ...plan, [mealType]: { ...slot, logged: true } },
      };
    });
  }

  return (
    <div>
      <Header title="Menu" error={error} backHref="/dashboard" />
      <div className="space-y-4">
        {MEAL_TYPES.map((mt) => (
          <MenuSlotCard
            key={mt}
            mealType={mt}
            slot={menuPlan[mt]}
            onSet={(name, calories) => setSlot(mt, name, calories)}
            onClear={() => clearSlot(mt)}
            onLogEaten={() => logSlotAsEaten(mt)}
            readonly={readonly}
          />
        ))}
      </div>
    </div>
  );
}
