import { badRequest, readJson, requireString, route } from "@/lib/api-helpers";
import { isFounderCostType } from "@/lib/constants";
import { nextSortOrder, serialiseCostItem } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

export const GET = route(async () => {
  const rows = await prisma.founderCostItem.findMany({ orderBy: { sortOrder: "asc" } });
  return { costs: rows.map(serialiseCostItem) };
});

export const POST = route(async (req) => {
  const body = await readJson(req);
  const name = requireString(body, "name");
  if (!isFounderCostType(body.type)) throw badRequest('"type" must be "one_time" or "recurring"');
  const amountCad = Number(body.amountCad);
  if (!Number.isFinite(amountCad) || amountCad < 0) throw badRequest('"amountCad" must be a non-negative number');

  const siblings = await prisma.founderCostItem.findMany({ select: { sortOrder: true } });
  const row = await prisma.founderCostItem.create({
    data: { name, type: body.type, amountCad, isCustom: true, sortOrder: nextSortOrder(siblings) },
  });
  return { cost: serialiseCostItem(row) };
});
