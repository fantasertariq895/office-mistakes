import { prisma } from "@/lib/prisma";
import {
  badRequest,
  optionalBoolean,
  optionalString,
  paramId,
  readJson,
  route,
} from "@/lib/api-helpers";

export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const data: Record<string, unknown> = {};
  if ("text" in body) {
    const text = optionalString(body, "text");
    if (!text) throw badRequest('"text" is required');
    data.text = text;
  }
  const resolved = optionalBoolean(body, "resolved");
  if (resolved !== undefined) data.resolved = resolved;

  return prisma.mistakeLogEntry.update({ where: { id }, data });
});

export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.mistakeLogEntry.delete({ where: { id } });
  return { ok: true };
});
