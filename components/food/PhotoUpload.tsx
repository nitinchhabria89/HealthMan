"use client";

import { useRef, useState } from "react";
import type { MealType } from "@/lib/types";

type AnalysisResult = { analysis: string; estimatedCalories: number };
const TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack", "drink"];

export default function PhotoUpload({
  calorieTarget,
  onConfirm,
}: {
  calorieTarget: number;
  onConfirm: (name: string, calories: number, type: MealType) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("Food photo");
  const [calories, setCalories] = useState(0);
  const [type, setType] = useState<MealType>("snack");

  function reset() {
    setPreview(null);
    setResult(null);
    setError("");
  }

  async function handleFile(file: File) {
    setError("");
    setResult(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      const base64 = dataUrl.split(",")[1];

      try {
        const res = await fetch("/api/ai/analyze-food", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, mimeType: file.type, calorieTarget }),
        });
        if (!res.ok) throw new Error("Analysis failed");
        const data: AnalysisResult = await res.json();
        setResult(data);
        setCalories(data.estimatedCalories);
      } catch {
        setError("Couldn't analyze photo. Try again or add manually.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="bg-surface border border-border rounded-card p-4">
      <span className="label">Photo Analysis</span>

      {!preview && (
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-3 w-full border-2 border-dashed border-borderLight rounded-input py-8 text-center text-textDim text-sm"
        >
          📷 Tap to take or upload a food photo
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Food" className="mt-3 w-full rounded-input object-cover max-h-48" />
      )}

      {loading && <p className="text-textDim text-sm mt-3">Analyzing...</p>}

      {error && (
        <div className="mt-3">
          <p className="text-red text-sm">{error}</p>
          <button onClick={reset} className="mt-2 text-xs text-blue">
            Retry
          </button>
        </div>
      )}

      {result && (
        <div className="mt-3 space-y-3">
          <p className="text-text text-sm whitespace-pre-wrap">{result.analysis}</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-innerBg border border-borderLight rounded-input px-3 py-2 text-text text-sm outline-none focus:border-blue"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              className="flex-1 bg-innerBg border border-borderLight rounded-input px-2 py-1.5 text-text text-sm"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MealType)}
              className="flex-1 bg-innerBg border border-borderLight rounded-input px-2 py-1.5 text-text text-sm"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onConfirm(name, calories, type);
                reset();
                setName("Food photo");
              }}
              className="flex-1 bg-green text-bg rounded-btn py-2 text-sm font-medium"
            >
              Add to log
            </button>
            <button onClick={reset} className="px-4 border border-borderLight rounded-btn text-textMuted text-sm">
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
