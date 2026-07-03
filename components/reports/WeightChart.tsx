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
    <div className="bg-surface border border-border rounded-card p-4">
      <span className="label">Weight Trend</span>
      <div className="mt-3" style={{ width: "100%", height: 180 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="label" tick={{ fill: "#4B6080", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#4B6080", fontSize: 10 }} axisLine={false} tickLine={false} width={32} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ background: "#08111E", border: "1px solid #162033", borderRadius: 8 }}
              labelStyle={{ color: "#E8F4FF" }}
              itemStyle={{ color: "#4B6080" }}
            />
            <Line type="monotone" dataKey="weight" stroke="#38BDF8" strokeWidth={2} dot={{ r: 3, fill: "#38BDF8" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
