"use client";

import { useEffect, useState } from "react";
import { useApp } from "./AppProvider";
import { CommissionPicker } from "./Board";
import { IconPencil, IconTrash } from "./icons";
import {
  Card,
  Empty,
  ErrorState,
  InlineAdd,
  InlineEdit,
  SkeletonList,
} from "./ui";
import { api } from "@/lib/client";
import { formatDay } from "@/lib/date";
import { useFetch } from "@/lib/hooks";
import type { Commission, MistakeLogEntry } from "@/lib/types";

type LoggedMistake = MistakeLogEntry & {
  commission: Pick<Commission, "id" | "name" | "color"> | null;
};

/**
 * The single home of the mistake log — everything that has actually gone wrong,
 * across every commission, in one place. Deliberately the only surface showing
 * these records, so nothing appears twice on the page.
 */
export function MistakeLogSection({
  defaultCommissionId,
}: {
  defaultCommissionId: number | null;
}) {
  const { version, bump, pushToast } = useApp();
  const log = useFetch<LoggedMistake[]>("/api/mistakes", version);
  const [target, setTarget] = useState<number | null>(defaultCommissionId);
  const [showResolved, setShowResolved] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Picking a commission above pre-aims the log form at it.
  useEffect(() => {
    if (defaultCommissionId !== null) setTarget(defaultCommissionId);
  }, [defaultCommissionId]);

  const entries = log.data ?? [];
  const visible = showResolved ? entries : entries.filter((e) => !e.resolved);
  const openCount = entries.filter((e) => !e.resolved).length;

  const add = async (text: string) => {
    if (target === null) {
      pushToast({ title: "Pick a commission first", tone: "error" });
      return;
    }
    try {
      await api.post("/api/mistakes", { commissionId: target, text });
      await log.reload();
      bump();
    } catch (err) {
      pushToast({
        title: "Could not log that",
        body: err instanceof Error ? err.message : undefined,
        tone: "error",
      });
    }
  };

  const patch = async (id: number, body: Record<string, unknown>) => {
    log.setData(entries.map((e) => (e.id === id ? { ...e, ...body } : e)));
    try {
      await api.patch(`/api/mistakes/${id}`, body);
      bump();
    } catch {
      await log.reload();
    }
  };

  const remove = async (entry: LoggedMistake) => {
    log.setData(entries.filter((e) => e.id !== entry.id));
    try {
      await api.del(`/api/mistakes/${entry.id}`);
      bump();
      pushToast({
        title: "Entry deleted",
        body: entry.text,
        tone: "success",
        undo: {
          label: "Undo",
          run: async () => {
            await api.post("/api/mistakes", {
              commissionId: entry.commissionId,
              text: entry.text,
            });
            await log.reload();
            bump();
          },
        },
      });
    } catch {
      await log.reload();
    }
  };

  return (
    <section style={{ marginTop: 30 }}>
      <div className="section-head">
        <h2 className="section-title">What went wrong</h2>
        <span className="section-sub">
          Everything logged, across all commissions. Add to it the moment
          something slips.
        </span>
      </div>

      <Card
        title="Mistake log"
        count={openCount}
        countTone="danger"
        subtitle="All commissions"
        actions={
          entries.some((e) => e.resolved) && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setShowResolved((v) => !v)}
              aria-pressed={showResolved}
            >
              {showResolved ? "Hide resolved" : "Show resolved"}
            </button>
          )
        }
        bodyClass="card-body flush"
      >
        {log.error && entries.length === 0 ? (
          <ErrorState message={log.error} onRetry={log.reload} />
        ) : log.loading && entries.length === 0 ? (
          <SkeletonList rows={3} />
        ) : visible.length === 0 ? (
          <Empty
            title="Nothing logged"
            hint="Log a mistake the moment it happens — that's the whole point."
          />
        ) : (
          <div className="list">
            {visible.map((entry) =>
              editingId === entry.id ? (
                <div className="list-row" key={entry.id}>
                  <InlineEdit
                    value={entry.text}
                    label="Edit logged mistake"
                    onSave={(text) => {
                      patch(entry.id, { text });
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div
                  className={`list-row${entry.resolved ? " resolved" : ""}`}
                  key={entry.id}
                >
                  <input
                    type="checkbox"
                    className="check-box"
                    checked={entry.resolved}
                    onChange={(e) => patch(entry.id, { resolved: e.target.checked })}
                    aria-label={
                      entry.resolved
                        ? `Mark "${entry.text}" unresolved`
                        : `Mark "${entry.text}" resolved`
                    }
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="list-primary">{entry.text}</div>
                    <div className="list-secondary row row-wrap" style={{ gap: 7 }}>
                      {entry.commission && (
                        <span className="row" style={{ gap: 5 }}>
                          <span
                            className="dot"
                            style={{ background: entry.commission.color }}
                          />
                          {entry.commission.name}
                        </span>
                      )}
                      <span>· {formatDay(entry.dateLogged)}</span>
                    </div>
                  </div>
                  <div className="row-actions">
                    <button
                      className="btn btn-icon"
                      onClick={() => setEditingId(entry.id)}
                      title="Edit"
                      aria-label={`Edit "${entry.text}"`}
                    >
                      <IconPencil size={14} />
                    </button>
                    <button
                      className="btn btn-icon"
                      onClick={() => remove(entry)}
                      title="Delete"
                      aria-label={`Delete "${entry.text}"`}
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        <div className="card-footer">
          <div className="stack" style={{ gap: 9 }}>
            <span className="field-label">Log a new mistake against…</span>
            <CommissionPicker value={target} onChange={setTarget} allowNone={false} />
            <InlineAdd
              placeholder={
                target === null ? "Pick a commission above first…" : "What went wrong?"
              }
              label="Describe the mistake"
              buttonLabel="Log"
              onAdd={add}
            />
          </div>
        </div>
      </Card>
    </section>
  );
}
