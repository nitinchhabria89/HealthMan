"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from "recharts";
import type { DayLog } from "@/lib/types";
import { formatDisplayDate } from "@/lib/utils";

export default function WorkoutHeatmap({
  dates,
  days,
}: {
  dates: string[];
  days: DayLog[];
}) {
  const data = dates.map((date, i) => ({
    date,
    label: formatDisplayDate(date),
    value: 1,
    done: !!(days[i]?.workout?.walk || days[i]?.workout?.yoga),
  }));

  return (
    <div className="bg-surface border border-border rounded-card shadow-card p-4">
      <span className="label">Workout Activity</span>
      <div className="mt-3" style={{ width: "100%", height: 100 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="label" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <Tooltip
              contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8 }}
              labelStyle={{ color: "#0F172A" }}
              formatter={(_, __, item) => [
                (item?.payload as { done?: boolean } | undefined)?.done ? "Workout" : "Rest",
                "",
              ]}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.done ? "#16A34A" : "#E2E8F0"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
