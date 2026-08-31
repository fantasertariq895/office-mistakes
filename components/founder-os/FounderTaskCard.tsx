"use client";

import {
  FOUNDER_TASK_PRIORITIES,
  FOUNDER_TASK_PRIORITY_LABELS,
  FOUNDER_TASK_STATUSES,
  FOUNDER_TASK_STATUS_LABELS,
  type FounderTaskPriority,
  type FounderTaskStatus,
} from "@/lib/constants";
import { toDateInputValue } from "@/lib/date";
import type { FoTask } from "@/lib/types";
import { IconTrash } from "../icons";
import { EditableCell } from "./EditableCell";

/**
 * Move-without-drag: a status `<select>` rather than prev/next buttons.
 * Blocked can be reached from — and left to — any column, so "next/prev"
 * is the wrong mental model here; a select jumps straight to any of the 5
 * columns in one action, reusing the already-styled/already-accessible
 * `.status-select` verbatim from TaskRow.
 */
export function FounderTaskCard({
  task,
  onMove,
  onPriorityChange,
  onTitleSave,
  onDueDateChange,
  onDelete,
}: {
  task: FoTask;
  onMove: (status: FounderTaskStatus) => void;
  onPriorityChange: (priority: FounderTaskPriority) => void;
  onTitleSave: (title: string) => void;
  onDueDateChange: (date: string | null) => void;
  onDelete: () => void;
}) {
  return (
    <div className="fo-card list-row">
      <div className="fo-card-top">
        <EditableCell
          value={task.title}
          label={`Title for "${task.title}"`}
          onSave={onTitleSave}
          className="fo-card-title"
        />
        <div className="row-actions">
          <button
            type="button"
            className="btn btn-icon"
            onClick={onDelete}
            title="Delete"
            aria-label={`Delete "${task.title}"`}
          >
            <IconTrash size={13} />
          </button>
        </div>
      </div>

      <div className="fo-card-controls">
        <select
          className="status-select"
          aria-label={`Move "${task.title}"`}
          value={task.status}
          onChange={(e) => onMove(e.target.value as FounderTaskStatus)}
        >
          {FOUNDER_TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {FOUNDER_TASK_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          className="status-select"
          aria-label={`Priority for "${task.title}"`}
          value={task.priority}
          onChange={(e) => onPriorityChange(e.target.value as FounderTaskPriority)}
        >
          {FOUNDER_TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {FOUNDER_TASK_PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
      </div>

      <input
        type="date"
        className="input fo-card-date"
        aria-label={`Due date for "${task.title}"`}
        value={toDateInputValue(task.dueDate)}
        onChange={(e) => onDueDateChange(e.target.value || null)}
      />
    </div>
  );
}
