import { NextRequest, NextResponse } from "next/server";
import { ensureThisMonthRun } from "@/lib/traffic-billing/server";

/**
 * Backstop for the automatic monthly Traffic Billing run. The primary
 * trigger is the page itself auto-starting the current month on load (see
 * app/traffic-billing/page.tsx) — this only matters if the app sits
 * unopened on the 1st itself. Scheduled 1st-of-the-month-only by
 * vercel.json.
 *
 * Same auth pattern as app/api/cron/monthly-reset/route.ts and
 * app/api/cron/trader-media-weekly/route.ts — deliberately not wrapped in
 * the shared `route()` helper, since that enforces the PIN lock, which
 * doesn't apply to a server-to-server cron call. Vercel signs these
 * requests with a bearer token matching CRON_SECRET; anything else is
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

  const result = await ensureThisMonthRun();
  return NextResponse.json(result);
}
