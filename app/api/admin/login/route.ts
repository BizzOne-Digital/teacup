import { NextResponse } from "next/server";
import {
  setAdminSession,
  clearAdminSession,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (!(await verifyAdminCredentials(email ?? "", password ?? ""))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const ok = await setAdminSession();
  if (!ok) {
    return NextResponse.json(
      { error: "Admin credentials not configured on server" },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
