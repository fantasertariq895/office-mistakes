import { route } from "@/lib/api-helpers";
import { serialiseRevenueMonth } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

/** The 12-month revenue forecast — all 12 rows always exist (seeded), so this is list-only, no create. */
export const GET = route(async () => {
  const rows = await prisma.founderRevenueMonth.findMany({ orderBy: { monthNumber: "asc" } });
  return { months: rows.map(serialiseRevenueMonth) };
});
