import { paramId, readJson, requireString, route } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);
  const text = requireString(body, "text");

  const mistake = await prisma.traderMediaMistake.update({
    where: { id },
    data: { text },
  });

  return { mistake };
});

export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.traderMediaMistake.delete({ where: { id } });
  return { ok: true };
});
