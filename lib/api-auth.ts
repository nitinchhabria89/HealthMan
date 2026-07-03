import { NextResponse } from "next/server";
import { auth, getDataOwnerEmail } from "./auth";
import type { Role } from "./types";

export type ApiSession = {
  email: string;
  name: string;
  role: Role;
  dataOwnerEmail: string;
};

export async function requireSession(): Promise<ApiSession | NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { email, name, role } = session.user;
  return { email, name, role, dataOwnerEmail: getDataOwnerEmail({ email, role }) };
}

export function requireWriteAccess(session: ApiSession): NextResponse | null {
  if (session.role === "readonly") {
    return NextResponse.json({ error: "Read-only account" }, { status: 403 });
  }
  return null;
}
