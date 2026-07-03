"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/ui/Header";
import WorkoutLogger from "@/components/workout/WorkoutLogger";
import WeekView from "@/components/workout/WeekView";
import { useDay } from "@/hooks/useDay";
import { todayStr } from "@/lib/utils";
import type { Workout } from "@/lib/types";

export default function WorkoutPage() {
  const date = useMemo(() => todayStr(), []);
  const { day, loading, update } = useDay(date);
  const { data: session } = useSession();
  const readonly = session?.user?.role === "readonly";

  function updateWorkout(patch: Partial<Workout>) {
    update((prev) => ({ workout: { ...prev.workout, ...patch } }));
  }

  if (loading) return <p className="text-textDim text-sm pt-6">Loading...</p>;

  return (
    <div>
      <Header title="Workout" />

      <div className="space-y-4">
        <WorkoutLogger workout={day.workout} onChange={updateWorkout} readonly={readonly} />
        <WeekView />
      </div>
    </div>
  );
}
