import { createClient } from "@vercel/kv";
import { DayLog, MealPreset, Profile, emptyDayLog } from "./types";

// Default Upstash retry (5 attempts, exponential backoff) means a single
// unreachable-KV failure can take 15-20s+ before surfacing. Cap it so
// failures fail fast instead of hanging every page load.
const kv = createClient({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
  retry: { retries: 1, backoff: () => 200 },
});

function dayKey(email: string, date: string) {
  return `${email}:health:day:${date}`;
}

function profileKey(email: string) {
  return `${email}:health:profile`;
}

function mealPresetsKey(email: string) {
  return `${email}:health:mealPresets`;
}

export async function getDay(email: string, date: string): Promise<DayLog> {
  const data = await kv.get<DayLog>(dayKey(email, date));
  return data ?? emptyDayLog(date);
}

export async function setDay(email: string, date: string, log: DayLog): Promise<void> {
  await kv.set(dayKey(email, date), log);
}

export async function getProfile(email: string): Promise<Profile | null> {
  return kv.get<Profile>(profileKey(email));
}

export async function setProfile(email: string, profile: Profile): Promise<void> {
  await kv.set(profileKey(email), profile);
}

export async function listDayDates(email: string): Promise<string[]> {
  const keys = await kv.keys(`${email}:health:day:*`);
  return keys
    .map((k) => k.split(":health:day:")[1])
    .filter(Boolean)
    .sort();
}

export async function getDays(email: string, dates: string[]): Promise<DayLog[]> {
  return Promise.all(dates.map((d) => getDay(email, d)));
}

export async function getMealPresets(email: string): Promise<MealPreset[]> {
  const data = await kv.get<MealPreset[]>(mealPresetsKey(email));
  return data ?? [];
}

export async function setMealPresets(email: string, presets: MealPreset[]): Promise<void> {
  await kv.set(mealPresetsKey(email), presets);
}
