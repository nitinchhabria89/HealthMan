"use client";

import { useState } from "react";

export default function AIAdvicePanel({
  symptom,
  userContext,
  buttonLabel = "Get Remedy",
}: {
  symptom: string;
  userContext: string;
  buttonLabel?: string;
}) {
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchAdvice() {
    if (!symptom) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/symptom-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptom, userContext }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setAdvice(data.advice);
    } catch {
      setError("Couldn't get advice. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!advice && (
        <button
          onClick={fetchAdvice}
          disabled={loading || !symptom}
          className="text-blue text-xs border border-blue rounded-btn px-3 py-1.5 disabled:opacity-50"
        >
          {loading ? "Thinking..." : buttonLabel}
        </button>
      )}
      {error && (
        <div className="mt-2">
          <p className="text-red text-xs">{error}</p>
          <button onClick={fetchAdvice} className="text-blue text-xs mt-1">
            Retry
          </button>
        </div>
      )}
      {advice && (
        <p className="text-text text-sm mt-2 whitespace-pre-wrap bg-innerBg border border-borderLight rounded-input p-3">
          {advice}
        </p>
      )}
    </div>
  );
}
