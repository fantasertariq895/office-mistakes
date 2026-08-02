import { prisma } from "@/lib/prisma";
import {
  badRequest,
  commissionIdParam,
  optionalString,
  readJson,
  requireString,
  route,
} from "@/lib/api-helpers";

export const GET = route(async (req) => {
  const commissionId = commissionIdParam(req);
  return prisma.contact.findMany({
    where:
      commissionId === undefined || commissionId === null ? {} : { commissionId },
    orderBy: [{ commissionId: "asc" }, { id: "asc" }],
    include: { commission: { select: { id: true, name: true, color: true } } },
  });
});

export const POST = route(async (req) => {
  const body = await readJson(req);
  const name = requireString(body, "name");

  if (typeof body.commissionId !== "number") {
    throw badRequest('"commissionId" is required');
  }
  const exists = await prisma.commission.count({
    where: { id: body.commissionId },
  });
  if (!exists) throw badRequest("Commission not found");

  return prisma.contact.create({
    data: {
      commissionId: body.commissionId,
      name,
      role: optionalString(body, "role") ?? null,
      email: optionalString(body, "email") ?? null,
      phone: optionalString(body, "phone") ?? null,
    },
  });
});
