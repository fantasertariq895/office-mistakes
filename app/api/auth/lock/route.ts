import { NextResponse } from "next/server";
import { UNLOCK_COOKIE } from "@/lib/auth";

/**
 * Sessions are stateless signed tokens (see lib/auth.ts) — there's nothing on
 * the server to revoke for a single browser. Deleting the cookie is enough:
 * without it the browser stops sending a token, and the token itself expires
 * on its own after 30 days if somehow replayed.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(UNLOCK_COOKIE);
  return res;
}
