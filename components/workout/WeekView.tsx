"use client";

import { useEffect, useState } from "react";
import { currentWeekDates, todayStr } from "@/lib/utils";
import type { DayLog } from "@/lib/types";

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
          next[dates[i]] = !!log?.workout?.done;
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
    <div className="bg-surface border border-border rounded-card p-4">
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
                  background: done ? "rgba(74,222,128,0.15)" : "#0B1626",
                  border: `1px solid ${isToday ? "#4ADE80" : done ? "#4ADE80" : "#1E3050"}`,
                }}
              >
                <span style={{ color: done ? "#4ADE80" : "#4B6080", fontSize: 12 }}>
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
