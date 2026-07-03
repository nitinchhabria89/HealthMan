import Card from "@/components/ui/Card";
import type { Symptom, Medicine } from "@/lib/types";

export default function TodaySummary({
  symptoms,
  medicines,
}: {
  symptoms: Symptom[];
  medicines: Medicine[];
}) {
  return (
    <Card>
      <span className="label">Today&apos;s Health</span>
      <div className="mt-3 space-y-2">
        {symptoms.length === 0 && medicines.length === 0 && (
          <p className="text-textDim text-sm">Nothing logged yet</p>
        )}
        {symptoms.map((s) => (
          <div key={s.id} className="flex items-center justify-between text-sm">
            <span className="text-amber">{s.text}</span>
            <span className="text-textDim text-xs">{s.time}</span>
          </div>
        ))}
        {medicines.map((m) => (
          <div key={m.id} className="flex items-center justify-between text-sm">
            <span className="text-purple">
              {m.name} · {m.dose}
            </span>
            <span className="text-textDim text-xs">{m.time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
