import { optionalString, paramId, readJson, route } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

/** Retitle a phase or change its lead-in prose. */
export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const title = optionalString(body, "title");
  const intro = optionalString(body, "intro");
  const stageKey = optionalString(body, "stageKey");

  const phase = await prisma.trafficBillingPhase.update({
    where: { id },
    data: {
      ...(title !== undefined && title !== null ? { title } : {}),
      ...(intro !== undefined ? { intro } : {}),
      ...(stageKey !== undefined && stageKey !== null ? { stageKey } : {}),
    },
  });

  return { phase };
});

/** Cascades to the phase's steps, their state in every run, and its issues. */
export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.trafficBillingPhase.delete({ where: { id } });
  return { ok: true };
});
