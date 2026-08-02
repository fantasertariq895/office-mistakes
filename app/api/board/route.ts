import { prisma } from "@/lib/prisma";
import { route } from "@/lib/api-helpers";
import { ensureMonthlyChecklistReset } from "@/lib/monthly-reset";

/**
 * Everything the single-canvas Home needs, in one request.
 *
 * Home renders all six commissions at once, so fetching per-section would mean
 * ~25 round trips on every load and on every tick. One query set instead.
 *
 * This is also the natural place to check the monthly checklist reset: it's
 * the first thing every page load calls, so a new month gets caught the next
 * time the app is opened, with zero dependency on any scheduler firing. The
 * Vercel Cron job (see vercel.json) is a backstop for gaps between visits,
 * not the primary mechanism.
 */
export const GET = route(async () => {
  const resetResult = await ensureMonthlyChecklistReset();

  const [universal, commissions, openTasks] = await Promise.all([
    prisma.checklistItem.findMany({
      where: { commissionId: null },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    }),
    prisma.commission.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        checklistItems: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
        contacts: { orderBy: { id: "asc" } },
        approvalRequirements: { orderBy: { id: "asc" } },
        mistakes: { orderBy: { dateLogged: "desc" }, take: 6 },
      },
    }),
    prisma.task.groupBy({
      by: ["commissionId"],
      where: { status: { not: "completed" } },
      _count: { _all: true },
    }),
  ]);

  const openByCommission = new Map<number, number>();
  for (const row of openTasks) {
    if (row.commissionId !== null) {
      openByCommission.set(row.commissionId, row._count._all);
    }
  }

  return {
    universal,
    commissions: commissions.map((c) => ({
      ...c,
      openTaskCount: openByCommission.get(c.id) ?? 0,
    })),
    monthlyReset: resetResult.ranReset
      ? { itemsReset: resetResult.itemsReset, month: resetResult.month }
      : null,
  };
});
