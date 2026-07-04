import { NextRequest, NextResponse } from "next/server";
import { requireSession, requireWriteAccess } from "@/lib/api-auth";
import { getMealPresets, setMealPresets } from "@/lib/kv";
import type { MealPreset } from "@/lib/types";

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const presets = await getMealPresets(session.dataOwnerEmail);
  return NextResponse.json({ presets });
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;
  const writeErr = requireWriteAccess(session);
  if (writeErr) return writeErr;

  const body = (await req.json()) as { presets: MealPreset[] };
  if (!Array.isArray(body?.presets)) {
    return NextResponse.json({ error: "Invalid presets" }, { status: 400 });
  }

  await setMealPresets(session.dataOwnerEmail, body.presets);
  return NextResponse.json({ ok: true });
}
