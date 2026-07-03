import type { Meal, MealType } from "@/lib/types";

const TYPE_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack", "drink"];
const TYPE_LABEL: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
  drink: "Drinks",
};

export default function MealList({
  meals,
  onDelete,
}: {
  meals: Meal[];
  onDelete: (id: string) => void;
}) {
  if (meals.length === 0) {
    return <p className="text-textDim text-sm">No meals logged yet</p>;
  }

  return (
    <div className="space-y-4">
      {TYPE_ORDER.map((type) => {
        const items = meals.filter((m) => m.type === type);
        if (items.length === 0) return null;
        return (
          <div key={type}>
            <span className="label">{TYPE_LABEL[type]}</span>
            <div className="mt-2 space-y-2">
              {items.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between bg-innerBg border border-borderLight rounded-input px-3 py-2"
                >
                  <div>
                    <p className="text-text text-sm">{m.name}</p>
                    <p className="text-textDim text-xs">{m.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-text text-sm font-medium">{m.calories} kcal</span>
                    <button onClick={() => onDelete(m.id)} className="text-red text-xs">
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
