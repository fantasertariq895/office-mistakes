"use client";

import { useRef, useState, type KeyboardEvent } from "react";

/**
 * A click-to-edit text cell for dense table rows (Pipeline) and cards
 * (Kanban). Same keyboard contract as `InlineEdit` (Enter=save,
 * Escape=cancel, autofocus) but commits on blur too and has no visible
 * Save/Cancel buttons — `InlineEdit`'s button chrome is too heavy at
 * 7-column table density and breaks row alignment when only one cell is
 * being edited.
 *
 * `committedRef` guards against a double-commit: pressing Enter sets
 * `editing` false, which unmounts the input, which can itself trigger a
 * trailing blur — without the guard that blur would fire onSave a second
 * time against the (by-then-stale) `value` prop.
 */
export function EditableCell({
  value,
  label,
  placeholder,
  onSave,
  className,
}: {
  value: string;
  /** Real label text — used as the aria-label, not shown visually. */
  label: string;
  placeholder?: string;
  onSave: (next: string) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const committedRef = useRef(false);

  const startEditing = () => {
    setDraft(value);
    committedRef.current = false;
    setEditing(true);
  };

  const commit = () => {
    if (committedRef.current) return;
    committedRef.current = true;
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== value) onSave(trimmed);
  };

  const cancel = () => {
    committedRef.current = true; // suppress the trailing blur-commit
    setDraft(value);
    setEditing(false);
  };

  const keys = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  if (editing) {
    return (
      <input
        className={`input fo-editable-input${className ? ` ${className}` : ""}`}
        autoFocus
        value={draft}
        aria-label={label}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={keys}
        onBlur={commit}
      />
    );
  }

  return (
    <button
      type="button"
      className={`fo-editable-cell${className ? ` ${className}` : ""}`}
      onClick={startEditing}
      aria-label={`Edit ${label}`}
    >
      {value ? value : <span className="fo-editable-placeholder">{placeholder ?? "—"}</span>}
    </button>
  );
}
