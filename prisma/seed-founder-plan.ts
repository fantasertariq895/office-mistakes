/**
 * Seeds the Founder OS master 90-day Plan from lib/founder-os/plan-seed.ts.
 *
 * Idempotent and non-destructive, same pattern as
 * prisma/seed-trader-media.ts: rows match on their stable `key`, so
 * re-running after an in-app edit never overwrites it and never
 * duplicates. Phase `number`/`sortOrder` are re-synced on every run
 * (structural, not user-editable); `title`/`intro`/step `text` never are.
 *
 *   npm run db:seed-founder-plan
 */
import { PrismaClient } from "@prisma/client";
import { PLAN_MISTAKES, PLAN_PHASES } from "../lib/founder-os/plan-seed";

const prisma = new PrismaClient();

async function main() {
  let phasesCreated = 0;
  let stepsCreated = 0;
  let mistakesCreated = 0;
  let phasesReordered = 0;

  const phaseIdByKey = new Map<string, number>();

  for (const [phaseIndex, phase] of PLAN_PHASES.entries()) {
    const number = phaseIndex + 1;
    const sortOrder = number * 100;

    const existing = await prisma.founderPlanPhase.findUnique({ where: { key: phase.key } });
    let row = existing;

    if (!row) {
      row = await prisma.founderPlanPhase.create({
        data: {
          key: phase.key,
          number,
          title: phase.title,
          intro: phase.intro ?? null,
          dayRange: phase.dayRange,
          sortOrder,
        },
      });
      phasesCreated++;
    } else if (!row.isCustom && (row.number !== number || row.sortOrder !== sortOrder || row.dayRange !== phase.dayRange)) {
      row = await prisma.founderPlanPhase.update({
        where: { id: row.id },
        data: { number, sortOrder, dayRange: phase.dayRange },
      });
      phasesReordered++;
    }

    phaseIdByKey.set(phase.key, row.id);

    for (const [index, step] of phase.steps.entries()) {
      const key = `${phase.key}-${step.key}`;
      const stepSortOrder = (index + 1) * 100;
      const found = await prisma.founderPlanStep.findUnique({ where: { key } });

      if (found) {
        if (!found.isCustom && found.sortOrder !== stepSortOrder) {
          await prisma.founderPlanStep.update({ where: { id: found.id }, data: { sortOrder: stepSortOrder } });
        }
        continue;
      }

      await prisma.founderPlanStep.create({
        data: {
          key,
          phaseId: row.id,
          groupLabel: step.groupLabel ?? null,
          text: step.text,
          notes: step.notes ? JSON.stringify(step.notes) : null,
          isHighRisk: step.highRisk ?? false,
          sortOrder: stepSortOrder,
        },
      });
      stepsCreated++;
    }
  }

  for (const [index, mistake] of PLAN_MISTAKES.entries()) {
    const phaseId = mistake.phase ? (phaseIdByKey.get(mistake.phase) ?? null) : null;
    const found = await prisma.founderPlanMistake.findFirst({ where: { text: mistake.text, phaseId } });
    if (found) continue;

    await prisma.founderPlanMistake.create({
      data: { text: mistake.text, phaseId, sortOrder: (index + 1) * 100 },
    });
    mistakesCreated++;
  }

  const totalSteps = await prisma.founderPlanStep.count();
  const totalPhases = await prisma.founderPlanPhase.count();
  console.log(
    `Founder Plan seed complete — created ${phasesCreated} phase(s), ` +
      `${stepsCreated} step(s), ${mistakesCreated} mistake(s); repositioned ${phasesReordered} phase(s). ` +
      `Plan now has ${totalPhases} phases / ${totalSteps} steps.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
