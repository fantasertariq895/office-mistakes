"use client";

import { useMemo } from "react";
import { useApp } from "../AppProvider";
import { Card, Empty, InlineAdd, SkeletonList } from "../ui";
import { IconTrash } from "../icons";
import { api } from "@/lib/client";
import { useFetch } from "@/lib/hooks";
import type { FoChecklist, FoChecklistItem } from "@/lib/types";

/**
 * Generic checklist UI, reused for the Legal & Compliance Checklist and the
 * First Customer Plan — both are "a checklist of items, sometimes grouped
 * under a day/week label, each with an optional why-it-matters note."
 * Deliberately its own component rather than reusing components/Checklist.tsx
 * — that one is wired to the shared ChecklistItem table (wiped monthly by
 * lib/monthly-reset.ts), which a legal checklist must never be.
 */
export function FounderChecklistPanel({ checklistKey, title }: { checklistKey: string; title: string }) {
  const { bump, version, pushToast } = useApp();
  const { data, loading, reload } = useFetch<{ checklists: FoChecklist[] }>(
    "/api/founder-os/checklists",
    version
  );
  const checklist = data?.checklists.find((c) => c.key === checklistKey) ?? null;
  const items = checklist?.items ?? [];
  const doneCount = items.filter((i) => i.done).length;

  const groups = useMemo(() => {
    const out: { label: string | null; items: FoChecklistItem[] }[] = [];
    for (const item of items) {
      const label = item.dayLabel ?? null;
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(item);
      else out.push({ label, items: [item] });
    }
    return out;
  }, [items]);

  const fail = (err: unknown, msg: string) =>
    pushToast({ title: msg, body: err instanceof Error ? err.message : undefined, tone: "error" });

  const toggle = async (item: FoChecklistItem, done: boolean) => {
    try {
      await api.patch(`/api/founder-os/checklist-items/${item.id}`, { done });
      await reload();
      bump();
    } catch (err) {
      fail(err, "Could not save");
    }
  };

  const addItem = async (text: string) => {
    if (!checklist) return;
    try {
      await api.post(`/api/founder-os/checklists/${checklist.key}/items`, { text });
      await reload();
      bump();
    } catch (err) {
      fail(err, "Could not add item");
    }
  };

  const remove = async (item: FoChecklistItem) => {
    try {
      await api.del(`/api/founder-os/checklist-items/${item.id}`);
      await reload();
      bump();
      pushToast({ title: "Item deleted", body: item.text, tone: "success" });
    } catch (err) {
      fail(err, "Could not delete item");
    }
  };

  return (
    <Card title={title} subtitle={items.length > 0 ? `${doneCount} of ${items.length} done` : undefined} bodyClass="card-body flush">
      <div className="card-body tight">
        {loading && items.length === 0 ? (
          <SkeletonList rows={4} />
        ) : items.length === 0 ? (
          <Empty title="Nothing here yet" />
        ) : (
          groups.map((group, gi) => (
            <div className="checklist" key={`${group.label ?? "none"}-${gi}`}>
              {group.label && <div className="checklist-group-label">{group.label}</div>}
              {group.items.map((item) => (
                <div className={`check-row${item.done ? " done" : ""} list-row`} key={item.id}>
                  <input
                    id={`fo-check-${item.id}`}
                    type="checkbox"
                    className="check-box"
                    checked={item.done}
                    onChange={(e) => toggle(item, e.target.checked)}
                  />
                  <label className="check-text" htmlFor={`fo-check-${item.id}`}>
                    {item.text}
                    {item.explanation && <span className="fo-checklist-explanation">{item.explanation}</span>}
                  </label>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="btn btn-icon"
                      onClick={() => remove(item)}
                      title="Delete"
                      aria-label={`Delete "${item.text}"`}
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <div className="card-footer">
        <InlineAdd placeholder="Add a checklist item…" label={`Add an item to ${title}`} onAdd={addItem} />
      </div>
    </Card>
  );
}
