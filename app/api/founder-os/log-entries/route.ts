import { optionalString, readJson, requireString, route } from "@/lib/api-helpers";
import { serialiseLogEntry } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

/** The Decision Log — a running record, newest first. */
export const GET = route(async () => {
  const rows = await prisma.founderLogEntry.findMany({ orderBy: { createdAt: "desc" } });
  return { entries: rows.map(serialiseLogEntry) };
});

export const POST = route(async (req) => {
  const body = await readJson(req);
  const decision = requireString(body, "decision");

  const row = await prisma.founderLogEntry.create({
    data: {
      decision,
      reasoning: optionalString(body, "reasoning") ?? null,
      alternatives: optionalString(body, "alternatives") ?? null,
      outcome: optionalString(body, "outcome") ?? null,
    },
  });
  return { entry: serialiseLogEntry(row) };
});
