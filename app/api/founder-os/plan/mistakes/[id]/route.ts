import { paramId, route } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.founderPlanMistake.delete({ where: { id } });
  return { ok: true };
});
