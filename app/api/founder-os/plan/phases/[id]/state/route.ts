import { badRequest, paramId, readJson, route } from "@/lib/api-helpers";
import { isFounderPlanStepState } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

/**
 * Set every step in a phase to one state — "mark this whole phase done", or
 * "this phase doesn't apply." No `runId` needed (unlike Traffic
 * Billing/Trader Media's equivalent) since state lives directly on the
 * step row here.
 */
export const POST = route(async (req, ctx) => {
  const phaseId = await paramId(ctx);
  const body = await readJson(req);

  if (!isFounderPlanStepState(body.state)) {
    throw badRequest('"state" must be "open", "done" or "na"');
  }
  const state = body.state;

  const result = await prisma.founderPlanStep.updateMany({
    where: { phaseId },
    data: { state, doneAt: state === "done" ? new Date() : null },
  });

  return { updated: result.count };
});
