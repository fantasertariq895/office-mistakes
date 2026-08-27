import { route } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

/**
 * Just enough for the sidebar badge — the newest run's week and how far
 * through it is. Deliberately not the full workspace, matching
 * app/api/traffic-billing/summary/route.ts's reasoning.
 *
 * Counts N/A as settled, matching lib/trader-media/progress.ts.
 */
export const GET = route(async () => {
  const run = await prisma.traderMediaRun.findFirst({ orderBy: { week: "desc" } });
  if (!run) return { run: null, total: 0, settled: 0, percent: 0 };

  const [total, settled] = await Promise.all([
    prisma.traderMediaStep.count(),
    prisma.traderMediaStepState.count({
      where: { runId: run.id, state: { in: ["done", "na"] } },
    }),
  ]);

  return {
    run: { id: run.id, week: run.week, status: run.status },
    total,
    settled,
    percent: total === 0 ? 0 : Math.round((settled / total) * 100),
  };
});
