import { badRequest, optionalString, paramId, readJson, route } from "@/lib/api-helpers";
import { isFounderRiskLevel } from "@/lib/constants";
import { serialiseRiskItem } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const data: Record<string, unknown> = {};
  const risk = optionalString(body, "risk");
  if (risk !== undefined && risk !== null) data.risk = risk;
  const prevention = optionalString(body, "prevention");
  if (prevention !== undefined) data.prevention = prevention;
  const backupPlan = optionalString(body, "backupPlan");
  if (backupPlan !== undefined) data.backupPlan = backupPlan;

  if (body.probability !== undefined) {
    if (!isFounderRiskLevel(body.probability)) throw badRequest('"probability" is invalid');
    data.probability = body.probability;
  }
  if (body.impact !== undefined) {
    if (!isFounderRiskLevel(body.impact)) throw badRequest('"impact" is invalid');
    data.impact = body.impact;
  }

  const row = await prisma.founderRiskItem.update({ where: { id }, data });
  return { risk: serialiseRiskItem(row) };
});

export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.founderRiskItem.delete({ where: { id } });
  return { ok: true };
});
