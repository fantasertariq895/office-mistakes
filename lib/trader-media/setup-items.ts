/**
 * "Access / Things You Need" — one-time setup, not a weekly task. Kept as its
 * own module rather than folded into sop-template.ts because it's a
 * completely different lifecycle: seeded once, never reordered, no
 * phase/step relation, and checked off once ever (see TraderMediaSetupItem
 * in prisma/schema.prisma — it deliberately has no runId).
 */

export type SetupItemSeed = { key: string; text: string };

export const SETUP_ITEMS: SetupItemSeed[] = [
  {
    key: "sharedrive-access",
    text: "Get National Sales SLT ShareDrive access → Revenue Estimate → 2026",
  },
  {
    key: "placements-pio-export",
    text: "Learn how to manually export PIO data from the Placements dashboard",
  },
  {
    key: "salesforce-report-access",
    text: "Get Salesforce report access, or confirm the automated Monday forwarding is set up",
  },
  {
    key: "bert-distribution-list",
    text: "Contact Todd Graham to be added to the BERT distribution list directly",
  },
  {
    key: "monday-1215-call",
    text: "Get the recurring Monday 12:15 PM sales/pipeline call invite",
  },
  {
    key: "monday-benoit-call",
    text: "Get the recurring Monday ~1:30–2:00 PM Benoit review call invite",
  },
];
