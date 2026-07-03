"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import type { DayLog } from "@/lib/types";
import { formatDisplayDate } from "@/lib/utils";

export default function CalorieChart({
  dates,
  days,
  defaultTarget,
}: {
  dates: string[];
  days: DayLog[];
  defaultTarget: number;
}) {
  const data = dates.map((date, i) => {
    const day = days[i];
    const consumed = day?.meals.reduce((s, m) => s + m.calories, 0) || 0;
    const target = day?.calorieTarget ?? defaultTarget;
    const ratio = target > 0 ? consumed / target : 0;
    const color = ratio >= 1 ? "#EF4444" : ratio >= 0.8 ? "#FBBF24" : "#4ADE80";
    return { date, label: formatDisplayDate(date), consumed, color };
  });

  return (
    <div className="bg-surface border border-border rounded-card p-4">
      <span className="label">Daily Calories</span>
      <div className="mt-3" style={{ width: "100%", height: 180 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="label" tick={{ fill: "#4B6080", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#4B6080", fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
            <Tooltip
              contentStyle={{ background: "#08111E", border: "1px solid #162033", borderRadius: 8 }}
              labelStyle={{ color: "#E8F4FF" }}
              itemStyle={{ color: "#4B6080" }}
            />
            <Bar dataKey="consumed" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
