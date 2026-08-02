import { prisma } from "./prisma";

/** "2026-08" in the server's local timezone. */
function monthKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export type MonthlyResetResult = {
  ranReset: boolean;
  itemsReset: number;
  month: string;
};

/**
 * Every checklist — universal and per-commission — starts the month unticked.
 * Cheap to call on every request: it's a no-op unless the stored month
 * differs from the current one, which is true for exactly the first call
 * after a month rolls over.
 *
 * On a fresh install `checklistsResetMonth` is null. The first call only
 * records the current month and does NOT reset — otherwise shipping this
 * feature would immediately wipe whatever's already ticked, mid-month, on
 * data that predates the feature.
 */
export async function ensureMonthlyChecklistReset(
  now = new Date()
): Promise<MonthlyResetResult> {
  const current = monthKey(now);

  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  if (settings.checklistsResetMonth === current) {
    return { ranReset: false, itemsReset: 0, month: current };
  }

  if (settings.checklistsResetMonth === null) {
    await prisma.settings.update({
      where: { id: 1 },
      data: { checklistsResetMonth: current },
    });
    return { ranReset: false, itemsReset: 0, month: current };
  }

  const [{ count }] = await prisma.$transaction([
    prisma.checklistItem.updateMany({
      where: { checkedAt: { not: null } },
      data: { checkedAt: null },
    }),
    prisma.settings.update({
      where: { id: 1 },
      data: { checklistsResetMonth: current },
    }),
  ]);

  return { ranReset: true, itemsReset: count, month: current };
}
