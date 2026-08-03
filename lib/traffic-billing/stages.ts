/**
 * Stage grouping for the phase rail.
 *
 * Split out from sop-template.ts on purpose: the client needs the stage
 * *labels* to render the rail, but has no use for the ~300-step seed content.
 * Keeping these separate means importing labels doesn't drag the whole SOP
 * into the browser bundle.
 */

export type Stage = {
  key: string;
  label: string;
  /** Inclusive phase-number range, used only when seeding. */
  from: number;
  to: number;
};

export const SOP_STAGES: Stage[] = [
  { key: "a", label: "Intake & Validation", from: 1, to: 2 },
  { key: "b", label: "Accrual Load & Delta Review", from: 3, to: 7 },
  { key: "c", label: "OEM Classification", from: 8, to: 10 },
  { key: "d", label: "Salesforce Account Data", from: 11, to: 14 },
  { key: "e", label: "Pacing & Overbudget", from: 15, to: 20 },
  { key: "f", label: "TRFFK Rollup", from: 21, to: 22 },
  { key: "g", label: "Management Fees", from: 23, to: 26 },
  { key: "h", label: "Adjusted Data & Batch Prep", from: 27, to: 35 },
  { key: "i", label: "Final Review & Send", from: 36, to: 37 },
];

const BY_KEY = new Map(SOP_STAGES.map((s) => [s.key, s]));

/** Unknown keys (a phase moved to a stage that was later removed) fall back. */
export function stageLabel(key: string): string {
  return BY_KEY.get(key)?.label ?? "Other";
}

export function stageOrder(key: string): number {
  const index = SOP_STAGES.findIndex((s) => s.key === key);
  return index === -1 ? SOP_STAGES.length : index;
}
