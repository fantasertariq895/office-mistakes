import { prisma } from "@/lib/prisma";
import { badRequest, optionalString, readJson, requireString, route } from "@/lib/api-helpers";
import { COMMISSION_COLORS } from "@/lib/constants";

export const GET = route(async () => {
  const [commissions, openTasks] = await Promise.all([
    prisma.commission.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            checklistItems: true,
            mistakes: true,
            contacts: true,
            approvalRequirements: true,
          },
        },
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

  return commissions.map((c) => ({
    ...c,
    openTaskCount: openByCommission.get(c.id) ?? 0,
  }));
});

export const POST = route(async (req) => {
  const body = await readJson(req);
  const name = requireString(body, "name");

  const existing = await prisma.commission.findUnique({ where: { name } });
  if (existing) throw badRequest("A commission with that name already exists");

  const last = await prisma.commission.findFirst({
    orderBy: { sortOrder: "desc" },
  });

  return prisma.commission.create({
    data: {
      name,
      color:
        optionalString(body, "color") ??
        COMMISSION_COLORS[(last?.sortOrder ?? 0) % COMMISSION_COLORS.length],
      description: optionalString(body, "description") ?? null,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
});
