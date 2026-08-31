import { badRequest, optionalString, readJson, requireString, route } from "@/lib/api-helpers";
import { nextSortOrder, serialiseChecklistItem } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

/** Add a custom item to a checklist, identified by its key ("legal" | "first-customer"). */
export const POST = route(async (req, ctx) => {
  const { key } = await ctx.params;
  const body = await readJson(req);
  const text = requireString(body, "text");

  const checklist = await prisma.founderChecklist.findUnique({ where: { key } });
  if (!checklist) throw badRequest("That checklist doesn't exist");

  const siblings = await prisma.founderChecklistItem.findMany({
    where: { checklistId: checklist.id },
    select: { sortOrder: true },
  });

  const row = await prisma.founderChecklistItem.create({
    data: {
      checklistId: checklist.id,
      text,
      explanation: optionalString(body, "explanation") ?? null,
      dayLabel: optionalString(body, "dayLabel") ?? null,
      isCustom: true,
      sortOrder: nextSortOrder(siblings),
    },
  });
  return { item: serialiseChecklistItem(row) };
});
