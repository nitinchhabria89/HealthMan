"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/ui/Header";
import Card from "@/components/ui/Card";
import CalorieRing from "@/components/ui/CalorieRing";
import WeightJourney from "@/components/dashboard/WeightJourney";
import WaterTracker from "@/components/dashboard/WaterTracker";
import TodaySummary from "@/components/dashboard/TodaySummary";
import ProfileCard from "@/components/dashboard/ProfileCard";
import { useDay } from "@/hooks/useDay";
import { useProfile } from "@/hooks/useProfile";
import { todayStr } from "@/lib/utils";

export default function DashboardPage() {
  const date = useMemo(() => todayStr(), []);
  const { day, loading: dayLoading, update } = useDay(date);
  const { profile, loading: profileLoading, update: updateProfile } = useProfile();
  const { data: session } = useSession();
  const readonly = session?.user?.role === "readonly";

  const consumed = day.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const target = day.calorieTarget ?? profile.calorieTarget ?? 2000;

  if (dayLoading || profileLoading) {
    return (
      <div className="pt-6">
        <p className="text-textDim text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <Header title="Today" />

      <div className="space-y-4">
        <Card>
          <CalorieRing consumed={consumed} target={target} />
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="label">Target</span>
            <input
              type="number"
              disabled={readonly}
              value={target}
              onChange={(e) => update({ calorieTarget: Number(e.target.value) })}
              className="w-20 bg-innerBg border border-borderLight rounded-input px-2 py-1 text-text text-sm text-center outline-none focus:border-blue disabled:opacity-50"
            />
            <span className="text-textDim text-xs">kcal</span>
          </div>
        </Card>

        <WeightJourney
          profile={profile}
          currentWeight={day.weight ?? profile.currentWeight}
          onWeightChange={(w) => update({ weight: w })}
          readonly={readonly}
        />

        <WaterTracker water={day.water} onChange={(n) => update({ water: n })} readonly={readonly} />

        <TodaySummary symptoms={day.symptoms} medicines={day.medicines} />

        <ProfileCard profile={profile} onUpdate={updateProfile} readonly={readonly} />
      </div>
    </div>
  );
}
