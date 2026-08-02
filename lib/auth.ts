import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const UNLOCK_COOKIE = "ops_unlock";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Sessions are stateless signed tokens, not a server-side store. A serverless
 * deployment has no single process memory to keep a Set of live tokens in —
 * different requests can land on different, freshly-cold instances — so the
 * token itself carries everything needed to verify it: an expiry and the
 * `sessionVersion` it was issued under. "Sign out everywhere" (PIN
 * changed/removed) is just bumping that version in Settings; every
 * previously-issued token stops verifying instantly, with no store to clear.
 */
function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.VERCEL) {
    // A missing secret on a real deployment would silently accept forged
    // cookies signed with a guessable fallback — refuse to boot instead.
    throw new Error(
      "SESSION_SECRET is not set. Add it in the Vercel project's Environment Variables."
    );
  }
  return "local-dev-only-insecure-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("hex");
}

export function hashPin(pin: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(pin, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPin(pin: string, stored: string | null): boolean {
  if (!stored) return false;
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(pin, Buffer.from(saltHex, "hex"), expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function issueSession(sessionVersion: number): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${sessionVersion}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

function verifySession(token: string, currentVersion: number): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [versionStr, expiresAtStr, signature] = parts;
  const payload = `${versionStr}.${expiresAtStr}`;
  const expected = Buffer.from(sign(payload), "hex");
  const actual = Buffer.from(signature, "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return false;
  }
  const version = Number(versionStr);
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(version) || !Number.isFinite(expiresAt)) return false;
  if (Date.now() > expiresAt) return false;
  return version === currentVersion;
}

/**
 * On a forced-PIN deployment with no PIN set yet, bootstrap one from
 * INITIAL_PIN so the very first visit is already locked — there is no
 * unlocked-Settings step to click "enable PIN" from once this is public.
 */
async function ensureBootstrapPin(): Promise<void> {
  if (process.env.FORCE_PIN !== "true") return;
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  if (settings.pinHash) return;
  const initial = process.env.INITIAL_PIN;
  if (!initial || !/^\d{4,8}$/.test(initial)) {
    throw new Error(
      "FORCE_PIN is set but no PIN exists yet and INITIAL_PIN is missing or invalid (must be 4–8 digits). Set INITIAL_PIN in the deployment's environment variables."
    );
  }
  await prisma.settings.update({
    where: { id: 1 },
    data: { pinHash: hashPin(initial) },
  });
}

export type LockState = { pinSet: boolean; unlocked: boolean; forcePin: boolean };

export async function getLockState(): Promise<LockState> {
  await ensureBootstrapPin();
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const forcePin = process.env.FORCE_PIN === "true";
  const pinSet = Boolean(settings?.pinHash);
  if (!pinSet) return { pinSet: false, unlocked: !forcePin, forcePin };

  const store = await cookies();
  const token = store.get(UNLOCK_COOKIE)?.value;
  const unlocked = Boolean(token && verifySession(token, settings!.sessionVersion));
  return { pinSet: true, unlocked, forcePin };
}

export async function isUnlocked(): Promise<boolean> {
  return (await getLockState()).unlocked;
}

/** Bumps sessionVersion — every previously-issued token stops verifying. */
export async function revokeAllSessions(): Promise<number> {
  const updated = await prisma.settings.update({
    where: { id: 1 },
    data: { sessionVersion: { increment: 1 } },
  });
  return updated.sessionVersion;
}

export async function currentSessionVersion(): Promise<number> {
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return settings.sessionVersion;
}
