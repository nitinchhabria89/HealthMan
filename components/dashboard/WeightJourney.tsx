"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import type { Profile } from "@/lib/types";

export default function WeightJourney({
  profile,
  currentWeight,
  onWeightChange,
  readonly,
}: {
  profile: Profile;
  currentWeight: number;
  onWeightChange: (w: number) => void;
  readonly?: boolean;
}) {
  const startWeight = profile.currentWeight || currentWeight || 0;
  const targetWeight = profile.targetWeight || 0;
  const effective = currentWeight || startWeight;

  const totalDelta = Math.abs(startWeight - targetWeight);
  const doneDelta = Math.abs(startWeight - effective);
  const pct = totalDelta > 0 ? Math.min(100, Math.round((doneDelta / totalDelta) * 100)) : 0;

  const remaining = Math.abs(effective - targetWeight);
  const weeksLeft = remaining > 0.1 ? Math.ceil(remaining / 0.5) : 0;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <span className="label">Weight Journey</span>
        <Link href="/weight" className="text-xs text-blue">
          History →
        </Link>
      </div>
      <p className="text-xs text-textDim -mt-2 mb-3">
        {weeksLeft > 0 ? `~${weeksLeft}w to goal` : "Goal reached"}
      </p>
      <div className="flex items-end gap-2 mb-3">
        <input
          type="number"
          disabled={readonly}
          value={currentWeight || ""}
          onChange={(e) => onWeightChange(Number(e.target.value))}
          placeholder="—"
          className="w-20 bg-innerBg border border-borderLight rounded-input px-2 py-1.5 text-text text-lg font-semibold outline-none focus:border-blue disabled:opacity-50"
        />
        <span className="text-textMuted text-sm mb-1.5">kg → {targetWeight || "—"}kg</span>
      </div>
      <div className="h-2 bg-innerBg rounded-full overflow-hidden">
        <div
          className="h-full bg-green transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </Card>
  );
}
