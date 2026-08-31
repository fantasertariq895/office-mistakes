import { badRequest, paramId, readJson, route } from "@/lib/api-helpers";
import { serialiseRevenueMonth } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

const NUMERIC_FIELDS = ["clients", "avgRevenuePerClient", "costOfDelivery"] as const;

export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const data: Record<string, number> = {};
  for (const field of NUMERIC_FIELDS) {
    if (body[field] === undefined) continue;
    const value = Number(body[field]);
    if (!Number.isFinite(value) || value < 0) throw badRequest(`"${field}" must be a non-negative number`);
    data[field] = value;
  }

  const row = await prisma.founderRevenueMonth.update({ where: { id }, data });
  return { month: serialiseRevenueMonth(row) };
});
