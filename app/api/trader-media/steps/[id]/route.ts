import {
  optionalBoolean,
  optionalString,
  paramId,
  readJson,
  route,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { serialiseStep } from "@/lib/trader-media/server";

/**
 * Edit a step's content — its wording, sub-heading or high-risk flag.
 *
 * This is content, not progress: run state lives at ./[id]/state. Rewording a
 * step deliberately leaves every past week's tick untouched, since the state
 * table keys on step id, not text.
 */
export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const text = optionalString(body, "text");
  const groupLabel = optionalString(body, "groupLabel");
  const isHighRisk = optionalBoolean(body, "isHighRisk");

  const step = await prisma.traderMediaStep.update({
    where: { id },
    data: {
      ...(text !== undefined && text !== null ? { text } : {}),
      ...(groupLabel !== undefined ? { groupLabel } : {}),
      ...(isHighRisk !== undefined ? { isHighRisk } : {}),
    },
  });

  return { step: serialiseStep(step) };
});

/**
 * Removes the step everywhere, including its state in past runs (cascade).
 * The UI offers Undo rather than a confirm dialog, matching the checklist.
 */
export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.traderMediaStep.delete({ where: { id } });
  return { ok: true };
});
