import { optionalString, readJson, requireString, route } from "@/lib/api-helpers";
import { isFounderTaskPriority, isFounderTechStatus } from "@/lib/constants";
import { nextSortOrder, serialiseTechStackItem } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

export const GET = route(async () => {
  const rows = await prisma.founderTechStackItem.findMany({ orderBy: { sortOrder: "asc" } });
  return { items: rows.map(serialiseTechStackItem) };
});

export const POST = route(async (req) => {
  const body = await readJson(req);
  const tool = requireString(body, "tool");
  const priority = isFounderTaskPriority(body.priority) ? body.priority : "medium";
  const status = isFounderTechStatus(body.status) ? body.status : "not_set_up";

  const siblings = await prisma.founderTechStackItem.findMany({ select: { sortOrder: true } });
  const row = await prisma.founderTechStackItem.create({
    data: {
      tool,
      purpose: optionalString(body, "purpose") ?? null,
      costCad: body.costCad !== undefined ? Number(body.costCad) : null,
      priority,
      status,
      isCustom: true,
      sortOrder: nextSortOrder(siblings),
    },
  });
  return { item: serialiseTechStackItem(row) };
});
