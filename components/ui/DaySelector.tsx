"use client";

import { lastNDates, todayStr } from "@/lib/utils";

export default function DaySelector({
  date,
  onChange,
}: {
  date: string;
  onChange: (d: string) => void;
}) {
  const dates = lastNDates(7);
  const today = todayStr();

  return (
    <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
      {dates.map((d) => {
        const active = d === date;
        const isToday = d === today;
        const dt = new Date(`${d}T00:00:00`);
        const label = isToday
          ? "Today"
          : dt.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
        return (
          <button
            key={d}
            onClick={() => onChange(d)}
            className="shrink-0 rounded-btn px-3 py-2 text-xs font-medium border transition-colors"
            style={{
              background: active ? "#0056D2" : "#F1F5F9",
              borderColor: active ? "#0056D2" : "#EDF1F5",
              color: active ? "#FFFFFF" : "#64748B",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
