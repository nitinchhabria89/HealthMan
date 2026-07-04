"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/ui/Header";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import PeriodSelector from "@/components/reports/PeriodSelector";
import WeightChart from "@/components/reports/WeightChart";
import { useDay } from "@/hooks/useDay";
import { useProfile } from "@/hooks/useProfile";
import { useReportData } from "@/hooks/useReportData";
import { todayStr, formatDisplayDate } from "@/lib/utils";

export default function WeightPage() {
  const date = useMemo(() => todayStr(), []);
  const { day, loading: dayLoading, error, update } = useDay(date);
  const { profile, loading: profileLoading } = useProfile();
  const [period, setPeriod] = useState(30);
  const { data, loading: reportLoading } = useReportData(period);
  const { data: session } = useSession();
  const readonly = session?.user?.role === "readonly";

  if (dayLoading || profileLoading) return <p className="text-textDim text-sm pt-6">Loading...</p>;

  const series = data?.weightSeries || [];
  const latest = day.weight ?? data?.latestWeight ?? null;
  const first = series.length > 0 ? series[0].weight : null;
  const changeInPeriod = latest != null && first != null ? Math.round((latest - first) * 10) / 10 : null;

  const goalIsLoss = (profile.targetWeight || 0) < (profile.currentWeight || 0);
  const changeColor =
    changeInPeriod == null || changeInPeriod === 0
      ? undefined
      : (goalIsLoss ? changeInPeriod < 0 : changeInPeriod > 0)
        ? "#16A34A"
        : "#DC2626";

  return (
    <div>
      <Header title="Weight" error={error} backHref="/dashboard" />

      <div className="space-y-4">
        <Card>
          <span className="label">Log Today&apos;s Weight</span>
          <div className="flex items-end gap-2 mt-3">
            <input
              type="number"
              step="0.1"
              disabled={readonly}
              value={day.weight ?? ""}
              onChange={(e) => update({ weight: e.target.value ? Number(e.target.value) : null })}
              placeholder="—"
              className="w-24 bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-2xl font-semibold outline-none focus:border-blue disabled:opacity-50"
            />
            <span className="text-textMuted text-sm mb-2">kg</span>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Current" value={latest != null ? `${latest}kg` : "Not logged"} />
          <StatCard
            label="Target"
            value={profile.targetWeight ? `${profile.targetWeight}kg` : "—"}
            color="#16A34A"
          />
          <StatCard
            label={`Change (${period}d)`}
            value={changeInPeriod != null ? `${changeInPeriod > 0 ? "+" : ""}${changeInPeriod}kg` : "—"}
            color={changeColor}
          />
          <StatCard label="Entries Logged" value={`${series.length}`} />
        </div>

        <PeriodSelector period={period} onChange={setPeriod} />

        {reportLoading ? (
          <p className="text-textDim text-sm">Loading trend...</p>
        ) : series.length >= 2 ? (
          <WeightChart series={series} />
        ) : (
          <Card>
            <p className="text-textDim text-sm">
              Log weight on at least 2 days in this period to see a trend line.
            </p>
          </Card>
        )}

        <Card>
          <span className="label">History</span>
          <div className="mt-3 space-y-2">
            {series.length === 0 && (
              <p className="text-textDim text-sm">No weight logged yet in this period.</p>
            )}
            {[...series].reverse().map((p) => (
              <div
                key={p.date}
                className="flex items-center justify-between bg-innerBg border border-borderLight rounded-input px-3 py-2"
              >
                <span className="text-text text-sm">{formatDisplayDate(p.date)}</span>
                <span className="text-text text-sm font-medium">{p.weight}kg</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
