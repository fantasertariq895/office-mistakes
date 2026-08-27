import { prisma } from "@/lib/prisma";
import { readJson, route } from "@/lib/api-helpers";
import { requireWeek, serialiseRun } from "@/lib/trader-media/server";

/**
 * Start (or re-open) the run for a Monday-anchored week.
 *
 * Idempotent on `week`: double-clicking "Start this week", or two tabs doing
 * it at once, returns the existing run rather than erroring or forking the
 * week's progress in two.
 *
 * The week comes from the client because it's the client's calendar that
 * defines "this week" — see the note at the top of lib/trader-media/server.
 */
export const POST = route(async (req) => {
  const body = await readJson(req);
  const week = requireWeek(body.week);

  const existing = await prisma.traderMediaRun.findUnique({ where: { week } });
  if (existing) return { run: serialiseRun(existing), created: false };

  const run = await prisma.traderMediaRun.create({ data: { week } });
  return { run: serialiseRun(run), created: true };
});
