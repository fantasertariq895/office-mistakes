import { route } from "@/lib/api-helpers";
import { serialiseScore } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

/** Business Opportunity Scorecard — 9 editable 1-10 scores. Overall is computed client-side, not stored. */
export const GET = route(async () => {
  const rows = await prisma.founderScore.findMany({ orderBy: { sortOrder: "asc" } });
  return { scores: rows.map(serialiseScore) };
});
