"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/ui/Header";
import MoodPicker from "@/components/health/MoodPicker";
import SymptomLogger from "@/components/health/SymptomLogger";
import MedicineLogger from "@/components/health/MedicineLogger";
import { useDay } from "@/hooks/useDay";
import { useProfile } from "@/hooks/useProfile";
import { todayStr } from "@/lib/utils";
import type { Symptom, Medicine } from "@/lib/types";

export default function HealthPage() {
  const date = useMemo(() => todayStr(), []);
  const { day, loading, update } = useDay(date);
  const { profile } = useProfile();
  const { data: session } = useSession();
  const readonly = session?.user?.role === "readonly";

  const userContext = `Age ${profile.age || "?"}, weight ${profile.currentWeight || "?"}kg, mood today: ${day.mood || "not set"}`;

  function addSymptom(text: string) {
    const symptom: Symptom = {
      id: crypto.randomUUID(),
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    update((prev) => ({ symptoms: [...prev.symptoms, symptom] }));
  }

  function addMedicine(name: string, dose: string) {
    const medicine: Medicine = {
      id: crypto.randomUUID(),
      name,
      dose,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    update((prev) => ({ medicines: [...prev.medicines, medicine] }));
  }

  function deleteMedicine(id: string) {
    update((prev) => ({ medicines: prev.medicines.filter((m) => m.id !== id) }));
  }

  if (loading) return <p className="text-textDim text-sm pt-6">Loading...</p>;

  return (
    <div>
      <Header title="Health" />

      <div className="space-y-4">
        <MoodPicker mood={day.mood} onChange={(m) => update({ mood: m })} readonly={readonly} />

        <SymptomLogger
          symptoms={day.symptoms}
          userContext={userContext}
          onAdd={addSymptom}
          readonly={readonly}
        />

        <MedicineLogger
          medicines={day.medicines}
          onAdd={addMedicine}
          onDelete={deleteMedicine}
          readonly={readonly}
        />
      </div>
    </div>
  );
}
