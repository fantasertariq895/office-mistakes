"use client";

import { useMemo } from "react";
import { useApp } from "../AppProvider";
import { Card, Empty, ErrorState, InlineAdd, SkeletonList } from "../ui";
import { api } from "@/lib/client";
import {
  FOUNDER_TASK_STATUSES,
  FOUNDER_TASK_STATUS_LABELS,
  type FounderTaskPriority,
  type FounderTaskStatus,
} from "@/lib/constants";
import { useFetch } from "@/lib/hooks";
import type { FoTask } from "@/lib/types";
import { FounderTaskCard } from "./FounderTaskCard";

export function KanbanBoard() {
  const { bump, version, pushToast } = useApp();
  const { data, loading, error, reload, setData } = useFetch<{ tasks: FoTask[] }>(
    "/api/founder-os/tasks",
    version
  );
  const tasks = data?.tasks ?? [];

  const columns = useMemo(() => {
    const map = new Map<FounderTaskStatus, FoTask[]>();
    for (const status of FOUNDER_TASK_STATUSES) map.set(status, []);
    for (const task of tasks) map.get(task.status)?.push(task);
    return map;
  }, [tasks]);

  const fail = (err: unknown, title: string) =>
    pushToast({ title, body: err instanceof Error ? err.message : undefined, tone: "error" });

  const patch = async (task: FoTask, body: Record<string, unknown>) => {
    setData((prev) =>
      prev
        ? { tasks: prev.tasks.map((t) => (t.id === task.id ? { ...t, ...body } : t)) }
        : prev
    );
    try {
      await api.patch(`/api/founder-os/tasks/${task.id}`, body);
      bump();
    } catch (err) {
      fail(err, "Could not update task");
      await reload();
    }
  };

  const addTask = async (title: string) => {
    try {
      await api.post("/api/founder-os/tasks", { title });
      await reload();
      bump();
    } catch (err) {
      fail(err, "Could not add task");
    }
  };

  const deleteTask = async (task: FoTask) => {
    setData((prev) => (prev ? { tasks: prev.tasks.filter((t) => t.id !== task.id) } : prev));
    try {
      await api.del(`/api/founder-os/tasks/${task.id}`);
      bump();
      pushToast({
        title: "Task deleted",
        body: task.title,
        tone: "success",
        undo: {
          label: "Undo",
          run: async () => {
            await api.post("/api/founder-os/tasks", {
              title: task.title,
              description: task.description ?? undefined,
              priority: task.priority,
              status: task.status,
              dueDate: task.dueDate,
            });
            await reload();
            bump();
          },
        },
      });
    } catch (err) {
      fail(err, "Could not delete task");
      await reload();
    }
  };

  return (
    <Card title="Master Task List" subtitle={`${tasks.length} task${tasks.length === 1 ? "" : "s"}`} bodyClass="card-body flush">
      <div className="card-body tight">
        <InlineAdd placeholder="Add a task…" label="New task title" onAdd={addTask} />
      </div>

      {error && tasks.length === 0 ? (
        <div className="card-body tight">
          <ErrorState message={error} onRetry={reload} />
        </div>
      ) : loading && tasks.length === 0 ? (
        <div className="card-body tight">
          <SkeletonList rows={3} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="card-body tight">
          <Empty title="No tasks yet" hint="Add the first one above." />
        </div>
      ) : (
        <div className="fo-board">
          {FOUNDER_TASK_STATUSES.map((status) => {
            const items = columns.get(status) ?? [];
            return (
              <div className="fo-column" key={status}>
                <div className="fo-column-head">
                  <span>{FOUNDER_TASK_STATUS_LABELS[status]}</span>
                  <span>{items.length}</span>
                </div>
                {items.map((task) => (
                  <FounderTaskCard
                    key={task.id}
                    task={task}
                    onMove={(next) => patch(task, { status: next })}
                    onPriorityChange={(next: FounderTaskPriority) => patch(task, { priority: next })}
                    onTitleSave={(title) => patch(task, { title })}
                    onDueDateChange={(date) => patch(task, { dueDate: date })}
                    onDelete={() => deleteTask(task)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
