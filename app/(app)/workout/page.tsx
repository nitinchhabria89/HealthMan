"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/ui/Header";
import DaySelector from "@/components/ui/DaySelector";
import WorkoutLogger from "@/components/workout/WorkoutLogger";
import WeekView from "@/components/workout/WeekView";
import { useDay } from "@/hooks/useDay";
import { todayStr } from "@/lib/utils";
import type { Workout } from "@/lib/types";

export default function WorkoutPage() {
  const [date, setDate] = useState(todayStr());
  const { day, loading, error, update } = useDay(date);
  const { data: session } = useSession();
  const readonly = session?.user?.role === "readonly";

  function updateWorkout(patch: Partial<Workout>) {
    update((prev) => ({ workout: { ...prev.workout, ...patch } }));
  }

  if (loading) return <p className="text-textDim text-sm pt-6">Loading...</p>;

  return (
    <div>
      <Header title="Workout" error={error} />

      <div className="space-y-4">
        <DaySelector date={date} onChange={setDate} />

        <WorkoutLogger workout={day.workout} onChange={updateWorkout} readonly={readonly} />
        <WeekView />
      </div>
    </div>
  );
}
