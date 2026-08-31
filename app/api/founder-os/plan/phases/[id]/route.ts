import { optionalString, paramId, readJson, route } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

/** Retitle a phase or change its lead-in prose. */
export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const title = optionalString(body, "title");
  const intro = optionalString(body, "intro");
  const dayRange = optionalString(body, "dayRange");

  const phase = await prisma.founderPlanPhase.update({
    where: { id },
    data: {
      ...(title !== undefined && title !== null ? { title } : {}),
      ...(intro !== undefined ? { intro } : {}),
      ...(dayRange !== undefined ? { dayRange } : {}),
    },
  });

  return { phase };
});

/** Cascades to the phase's steps and its mistakes. */
export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.founderPlanPhase.delete({ where: { id } });
  return { ok: true };
});
