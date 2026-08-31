import { route } from "@/lib/api-helpers";
import { serialisePricingTier } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

/** The 3 pricing tiers (Basic/Professional/Premium) — always 3, seeded, no create/delete. */
export const GET = route(async () => {
  const rows = await prisma.founderPricingTier.findMany({ orderBy: { sortOrder: "asc" } });
  return { tiers: rows.map(serialisePricingTier) };
});
