import { badRequest, readJson, requireString, route } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { nextSortOrder } from "@/lib/traffic-billing/server";

/**
 * Add a "mistake to avoid". `phaseId: null` makes it global — shown on every
 * phase, for the rules that apply throughout the SOP.
 */
export const POST = route(async (req) => {
  const body = await readJson(req);
  const text = requireString(body, "text");

  let phaseId: number | null = null;
  if (body.phaseId !== null && body.phaseId !== undefined) {
    const parsed = Number(body.phaseId);
    if (!Number.isInteger(parsed)) throw badRequest('"phaseId" must be a number or null');
    phaseId = parsed;
  }

  const siblings = await prisma.trafficBillingMistake.findMany({
    where: { phaseId },
    select: { sortOrder: true },
  });

  const mistake = await prisma.trafficBillingMistake.create({
    data: { text, phaseId, isCustom: true, sortOrder: nextSortOrder(siblings) },
  });

  return { mistake };
});
