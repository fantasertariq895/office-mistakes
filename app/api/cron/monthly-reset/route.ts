import { NextRequest, NextResponse } from "next/server";
import { ensureMonthlyChecklistReset } from "@/lib/monthly-reset";

/**
 * Backstop for the automatic monthly checklist reset. The primary trigger is
 * every /api/board load (see that route) — this only matters if the app
 * happens to sit unopened across a month boundary for a while. Scheduled
 * daily by vercel.json; harmless to call more often since it's a no-op except
 * on the day the month actually changes.
 *
 * Deliberately NOT wrapped in the shared `route()` helper — that enforces the
 * PIN lock, which doesn't apply to a server-to-server cron call. Vercel signs
 * these requests with a bearer token matching CRON_SECRET; anything else is
 * rejected.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await ensureMonthlyChecklistReset();
  return NextResponse.json(result);
}
