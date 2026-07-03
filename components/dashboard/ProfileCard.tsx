"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import type { Profile } from "@/lib/types";

export default function ProfileCard({
  profile,
  onUpdate,
  readonly,
}: {
  profile: Profile;
  onUpdate: (patch: Partial<Profile>) => void;
  readonly: boolean;
}) {
  const [open, setOpen] = useState(!profile.name);

  if (readonly && !profile.name) return null;

  return (
    <Card>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between"
      >
        <span className="label">Profile</span>
        <span className="text-textDim text-xs">{open ? "Hide" : "Edit"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {!readonly ? (
            <>
              <input
                value={profile.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder="Name"
                className="w-full bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={profile.age || ""}
                  onChange={(e) => onUpdate({ age: Number(e.target.value) })}
                  placeholder="Age"
                  className="bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue"
                />
                <select
                  value={profile.gender}
                  onChange={(e) => onUpdate({ gender: e.target.value as Profile["gender"] })}
                  className="bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <input
                  type="number"
                  value={profile.height || ""}
                  onChange={(e) => onUpdate({ height: Number(e.target.value) })}
                  placeholder="Height (cm)"
                  className="bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue"
                />
                <input
                  type="number"
                  value={profile.currentWeight || ""}
                  onChange={(e) => onUpdate({ currentWeight: Number(e.target.value) })}
                  placeholder="Start weight (kg)"
                  className="bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue"
                />
                <input
                  type="number"
                  value={profile.targetWeight || ""}
                  onChange={(e) => onUpdate({ targetWeight: Number(e.target.value) })}
                  placeholder="Target weight (kg)"
                  className="bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue"
                />
                <input
                  type="number"
                  value={profile.calorieTarget || ""}
                  onChange={(e) => onUpdate({ calorieTarget: Number(e.target.value) })}
                  placeholder="Calorie target"
                  className="bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue"
                />
              </div>
            </>
          ) : (
            <p className="text-textDim text-sm">
              {profile.name}, {profile.age}yo · {profile.height}cm · {profile.currentWeight}kg → {profile.targetWeight}kg
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
