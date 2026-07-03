import { NextRequest, NextResponse } from "next/server";
import { requireSession, requireWriteAccess } from "@/lib/api-auth";
import { getDay, setDay } from "@/lib/kv";
import { isValidDateStr, todayStr } from "@/lib/utils";
import type { DayLog } from "@/lib/types";

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const date = req.nextUrl.searchParams.get("date") || todayStr();
  if (!isValidDateStr(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const log = await getDay(session.dataOwnerEmail, date);
  return NextResponse.json(log);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;
  const writeErr = requireWriteAccess(session);
  if (writeErr) return writeErr;

  const body = (await req.json()) as DayLog;
  if (!body?.date || !isValidDateStr(body.date)) {
    return NextResponse.json({ error: "Invalid day log" }, { status: 400 });
  }

  await setDay(session.dataOwnerEmail, body.date, body);
  return NextResponse.json({ ok: true });
}
