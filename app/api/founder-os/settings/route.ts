import { readJson, route } from "@/lib/api-helpers";
import { parseFounderDate, serialiseSettings } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

/** Founder OS's singleton settings row — currently just the 90-day runway's Day 1. */
export const GET = route(async () => {
  const row = await prisma.founderSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return { settings: serialiseSettings(row) };
});

export const PATCH = route(async (req) => {
  const body = await readJson(req);
  const startDate = parseFounderDate(body.startDate);

  const row = await prisma.founderSettings.upsert({
    where: { id: 1 },
    update: { startDate },
    create: { id: 1, startDate },
  });
  return { settings: serialiseSettings(row) };
});
