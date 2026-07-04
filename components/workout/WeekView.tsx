"use client";

import { useEffect, useState } from "react";
import { currentWeekDates, todayStr } from "@/lib/utils";
import { isWorkoutDay, type DayLog } from "@/lib/types";

const LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export default function WeekView() {
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});
  const dates = currentWeekDates();
  const today = todayStr();

  useEffect(() => {
    let cancelled = false;
    Promise.all(dates.map((d) => fetch(`/api/health/day?date=${d}`).then((r) => r.json())))
      .then((logs: DayLog[]) => {
        if (cancelled) return;
        const next: Record<string, boolean> = {};
        logs.forEach((log, i) => {
          next[dates[i]] = isWorkoutDay(log?.workout);
        });
        setStatuses(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-surface border border-border rounded-card shadow-card p-4">
      <span className="label">This Week</span>
      <div className="flex gap-2 mt-3">
        {dates.map((d, i) => {
          const done = statuses[d];
          const isToday = d === today;
          return (
            <div key={d} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className="w-full aspect-square rounded-input flex items-center justify-center"
                style={{
                  background: done ? "rgba(22,163,74,0.1)" : "#F1F5F9",
                  border: `1px solid ${isToday ? "#16A34A" : done ? "#16A34A" : "#EDF1F5"}`,
                }}
              >
                <span style={{ color: done ? "#16A34A" : "#64748B", fontSize: 14 }}>
                  {done ? "✓" : "·"}
                </span>
              </div>
              <span className={`text-xs ${isToday ? "text-green" : "text-textDim"}`}>
                {LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
