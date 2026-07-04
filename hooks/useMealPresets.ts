"use client";

import { useCallback, useEffect, useState } from "react";
import type { MealPreset } from "@/lib/types";

export function useMealPresets() {
  const [presets, setPresetsState] = useState<MealPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health/meal-presets")
      .then((r) => {
        if (!r.ok) throw new Error(`presets fetch failed with ${r.status}`);
        return r.json();
      })
      .then((data: { presets: MealPreset[] }) => {
        if (!cancelled) setPresetsState(data.presets || []);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load meal presets.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: MealPreset[]) => {
    fetch("/api/health/meal-presets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presets: next }),
    }).catch(() => setError("Couldn't save preset."));
  }, []);

  const addPreset = useCallback(
    (preset: MealPreset) => {
      setPresetsState((prev) => {
        const next = [...prev, preset];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const removePreset = useCallback(
    (id: string) => {
      setPresetsState((prev) => {
        const next = prev.filter((p) => p.id !== id);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return { presets, loading, error, addPreset, removePreset };
}
