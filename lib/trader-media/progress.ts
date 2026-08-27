/**
 * Progress maths, shared by the rail, the header bar and the phase cards so
 * they can never disagree about what "done" means. Verbatim mirror of
 * lib/traffic-billing/progress.ts — see that file's doc comment for the full
 * reasoning behind N/A counting as settled, not outstanding.
 */
import type { TmStepState } from "@/lib/constants";
import type { TmPhase, TmStepStateRow } from "@/lib/types";

export type Progress = {
  total: number;
  done: number;
  na: number;
  open: number;
  /** Everything that isn't still open. */
  settled: number;
  percent: number;
  complete: boolean;
};

export type StateMap = Map<number, { state: TmStepState; note: string | null }>;

export function buildStateMap(states: TmStepStateRow[]): StateMap {
  return new Map(states.map((s) => [s.stepId, { state: s.state, note: s.note }]));
}

export function stateOf(map: StateMap, stepId: number): TmStepState {
  return map.get(stepId)?.state ?? "open";
}

export function progressFor(steps: { id: number }[], map: StateMap): Progress {
  let done = 0;
  let na = 0;
  for (const step of steps) {
    const state = stateOf(map, step.id);
    if (state === "done") done++;
    else if (state === "na") na++;
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

export function overallProgress(phases: TmPhase[], map: StateMap): Progress {
  return progressFor(phases.flatMap((p) => p.steps), map);
}

/**
 * The phase to land on when the workspace opens: the first with outstanding
 * work, falling back to the last phase once everything is settled.
 */
export function firstOpenPhaseId(phases: TmPhase[], map: StateMap): number | null {
  if (phases.length === 0) return null;
  const found = phases.find((p) => !progressFor(p.steps, map).complete);
  return (found ?? phases[phases.length - 1]).id;
}
