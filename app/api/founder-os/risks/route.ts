import { optionalString, readJson, requireString, route } from "@/lib/api-helpers";
import { isFounderRiskLevel } from "@/lib/constants";
import { nextSortOrder, serialiseRiskItem } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

export const GET = route(async () => {
  const rows = await prisma.founderRiskItem.findMany({ orderBy: { sortOrder: "asc" } });
  return { risks: rows.map(serialiseRiskItem) };
});

export const POST = route(async (req) => {
  const body = await readJson(req);
  const risk = requireString(body, "risk");
  const probability = isFounderRiskLevel(body.probability) ? body.probability : "medium";
  const impact = isFounderRiskLevel(body.impact) ? body.impact : "medium";

  const siblings = await prisma.founderRiskItem.findMany({ select: { sortOrder: true } });
  const row = await prisma.founderRiskItem.create({
    data: {
      risk,
      probability,
      impact,
      prevention: optionalString(body, "prevention") ?? null,
      backupPlan: optionalString(body, "backupPlan") ?? null,
      isCustom: true,
      sortOrder: nextSortOrder(siblings),
    },
  });
  return { risk: serialiseRiskItem(row) };
});
