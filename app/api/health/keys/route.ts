import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { listDayDates } from "@/lib/kv";

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const dates = await listDayDates(session.dataOwnerEmail);
  return NextResponse.json({ dates });
}
