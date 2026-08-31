import { route } from "@/lib/api-helpers";
import { serialiseMarketingWeek } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

/** The 90-day (13-week) outreach/content calendar — all weeks always exist (seeded), list-only. */
export const GET = route(async () => {
  const rows = await prisma.founderMarketingWeek.findMany({ orderBy: { weekNumber: "asc" } });
  return { weeks: rows.map(serialiseMarketingWeek) };
});
