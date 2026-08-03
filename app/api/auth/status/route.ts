import { NextResponse } from "next/server";
import { getLockState } from "@/lib/auth";

// Deliberately not wrapped in the shared `route()` helper — it works even
// when locked (that's the point of it), so it can't require isUnlocked().
// It still needs its own error handling though: this is the very first call
// the app makes on load, so a raw unhandled crash here (bad DATABASE_URL,
// missing SESSION_SECRET, schema not pushed yet) previously surfaced as
// unparseable HTML that the client swallowed into a generic message. A real
// JSON error here is what makes the "can't reach the dashboard" screen
// actually tell you what's wrong.
export async function GET() {
  try {
    return NextResponse.json(await getLockState());
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error("[auth/status]", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
