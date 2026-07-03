"use client";

import { useCallback, useEffect, useState } from "react";
import type { DayLog } from "@/lib/types";
import { emptyDayLog } from "@/lib/types";

export function useDay(date: string) {
  const [day, setDayState] = useState<DayLog>(emptyDayLog(date));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/health/day?date=${date}`)
      .then((r) => r.json())
      .then((data: DayLog) => {
        if (!cancelled) setDayState(data);
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
    });
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

  return { day, loading, update };
}
