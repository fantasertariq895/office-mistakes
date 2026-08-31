"use client";

import { useMemo, useState } from "react";
import type { FounderPlanStepState } from "@/lib/constants";
import { FOUNDER_PLAN_ACCENT_COLOR } from "@/lib/constants";
import { progressFor } from "@/lib/founder-os/plan-progress";
import type { FoPlanMistake, FoPlanPhase } from "@/lib/types";
import { IconAlert, IconArrowLeft, IconArrowRight, IconCheckCircle, IconPencil, IconTrash } from "../../icons";
import { InlineAdd, InlineEdit } from "../../ui";
import { PlanProgressBar, PlanProgressLabel } from "./PlanProgressBar";
import { PlanStepRow } from "./PlanStepRow";

type Handlers = {
  setStepState: (stepId: number, next: FounderPlanStepState) => void;
  setStepNote: (stepId: number, next: string | null) => void;
  renameStep: (stepId: number, text: string) => void;
  deleteStep: (stepId: number) => void;
  addStep: (phaseId: number, text: string, groupLabel: string | null) => Promise<void>;
  renamePhase: (phaseId: number, title: string) => void;
  setPhaseState: (phaseId: number, next: FounderPlanStepState) => void;
  addMistake: (phaseId: number, text: string) => Promise<void>;
  deleteMistake: (id: number) => void;
};

export function PlanCard({
  phase,
  globalMistakes,
  position,
  onPrev,
  onNext,
  handlers,
}: {
  phase: FoPlanPhase;
  globalMistakes: FoPlanMistake[];
  position: { index: number; total: number; hasPrev: boolean; hasNext: boolean };
  onPrev: () => void;
  onNext: () => void;
  handlers: Handlers;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [showGlobal, setShowGlobal] = useState(false);
  const [confirmNext, setConfirmNext] = useState(false);

  const progress = progressFor(phase.steps);

  const groups = useMemo(() => {
    const out: { label: string | null; steps: FoPlanPhase["steps"] }[] = [];
    for (const step of phase.steps) {
      const label = step.groupLabel ?? null;
      const last = out[out.length - 1];
      if (last && last.label === label) last.steps.push(step);
      else out.push({ label, steps: [step] });
    }
    return out;
  }, [phase.steps]);

  const handleNext = () => {
    if (!progress.complete && !confirmNext) {
      setConfirmNext(true);
      return;
    }
    setConfirmNext(false);
    onNext();
  };

  return (
    <article className="tb-phase card">
      <header className="tb-phase-head" style={{ "--stage": FOUNDER_PLAN_ACCENT_COLOR } as React.CSSProperties}>
        <span className="tb-phase-numeral" aria-hidden="true">
          {String(phase.number).padStart(2, "0")}
        </span>
        <div className="tb-phase-heading">
          <span className="tb-phase-badge">
            {phase.dayRange && <span className="tb-phase-stage">{phase.dayRange}</span>}
            <span className="tb-phase-of">
              Week {phase.number} of {position.total}
            </span>
          </span>
          {editingTitle ? (
            <InlineEdit
              value={phase.title}
              label="Edit phase title"
              onSave={(title) => {
                handlers.renamePhase(phase.id, title);
                setEditingTitle(false);
              }}
              onCancel={() => setEditingTitle(false)}
            />
          ) : (
            <h2 className="tb-phase-title">
              {phase.title}
              <button
                type="button"
                className="btn btn-icon"
                onClick={() => setEditingTitle(true)}
                title="Edit phase title"
                aria-label={`Edit the title of ${phase.title}`}
              >
                <IconPencil size={13} />
              </button>
            </h2>
          )}
        </div>

        <div className="tb-phase-progress">
          <PlanProgressBar progress={progress} label={`${progress.settled} of ${progress.total} steps settled this week`} />
          <PlanProgressLabel progress={progress} />
        </div>

        <div className="tb-phase-bulk">
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => handlers.setPhaseState(phase.id, "done")}
            disabled={progress.done === progress.total}
          >
            Mark all done
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => handlers.setPhaseState(phase.id, "na")}
            title="This whole week doesn't apply"
          >
            Week N/A
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => handlers.setPhaseState(phase.id, "open")}
            disabled={progress.settled === 0}
          >
            Reset
          </button>
        </div>
      </header>

      {phase.intro && <p className="tb-phase-intro">{phase.intro}</p>}

      <div className="tb-steps">
        {groups.map((group, gi) => (
          <div className="tb-step-group" key={`${group.label ?? "none"}-${gi}`}>
            {group.label && <div className="checklist-group-label">{group.label}</div>}
            {group.steps.map((step) => (
              <PlanStepRow
                key={step.id}
                step={step}
                onSetState={(next) => handlers.setStepState(step.id, next)}
                onSetNote={(next) => handlers.setStepNote(step.id, next)}
                onRename={(text) => handlers.renameStep(step.id, text)}
                onDelete={() => handlers.deleteStep(step.id)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="tb-add-step">
        <InlineAdd
          placeholder="Add a step to this week…"
          label={`Add a step to ${phase.title}`}
          onAdd={(text) =>
            handlers.addStep(phase.id, text, phase.steps[phase.steps.length - 1]?.groupLabel ?? null)
          }
        />
      </div>

      <section className="tb-mistakes" aria-label="Mistakes to avoid in this phase">
        <header className="tb-mistakes-head">
          <IconAlert size={15} />
          <h3>Mistakes to avoid here</h3>
        </header>

        {phase.mistakes.length === 0 ? (
          <p className="tb-mistakes-empty">Nothing specific flagged for this week.</p>
        ) : (
          <ul className="tb-mistakes-list">
            {phase.mistakes.map((mistake) => (
              <li key={mistake.id}>
                <span>{mistake.text}</span>
                <button
                  type="button"
                  className="btn btn-icon"
                  onClick={() => handlers.deleteMistake(mistake.id)}
                  title="Remove"
                  aria-label={`Remove "${mistake.text}"`}
                >
                  <IconTrash size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {globalMistakes.length > 0 && (
          <>
            <button
              type="button"
              className="tb-global-toggle"
              onClick={() => setShowGlobal((v) => !v)}
              aria-expanded={showGlobal}
            >
              {showGlobal ? "Hide" : "Show"} the {globalMistakes.length} rules that apply throughout
            </button>
            {showGlobal && (
              <ul className="tb-mistakes-list global">
                {globalMistakes.map((m) => (
                  <li key={m.id}>
                    <span>{m.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <InlineAdd
          placeholder="Add a mistake to avoid this week…"
          label={`Add a mistake to avoid for ${phase.title}`}
          onAdd={(text) => handlers.addMistake(phase.id, text)}
        />
      </section>

      <footer className="tb-phase-nav">
        <button type="button" className="btn btn-sm" onClick={onPrev} disabled={!position.hasPrev}>
          <IconArrowLeft size={14} />
          Previous
        </button>

        <span className="tb-phase-position">
          {position.index + 1} of {position.total}
        </span>

        {confirmNext ? (
          <div className="tb-confirm-next" role="alert">
            <span>
              {progress.open} step{progress.open === 1 ? "" : "s"} still open here.
            </span>
            <button type="button" className="btn btn-sm btn-primary" onClick={handleNext}>
              Continue anyway
            </button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setConfirmNext(false)}>
              Stay
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-sm btn-primary" onClick={handleNext} disabled={!position.hasNext}>
            {progress.complete && <IconCheckCircle size={14} />}
            Next week
            <IconArrowRight size={14} />
          </button>
        )}
      </footer>
    </article>
  );
}
