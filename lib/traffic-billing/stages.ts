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
  /**
   * Stage identity colour, drawn from COMMISSION_COLORS in lib/constants so no
   * new hues enter the system. Used for the rail marker, the active-phase bar
   * and the phase eyebrow — i.e. to say "which part of the month is this",
   * which is meaning, not decoration.
   *
   * Deliberately not red: the base design system reserves red for genuinely
   * late/dangerous states, so the final stage takes slate instead.
   */
  color: string;
  /** Inclusive phase-number range, used only when seeding. */
  from: number;
  to: number;
};

export const SOP_STAGES: Stage[] = [
  { key: "a", label: "Intake & Validation", color: "#2563EB", from: 1, to: 2 },
  { key: "b", label: "Accrual Load & Delta Review", color: "#0891B2", from: 3, to: 7 },
  { key: "c", label: "OEM Classification", color: "#7C3AED", from: 8, to: 10 },
  { key: "d", label: "Salesforce Account Data", color: "#0D9488", from: 11, to: 14 },
  { key: "e", label: "Pacing & Overbudget", color: "#D97706", from: 15, to: 20 },
  { key: "f", label: "TRFFK Rollup", color: "#DB2777", from: 21, to: 22 },
  { key: "g", label: "Management Fees", color: "#059669", from: 23, to: 26 },
  { key: "h", label: "Adjusted Data & Batch Prep", color: "#65A30D", from: 27, to: 35 },
  { key: "i", label: "Final Review & Send", color: "#6B7280", from: 36, to: 37 },
];

const BY_KEY = new Map(SOP_STAGES.map((s) => [s.key, s]));

export function stageColor(key: string): string {
  return BY_KEY.get(key)?.color ?? "#6B7280";
}

/** Unknown keys (a phase moved to a stage that was later removed) fall back. */
export function stageLabel(key: string): string {
  return BY_KEY.get(key)?.label ?? "Other";
}

export function stageOrder(key: string): number {
  const index = SOP_STAGES.findIndex((s) => s.key === key);
  return index === -1 ? SOP_STAGES.length : index;
}
