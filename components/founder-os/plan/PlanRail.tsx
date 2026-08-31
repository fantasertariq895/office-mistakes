"use client";

import { FOUNDER_PLAN_ACCENT_COLOR } from "@/lib/constants";
import { progressFor } from "@/lib/founder-os/plan-progress";
import type { FoPlanPhase } from "@/lib/types";

/** Flat rail (no stage grouping — 13 phases doesn't need it), mirroring components/trader-media/PhaseRail.tsx. */
export function PlanRail({
  phases,
  activePhaseId,
  onSelect,
}: {
  phases: FoPlanPhase[];
  activePhaseId: number | null;
  onSelect: (phaseId: number) => void;
}) {
  return (
    <nav
      className="tb-rail"
      aria-label="90-day plan phases"
      style={{ "--stage": FOUNDER_PLAN_ACCENT_COLOR } as React.CSSProperties}
    >
      <ul className="tb-rail-list">
        {phases.map((phase) => {
          const progress = progressFor(phase.steps);
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
                  {phase.title}
                  {phase.dayRange && <span className="fo-plan-rail-days">{phase.dayRange}</span>}
                </span>
                <span className="tb-rail-meta" aria-hidden="true">
                  {progress.complete ? "✓" : `${progress.settled}/${progress.total}`}
                </span>
                <span className="visually-hidden">
                  {progress.complete ? "complete" : `${progress.settled} of ${progress.total} steps settled`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
