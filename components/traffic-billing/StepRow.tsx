"use client";

import { useState } from "react";
import type { TbStepState } from "@/lib/constants";
import type { TbStep } from "@/lib/types";
import { IconBan, IconPencil, IconTrash } from "../icons";
import { InlineEdit } from "../ui";

/**
 * One SOP step.
 *
 * The control is tri-state, not a checkbox: the checkbox ticks/unticks, and a
 * separate N/A button marks the step as legitimately not applicable this
 * month. The SOP says "where applicable" throughout — without N/A, a month
 * that skipped (say) the US branch could never read as finished, and a
 * progress number you can't reach is a progress number people stop believing.
 *
 * Read-only mode is used for completed runs: history stays legible but can't
 * be silently rewritten months later.
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
  step: TbStep;
  state: TbStepState;
  note: string | null;
  readOnly: boolean;
  onSetState: (next: TbStepState) => void;
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
          id={`tb-step-${step.id}`}
          type="checkbox"
          className="check-box"
          checked={done}
          disabled={readOnly || na}
          onChange={(e) => onSetState(e.target.checked ? "done" : "open")}
        />

        <label className="tb-step-text" htmlFor={`tb-step-${step.id}`}>
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
              title={na ? "This step does apply after all" : "Mark not applicable this month"}
              aria-label={
                na
                  ? `Mark "${step.text}" as applicable again`
                  : `Mark "${step.text}" not applicable this month`
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
          <label className="visually-hidden" htmlFor={`tb-note-${step.id}`}>
            Note for this step
          </label>
          <textarea
            id={`tb-note-${step.id}`}
            className="input"
            rows={2}
            value={noteDraft}
            placeholder="What did you find? e.g. which account caused the Delta…"
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
