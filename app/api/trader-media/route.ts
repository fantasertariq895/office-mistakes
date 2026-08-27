import { route } from "@/lib/api-helpers";
import { loadWorkspace } from "@/lib/trader-media/server";

/**
 * The whole Trader Media workspace for one run.
 *
 * `?week=2026-08-24` picks a specific run (used by the week switcher and to
 * read back a completed week); omitting it returns the most recent run.
 */
export const GET = route(async (req) => {
  const week = req.nextUrl.searchParams.get("week");
  return loadWorkspace(week);
});
