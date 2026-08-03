import { route } from "@/lib/api-helpers";
import { loadWorkspace } from "@/lib/traffic-billing/server";

/**
 * The whole Traffic Billing workspace for one run.
 *
 * `?month=2026-08` picks a specific run (used by the month switcher and to
 * read back a completed month); omitting it returns the most recent run.
 */
export const GET = route(async (req) => {
  const month = req.nextUrl.searchParams.get("month");
  return loadWorkspace(month);
});
