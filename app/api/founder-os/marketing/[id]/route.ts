import { badRequest, optionalString, paramId, readJson, route } from "@/lib/api-helpers";
import { serialiseMarketingWeek } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const data: Record<string, unknown> = {};
  if (body.plannedOutreach !== undefined) {
    if (body.plannedOutreach === null) {
      data.plannedOutreach = null;
    } else {
      const value = Number(body.plannedOutreach);
      if (!Number.isFinite(value) || value < 0) throw badRequest('"plannedOutreach" must be a non-negative number');
      data.plannedOutreach = Math.round(value);
    }
  }
  const plannedContent = optionalString(body, "plannedContent");
  if (plannedContent !== undefined) data.plannedContent = plannedContent;
  const notes = optionalString(body, "notes");
  if (notes !== undefined) data.notes = notes;

  const row = await prisma.founderMarketingWeek.update({ where: { id }, data });
  return { week: serialiseMarketingWeek(row) };
});
