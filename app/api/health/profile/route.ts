import { NextRequest, NextResponse } from "next/server";
import { requireSession, requireWriteAccess } from "@/lib/api-auth";
import { getProfile, setProfile } from "@/lib/kv";
import type { Profile } from "@/lib/types";

export async function GET() {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const profile = await getProfile(session.dataOwnerEmail);
  return NextResponse.json(profile);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;
  const writeErr = requireWriteAccess(session);
  if (writeErr) return writeErr;

  const body = (await req.json()) as Profile;
  if (!body?.name) {
    return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
  }

  await setProfile(session.dataOwnerEmail, body);
  return NextResponse.json({ ok: true });
}
