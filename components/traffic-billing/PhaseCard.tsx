"use client";

import { useMemo, useState } from "react";
import type { TbStepState } from "@/lib/constants";
import { progressFor, stateOf, type StateMap } from "@/lib/traffic-billing/progress";
import { stageColor, stageLabel } from "@/lib/traffic-billing/stages";
import type { TbIssue, TbMistake, TbPhase } from "@/lib/types";
import {
  IconAlert,
  IconArrowLeft,
  IconArrowRight,
  IconCheckCircle,
  IconPencil,
  IconTrash,
} from "../icons";
import { InlineAdd, InlineEdit } from "../ui";
import { TbProgressBar, TbProgressLabel } from "./ProgressBar";
import { StepRow } from "./StepRow";

type Handlers = {
  setStepState: (stepId: number, next: TbStepState) => void;
  setStepNote: (stepId: number, next: string | null) => void;
  renameStep: (stepId: number, text: string) => void;
  deleteStep: (stepId: number) => void;
  addStep: (phaseId: number, text: string, groupLabel: string | null) => Promise<void>;
  renamePhase: (phaseId: number, title: string) => void;
  setPhaseState: (phaseId: number, next: TbStepState) => void;
  addMistake: (phaseId: number, text: string) => Promise<void>;
  deleteMistake: (id: number) => void;
  addIssue: (phaseId: number, text: string) => Promise<void>;
  toggleIssue: (id: number, resolved: boolean) => void;
  deleteIssue: (id: number) => void;
};

