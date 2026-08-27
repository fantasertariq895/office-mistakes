"use client";

import { progressFor, type StateMap } from "@/lib/trader-media/progress";
import { TM_ACCENT_COLOR } from "@/lib/constants";
import type { TmPhase } from "@/lib/types";
import { IconUser } from "../icons";

/**
 * The phase navigator. Unlike Traffic Billing's PhaseRail, this is a flat
 * list, not grouped into stages — 13 phases is small enough that a stage
 * layer would be pure overhead with nothing to organize.
 */
export function PhaseRail({
  phases,
  stateMap,
  activePhaseId,
  onSelect,
  issueCountByPhase,
}: {
  phases: TmPhase[];
  stateMap: StateMap;
  activePhaseId: number | null;
  onSelect: (phaseId: number) => void;
  issueCountByPhase: Map<number, number>;
}) {
  return (
    <nav
      className="tb-rail"
      aria-label="SOP phases"
      style={{ "--stage": TM_ACCENT_COLOR } as React.CSSProperties}
    >
      <ul className="tb-rail-list">
        {phases.map((phase) => {
          const progress = progressFor(phase.steps, stateMap);
          const issues = issueCountByPhase.get(phase.id) ?? 0;
          const active = phase.id === activePhaseId;
          const started = progress.settled > 0;

          const status = progress.complete ? "complete" : started ? "started" : "untouched";

          return (
            <li key={phase.id}>
              <button
                type="button"
                className={`tb-rail-item ${status}${active ? " active" : ""}`}
                onClick={() => onSelect(phase.id)}
                aria-current={active ? "true" : undefined}
              >
                <span className="tb-rail-num">{phase.number}</span>
                <span className="tb-rail-title">
                  {phase.isOwnerPending && (
                    <IconUser
                      size={11}
                      aria-label="Not yet yours — Yuvika owns this"
                      style={{ marginRight: 4, verticalAlign: "-1px" }}
                    />
                  )}
                  {phase.title}
                </span>
                {issues > 0 && (
                  <span
                    className="tb-rail-issue"
                    title={`${issues} open issue${issues === 1 ? "" : "s"}`}
                  >
                    {issues}
                  </span>
                )}
                <span className="tb-rail-meta" aria-hidden="true">
                  {progress.complete ? "✓" : `${progress.settled}/${progress.total}`}
                </span>
                <span className="visually-hidden">
                  {progress.complete
                    ? "complete"
                    : `${progress.settled} of ${progress.total} steps settled`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
