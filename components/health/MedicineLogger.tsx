"use client";

import { useState } from "react";
import type { Medicine } from "@/lib/types";

export default function MedicineLogger({
  medicines,
  onAdd,
  onDelete,
  readonly,
}: {
  medicines: Medicine[];
  onAdd: (name: string, dose: string) => void;
  onDelete: (id: string) => void;
  readonly: boolean;
}) {
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");

  function submit() {
    if (!name) return;
    onAdd(name, dose);
    setName("");
    setDose("");
  }

  return (
    <div className="bg-surface border border-border rounded-card shadow-card p-4 space-y-3">
      <span className="label">Medicines</span>

      {!readonly && (
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Medicine name"
            className="flex-1 min-w-0 bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue"
          />
          <input
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            placeholder="Dose"
            className="w-16 shrink-0 bg-innerBg border border-borderLight rounded-input px-2 py-2 text-text text-sm outline-none focus:border-blue"
          />
          <button
            onClick={submit}
            disabled={!name}
            className="shrink-0 bg-purple text-bg rounded-btn px-3 text-sm font-medium disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}

      <div className="space-y-2">
        {medicines.length === 0 && (
          <p className="text-textDim text-sm">No medicines logged</p>
        )}
        {medicines.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between bg-innerBg border border-borderLight rounded-input px-3 py-2"
          >
            <div>
              <p className="text-purple text-sm">
                {m.name}
                {m.dose ? ` · ${m.dose}` : ""}
              </p>
              <p className="text-textDim text-xs">{m.time}</p>
            </div>
            {!readonly && (
              <button onClick={() => onDelete(m.id)} className="text-red text-xs">
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
