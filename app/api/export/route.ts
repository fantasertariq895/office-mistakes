import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { route } from "@/lib/api-helpers";
import { toDateInputValue } from "@/lib/date";

/** Full JSON snapshot of the database (PRD §6 — manual data export). */
export const GET = route(async () => {
  const [
    commissions,
    checklistItems,
    mistakes,
    contacts,
    approvalRequirements,
    tasks,
    notificationRules,
    settings,
  ] = await Promise.all([
    prisma.commission.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.checklistItem.findMany({ orderBy: [{ commissionId: "asc" }, { sortOrder: "asc" }] }),
    prisma.mistakeLogEntry.findMany({ orderBy: { dateLogged: "desc" } }),
    prisma.contact.findMany({ orderBy: { commissionId: "asc" } }),
    prisma.approvalRequirement.findMany({ orderBy: { commissionId: "asc" } }),
    prisma.task.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.notificationRule.findMany(),
    prisma.settings.findUnique({ where: { id: 1 } }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    app: "office-ops-dashboard",
    version: 1,
    commissions,
    checklistItems,
    mistakes,
    contacts,
    approvalRequirements,
    tasks,
    notificationRules,
    settings: settings
      ? {
          ...settings,
          // The PIN hash stays out of exports.
          pinHash: undefined,
          pinSet: Boolean(settings.pinHash),
        }
      : null,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="office-dashboard-${toDateInputValue(new Date())}.json"`,
    },
  });
});
