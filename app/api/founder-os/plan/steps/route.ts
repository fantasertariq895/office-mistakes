import {
  badRequest,
  optionalBoolean,
  optionalString,
  readJson,
  requireString,
  route,
} from "@/lib/api-helpers";
import { serialisePlanStep } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

function nextSortOrder(existing: { sortOrder: number }[]): number {
  return existing.reduce((max, row) => Math.max(max, row.sortOrder), 0) + 100;
}

/**
 * Add a step of your own to a phase. Custom steps get a
 * `custom-<phaseKey>-<n>` key so they can never collide with a seeded
 * `<phaseKey>-sNN` key — a collision would make re-seeding skip a real
 * plan step.
 */
export const POST = route(async (req) => {
  const body = await readJson(req);
  const text = requireString(body, "text");
  const phaseId = Number(body.phaseId);
  if (!Number.isInteger(phaseId)) throw badRequest('"phaseId" is required');

  const phase = await prisma.founderPlanPhase.findUnique({
    where: { id: phaseId },
    include: { steps: { select: { sortOrder: true } } },
  });
  if (!phase) throw badRequest("That phase no longer exists");

  const customCount = await prisma.founderPlanStep.count({ where: { phaseId, isCustom: true } });

  const step = await prisma.founderPlanStep.create({
    data: {
      key: `custom-${phase.key}-${Date.now()}-${customCount + 1}`,
      phaseId,
      text,
      groupLabel: optionalString(body, "groupLabel") ?? null,
      isHighRisk: optionalBoolean(body, "isHighRisk") ?? false,
      isCustom: true,
      sortOrder: nextSortOrder(phase.steps),
    },
  });

  return { step: serialisePlanStep(step) };
});
