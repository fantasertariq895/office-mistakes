import { optionalString, readJson, requireString, route } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

function nextSortOrder(existing: { sortOrder: number }[]): number {
  return existing.reduce((max, row) => Math.max(max, row.sortOrder), 0) + 100;
}

/** Add a phase of your own — for plan steps that aren't in the written 90-day plan yet. */
export const POST = route(async (req) => {
  const body = await readJson(req);
  const title = requireString(body, "title");

  const existing = await prisma.founderPlanPhase.findMany({ select: { sortOrder: true, number: true } });
  const highestNumber = existing.reduce((max, p) => Math.max(max, p.number), 0);

  const phase = await prisma.founderPlanPhase.create({
    data: {
      key: `custom-p${Date.now()}`,
      number: highestNumber + 1,
      title,
      intro: optionalString(body, "intro") ?? null,
      dayRange: optionalString(body, "dayRange") ?? null,
      sortOrder: nextSortOrder(existing),
      isCustom: true,
    },
  });

  return { phase };
});
