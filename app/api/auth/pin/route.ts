import { NextRequest, NextResponse } from "next/server";
import {
  UNLOCK_COOKIE,
  hashPin,
  isUnlocked,
  issueSession,
  revokeAllSessions,
  verifyPin,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function settings() {
  return prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}

/** Set or change the PIN. Requires the current PIN if one is already set. */
export async function POST(req: NextRequest) {
  if (!(await isUnlocked())) {
    return NextResponse.json({ error: "locked" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const pin = typeof body?.pin === "string" ? body.pin.trim() : "";
  const currentPin = typeof body?.currentPin === "string" ? body.currentPin : "";

  if (!/^\d{4,8}$/.test(pin)) {
    return NextResponse.json({ error: "PIN must be 4–8 digits" }, { status: 400 });
  }

  const current = await settings();
  if (current.pinHash && !verifyPin(currentPin, current.pinHash)) {
    return NextResponse.json({ error: "Current PIN is incorrect" }, { status: 400 });
  }

  await prisma.settings.update({ where: { id: 1 }, data: { pinHash: hashPin(pin) } });

  // Invalidate any other unlocked session, then re-issue one for this browser.
  const newVersion = await revokeAllSessions();
  const res = NextResponse.json({ ok: true, pinSet: true });
  res.cookies.set(UNLOCK_COOKIE, issueSession(newVersion), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return res;
}

/** Turn the PIN lock off. Blocked entirely on a forced-PIN deployment. */
export async function DELETE(req: NextRequest) {
  if (process.env.FORCE_PIN === "true") {
    return NextResponse.json(
      { error: "The PIN lock can't be turned off on this deployment." },
      { status: 403 }
    );
  }

  if (!(await isUnlocked())) {
    return NextResponse.json({ error: "locked" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const currentPin = typeof body?.currentPin === "string" ? body.currentPin : "";

  const current = await settings();
  if (!current.pinHash) return NextResponse.json({ ok: true, pinSet: false });

  if (!verifyPin(currentPin, current.pinHash)) {
    return NextResponse.json({ error: "Current PIN is incorrect" }, { status: 400 });
  }

  await prisma.settings.update({ where: { id: 1 }, data: { pinHash: null } });
  await revokeAllSessions();

  const res = NextResponse.json({ ok: true, pinSet: false });
  res.cookies.delete(UNLOCK_COOKIE);
  return res;
}
