"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { formatDisplayDate } from "@/lib/utils";

export default function WeightChart({
  series,
}: {
  series: { date: string; weight: number }[];
}) {
  if (series.length < 2) return null;

  const data = series.map((p) => ({ ...p, label: formatDisplayDate(p.date) }));

  return (
    <div className="bg-surface border border-border rounded-card shadow-card p-4">
      <span className="label">Weight Trend</span>
      <div className="mt-3" style={{ width: "100%", height: 180 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="label" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} width={32} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8 }}
              labelStyle={{ color: "#0F172A" }}
              itemStyle={{ color: "#64748B" }}
            />
            <Line type="monotone" dataKey="weight" stroke="#0056D2" strokeWidth={2} dot={{ r: 3, fill: "#0056D2" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
