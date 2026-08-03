"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { ChecklistBox, CommissionCard, ContactStrip } from "@/components/Board";
import { IconPlus } from "@/components/icons";
import { MistakeLogSection } from "@/components/MistakeLogSection";
import { TaskFormModal, TaskList } from "@/components/Tasks";
import { Card, ErrorState, InlineAdd } from "@/components/ui";
import { api } from "@/lib/client";
import { formatFullDate, localTodayInputValue } from "@/lib/date";
import { useFetch } from "@/lib/hooks";
import { sortTasks } from "@/lib/task-utils";
import type { BoardData, ChecklistItem, Task } from "@/lib/types";

/**
 * The whole dashboard, one page.
 *
 * Commission cards -> tasks for the picked one -> a working split of
 * "Checklist" (that commission, tick before you send) against "Always check
 * before sending" (the universal rules, same on every commission) -> the
 * mistake log, once, at the bottom.
 *
 * The log deliberately appears nowhere else on the page — it used to show up
 * both scoped to a commission and again for everyone, which read as the same
 * mistake being logged twice.
 */
export default function HomePage() {
  const { currentCommissionId, setCurrentCommissionId, version, bump, pushToast } =
    useApp();

  const board = useFetch<BoardData>("/api/board", version);
  const tasks = useFetch<Task[]>("/api/tasks", version);

  const [scope, setScope] = useState<"open" | "completed">("open");
  const [editing, setEditing] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);

  const data = board.data;
  const selected = data?.commissions.find((c) => c.id === currentCommissionId) ?? null;

  // Surface the automatic monthly reset exactly once, the moment it happens.
  const announcedReset = useRef<string | null>(null);
  useEffect(() => {
    const reset = board.data?.monthlyReset;
    if (!reset || announcedReset.current === reset.month) return;
    announcedReset.current = reset.month;
    pushToast({
      title: "Checklists reset for the new month",
      body: `${reset.itemsReset} item${reset.itemsReset === 1 ? "" : "s"} unticked, ready for ${reset.month}.`,
      tone: "success",
      durationMs: 10_000,
    });
  }, [board.data?.monthlyReset, pushToast]);

  const allTasks = tasks.data ?? [];

  const visible = useMemo(() => {
    let list = allTasks.filter((t) =>
      scope === "completed" ? t.status === "completed" : t.status !== "completed"
    );
    if (currentCommissionId !== null) {
      list = list.filter((t) => t.commissionId === currentCommissionId);
    }
    return sortTasks(list);
  }, [allTasks, currentCommissionId, scope]);

  const openCountFor = (commissionId: number | null) =>
    allTasks.filter(
      (t) =>
        t.status !== "completed" &&
        (commissionId === null ? true : t.commissionId === commissionId)
    ).length;

  /* ------------------------------------------------------------ mutations */

  const patchItemLocally = (id: number, patch: Partial<ChecklistItem>) => {
    board.setData((prev) =>
      prev
        ? {
            ...prev,
            universal: prev.universal.map((i) =>
              i.id === id ? { ...i, ...patch } : i
            ),
            commissions: prev.commissions.map((c) => ({
              ...c,
              checklistItems: c.checklistItems.map((i) =>
                i.id === id ? { ...i, ...patch } : i
              ),
            })),
          }
        : prev
    );
  };

  const toggleItem = async (item: ChecklistItem, checked: boolean) => {
    patchItemLocally(item.id, { checkedAt: checked ? new Date().toISOString() : null });
    try {
      await api.patch(`/api/checklist-items/${item.id}`, { checked });
    } catch {
      await board.reload();
    }
  };

  const flagItem = async (item: ChecklistItem, isHighRisk: boolean) => {
    patchItemLocally(item.id, { isHighRisk });
    try {
      await api.patch(`/api/checklist-items/${item.id}`, { isHighRisk });
    } catch {
      await board.reload();
    }
  };

  const addCommissionItem = async (commissionId: number, text: string) => {
    try {
      await api.post("/api/checklist-items", { commissionId, text });
      await board.reload();
      bump();
    } catch (err) {
      pushToast({
        title: "Could not add",
        body: err instanceof Error ? err.message : undefined,
        tone: "error",
      });
    }
  };

  const addUniversalItem = async (text: string) => {
    try {
      await api.post("/api/checklist-items", { commissionId: null, text });
      await board.reload();
      bump();
    } catch (err) {
      pushToast({
        title: "Could not add",
        body: err instanceof Error ? err.message : undefined,
        tone: "error",
      });
    }
  };

  const quickAdd = async (title: string) => {
    try {
      await api.post("/api/tasks", {
        title,
        dueDate: localTodayInputValue(),
        commissionId: currentCommissionId,
      });
      await tasks.reload();
      bump();
    } catch (err) {
      pushToast({
        title: "Could not add task",
        body: err instanceof Error ? err.message : undefined,
        tone: "error",
      });
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{formatFullDate()}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setCreating(true)}>
            <IconPlus size={15} />
            New task
          </button>
        </div>
      </header>

      {/* ---------------------------------------------- commission cards -- */}
      {board.error && !data ? (
        <Card headerless>
          <ErrorState message={board.error} onRetry={board.reload} />
        </Card>
      ) : (
        <div className="commission-strip" style={{ marginBottom: 20 }}>
          <button
            type="button"
            className="commission-card"
            aria-pressed={currentCommissionId === null}
            onClick={() => setCurrentCommissionId(null)}
          >
            <span className="commission-card-name">All tasks</span>
            <span className="commission-card-stats">
              <span className="subtle">
                {openCountFor(null)} open across everything
              </span>
            </span>
          </button>

          {(data?.commissions ?? []).map((commission) => (
            <CommissionCard
              key={commission.id}
              commission={{ ...commission, openTaskCount: openCountFor(commission.id) }}
              active={commission.id === currentCommissionId}
              onSelect={() =>
                setCurrentCommissionId(
                  commission.id === currentCommissionId ? null : commission.id
                )
              }
            />
          ))}
        </div>
      )}

      {/* ------------------------------------------------------- task list */}
      <div className="stack">
        <TaskList
          title={selected ? `${selected.name} tasks` : "All tasks"}
          count={visible.length}
          tasks={visible}
          loading={tasks.loading}
          error={tasks.error}
          onRetry={tasks.reload}
          onChanged={tasks.reload}
          onEdit={setEditing}
          emptyTitle={scope === "completed" ? "Nothing completed yet" : "No open tasks"}
          emptyHint={
            scope === "completed"
              ? undefined
              : selected
                ? `Add the first ${selected.name} task below.`
                : "Add one below to get started."
          }
          actions={
            <div className="filter-switch">
              <button
                type="button"
                aria-pressed={scope === "open"}
                onClick={() => setScope("open")}
              >
                Open
              </button>
              <button
                type="button"
                aria-pressed={scope === "completed"}
                onClick={() => setScope("completed")}
              >
                Done
              </button>
            </div>
          }
        />

        {scope === "open" && (
          <InlineAdd
            placeholder={
              selected ? `Add a ${selected.name} task for today…` : "Add a task for today…"
            }
            label="Quick add a task due today"
            buttonLabel="Add"
            onAdd={quickAdd}
          />
        )}
      </div>

      {/* --------------- checklist (left) + always-check rules (right) --- */}
      <div className="stack" style={{ marginTop: 26 }}>
        <div className="section-head">
          {selected ? (
            <h2 className="section-title">
              <span className="row" style={{ gap: 9 }}>
                <span className="dot" style={{ background: selected.color }} />
                {selected.name}
              </span>
            </h2>
          ) : (
            <h2 className="section-title">Before you send</h2>
          )}
          <span className="section-sub">
            {selected
              ? "Run both checklists before you send."
              : "Pick a commission above to add its checklist alongside these."}
          </span>
        </div>

        {selected && <ContactStrip commission={selected} />}

        <div className={selected ? "work-split" : "work-split single"}>
          {selected && (
            <ChecklistBox
              title="Checklist"
              color={selected.color}
              items={selected.checklistItems}
              emptyHint="Add the first thing you've been burned by."
              onToggle={toggleItem}
              onFlag={flagItem}
              onAdd={(text) => addCommissionItem(selected.id, text)}
              addPlaceholder="Add a mistake to avoid…"
              addLabel={`New checklist item for ${selected.name}`}
            />
          )}
          <ChecklistBox
            title="Always check before sending"
            items={data?.universal ?? []}
            emptyHint="Rules that apply no matter what you're working on."
            onToggle={toggleItem}
            onFlag={flagItem}
            onAdd={addUniversalItem}
            addPlaceholder="Add a rule that always applies…"
            addLabel="New always rule"
          />
        </div>
      </div>

      {/* --------------------------------------- the mistake log, once --- */}
      <MistakeLogSection defaultCommissionId={currentCommissionId} />

      {(creating || editing) && (
        <TaskFormModal
          task={editing}
          initialCommissionId={currentCommissionId}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={tasks.reload}
        />
      )}
    </div>
  );
}
