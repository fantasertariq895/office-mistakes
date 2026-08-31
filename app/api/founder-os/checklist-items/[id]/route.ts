import { optionalBoolean, optionalString, paramId, readJson, route } from "@/lib/api-helpers";
import { serialiseChecklistItem } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const data: Record<string, unknown> = {};
  const text = optionalString(body, "text");
  if (text !== undefined && text !== null) data.text = text;

  const done = optionalBoolean(body, "done");
  if (done !== undefined) {
    data.done = done;
    data.doneAt = done ? new Date() : null;
  }

  const row = await prisma.founderChecklistItem.update({ where: { id }, data });
  return { item: serialiseChecklistItem(row) };
});

export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.founderChecklistItem.delete({ where: { id } });
  return { ok: true };
});
