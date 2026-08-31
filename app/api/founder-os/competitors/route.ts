import { optionalString, readJson, requireString, route } from "@/lib/api-helpers";
import { nextSortOrder, serialiseCompetitor } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

export const GET = route(async () => {
  const rows = await prisma.founderCompetitor.findMany({ orderBy: { sortOrder: "asc" } });
  return { competitors: rows.map(serialiseCompetitor) };
});

export const POST = route(async (req) => {
  const body = await readJson(req);
  const name = requireString(body, "name");

  const siblings = await prisma.founderCompetitor.findMany({ select: { sortOrder: true } });
  const row = await prisma.founderCompetitor.create({
    data: {
      name,
      service: optionalString(body, "service") ?? null,
      price: optionalString(body, "price") ?? null,
      targetCustomer: optionalString(body, "targetCustomer") ?? null,
      strengths: optionalString(body, "strengths") ?? null,
      weaknesses: optionalString(body, "weaknesses") ?? null,
      positioning: optionalString(body, "positioning") ?? null,
      opportunity: optionalString(body, "opportunity") ?? null,
      isCustom: true,
      sortOrder: nextSortOrder(siblings),
    },
  });
  return { competitor: serialiseCompetitor(row) };
});
