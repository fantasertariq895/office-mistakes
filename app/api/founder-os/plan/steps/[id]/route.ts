import {
  badRequest,
  optionalBoolean,
  optionalString,
  paramId,
  readJson,
  route,
} from "@/lib/api-helpers";
import { isFounderPlanStepState } from "@/lib/constants";
import { serialisePlanStep } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

/**
 * One endpoint for both content edits (wording, sub-heading, high-risk
 * flag) and state changes (tick/N/A, note) — unlike Traffic Billing/Trader
 * Media's split between a content route and a run-scoped `/state`
 * sub-route, there's no run dimension here, so there's nothing to split.
 */
export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const text = optionalString(body, "text");
  const groupLabel = optionalString(body, "groupLabel");
  const isHighRisk = optionalBoolean(body, "isHighRisk");
  const note = optionalString(body, "note");

  const hasState = body.state !== undefined;
  if (hasState && !isFounderPlanStepState(body.state)) {
    throw badRequest('"state" must be "open", "done" or "na"');
  }
  const state = hasState ? (body.state as string) : undefined;

  const step = await prisma.founderPlanStep.update({
    where: { id },
    data: {
      ...(text !== undefined && text !== null ? { text } : {}),
      ...(groupLabel !== undefined ? { groupLabel } : {}),
      ...(isHighRisk !== undefined ? { isHighRisk } : {}),
      ...(note !== undefined ? { note } : {}),
      ...(state !== undefined ? { state, doneAt: state === "done" ? new Date() : null } : {}),
    },
  });

  return { step: serialisePlanStep(step) };
});

/** Removes the step. The UI offers Undo rather than a confirm dialog, matching the checklist. */
export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.founderPlanStep.delete({ where: { id } });
  return { ok: true };
});
