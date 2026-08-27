import { badRequest, optionalString, paramId, readJson, route } from "@/lib/api-helpers";
import { isTmStepState } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

/**
 * Set one step's state (or note) for one run.
 *
 * Upsert rather than update: state rows are created lazily, so the first time
 * a step is touched in a given week there's nothing to update yet.
 */
export const PATCH = route(async (req, ctx) => {
  const stepId = await paramId(ctx);
  const body = await readJson(req);

  const runId = Number(body.runId);
  if (!Number.isInteger(runId)) throw badRequest('"runId" is required');

  const note = optionalString(body, "note");
  const hasState = body.state !== undefined;
  if (hasState && !isTmStepState(body.state)) {
    throw badRequest('"state" must be "open", "done" or "na"');
  }
  if (!hasState && note === undefined) {
    throw badRequest("Nothing to update");
  }

  const state = hasState ? (body.state as string) : undefined;

  await prisma.traderMediaStepState.upsert({
    where: { runId_stepId: { runId, stepId } },
    create: {
      runId,
      stepId,
      state: state ?? "open",
      note: note ?? null,
    },
    update: {
      ...(state !== undefined ? { state } : {}),
      ...(note !== undefined ? { note } : {}),
    },
  });

  return { ok: true };
});
