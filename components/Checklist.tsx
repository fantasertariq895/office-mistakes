"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/client";
import { useFetch } from "@/lib/hooks";
import type { ChecklistItem } from "@/lib/types";
import { useApp } from "./AppProvider";
import { IconFlag, IconPencil, IconRotate, IconTrash } from "./icons";
import {
  Card,
  Empty,
  ErrorState,
  InlineAdd,
  InlineEdit,
  SkeletonList,
} from "./ui";

export function itemsUrl(commissionId: number | null) {
  return `/api/checklist-items?commissionId=${commissionId ?? "universal"}`;
}

/* ------------------------------------------------------------------- row -- */

export function ChecklistRow({
  item,
  onToggle,
  onFlag,
  onRename,
  onDelete,
  contextLabel,
  showCategory = true,
}: {
  item: ChecklistItem;
  onToggle: (checked: boolean) => void;
  onFlag?: (next: boolean) => void;
  onRename?: (text: string) => void;
  onDelete?: () => void;
  contextLabel?: string;
  showCategory?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const checked = item.checkedAt !== null;

  if (editing && onRename) {
    return (
      <div className="check-row">
        <InlineEdit
          value={item.text}
          label="Edit checklist item"
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
    <div
      className={`check-row${checked ? " done" : ""}${
        item.isHighRisk && !checked ? " high-risk" : ""
      }`}
    >
      <input
        id={`check-${item.id}`}
        type="checkbox"
        className="check-box"
        checked={checked}
        onChange={(e) => onToggle(e.target.checked)}
      />
      <label className="check-text" htmlFor={`check-${item.id}`}>
        {item.text}
        {(item.isHighRisk || contextLabel || (item.category && showCategory)) && (
          <span className="check-meta">
            {item.isHighRisk && <span className="badge danger">High risk</span>}
            {contextLabel && <span className="badge">{contextLabel}</span>}
            {item.category && showCategory && !contextLabel && (
              <span className="badge plain">{item.category}</span>
            )}
          </span>
        )}
      </label>
      <div className="check-actions">
        {onFlag && (
          <button
            type="button"
            className={`flag-btn${item.isHighRisk ? " on" : ""}`}
            onClick={() => onFlag(!item.isHighRisk)}
            aria-pressed={item.isHighRisk}
            title={item.isHighRisk ? "Remove high-risk flag" : "Flag as high risk"}
            aria-label={
              item.isHighRisk
                ? `Remove high-risk flag from "${item.text}"`
                : `Flag "${item.text}" as high risk`
            }
          >
            <IconFlag size={14} />
          </button>
        )}
        {onRename && (
          <button
            type="button"
            className="btn btn-icon"
            onClick={() => setEditing(true)}
            title="Edit"
            aria-label={`Edit "${item.text}"`}
          >
            <IconPencil size={14} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="btn btn-icon"
            onClick={onDelete}
            title="Delete"
            aria-label={`Delete "${item.text}"`}
          >
            <IconTrash size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------- shared data hook --- */

function useChecklist(commissionId: number | null, enabled = true) {
  const { bump, version, pushToast } = useApp();
  const url = enabled ? itemsUrl(commissionId) : null;
  const { data, loading, error, reload, setData } = useFetch<ChecklistItem[]>(
    url,
    version
  );
  const items = enabled ? (data ?? []) : [];

  const patch = async (id: number, body: Record<string, unknown>) => {
    setData(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              ...(body.checked !== undefined
                ? { checkedAt: body.checked ? new Date().toISOString() : null }
                : {}),
              ...(body.isHighRisk !== undefined
                ? { isHighRisk: body.isHighRisk as boolean }
                : {}),
              ...(body.text !== undefined ? { text: body.text as string } : {}),
            }
          : item
      )
    );
    try {
      await api.patch(`/api/checklist-items/${id}`, body);
      bump();
    } catch (err) {
      pushToast({
        title: "Could not save",
        body: err instanceof Error ? err.message : undefined,
        tone: "error",
      });
      await reload();
    }
  };

  const add = async (text: string) => {
    try {
      await api.post("/api/checklist-items", { commissionId, text });
      await reload();
      bump();
    } catch (err) {
      pushToast({
        title: "Could not add",
        body: err instanceof Error ? err.message : undefined,
        tone: "error",
      });
    }
  };

  /** Deletes immediately and offers Undo — no confirm step for reversible work. */
  const remove = async (item: ChecklistItem) => {
    setData(items.filter((i) => i.id !== item.id));
    try {
      await api.del(`/api/checklist-items/${item.id}`);
      bump();
      pushToast({
        title: "Item deleted",
        body: item.text,
        tone: "success",
        undo: {
          label: "Undo",
          run: async () => {
            await api.post("/api/checklist-items", {
              commissionId: item.commissionId,
              text: item.text,
              category: item.category,
              isHighRisk: item.isHighRisk,
              isCustom: item.isCustom,
            });
            await reload();
            bump();
          },
        },
      });
    } catch {
      await reload();
    }
  };

  const resetAll = async () => {
    const previouslyChecked = items.filter((i) => i.checkedAt).map((i) => i.id);
    setData(items.map((i) => ({ ...i, checkedAt: null })));
    try {
      await api.post("/api/checklist-items/reset", { commissionId });
      bump();
      pushToast({
        title: `Unticked ${previouslyChecked.length} item${previouslyChecked.length === 1 ? "" : "s"}`,
        tone: "success",
        undo: {
          label: "Undo",
          run: async () => {
            await Promise.all(
              previouslyChecked.map((id) =>
                api.patch(`/api/checklist-items/${id}`, { checked: true })
              )
            );
            await reload();
            bump();
          },
        },
      });
    } catch {
      await reload();
    }
  };

  return { items, loading, error, reload, patch, add, remove, resetAll };
}

/* ----------------------------------------------------------------- panel -- */

export function ChecklistPanel({
  commissionId,
  title = "Checklist",
  subtitle,
  addPlaceholder = "Add a mistake to avoid…",
  addLabel = "New checklist item",
  emptyTitle = "No checklist items yet",
  emptyHint = "Add the first one below — anything you've been burned by before.",
  groupByCategory = true,
}: {
  commissionId: number | null;
  title?: string;
  subtitle?: string;
  addPlaceholder?: string;
  addLabel?: string;
  emptyTitle?: string;
  emptyHint?: string;
  groupByCategory?: boolean;
}) {
  const { items, loading, error, reload, patch, add, remove, resetAll } =
    useChecklist(commissionId);

  const checkedCount = items.filter((i) => i.checkedAt).length;
  const progress = items.length ? Math.round((checkedCount / items.length) * 100) : 0;

  const groups = useMemo(() => {
    if (!groupByCategory) return [{ label: null as string | null, items }];
    const distinct = new Set(items.map((i) => i.category ?? ""));
    if (distinct.size <= 1) return [{ label: null as string | null, items }];
    const map = new Map<string, ChecklistItem[]>();
    for (const item of items) {
      const key = item.category ?? "Other";
      const bucket = map.get(key);
      if (bucket) bucket.push(item);
      else map.set(key, [item]);
    }
    return [...map.entries()].map(([label, groupItems]) => ({
      label,
      items: groupItems,
    }));
  }, [groupByCategory, items]);

  return (
    <Card
      title={title}
      subtitle={subtitle}
      actions={
        items.length > 0 && (
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={resetAll}
            disabled={checkedCount === 0}
            title="Untick everything, ready for the next send"
          >
            <IconRotate size={14} />
            Reset
          </button>
        )
      }
      bodyClass="card-body flush"
    >
      {items.length > 0 && (
        <div className="checklist-progress">
          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={checkedCount}
            aria-valuemin={0}
            aria-valuemax={items.length}
            aria-label={`${checkedCount} of ${items.length} checked`}
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-label">
            {checkedCount}/{items.length} checked
          </span>
        </div>
      )}

      <div className="card-body tight">
        {error && items.length === 0 ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading && items.length === 0 ? (
          <SkeletonList rows={3} />
        ) : items.length === 0 ? (
          <Empty title={emptyTitle} hint={emptyHint} />
        ) : (
          groups.map((group) => (
            <div key={group.label ?? "all"} className="checklist">
              {group.label && (
                <div className="checklist-group-label">{group.label}</div>
              )}
              {group.items.map((item) => (
                <ChecklistRow
                  key={item.id}
                  item={item}
                  showCategory={group.label === null}
                  onToggle={(checked) => patch(item.id, { checked })}
                  onFlag={(isHighRisk) => patch(item.id, { isHighRisk })}
                  onRename={(text) => patch(item.id, { text })}
                  onDelete={() => remove(item)}
                />
              ))}
            </div>
          ))
        )}
      </div>

      <div className="card-footer">
        <InlineAdd placeholder={addPlaceholder} label={addLabel} onAdd={add} />
      </div>
    </Card>
  );
}
