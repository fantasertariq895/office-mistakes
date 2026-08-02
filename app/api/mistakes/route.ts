import { prisma } from "@/lib/prisma";
import {
  badRequest,
  commissionIdParam,
  readJson,
  requireString,
  route,
} from "@/lib/api-helpers";

export const GET = route(async (req) => {
  const commissionId = commissionIdParam(req);
  return prisma.mistakeLogEntry.findMany({
    where:
      commissionId === undefined || commissionId === null ? {} : { commissionId },
    orderBy: { dateLogged: "desc" },
    include: { commission: { select: { id: true, name: true, color: true } } },
  });
});

export const POST = route(async (req) => {
  const body = await readJson(req);
  const text = requireString(body, "text");

  if (typeof body.commissionId !== "number") {
    throw badRequest('"commissionId" is required');
  }
  const exists = await prisma.commission.count({
    where: { id: body.commissionId },
  });
  if (!exists) throw badRequest("Commission not found");

  return prisma.mistakeLogEntry.create({
    data: { commissionId: body.commissionId, text },
  });
});
