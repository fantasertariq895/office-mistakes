import { badRequest, paramId, readJson, route } from "@/lib/api-helpers";
import { serialiseScore } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);
  const score = Number(body.score);
  if (!Number.isInteger(score) || score < 1 || score > 10) {
    throw badRequest('"score" must be an integer from 1 to 10');
  }

  const row = await prisma.founderScore.update({ where: { id }, data: { score } });
  return { score: serialiseScore(row) };
});
