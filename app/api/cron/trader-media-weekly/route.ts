import { NextRequest, NextResponse } from "next/server";
import { ensureThisWeekRun } from "@/lib/trader-media/server";

/**
 * Backstop for the automatic weekly Trader Media run. The primary trigger is
 * the page itself auto-starting the current week on load (see
 * app/trader-media/page.tsx) — this only matters if the app sits unopened
 * on the Monday in question. Scheduled Monday-only by vercel.json.
 *
 * Same auth pattern as app/api/cron/monthly-reset/route.ts, deliberately not
 * wrapped in the shared `route()` helper — that enforces the PIN lock, which
 * doesn't apply to a server-to-server cron call. Vercel signs these requests
 * with a bearer token matching CRON_SECRET; anything else is rejected.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await ensureThisWeekRun();
  return NextResponse.json(result);
}
