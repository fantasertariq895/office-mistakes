import { prisma } from "@/lib/prisma";
import {
  badRequest,
  notFound,
  optionalString,
  paramId,
  readJson,
  route,
} from "@/lib/api-helpers";

export const GET = route(async (_req, ctx) => {
  const id = await paramId(ctx);

  const commission = await prisma.commission.findUnique({
    where: { id },
    include: {
      checklistItems: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
      mistakes: { orderBy: { dateLogged: "desc" } },
      contacts: { orderBy: { id: "asc" } },
      approvalRequirements: { orderBy: { id: "asc" } },
    },
  });
  if (!commission) throw notFound("Commission not found");

  const openTaskCount = await prisma.task.count({
    where: { commissionId: id, status: { not: "completed" } },
  });

  return { ...commission, openTaskCount };
});

export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const data: Record<string, unknown> = {};
  if ("name" in body) {
    const name = optionalString(body, "name");
    if (!name) throw badRequest('"name" is required');
    const clash = await prisma.commission.findUnique({ where: { name } });
    if (clash && clash.id !== id) {
      throw badRequest("A commission with that name already exists");
    }
    data.name = name;
  }
  if ("color" in body) data.color = optionalString(body, "color") ?? "#6B7280";
  if ("description" in body) data.description = optionalString(body, "description");
  if ("sortOrder" in body && typeof body.sortOrder === "number") {
    data.sortOrder = body.sortOrder;
  }

  return prisma.commission.update({ where: { id }, data });
});

export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  // Checklist items, mistakes, contacts and approvals cascade;
  // tasks keep their history and simply lose the tag.
  await prisma.commission.delete({ where: { id } });
  return { ok: true };
});