export function PhaseCard({
  phase,
  stateMap,
  globalMistakes,
  issues,
  readOnly,
  position,
  onPrev,
  onNext,
  handlers,
}: {
  phase: TbPhase;
  stateMap: StateMap;
  globalMistakes: TbMistake[];
  issues: TbIssue[];
  readOnly: boolean;
  position: { index: number; total: number; hasPrev: boolean; hasNext: boolean };
  onPrev: () => void;
  onNext: () => void;
  handlers: Handlers;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [showGlobal, setShowGlobal] = useState(false);
  const [confirmNext, setConfirmNext] = useState(false);

  const progress = progressFor(phase.steps, stateMap);

  /**
   * Steps carry their sub-heading inline; group consecutive runs of the same
   * label so "Performance Max Classification" prints once, above its block,
   * the way it reads in the SOP.
   */
  const groups = useMemo(() => {
    const out: { label: string | null; steps: TbPhase["steps"] }[] = [];
    for (const step of phase.steps) {
      const label = step.groupLabel ?? null;
      const last = out[out.length - 1];
      if (last && last.label === label) last.steps.push(step);
      else out.push({ label, steps: [step] });
    }
    return out;
  }, [phase.steps]);

  const openIssues = issues.filter((i) => !i.resolved);

  /**
   * Soft gating, not hard. The SOP says "do not continue until…", but hard
   * blocking a 300-step process on incomplete data just teaches people to
   * tick boxes they haven't done — which is strictly worse than an honest
   * partial. So: warn once, then let them through.
   */
  const handleNext = () => {
    if (!progress.complete && !confirmNext && !readOnly) {
      setConfirmNext(true);
      return;
    }
    setConfirmNext(false);
    onNext();
  };

  return (
    <article className="tb-phase card">
      <header
        className="tb-phase-head"
        style={{ "--stage": stageColor(phase.stageKey) } as React.CSSProperties}
      >
        <span className="tb-phase-numeral" aria-hidden="true">
          {String(phase.number).padStart(2, "0")}
        </span>
        <div className="tb-phase-heading">
          <span className="tb-phase-badge">
            <span className="tb-phase-stage">{stageLabel(phase.stageKey)}</span>
            <span className="tb-phase-of">
              Phase {phase.number} of {position.total}
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
              {!readOnly && (
                <button
                  type="button"
                  className="btn btn-icon"
                  onClick={() => setEditingTitle(true)}
                  title="Edit phase title"
                  aria-label={`Edit the title of phase ${phase.number}`}
                >
                  <IconPencil size={13} />
                </button>
              )}
            </h2>
          )}
        </div>

        <div className="tb-phase-progress">
          <TbProgressBar
            progress={progress}
            label={`${progress.settled} of ${progress.total} steps settled in this phase`}
          />
          <TbProgressLabel progress={progress} />
        </div>

        {!readOnly && (
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
              title="This whole phase doesn't apply to this billing month"
            >
              Phase N/A
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
        )}
      </header>

      {phase.intro && <p className="tb-phase-intro">{phase.intro}</p>}

      <div className="tb-steps">
        {groups.map((group, gi) => (
          <div className="tb-step-group" key={`${group.label ?? "none"}-${gi}`}>
            {group.label && <div className="checklist-group-label">{group.label}</div>}
            {group.steps.map((step) => (
              <StepRow
                key={step.id}
                step={step}
                state={stateOf(stateMap, step.id)}
                note={stateMap.get(step.id)?.note ?? null}
                readOnly={readOnly}
                onSetState={(next) => handlers.setStepState(step.id, next)}
                onSetNote={(next) => handlers.setStepNote(step.id, next)}
                onRename={(text) => handlers.renameStep(step.id, text)}
                onDelete={() => handlers.deleteStep(step.id)}
              />
            ))}
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="tb-add-step">
          <InlineAdd
            placeholder="Add a step to this phase…"
            label={`Add a step to phase ${phase.number}`}
            onAdd={(text) =>
              handlers.addStep(
                phase.id,
                text,
                // Inherit the last sub-heading so an added step lands in the
                // block it belongs to rather than orphaned at the bottom.
                phase.steps[phase.steps.length - 1]?.groupLabel ?? null
              )
            }
          />
        </div>
      )}

      {/* ------------------------------------------- mistakes to avoid --- */}
      <section className="tb-mistakes" aria-label="Mistakes to avoid in this phase">
        <header className="tb-mistakes-head">
          <IconAlert size={15} />
          <h3>Mistakes to avoid here</h3>
        </header>

        {phase.mistakes.length === 0 ? (
          <p className="tb-mistakes-empty">
            Nothing specific flagged for this phase in the SOP.
          </p>
        ) : (
          <ul className="tb-mistakes-list">
            {phase.mistakes.map((mistake) => (
              <li key={mistake.id}>
                <span>{mistake.text}</span>
                {!readOnly && (
                  <button
                    type="button"
                    className="btn btn-icon"
                    onClick={() => handlers.deleteMistake(mistake.id)}
                    title="Remove"
                    aria-label={`Remove "${mistake.text}"`}
                  >
                    <IconTrash size={13} />
                  </button>
                )}
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
              {showGlobal ? "Hide" : "Show"} the {globalMistakes.length} rules that apply
              throughout
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

        {!readOnly && (
          <InlineAdd
            placeholder="Add a mistake to avoid in this phase…"
            label={`Add a mistake to avoid for phase ${phase.number}`}
            onAdd={(text) => handlers.addMistake(phase.id, text)}
          />
        )}
      </section>

      {/* --------------------------------------------- issues this run --- */}
      <section className="tb-issues" aria-label="Issues logged in this phase">
        <header className="tb-issues-head">
          <h3>What went wrong this month</h3>
          {openIssues.length > 0 && (
            <span className="count-pill danger">{openIssues.length}</span>
          )}
        </header>

        {issues.length > 0 && (
          <ul className="tb-issues-list">
            {issues.map((issue) => (
              <li key={issue.id} className={issue.resolved ? "resolved" : undefined}>
                <input
                  type="checkbox"
                  className="check-box"
                  checked={issue.resolved}
                  disabled={readOnly}
                  onChange={(e) => handlers.toggleIssue(issue.id, e.target.checked)}
                  aria-label={`Mark "${issue.text}" resolved`}
                />
                <span>{issue.text}</span>
                {!readOnly && (
                  <button
                    type="button"
                    className="btn btn-icon"
                    onClick={() => handlers.deleteIssue(issue.id)}
                    title="Delete"
                    aria-label={`Delete "${issue.text}"`}
                  >
                    <IconTrash size={13} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {!readOnly && (
          <InlineAdd
            placeholder="Log something that went wrong here…"
            label={`Log an issue in phase ${phase.number}`}
            buttonLabel="Log"
            onAdd={(text) => handlers.addIssue(phase.id, text)}
          />
        )}
      </section>

      {/* -------------------------------------------------- navigation --- */}
      <footer className="tb-phase-nav">
        <button
          type="button"
          className="btn btn-sm"
          onClick={onPrev}
          disabled={!position.hasPrev}
        >
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
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => setConfirmNext(false)}
            >
              Stay
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={handleNext}
            disabled={!position.hasNext}
          >
            {progress.complete && <IconCheckCircle size={14} />}
            Next phase
            <IconArrowRight size={14} />
          </button>
        )}
      </footer>
    </article>
  );
}
