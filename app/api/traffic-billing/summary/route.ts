import { route } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

/**
 * Just enough for the sidebar badge — the newest run's month and how far
 * through it is. Deliberately not the full workspace: the sidebar renders on
 * every page, and shipping ~250 steps to it to display "62%" would be absurd.
 *
 * Counts N/A as settled, matching lib/traffic-billing/progress.ts.
 */
export const GET = route(async () => {
  const run = await prisma.trafficBillingRun.findFirst({ orderBy: { month: "desc" } });
  if (!run) return { run: null, total: 0, settled: 0, percent: 0 };

  const [total, settled] = await Promise.all([
    prisma.trafficBillingStep.count(),
    prisma.trafficBillingStepState.count({
      where: { runId: run.id, state: { in: ["done", "na"] } },
    }),
  ]);

  return {
    run: { id: run.id, month: run.month, status: run.status },
    total,
    settled,
    percent: total === 0 ? 0 : Math.round((settled / total) * 100),
  };
});
