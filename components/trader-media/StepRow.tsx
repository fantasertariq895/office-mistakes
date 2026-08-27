"use client";

import { useState } from "react";
import type { TmStepState } from "@/lib/constants";
import type { TmStep } from "@/lib/types";
import { IconBan, IconPencil, IconTrash } from "../icons";
import { InlineEdit } from "../ui";

/**
 * One SOP step. Verbatim mirror of components/traffic-billing/StepRow.tsx —
 * see that file's doc comment for why the control is tri-state, not a
 * checkbox, and why read-only mode exists.
 */
export function StepRow({
  step,
  state,
  note,
  readOnly,
  onSetState,
  onSetNote,
  onRename,
  onDelete,
}: {
  step: TmStep;
  state: TmStepState;
  note: string | null;
  readOnly: boolean;
  onSetState: (next: TmStepState) => void;
  onSetNote: (next: string | null) => void;
  onRename: (text: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [noteDraft, setNoteDraft] = useState(note ?? "");
  const [noteOpen, setNoteOpen] = useState(false);

  const done = state === "done";
  const na = state === "na";

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
          id={`tm-step-${step.id}`}
          type="checkbox"
          className="check-box"
          checked={done}
          disabled={readOnly || na}
          onChange={(e) => onSetState(e.target.checked ? "done" : "open")}
        />

        <label className="tb-step-text" htmlFor={`tm-step-${step.id}`}>
          {step.text}
          {(step.isHighRisk || na || step.isCustom) && (
            <span className="check-meta">
              {step.isHighRisk && <span className="badge danger">High risk</span>}
              {na && <span className="badge plain">Not applicable</span>}
              {step.isCustom && <span className="badge plain">Added</span>}
            </span>
          )}
        </label>

        {!readOnly && (
          <div className="tb-step-actions">
            <button
              type="button"
              className={`tb-na-btn${na ? " on" : ""}`}
              aria-pressed={na}
              onClick={() => onSetState(na ? "open" : "na")}
              title={na ? "This step does apply after all" : "Mark not applicable this week"}
              aria-label={
                na
                  ? `Mark "${step.text}" as applicable again`
                  : `Mark "${step.text}" not applicable this week`
              }
            >
              <IconBan size={14} />
            </button>
            <button
              type="button"
              className={`btn btn-icon${note ? " has-note" : ""}`}
              onClick={() => setNoteOpen((v) => !v)}
              aria-expanded={noteOpen}
              title={note ? "Edit note" : "Add a note"}
              aria-label={`${note ? "Edit" : "Add"} note for "${step.text}"`}
            >
              <span aria-hidden="true" className="tb-note-glyph">
                {note ? "●" : "○"}
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
        )}
      </div>

      {/* Reference bullets from the SOP — context, never work to tick off. */}
      {step.notes.length > 0 && (
        <ul className="tb-step-notes">
          {step.notes.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}

      {note && !noteOpen && <p className="tb-step-note-saved">{note}</p>}

      {noteOpen && !readOnly && (
        <form
          className="tb-note-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSetNote(noteDraft.trim() || null);
            setNoteOpen(false);
          }}
        >
          <label className="visually-hidden" htmlFor={`tm-note-${step.id}`}>
            Note for this step
          </label>
          <textarea
            id={`tm-note-${step.id}`}
            className="input"
            rows={2}
            value={noteDraft}
            placeholder="What did you find? e.g. which tab was off…"
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
                setNoteDraft(note ?? "");
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
