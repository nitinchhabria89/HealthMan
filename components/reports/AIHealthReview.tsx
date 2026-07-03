"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";
import type { ReportAggregate } from "@/hooks/useReportData";

export default function AIHealthReview({
  aggregatedData,
  period,
  profile,
}: {
  aggregatedData: ReportAggregate;
  period: number;
  profile: Profile;
}) {
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aggregatedData, period, profile }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setReview(data.review);
    } catch {
      setError("Couldn't generate review. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-card p-4">
      <span className="label">AI Health Review</span>

      {!review && (
        <button
          onClick={generate}
          disabled={loading}
          className="mt-3 w-full bg-blue text-bg rounded-btn py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Generate AI Health Review"}
        </button>
      )}

      {error && (
        <div className="mt-3">
          <p className="text-red text-sm">{error}</p>
          <button onClick={generate} className="text-blue text-xs mt-1">
            Retry
          </button>
        </div>
      )}

      {review && (
        <div className="mt-3 text-text text-sm whitespace-pre-wrap leading-relaxed">{review}</div>
      )}
    </div>
  );
}
