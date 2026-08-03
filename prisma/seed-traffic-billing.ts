/**
 * Seeds the Traffic Billing SOP from lib/traffic-billing/sop-template.ts.
 *
 * Idempotent and non-destructive, in the same spirit as prisma/seed.ts:
 * every row is matched on its stable `key`, so re-running after you've edited
 * a step in the app will NOT overwrite your wording, and will never duplicate.
 * New template rows get created; nothing gets deleted.
 *
 * Deliberately does not touch Commission, ChecklistItem or anything else the
 * existing dashboard owns — this script is safe to run against the shared
 * Neon database without disturbing the commissions work.
 *
 *   npm run db:seed-traffic-billing
 */
import { PrismaClient } from "@prisma/client";
import { SOP_MISTAKES, SOP_PHASES } from "../lib/traffic-billing/sop-template";

const prisma = new PrismaClient();

async function main() {
  let phasesCreated = 0;
  let stepsCreated = 0;
  let mistakesCreated = 0;

  const phaseIdByKey = new Map<string, number>();

  let phasesReordered = 0;

  for (const [phaseIndex, phase] of SOP_PHASES.entries()) {
    // Display number and ordering come from position in the template, so a
    // phase inserted in the middle pushes the rest down automatically.
    const number = phaseIndex + 1;
    const sortOrder = number * 100;

    const existing = await prisma.trafficBillingPhase.findUnique({
      where: { key: phase.key },
    });

    let row = existing;

    if (!row) {
      row = await prisma.trafficBillingPhase.create({
        data: {
          key: phase.key,
          number,
          stageKey: phase.stageKey,
          title: phase.title,
          intro: phase.intro ?? null,
          sortOrder,
        },
      });
      phasesCreated++;
    } else if (
      // Structural fields only. `title` and `intro` are deliberately NOT synced
      // — those are the fields the user edits in the app, and re-running the
      // seed must never quietly revert their wording.
      !row.isCustom &&
      (row.number !== number ||
        row.sortOrder !== sortOrder ||
        row.stageKey !== phase.stageKey)
    ) {
      row = await prisma.trafficBillingPhase.update({
        where: { id: row.id },
        data: { number, stageKey: phase.stageKey, sortOrder },
      });
      phasesReordered++;
    }

    phaseIdByKey.set(phase.key, row.id);

    for (const [index, step] of phase.steps.entries()) {
      const key = `${phase.key}-${step.key}`;
      const stepSortOrder = (index + 1) * 100;
      const found = await prisma.trafficBillingStep.findUnique({ where: { key } });

      if (found) {
        // Same rule as phases: reposition, never reword.
        if (!found.isCustom && found.sortOrder !== stepSortOrder) {
          await prisma.trafficBillingStep.update({
            where: { id: found.id },
            data: { sortOrder: stepSortOrder },
          });
        }
        continue;
      }

      await prisma.trafficBillingStep.create({
        data: {
          key,
          phaseId: row.id,
          groupLabel: step.groupLabel ?? null,
          text: step.text,
          // Stored as JSON rather than a relation: reference bullets are
          // read-only display text with no state of their own.
          notes: step.notes ? JSON.stringify(step.notes) : null,
          isHighRisk: step.highRisk ?? false,
          sortOrder: stepSortOrder,
        },
      });
      stepsCreated++;
    }
  }

  for (const [index, mistake] of SOP_MISTAKES.entries()) {
    const phaseId = mistake.phase ? (phaseIdByKey.get(mistake.phase) ?? null) : null;
    const found = await prisma.trafficBillingMistake.findFirst({
      where: { text: mistake.text, phaseId },
    });
    if (found) continue;

    await prisma.trafficBillingMistake.create({
      data: { text: mistake.text, phaseId, sortOrder: (index + 1) * 100 },
    });
    mistakesCreated++;
  }

  const totalSteps = await prisma.trafficBillingStep.count();
  const totalPhases = await prisma.trafficBillingPhase.count();
  console.log(
    `Traffic Billing seed complete — created ${phasesCreated} phase(s), ` +
      `${stepsCreated} step(s), ${mistakesCreated} mistake(s); ` +
      `repositioned ${phasesReordered} phase(s). ` +
      `SOP now has ${totalPhases} phases / ${totalSteps} steps.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
