import { optionalString, paramId, readJson, route } from "@/lib/api-helpers";
import { serialiseDocument } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const data: Record<string, unknown> = {};
  const title = optionalString(body, "title");
  if (title !== undefined && title !== null) data.title = title;
  const content = optionalString(body, "content");
  if (content !== undefined) data.content = content;

  const row = await prisma.founderDocument.update({ where: { id }, data });
  return { document: serialiseDocument(row) };
});

export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.founderDocument.delete({ where: { id } });
  return { ok: true };
});
