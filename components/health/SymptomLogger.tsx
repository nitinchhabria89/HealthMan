"use client";

import { useState } from "react";
import type { Symptom } from "@/lib/types";
import AIAdvicePanel from "./AIAdvicePanel";

const PRESETS = [
  "Headache",
  "Acidity",
  "Burping",
  "Bloating",
  "Fatigue",
  "Nausea",
  "Dizziness",
  "Back pain",
  "Cold/cough",
  "Burning sensation",
  "Constipation",
  "Chest tightness",
];

export default function SymptomLogger({
  symptoms,
  userContext,
  onAdd,
  readonly,
}: {
  symptoms: Symptom[];
  userContext: string;
  onAdd: (text: string) => void;
  readonly: boolean;
}) {
  const [text, setText] = useState("");

  function log(t: string) {
    if (!t.trim()) return;
    onAdd(t.trim());
    setText("");
  }

  return (
    <div className="bg-surface border border-border rounded-card shadow-card p-4 space-y-4">
      <span className="label">Symptoms</span>

      {!readonly && (
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => log(p)}
              className="text-xs border border-borderLight rounded-btn px-3 py-1.5 text-textMuted"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {!readonly && (
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe a symptom..."
            className="flex-1 bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue"
          />
          <button
            onClick={() => log(text)}
            disabled={!text.trim()}
            className="bg-green text-bg rounded-btn px-4 text-sm font-medium disabled:opacity-50"
          >
            Log
          </button>
        </div>
      )}
      {text.trim() && <AIAdvicePanel symptom={text} userContext={userContext} />}

      <div className="space-y-3 pt-2">
        {symptoms.length === 0 && (
          <p className="text-textDim text-sm">No symptoms logged</p>
        )}
        {symptoms.map((s) => (
          <div key={s.id} className="border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-text text-sm">{s.text}</span>
              <span className="text-textDim text-xs">{s.time}</span>
            </div>
            <div className="mt-2">
              <AIAdvicePanel symptom={s.text} userContext={userContext} buttonLabel="Get advice" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
