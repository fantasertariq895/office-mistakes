import { badRequest, paramId, readJson, route } from "@/lib/api-helpers";
import { isTbStepState } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

/**
 * Set every step in a phase to one state for a run — "mark this whole phase
 * done", or "this phase doesn't apply this month" (common: the US/Kia/OEM
 * branches don't all run every billing month).
 *
 * One transaction so a phase can never end up half-applied.
 */
export const POST = route(async (req, ctx) => {
  const phaseId = await paramId(ctx);
  const body = await readJson(req);

  const runId = Number(body.runId);
  if (!Number.isInteger(runId)) throw badRequest('"runId" is required');
  if (!isTbStepState(body.state)) {
    throw badRequest('"state" must be "open", "done" or "na"');
  }
  const state = body.state;

  const steps = await prisma.trafficBillingStep.findMany({
    where: { phaseId },
    select: { id: true },
  });

  await prisma.$transaction(
    steps.map((step) =>
      prisma.trafficBillingStepState.upsert({
        where: { runId_stepId: { runId, stepId: step.id } },
        create: { runId, stepId: step.id, state },
        update: { state },
      })
    )
  );

  return { updated: steps.length };
});
