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
  if ("category" in body) data.category = optionalString(body, "category");

  const isHighRisk = optionalBoolean(body, "isHighRisk");
  if (isHighRisk !== undefined) data.isHighRisk = isHighRisk;

  // `checked` is the UI-level toggle; it maps onto the checkedAt timestamp.
  const checked = optionalBoolean(body, "checked");
  if (checked !== undefined) data.checkedAt = checked ? new Date() : null;

  if ("sortOrder" in body && typeof body.sortOrder === "number") {
    data.sortOrder = body.sortOrder;
  }

  return prisma.checklistItem.update({ where: { id }, data });
});

export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.checklistItem.delete({ where: { id } });
  return { ok: true };
});
