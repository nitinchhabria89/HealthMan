"use client";

import { useCallback, useEffect, useState } from "react";
import type { DayLog } from "@/lib/types";
import { emptyDayLog } from "@/lib/types";

export function useDay(date: string) {
  const [day, setDayState] = useState<DayLog>(emptyDayLog(date));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`/api/health/day?date=${date}`)
      .then((r) => {
        if (!r.ok) throw new Error(`day fetch failed with ${r.status}`);
        return r.json();
      })
      .then((data: DayLog) => {
        if (!cancelled) setDayState(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load today's data — changes won't be saved.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  const persist = useCallback((next: DayLog) => {
    fetch("/api/health/day", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`day save failed with ${r.status}`);
        setError("");
      })
      .catch(() => setError("Couldn't save — changes may be lost on reload."));
  }, []);

  const update = useCallback(
    (patch: Partial<DayLog> | ((prev: DayLog) => Partial<DayLog>)) => {
      setDayState((prev) => {
        const resolved = typeof patch === "function" ? patch(prev) : patch;
        const next = { ...prev, ...resolved };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return { day, loading, error, update };
}
