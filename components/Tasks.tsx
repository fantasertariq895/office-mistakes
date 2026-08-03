"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { api } from "@/lib/client";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/constants";
import { localTodayInputValue, relativeDayLabel, toDateInputValue } from "@/lib/date";
import { isDueTodayTask, isOverdueTask } from "@/lib/task-utils";
import type { Task } from "@/lib/types";
import { useApp } from "./AppProvider";
import { CommissionPicker } from "./Board";
import { IconPencil, IconTrash } from "./icons";
import {
  Card,
  CommissionChip,
  Empty,
  ErrorState,
  Modal,
  SkeletonList,
} from "./ui";

/* ------------------------------------------------------------------ row --- */

export function TaskRow({
  task,
  onChanged,
  onEdit,
  compact,
}: {
  task: Task;
  onChanged: () => void;
  onEdit: (task: Task) => void;
  compact?: boolean;
}) {
  const { bump, pushToast, setCurrentCommissionId } = useApp();
  const [expanded, setExpanded] = useState(false);
  const overdue = isOverdueTask(task);
  const dueToday = isDueTodayTask(task);
  const completed = task.status === "completed";
  const hasDetail = Boolean(task.notes || task.description);

  const patch = async (body: Record<string, unknown>) => {
    try {
      await api.patch(`/api/tasks/${task.id}`, body);
      onChanged();
      bump();
    } catch (err) {
      pushToast({
        title: "Could not update task",
        body: err instanceof Error ? err.message : undefined,
        tone: "error",
      });
    }
  };

  const remove = async () => {
    try {
      await api.del(`/api/tasks/${task.id}`);
      onChanged();
      bump();
      pushToast({
        title: "Task deleted",
        body: task.title,
        tone: "success",
        undo: {
          label: "Undo",
          run: async () => {
            await api.post("/api/tasks", {
              title: task.title,
              description: task.description,
              notes: task.notes,
              priority: task.priority,
              status: task.status,
              dueDate: task.dueDate ? toDateInputValue(task.dueDate) : null,
              commissionId: task.commissionId,
            });
            onChanged();
            bump();
          },
        },
      });
    } catch (err) {
      pushToast({
        title: "Could not delete task",
        body: err instanceof Error ? err.message : undefined,
        tone: "error",
      });
    }
  };

  return (
    <div className={`task-row${completed ? " completed" : ""}`}>
      <input
        type="checkbox"
        className="check-box"
        style={{ marginTop: 2 }}
        checked={completed}
        onChange={(e) =>
          patch({ status: e.target.checked ? "completed" : "not_started" })
        }
        aria-label={
          completed ? `Reopen "${task.title}"` : `Complete "${task.title}"`
        }
      />

      <div className="task-main">
        {hasDetail ? (
          <button
            type="button"
            className="task-title"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {task.title}
          </button>
        ) : (
          <div className="task-title" style={{ cursor: "default" }}>
            {task.title}
          </div>
        )}

        {task.description && !expanded && (
          <div className="task-desc">{task.description}</div>
        )}

        {expanded && (
          <>
            {task.description && (
              <div className="task-desc" style={{ WebkitLineClamp: "unset" }}>
                {task.description}
              </div>
            )}
            {task.notes && <div className="task-notes">{task.notes}</div>}
          </>
        )}

        <div className="task-meta">
          {task.dueDate && (
            <span
              className={`badge${overdue ? " danger" : dueToday ? " warning" : ""}`}
            >
              {relativeDayLabel(task.dueDate)}
            </span>
          )}
          {/* Only the exceptional priority is worth pixels. */}
          {task.priority === "high" && !completed && (
            <span className="badge danger">High</span>
          )}
          {task.status === "waiting" && <span className="badge warning">Waiting</span>}
          {task.commission && (
            <button
              type="button"
              className="chip-button"
              title={`Surface the ${task.commission.name} checklist`}
              aria-label={`Switch current commission to ${task.commission.name}`}
              onClick={() => setCurrentCommissionId(task.commission!.id)}
            >
              <CommissionChip
                name={task.commission.name}
                color={task.commission.color}
              />
            </button>
          )}
          {hasDetail && !expanded && task.notes && (
            <span className="badge plain">Notes</span>
          )}
        </div>
      </div>

      <div className="task-side">
        {!compact && (
          <select
            className="status-select"
            value={task.status}
            onChange={(e) => patch({ status: e.target.value })}
            aria-label={`Status of "${task.title}"`}
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        )}
        <div className="task-actions">
          <button
            type="button"
            className="btn btn-icon"
            onClick={() => onEdit(task)}
            title="Edit"
            aria-label={`Edit "${task.title}"`}
          >
            <IconPencil size={14} />
          </button>
          <button
            type="button"
            className="btn btn-icon"
            onClick={remove}
            title="Delete"
            aria-label={`Delete "${task.title}"`}
          >
            <IconTrash size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- list --- */

export function TaskList({
  tasks,
  loading,
  error,
  onRetry,
  emptyTitle,
  emptyHint,
  emptyAction,
  onChanged,
  onEdit,
  title,
  count,
  countTone,
  actions,
  compact,
  limit,
}: {
  tasks: Task[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle: string;
  emptyHint?: string;
  emptyAction?: ReactNode;
  onChanged: () => void;
  onEdit: (task: Task) => void;
  title?: ReactNode;
  count?: number;
  countTone?: "default" | "danger";
  actions?: ReactNode;
  compact?: boolean;
  limit?: number;
}) {
  const shown = limit ? tasks.slice(0, limit) : tasks;
  const hidden = tasks.length - shown.length;

  return (
    <Card
      title={title}
      count={count}
      countTone={countTone}
      actions={actions}
      headerless={!title}
      bodyClass="card-body flush"
    >
      {error && tasks.length === 0 ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : loading && tasks.length === 0 ? (
        <SkeletonList rows={2} />
      ) : tasks.length === 0 ? (
        <Empty title={emptyTitle} hint={emptyHint} action={emptyAction} />
      ) : (
        <>
          {shown.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onChanged={onChanged}
              onEdit={onEdit}
              compact={compact}
            />
          ))}
          {hidden > 0 && (
            <div className="empty-inline">
              + {hidden} more — see the Tasks page
            </div>
          )}
        </>
      )}
    </Card>
  );
}

/* ----------------------------------------------------------------- form --- */

export type TaskDraft = {
  title: string;
  description: string;
  notes: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  commissionId: number | null;
};

export function emptyDraft(commissionId: number | null = null): TaskDraft {
  return {
    title: "",
    description: "",
    notes: "",
    priority: "medium",
    status: "not_started",
    dueDate: localTodayInputValue(),
    commissionId,
  };
}

export function TaskFormModal({
  task,
  initialCommissionId,
  onClose,
  onSaved,
}: {
  task: Task | null;
  initialCommissionId?: number | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { bump, pushToast, setCurrentCommissionId } = useApp();
  const initial = useRef<TaskDraft>(
    task
      ? {
          title: task.title,
          description: task.description ?? "",
          notes: task.notes ?? "",
          priority: task.priority,
          status: task.status,
          dueDate: toDateInputValue(task.dueDate),
          commissionId: task.commissionId,
        }
      : emptyDraft(initialCommissionId ?? null)
  );
  const [draft, setDraft] = useState<TaskDraft>(initial.current);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  // Tagging a commission on a task immediately surfaces its checklist
  // elsewhere on the page (PRD §6, Feature 3).
  useEffect(() => {
    if (draft.commissionId !== null) setCurrentCommissionId(draft.commissionId);
  }, [draft.commissionId, setCurrentCommissionId]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial.current);

  const requestClose = () => {
    if (!dirty || confirmDiscard) return true;
    setConfirmDiscard(true);
    return false;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim() || busy) return;
    setBusy(true);
    setError(null);
    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      notes: draft.notes.trim() || null,
      priority: draft.priority,
      status: draft.status,
      dueDate: draft.dueDate || null,
      commissionId: draft.commissionId,
    };
    try {
      if (task) await api.patch(`/api/tasks/${task.id}`, payload);
      else await api.post("/api/tasks", payload);
      onSaved();
      bump();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save task";
      setError(message);
      pushToast({ title: "Could not save task", body: message, tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={task ? "Edit task" : "New task"}
      onClose={onClose}
      onRequestClose={requestClose}
      footer={
        <>
          {error && <span className="error-text spacer">{error}</span>}
          {confirmDiscard && (
            <span className="error-text spacer">Discard unsaved changes?</span>
          )}
          <button
            className={confirmDiscard ? "btn btn-danger" : "btn btn-ghost"}
            type="button"
            onClick={onClose}
          >
            {confirmDiscard ? "Discard" : "Cancel"}
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            form="task-form"
            disabled={busy || !draft.title.trim()}
          >
            {task ? "Save changes" : "Add task"}
          </button>
        </>
      }
    >
      <form id="task-form" onSubmit={submit} className="stack" style={{ gap: 14 }}>
        <div className="field">
          <label className="field-label" htmlFor="task-title">
            Title
          </label>
          <input
            id="task-title"
            className="input"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="What needs doing?"
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="task-desc">
            Description
          </label>
          <textarea
            id="task-desc"
            className="textarea"
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="Optional detail"
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label className="field-label" htmlFor="task-priority">
              Priority
            </label>
            <select
              id="task-priority"
              className="select"
              value={draft.priority}
              onChange={(e) =>
                setDraft({ ...draft, priority: e.target.value as TaskPriority })
              }
            >
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="task-status">
              Status
            </label>
            <select
              id="task-status"
              className="select"
              value={draft.status}
              onChange={(e) =>
                setDraft({ ...draft, status: e.target.value as TaskStatus })
              }
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="task-due">
            Due date
          </label>
          <div className="row">
            <input
              id="task-due"
              type="date"
              className="input"
              value={draft.dueDate}
              onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
            />
            {draft.dueDate && (
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => setDraft({ ...draft, dueDate: "" })}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="field">
          <span className="field-label" id="task-commission-label">
            Commission
          </span>
          <CommissionPicker
            value={draft.commissionId}
            onChange={(id) => setDraft({ ...draft, commissionId: id })}
            noneLabel="No commission"
          />
          <span className="field-hint">
            Tagging a commission surfaces its checklist across the app.
          </span>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="task-notes">
            Notes
          </label>
          <textarea
            id="task-notes"
            className="textarea"
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            placeholder="Anything you'll want to remember later"
          />
        </div>
      </form>
    </Modal>
  );
}
