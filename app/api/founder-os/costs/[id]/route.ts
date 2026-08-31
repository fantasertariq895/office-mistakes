import { badRequest, optionalString, paramId, readJson, route } from "@/lib/api-helpers";
import { isFounderCostType } from "@/lib/constants";
import { serialiseCostItem } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const name = optionalString(body, "name");
  const data: Record<string, unknown> = {};
  if (name !== undefined && name !== null) data.name = name;

  if (body.type !== undefined) {
    if (!isFounderCostType(body.type)) throw badRequest('"type" must be "one_time" or "recurring"');
    data.type = body.type;
  }

  if (body.amountCad !== undefined) {
    const amountCad = Number(body.amountCad);
    if (!Number.isFinite(amountCad) || amountCad < 0) throw badRequest('"amountCad" must be a non-negative number');
    data.amountCad = amountCad;
  }

  const row = await prisma.founderCostItem.update({ where: { id }, data });
  return { cost: serialiseCostItem(row) };
});

export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.founderCostItem.delete({ where: { id } });
  return { ok: true };
});
