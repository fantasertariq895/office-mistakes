import { prisma } from "@/lib/prisma";
import {
  badRequest,
  commissionIdParam,
  optionalBoolean,
  optionalString,
  readJson,
  requireString,
  route,
} from "@/lib/api-helpers";

/**
 * `?commissionId=universal` → the universal (Mistake Prevention) rules.
 * `?commissionId=3`        → that commission's checklist.
 * omitted                  → everything (used by Settings).
 */
export const GET = route(async (req) => {
  const commissionId = commissionIdParam(req);
  return prisma.checklistItem.findMany({
    where: commissionId === undefined ? {} : { commissionId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
});

export const POST = route(async (req) => {
  const body = await readJson(req);
  const text = requireString(body, "text");

  let commissionId: number | null = null;
  if ("commissionId" in body && body.commissionId !== null) {
    if (typeof body.commissionId !== "number") {
      throw badRequest('"commissionId" must be a number or null');
    }
    commissionId = body.commissionId;
    const exists = await prisma.commission.count({ where: { id: commissionId } });
    if (!exists) throw badRequest("Commission not found");
  }

  const last = await prisma.checklistItem.findFirst({
    where: { commissionId },
    orderBy: { sortOrder: "desc" },
  });

  return prisma.checklistItem.create({
    data: {
      commissionId,
      text,
      category: optionalString(body, "category") ?? null,
      isHighRisk: optionalBoolean(body, "isHighRisk") ?? false,
      // Anything added through the app is a custom rule you discovered yourself.
      isCustom: optionalBoolean(body, "isCustom") ?? true,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
});
