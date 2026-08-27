import { optionalString, readJson, requireString, route } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { nextSortOrder } from "@/lib/trader-media/server";

/**
 * Add a phase of your own — for work that isn't in the written SOP yet.
 *
 * `number` is display-only and continues past the seeded 13; `sortOrder`
 * places it at the end. Custom phases carry a `custom-` key so re-seeding
 * can't confuse them for SOP phases. No `stageKey` — Trader Media's rail has
 * no stage grouping (13 phases doesn't need it the way Traffic Billing's 37
 * did).
 */
export const POST = route(async (req) => {
  const body = await readJson(req);
  const title = requireString(body, "title");

  const existing = await prisma.traderMediaPhase.findMany({
    select: { sortOrder: true, number: true },
  });
  const highestNumber = existing.reduce((max, p) => Math.max(max, p.number), 0);

  const phase = await prisma.traderMediaPhase.create({
    data: {
      key: `custom-p${Date.now()}`,
      number: highestNumber + 1,
      title,
      intro: optionalString(body, "intro") ?? null,
      sortOrder: nextSortOrder(existing),
      isCustom: true,
    },
  });

  return { phase };
});
