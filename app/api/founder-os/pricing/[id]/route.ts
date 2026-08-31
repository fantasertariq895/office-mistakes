import { badRequest, optionalString, paramId, readJson, route } from "@/lib/api-helpers";
import { serialisePricingTier } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const data: Record<string, unknown> = {};
  const description = optionalString(body, "description");
  if (description !== undefined) data.description = description;

  if (body.priceCad !== undefined) {
    if (body.priceCad === null) {
      data.priceCad = null;
    } else {
      const priceCad = Number(body.priceCad);
      if (!Number.isFinite(priceCad) || priceCad < 0) throw badRequest('"priceCad" must be a non-negative number');
      data.priceCad = priceCad;
    }
  }

  const row = await prisma.founderPricingTier.update({ where: { id }, data });
  return { tier: serialisePricingTier(row) };
});
