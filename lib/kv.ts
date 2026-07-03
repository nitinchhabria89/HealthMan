import { kv } from "@vercel/kv";
import { DayLog, Profile, emptyDayLog } from "./types";

function dayKey(email: string, date: string) {
  return `${email}:health:day:${date}`;
}

function profileKey(email: string) {
  return `${email}:health:profile`;
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
