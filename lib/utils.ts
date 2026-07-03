export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isValidDateStr(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function formatDisplayDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function currentWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay(); // 0 Sun .. 6 Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export function lastNDates(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    dates.push(daysAgoStr(i));
  }
  return dates;
}

const MET_BY_TYPE: Record<string, number> = {
  walking: 3.5,
  running: 9.8,
  cycling: 7.5,
  swimming: 8,
  yoga: 2.5,
  strength: 5,
  hiit: 8,
  cardio: 7,
  pilates: 3,
  sports: 6,
  dance: 5,
  other: 4,
};

export function estimateCaloriesBurned(type: string, durationMinutes: number, weightKg = 75): number {
  const met = MET_BY_TYPE[type.toLowerCase()] ?? MET_BY_TYPE.other;
  return Math.round(met * 3.5 * weightKg / 200 * durationMinutes);
}
