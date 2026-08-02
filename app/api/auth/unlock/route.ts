import { NextRequest, NextResponse } from "next/server";
import { UNLOCK_COOKIE, issueSession, verifyPin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const pin = typeof body?.pin === "string" ? body.pin : "";

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings?.pinHash) {
    return NextResponse.json({ ok: true, unlocked: true });
  }

  if (!verifyPin(pin, settings.pinHash)) {
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, unlocked: true });
  res.cookies.set(UNLOCK_COOKIE, issueSession(settings.sessionVersion), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return res;
}
