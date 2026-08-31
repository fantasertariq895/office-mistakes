/**
 * Seeds Founder OS Phase 2/3 content from lib/founder-os/seed-data.ts.
 *
 * Idempotent and non-destructive, same spirit as the other seed scripts in
 * this repo: rows with a stable unique key are matched on that key, so
 * re-running after an in-app edit never overwrites it and never duplicates.
 * Rows with no natural unique key (competitors, cost items, pricing tiers,
 * tech stack, risk items — all `isCustom`-flaggable) are seeded once by
 * matching on their seed-identifying field(s); once any row of that kind
 * exists, re-running is a no-op for that table, since after the first run
 * there's no reliable way to tell "unedited seed row" from "user's own
 * edit" without a key column, and guessing wrong would silently revert an
 * edit — the same failure mode every other seed script in this repo goes
 * out of its way to avoid.
 *
 *   npm run db:seed-founder-os
 */
import { PrismaClient } from "@prisma/client";
import {
  CHECKLISTS,
  COMPETITORS,
  COST_ITEMS,
  DOCUMENTS,
  MARKETING_WEEKS,
  PRICING_TIERS,
  RISK_ITEMS,
  SCORES,
  TECH_STACK,
  TEXT_BLOCKS,
} from "../lib/founder-os/seed-data";

const prisma = new PrismaClient();

async function main() {
  const counts: Record<string, number> = {};

  // Text blocks — keyed, safe to find-or-create.
  let textBlocksCreated = 0;
  for (const [i, block] of TEXT_BLOCKS.entries()) {
    const found = await prisma.founderTextBlock.findUnique({ where: { key: block.key } });
    if (found) continue;
    await prisma.founderTextBlock.create({
      data: {
        key: block.key,
        section: block.section,
        label: block.label,
        content: block.content ?? null,
        sortOrder: (i + 1) * 100,
      },
    });
    textBlocksCreated++;
  }
  counts.textBlocks = textBlocksCreated;

  // Scores — keyed.
  let scoresCreated = 0;
  for (const [i, score] of SCORES.entries()) {
    const found = await prisma.founderScore.findUnique({ where: { key: score.key } });
    if (found) continue;
    await prisma.founderScore.create({
      data: { key: score.key, label: score.label, score: 5, sortOrder: (i + 1) * 100 },
    });
    scoresCreated++;
  }
  counts.scores = scoresCreated;

  // Competitors — no natural key; seed once only, if the table is empty.
  const competitorCount = await prisma.founderCompetitor.count();
  if (competitorCount === 0) {
    for (const [i, c] of COMPETITORS.entries()) {
      await prisma.founderCompetitor.create({ data: { ...c, sortOrder: (i + 1) * 100 } });
    }
    counts.competitors = COMPETITORS.length;
  } else {
    counts.competitors = 0;
  }

  // Cost items — seed once only.
  const costCount = await prisma.founderCostItem.count();
  if (costCount === 0) {
    for (const [i, item] of COST_ITEMS.entries()) {
      await prisma.founderCostItem.create({ data: { ...item, sortOrder: (i + 1) * 100 } });
    }
    counts.costItems = COST_ITEMS.length;
  } else {
    counts.costItems = 0;
  }

  // Revenue months — keyed by monthNumber (unique), safe to find-or-create.
  let revenueMonthsCreated = 0;
  for (let m = 1; m <= 12; m++) {
    const found = await prisma.founderRevenueMonth.findUnique({ where: { monthNumber: m } });
    if (found) continue;
    await prisma.founderRevenueMonth.create({ data: { monthNumber: m } });
    revenueMonthsCreated++;
  }
  counts.revenueMonths = revenueMonthsCreated;

  // Pricing tiers — seed once only.
  const tierCount = await prisma.founderPricingTier.count();
  if (tierCount === 0) {
    for (const [i, tier] of PRICING_TIERS.entries()) {
      await prisma.founderPricingTier.create({
        data: { name: tier.name, description: tier.description || null, sortOrder: (i + 1) * 100 },
      });
    }
    counts.pricingTiers = PRICING_TIERS.length;
  } else {
    counts.pricingTiers = 0;
  }

  // Tech stack — seed once only.
  const techCount = await prisma.founderTechStackItem.count();
  if (techCount === 0) {
    for (const [i, item] of TECH_STACK.entries()) {
      await prisma.founderTechStackItem.create({
        data: { ...item, sortOrder: (i + 1) * 100 },
      });
    }
    counts.techStack = TECH_STACK.length;
  } else {
    counts.techStack = 0;
  }

  // Risk items — seed once only.
  const riskCount = await prisma.founderRiskItem.count();
  if (riskCount === 0) {
    for (const [i, item] of RISK_ITEMS.entries()) {
      await prisma.founderRiskItem.create({ data: { ...item, sortOrder: (i + 1) * 100 } });
    }
    counts.riskItems = RISK_ITEMS.length;
  } else {
    counts.riskItems = 0;
  }

  // Marketing weeks — keyed by weekNumber (unique).
  let marketingWeeksCreated = 0;
  for (const week of MARKETING_WEEKS) {
    const found = await prisma.founderMarketingWeek.findUnique({ where: { weekNumber: week.weekNumber } });
    if (found) continue;
    await prisma.founderMarketingWeek.create({ data: week });
    marketingWeeksCreated++;
  }
  counts.marketingWeeks = marketingWeeksCreated;

  // Checklists — keyed by `key`; items keyed by (checklistId, text) since
  // items have no natural unique slug of their own.
  let checklistsCreated = 0;
  let checklistItemsCreated = 0;
  for (const checklist of CHECKLISTS) {
    let row = await prisma.founderChecklist.findUnique({ where: { key: checklist.key } });
    if (!row) {
      row = await prisma.founderChecklist.create({ data: { key: checklist.key, title: checklist.title } });
      checklistsCreated++;
    }
    for (const [i, item] of checklist.items.entries()) {
      const found = await prisma.founderChecklistItem.findFirst({
        where: { checklistId: row.id, text: item.text },
      });
      if (found) continue;
      await prisma.founderChecklistItem.create({
        data: {
          checklistId: row.id,
          text: item.text,
          explanation: item.explanation ?? null,
          dayLabel: item.dayLabel ?? null,
          sortOrder: (i + 1) * 100,
        },
      });
      checklistItemsCreated++;
    }
  }
  counts.checklists = checklistsCreated;
  counts.checklistItems = checklistItemsCreated;

  // Documents — keyed.
  let documentsCreated = 0;
  for (const [i, doc] of DOCUMENTS.entries()) {
    const found = await prisma.founderDocument.findUnique({ where: { key: doc.key } });
    if (found) continue;
    await prisma.founderDocument.create({
      data: {
        key: doc.key,
        section: doc.section,
        title: doc.title,
        content: doc.content ?? null,
        sortOrder: (i + 1) * 100,
      },
    });
    documentsCreated++;
  }
  counts.documents = documentsCreated;

  console.log("Founder OS Phase 2/3 seed complete —", JSON.stringify(counts));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
