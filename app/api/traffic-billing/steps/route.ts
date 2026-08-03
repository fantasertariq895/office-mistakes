import {
  badRequest,
  optionalBoolean,
  optionalString,
  readJson,
  requireString,
  route,
} from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { nextSortOrder, serialiseStep } from "@/lib/traffic-billing/server";

/**
 * Add a step of your own to a phase.
 *
 * Custom steps get a `custom-<phaseKey>-<n>` key so they can never collide
 * with a seeded `<phaseKey>-sNN` key — which matters because re-running the
 * seed matches on key, and a collision would make it skip a real SOP step.
 */
export const POST = route(async (req) => {
  const body = await readJson(req);
  const text = requireString(body, "text");
  const phaseId = Number(body.phaseId);
  if (!Number.isInteger(phaseId)) throw badRequest('"phaseId" is required');

  const phase = await prisma.trafficBillingPhase.findUnique({
    where: { id: phaseId },
    include: { steps: { select: { sortOrder: true } } },
  });
  if (!phase) throw badRequest("That phase no longer exists");

  const customCount = await prisma.trafficBillingStep.count({
    where: { phaseId, isCustom: true },
  });

  const step = await prisma.trafficBillingStep.create({
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

  return { step: serialiseStep(step) };
});
