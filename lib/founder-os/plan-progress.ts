/**
 * Progress maths for the master 90-day Plan checklist. Simpler than
 * lib/trader-media/progress.ts's equivalent — there's no run/StateMap
 * layer since a step's state lives directly on the row (see
 * FounderPlanStep in prisma/schema.prisma), so this operates on FoPlanStep
 * arrays directly. Same rule as every other tri-state checklist in this
 * app: N/A counts as settled, not outstanding.
 */
import type { FoPlanPhase, FoPlanStep } from "@/lib/types";

export type Progress = {
  total: number;
  done: number;
  na: number;
  open: number;
  settled: number;
  percent: number;
  complete: boolean;
};

export function progressFor(steps: FoPlanStep[]): Progress {
  let done = 0;
  let na = 0;
  for (const step of steps) {
    if (step.state === "done") done++;
    else if (step.state === "na") na++;
  }
  const total = steps.length;
  const settled = done + na;
  const open = total - settled;
  return {
    total,
    done,
    na,
    open,
    settled,
    percent: total === 0 ? 0 : Math.round((settled / total) * 100),
    complete: total > 0 && open === 0,
  };
}

export function overallProgress(phases: FoPlanPhase[]): Progress {
  return progressFor(phases.flatMap((p) => p.steps));
}

/** The phase to land on: the first with outstanding work, else the last phase. */
export function firstOpenPhaseId(phases: FoPlanPhase[]): number | null {
  if (phases.length === 0) return null;
  const found = phases.find((p) => !progressFor(p.steps).complete);
  return (found ?? phases[phases.length - 1]).id;
}
