"use client";

import { useCallback, useEffect, useState } from "react";
import type { Profile } from "@/lib/types";

const DEFAULT_PROFILE: Profile = {
  name: "",
  currentWeight: 0,
  targetWeight: 0,
  height: 0,
  age: 0,
  calorieTarget: 2000,
  gender: "male",
};

export function useProfile() {
  const [profile, setProfileState] = useState<Profile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health/profile")
      .then((r) => r.json())
      .then((data: Profile | null) => {
        if (!cancelled && data) setProfileState(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: Profile) => {
    fetch("/api/health/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
  }, []);

  const update = useCallback(
    (patch: Partial<Profile>) => {
      setProfileState((prev) => {
        const next = { ...prev, ...patch };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return { profile, loading, update };
}
