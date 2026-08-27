/**
 * Seeds the Trader Media SOP from lib/trader-media/sop-template.ts, plus the
 * one-time setup checklist from lib/trader-media/setup-items.ts.
 *
 * Idempotent and non-destructive, in the same spirit as
 * prisma/seed-traffic-billing.ts: every row is matched on its stable `key`,
 * so re-running after you've edited a step in the app will NOT overwrite your
 * wording, and will never duplicate. New template rows get created; nothing
 * gets deleted.
 *
 * One deliberate difference from the Traffic Billing seed: `isOwnerPending`
 * IS re-synced on every run for non-custom phases, alongside `number` and
 * `sortOrder`. Unlike `title`/`intro` (which the user edits in the app),
 * `isOwnerPending` is a structural, seed-controlled flag — there's no UI to
 * change it, so there's nothing an edit could revert.
 *
 * Deliberately does not touch Commission, ChecklistItem, TrafficBilling* or
 * anything else the existing dashboard owns.
 *
 *   npm run db:seed-trader-media
 */
import { PrismaClient } from "@prisma/client";
import { SOP_MISTAKES, SOP_PHASES } from "../lib/trader-media/sop-template";
import { SETUP_ITEMS } from "../lib/trader-media/setup-items";

const prisma = new PrismaClient();

async function main() {
  let phasesCreated = 0;
  let stepsCreated = 0;
  let mistakesCreated = 0;
  let setupItemsCreated = 0;

  const phaseIdByKey = new Map<string, number>();

  let phasesReordered = 0;

  for (const [phaseIndex, phase] of SOP_PHASES.entries()) {
    // Display number and ordering come from position in the template, so a
    // phase inserted in the middle pushes the rest down automatically.
    const number = phaseIndex + 1;
    const sortOrder = number * 100;
    const isOwnerPending = phase.isOwnerPending ?? false;

    const existing = await prisma.traderMediaPhase.findUnique({
      where: { key: phase.key },
    });

    let row = existing;

    if (!row) {
      row = await prisma.traderMediaPhase.create({
        data: {
          key: phase.key,
          number,
          title: phase.title,
          intro: phase.intro ?? null,
          isOwnerPending,
          sortOrder,
        },
      });
      phasesCreated++;
    } else if (
      // Structural fields only. `title` and `intro` are deliberately NOT synced
      // — those are the fields the user edits in the app, and re-running the
      // seed must never quietly revert their wording. `isOwnerPending` IS
      // synced (see module doc) since it's not user-editable.
      !row.isCustom &&
      (row.number !== number ||
        row.sortOrder !== sortOrder ||
        row.isOwnerPending !== isOwnerPending)
    ) {
      row = await prisma.traderMediaPhase.update({
        where: { id: row.id },
        data: { number, sortOrder, isOwnerPending },
      });
      phasesReordered++;
    }

    phaseIdByKey.set(phase.key, row.id);

    for (const [index, step] of phase.steps.entries()) {
      const key = `${phase.key}-${step.key}`;
      const stepSortOrder = (index + 1) * 100;
      const found = await prisma.traderMediaStep.findUnique({ where: { key } });

      if (found) {
        // Same rule as phases: reposition, never reword.
        if (!found.isCustom && found.sortOrder !== stepSortOrder) {
          await prisma.traderMediaStep.update({
            where: { id: found.id },
            data: { sortOrder: stepSortOrder },
          });
        }
        continue;
      }

      await prisma.traderMediaStep.create({
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
    const found = await prisma.traderMediaMistake.findFirst({
      where: { text: mistake.text, phaseId },
    });
    if (found) continue;

    await prisma.traderMediaMistake.create({
      data: { text: mistake.text, phaseId, sortOrder: (index + 1) * 100 },
    });
    mistakesCreated++;
  }

  for (const [index, item] of SETUP_ITEMS.entries()) {
    const found = await prisma.traderMediaSetupItem.findUnique({ where: { key: item.key } });
    if (found) continue; // never touch `done`/`doneAt` on an existing row — that's the user's own progress

    await prisma.traderMediaSetupItem.create({
      data: { key: item.key, text: item.text, sortOrder: (index + 1) * 100 },
    });
    setupItemsCreated++;
  }

  const totalSteps = await prisma.traderMediaStep.count();
  const totalPhases = await prisma.traderMediaPhase.count();
  console.log(
    `Trader Media seed complete — created ${phasesCreated} phase(s), ` +
      `${stepsCreated} step(s), ${mistakesCreated} mistake(s), ` +
      `${setupItemsCreated} setup item(s); repositioned ${phasesReordered} phase(s). ` +
      `SOP now has ${totalPhases} phases / ${totalSteps} steps.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
