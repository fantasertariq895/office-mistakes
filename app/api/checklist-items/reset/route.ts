import { prisma } from "@/lib/prisma";
import { badRequest, readJson, route } from "@/lib/api-helpers";

/** Unticks a whole checklist so it's ready for the next send. */
export const POST = route(async (req) => {
  const body = await readJson(req);

  let commissionId: number | null;
  if (body.commissionId === null || body.commissionId === "universal") {
    commissionId = null;
  } else if (typeof body.commissionId === "number") {
    commissionId = body.commissionId;
  } else {
    throw badRequest('"commissionId" must be a number, null or "universal"');
  }

  const result = await prisma.checklistItem.updateMany({
    where: { commissionId, checkedAt: { not: null } },
    data: { checkedAt: null },
  });
  return { reset: result.count };
});
