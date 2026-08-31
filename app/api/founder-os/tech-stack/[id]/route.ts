import { badRequest, optionalString, paramId, readJson, route } from "@/lib/api-helpers";
import { isFounderTaskPriority, isFounderTechStatus } from "@/lib/constants";
import { serialiseTechStackItem } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const data: Record<string, unknown> = {};
  const tool = optionalString(body, "tool");
  if (tool !== undefined && tool !== null) data.tool = tool;
  const purpose = optionalString(body, "purpose");
  if (purpose !== undefined) data.purpose = purpose;

  if (body.costCad !== undefined) {
    data.costCad = body.costCad === null ? null : Number(body.costCad);
  }
  if (body.priority !== undefined) {
    if (!isFounderTaskPriority(body.priority)) throw badRequest('"priority" is invalid');
    data.priority = body.priority;
  }
  if (body.status !== undefined) {
    if (!isFounderTechStatus(body.status)) throw badRequest('"status" is invalid');
    data.status = body.status;
  }

  const row = await prisma.founderTechStackItem.update({ where: { id }, data });
  return { item: serialiseTechStackItem(row) };
});

export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.founderTechStackItem.delete({ where: { id } });
  return { ok: true };
});
