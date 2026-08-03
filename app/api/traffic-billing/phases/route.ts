import { optionalString, readJson, requireString, route } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { nextSortOrder } from "@/lib/traffic-billing/server";

/**
 * Add a phase of your own — for work that isn't in the written SOP yet.
 *
 * `number` is display-only and continues past the seeded 37; `sortOrder`
 * places it at the end of its stage. Custom phases carry a `custom-` key so
 * re-seeding can't confuse them for SOP phases.
 */
export const POST = route(async (req) => {
  const body = await readJson(req);
  const title = requireString(body, "title");
  const stageKey = optionalString(body, "stageKey") ?? "i";

  const existing = await prisma.trafficBillingPhase.findMany({
    select: { sortOrder: true, number: true },
  });
  const highestNumber = existing.reduce((max, p) => Math.max(max, p.number), 0);

  const phase = await prisma.trafficBillingPhase.create({
    data: {
      key: `custom-p${Date.now()}`,
      number: highestNumber + 1,
      stageKey,
      title,
      intro: optionalString(body, "intro") ?? null,
      sortOrder: nextSortOrder(existing),
      isCustom: true,
    },
  });

  return { phase };
});
