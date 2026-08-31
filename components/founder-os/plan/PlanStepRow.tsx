"use client";

import { useState } from "react";
import type { FounderPlanStepState } from "@/lib/constants";
import type { FoPlanStep } from "@/lib/types";
import { IconBan, IconPencil, IconTrash } from "../../icons";
import { InlineEdit } from "../../ui";

/**
 * One plan step. Tri-state control, same reasoning as every other
 * checklist in this app: a step that genuinely doesn't apply this time
 * (e.g. HST registration before $30k revenue) needs N/A, not a permanently
 * unreachable 100%. No `readOnly` — unlike Traffic Billing/Trader Media,
 * this checklist has no "completed run" to lock; it's one continuous plan.
 */
export function PlanStepRow({
  step,
  onSetState,
  onSetNote,
  onRename,
  onDelete,
}: {
  step: FoPlanStep;
  onSetState: (next: FounderPlanStepState) => void;
  onSetNote: (next: string | null) => void;
  onRename: (text: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [noteDraft, setNoteDraft] = useState(step.note ?? "");
  const [noteOpen, setNoteOpen] = useState(false);

  const done = step.state === "done";
  const na = step.state === "na";

  if (editing) {
    return (
      <div className="tb-step editing">
        <InlineEdit
          value={step.text}
          label="Edit step wording"
          onSave={(text) => {
            onRename(text);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className={`tb-step${done ? " done" : ""}${na ? " na" : ""}`}>
      <div className="tb-step-main">
        <input
          id={`fo-plan-step-${step.id}`}
          type="checkbox"
          className="check-box"
          checked={done}
          disabled={na}
          onChange={(e) => onSetState(e.target.checked ? "done" : "open")}
        />

        <label className="tb-step-text" htmlFor={`fo-plan-step-${step.id}`}>
          {step.text}
          {(step.isHighRisk || na || step.isCustom) && (
            <span className="check-meta">
              {step.isHighRisk && <span className="badge danger">Key milestone</span>}
              {na && <span className="badge plain">Not applicable</span>}
              {step.isCustom && <span className="badge plain">Added</span>}
            </span>
          )}
        </label>

        <div className="tb-step-actions">
          <button
            type="button"
            className={`tb-na-btn${na ? " on" : ""}`}
            aria-pressed={na}
            onClick={() => onSetState(na ? "open" : "na")}
            title={na ? "This step does apply after all" : "Mark not applicable"}
            aria-label={na ? `Mark "${step.text}" as applicable again` : `Mark "${step.text}" not applicable`}
          >
            <IconBan size={14} />
          </button>
          <button
            type="button"
            className={`btn btn-icon${step.note ? " has-note" : ""}`}
            onClick={() => setNoteOpen((v) => !v)}
            aria-expanded={noteOpen}
            title={step.note ? "Edit note" : "Add a note"}
            aria-label={`${step.note ? "Edit" : "Add"} note for "${step.text}"`}
          >
            <span aria-hidden="true" className="tb-note-glyph">
              {step.note ? "●" : "○"}
            </span>
          </button>
          <button
            type="button"
            className="btn btn-icon"
            onClick={() => setEditing(true)}
            title="Edit wording"
            aria-label={`Edit "${step.text}"`}
          >
            <IconPencil size={14} />
          </button>
          <button
            type="button"
            className="btn btn-icon"
            onClick={onDelete}
            title="Delete step"
            aria-label={`Delete "${step.text}"`}
          >
            <IconTrash size={14} />
          </button>
        </div>
      </div>

      {step.notes.length > 0 && (
        <ul className="tb-step-notes">
          {step.notes.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}

      {step.note && !noteOpen && <p className="tb-step-note-saved">{step.note}</p>}

      {noteOpen && (
        <form
          className="tb-note-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSetNote(noteDraft.trim() || null);
            setNoteOpen(false);
          }}
        >
          <label className="visually-hidden" htmlFor={`fo-plan-note-${step.id}`}>
            Note for this step
          </label>
          <textarea
            id={`fo-plan-note-${step.id}`}
            className="input"
            rows={2}
            value={noteDraft}
            placeholder="What did you find?"
            onChange={(e) => setNoteDraft(e.target.value)}
          />
          <div className="row">
            <button type="submit" className="btn btn-sm btn-primary">
              Save note
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setNoteDraft(step.note ?? "");
                setNoteOpen(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
