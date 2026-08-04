"use client";

import { useMemo } from "react";
import { stageColor, stageLabel, stageOrder } from "@/lib/traffic-billing/stages";
import { progressFor, type StateMap } from "@/lib/traffic-billing/progress";
import type { TbPhase } from "@/lib/types";
import { IconCheckCircle } from "../icons";

/**
 * The stage-grouped phase navigator.
 *
 * 37 phases is far too many for a flat list — grouping them into the SOP's own
 * nine workflow stages is what makes it scannable. Stages auto-expand around
 * wherever you are rather than needing to be opened manually, because the
 * common case is moving one phase at a time and having to click a stage open
 * every few steps would be pure friction.
 */
export function PhaseRail({
  phases,
  stateMap,
  activePhaseId,
  onSelect,
  issueCountByPhase,
}: {
  phases: TbPhase[];
  stateMap: StateMap;
  activePhaseId: number | null;
  onSelect: (phaseId: number) => void;
  issueCountByPhase: Map<number, number>;
}) {
  const stages = useMemo(() => {
    const map = new Map<string, TbPhase[]>();
    for (const phase of phases) {
      const bucket = map.get(phase.stageKey);
      if (bucket) bucket.push(phase);
      else map.set(phase.stageKey, [phase]);
    }
    return [...map.entries()]
      .sort((a, b) => stageOrder(a[0]) - stageOrder(b[0]))
      .map(([key, items]) => ({
        key,
        label: stageLabel(key),
        color: stageColor(key),
        phases: items,
      }));
  }, [phases]);

  return (
    <nav className="tb-rail" aria-label="SOP phases">
      {stages.map((stage) => {
        const stageProgress = progressFor(
          stage.phases.flatMap((p) => p.steps),
          stateMap
        );
        return (
          <section
            className="tb-rail-stage"
            key={stage.key}
            // Stage colour rides down as a custom property so the marker, the
            // active bar and the progress dot all read from one source.
            style={{ "--stage": stage.color } as React.CSSProperties}
          >
            <header className="tb-rail-stage-head">
              <span className="tb-rail-stage-dot" aria-hidden="true" />
              <span className="tb-rail-stage-label">{stage.label}</span>
              {stageProgress.complete ? (
                <span className="tb-rail-stage-done" title="Stage complete">
                  <IconCheckCircle size={13} />
                </span>
              ) : (
                <span className="tb-rail-stage-count">
                  {stageProgress.settled}/{stageProgress.total}
                </span>
              )}
            </header>

            <ul className="tb-rail-list">
              {stage.phases.map((phase) => {
                const progress = progressFor(phase.steps, stateMap);
                const issues = issueCountByPhase.get(phase.id) ?? 0;
                const active = phase.id === activePhaseId;
                const started = progress.settled > 0;

                const status = progress.complete
                  ? "complete"
                  : started
                    ? "started"
                    : "untouched";

                return (
                  <li key={phase.id}>
                    <button
                      type="button"
                      className={`tb-rail-item ${status}${active ? " active" : ""}`}
                      onClick={() => onSelect(phase.id)}
                      aria-current={active ? "true" : undefined}
                    >
                      <span className="tb-rail-num">{phase.number}</span>
                      <span className="tb-rail-title">{phase.title}</span>
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
          </section>
        );
      })}
    </nav>
  );
}
