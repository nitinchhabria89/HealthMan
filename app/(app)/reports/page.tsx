"use client";

import { useState } from "react";
import Header from "@/components/ui/Header";
import StatCard from "@/components/ui/StatCard";
import PeriodSelector from "@/components/reports/PeriodSelector";
import CalorieChart from "@/components/reports/CalorieChart";
import WeightChart from "@/components/reports/WeightChart";
import WorkoutHeatmap from "@/components/reports/WorkoutHeatmap";
import SymptomFrequency from "@/components/reports/SymptomFrequency";
import AIHealthReview from "@/components/reports/AIHealthReview";
import { useReportData } from "@/hooks/useReportData";
import { useProfile } from "@/hooks/useProfile";

export default function ReportsPage() {
  const [period, setPeriod] = useState(7);
  const { data, loading, error } = useReportData(period);
  const { profile } = useProfile();

  if (error) {
    return (
      <div>
        <Header title="Reports" />
        <p className="text-red text-sm">{error}</p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div>
        <Header title="Reports" />
        <p className="text-textDim text-sm">Crunching numbers...</p>
      </div>
    );
  }

  const target = profile.calorieTarget || 2000;
  const calorieRatio = target > 0 ? data.avgCalories / target : 0;
  const calorieColor = calorieRatio >= 1 ? "#DC2626" : calorieRatio >= 0.8 ? "#D97706" : "#16A34A";

  return (
    <div>
      <Header title="Reports" />

      <div className="space-y-4">
        <PeriodSelector period={period} onChange={setPeriod} />

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Days Logged" value={`${data.loggedDays} / ${data.totalDays}`} />
          <StatCard
            label="Workout Consistency"
            value={`${data.workoutConsistencyPct}%`}
            color="#16A34A"
          />
          <StatCard label="Workout Streak" value={`${data.workoutStreak}d`} color="#16A34A" />
          <StatCard label="Avg Calories" value={`${data.avgCalories} kcal`} color={calorieColor} />
          <StatCard label="Avg Water" value={`${data.avgWater} glasses`} color="#0056D2" />
          <StatCard
            label="Weight"
            value={
              data.latestWeight != null
                ? `${data.latestWeight}kg → ${profile.targetWeight || "—"}kg`
                : "Not logged"
            }
          />
        </div>

        <CalorieChart dates={data.dates} days={data.days} defaultTarget={target} />
        <WeightChart series={data.weightSeries} />
        <WorkoutHeatmap dates={data.dates} days={data.days} />
        <SymptomFrequency items={data.symptomCounts} />

        <div className="bg-surface border border-border rounded-card shadow-card p-4">
          <span className="label">Medicine Usage</span>
          {data.medicineCounts.length === 0 ? (
            <p className="text-textDim text-sm mt-3">No medicines logged</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {data.medicineCounts.map((m) => (
                <div
                  key={m.name}
                  className="bg-innerBg border border-borderLight rounded-input px-3 py-2 flex items-center justify-between"
                >
                  <span className="text-purple text-sm">{m.name}</span>
                  <span className="text-textDim text-xs">{m.count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-card shadow-card p-4">
          <span className="label">Mood Distribution</span>
          {data.moodCounts.length === 0 ? (
            <p className="text-textDim text-sm mt-3">No moods logged</p>
          ) : (
            <div className="flex flex-wrap gap-2 mt-3">
              {data.moodCounts.map((m) => (
                <span
                  key={m.name}
                  className="text-xs border border-borderLight rounded-btn px-3 py-1.5 text-text"
                >
                  {m.name} · {m.count}
                </span>
              ))}
            </div>
          )}
        </div>

        <AIHealthReview aggregatedData={data} period={period} profile={profile} />
      </div>
    </div>
  );
}
