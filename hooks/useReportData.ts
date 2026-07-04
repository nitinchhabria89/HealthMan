"use client";

import { useEffect, useState } from "react";
import type { DayLog } from "@/lib/types";
import { lastNDates } from "@/lib/utils";

export type CountItem = { name: string; count: number };

export type ReportAggregate = {
  dates: string[];
  days: DayLog[];
  totalDays: number;
  loggedDays: number;
  workoutDays: number;
  workoutConsistencyPct: number;
  workoutStreak: number;
  avgCalories: number;
  avgWater: number;
  latestWeight: number | null;
  symptomCounts: CountItem[];
  medicineCounts: CountItem[];
  moodCounts: CountItem[];
  weightSeries: { date: string; weight: number }[];
};

function tally(items: string[]): CountItem[] {
  const map = new Map<string, number>();
  for (const item of items) {
    if (!item) continue;
    map.set(item, (map.get(item) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function aggregate(dates: string[], days: DayLog[], loggedDates: Set<string>): ReportAggregate {
  const totalDays = dates.length;
  const loggedDays = dates.filter((d) => loggedDates.has(d)).length;

  const workoutDays = days.filter((d) => d.workout?.done).length;
  const workoutConsistencyPct = totalDays > 0 ? Math.round((workoutDays / totalDays) * 100) : 0;

  let workoutStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].workout?.done) workoutStreak++;
    else break;
  }

  const daysWithMeals = days.filter((d) => d.meals.length > 0);
  const avgCalories =
    daysWithMeals.length > 0
      ? Math.round(
          daysWithMeals.reduce((sum, d) => sum + d.meals.reduce((s, m) => s + m.calories, 0), 0) /
            daysWithMeals.length
        )
      : 0;

  const avgWater =
    totalDays > 0
      ? Math.round((days.reduce((sum, d) => sum + (d.water || 0), 0) / totalDays) * 10) / 10
      : 0;

  let latestWeight: number | null = null;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].weight != null) {
      latestWeight = days[i].weight;
      break;
    }
  }

  const weightSeries = dates
    .map((date, i) => ({ date, weight: days[i]?.weight }))
    .filter((p): p is { date: string; weight: number } => p.weight != null);

  const symptomCounts = tally(days.flatMap((d) => d.symptoms.map((s) => s.text)));
  const medicineCounts = tally(days.flatMap((d) => d.medicines.map((m) => m.name)));
  const moodCounts = tally(days.map((d) => d.mood).filter(Boolean));

  return {
    dates,
    days,
    totalDays,
    loggedDays,
    workoutDays,
    workoutConsistencyPct,
    workoutStreak,
    avgCalories,
    avgWater,
    latestWeight,
    symptomCounts,
    medicineCounts,
    moodCounts,
    weightSeries,
  };
}

async function fetchJsonOrThrow<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} failed with ${res.status}`);
  return res.json();
}

export function useReportData(period: number) {
  const [data, setData] = useState<ReportAggregate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    const dates = lastNDates(period);

    Promise.all([
      fetchJsonOrThrow<{ dates: string[] }>("/api/health/keys"),
      Promise.all(dates.map((d) => fetchJsonOrThrow<DayLog>(`/api/health/day?date=${d}`))),
    ])
      .then(([keysRes, days]) => {
        if (cancelled) return;
        const loggedDates = new Set(keysRes.dates || []);
        setData(aggregate(dates, days, loggedDates));
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load report data. Check your data connection.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  return { data, loading, error };
}
