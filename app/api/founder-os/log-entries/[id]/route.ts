import { optionalString, paramId, readJson, route } from "@/lib/api-helpers";
import { serialiseLogEntry } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const data: Record<string, unknown> = {};
  const decision = optionalString(body, "decision");
  if (decision !== undefined && decision !== null) data.decision = decision;
  for (const field of ["reasoning", "alternatives", "outcome"] as const) {
    const value = optionalString(body, field);
    if (value !== undefined) data[field] = value;
  }

  const row = await prisma.founderLogEntry.update({ where: { id }, data });
  return { entry: serialiseLogEntry(row) };
});

export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.founderLogEntry.delete({ where: { id } });
  return { ok: true };
});
