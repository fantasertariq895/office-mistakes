import { optionalString, paramId, readJson, route } from "@/lib/api-helpers";
import { serialiseCompetitor } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

const FIELDS = [
  "name",
  "service",
  "price",
  "targetCustomer",
  "strengths",
  "weaknesses",
  "positioning",
  "opportunity",
] as const;

export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const data: Record<string, unknown> = {};
  for (const field of FIELDS) {
    const value = optionalString(body, field);
    if (value !== undefined) data[field] = field === "name" && value === null ? undefined : value;
  }

  const row = await prisma.founderCompetitor.update({ where: { id }, data });
  return { competitor: serialiseCompetitor(row) };
});

export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.founderCompetitor.delete({ where: { id } });
  return { ok: true };
});
