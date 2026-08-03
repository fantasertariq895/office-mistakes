import { prisma } from "@/lib/prisma";
import { readJson, route } from "@/lib/api-helpers";
import { requireMonth, serialiseRun } from "@/lib/traffic-billing/server";

/**
 * Start (or re-open) the run for a billing month.
 *
 * Idempotent on `month`: double-clicking "Start new month", or two tabs doing
 * it at once, returns the existing run rather than erroring or forking the
 * month's progress in two.
 *
 * The month comes from the client because it's the client's calendar that
 * defines "this month" — see the note at the top of lib/traffic-billing/server.
 */
export const POST = route(async (req) => {
  const body = await readJson(req);
  const month = requireMonth(body.month);

  const existing = await prisma.trafficBillingRun.findUnique({ where: { month } });
  if (existing) return { run: serialiseRun(existing), created: false };

  const run = await prisma.trafficBillingRun.create({ data: { month } });
  return { run: serialiseRun(run), created: true };
});
