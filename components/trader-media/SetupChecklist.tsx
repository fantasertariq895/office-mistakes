"use client";

import { useState } from "react";
import { useApp } from "../AppProvider";
import { IconChevron } from "../icons";
import { Card, SkeletonList } from "../ui";
import { api } from "@/lib/client";
import { useFetch } from "@/lib/hooks";
import type { TmSetupItem } from "@/lib/types";

/**
 * The one-time "Access / Things You Need" checklist — ShareDrive access,
 * BERT distribution, recurring call invites. Deliberately separate from the
 * weekly run: it's fetched and mutated independently (its own useFetch, its
 * own /api/trader-media/setup endpoint) and never resets, since
 * TraderMediaSetupItem has no relation to TraderMediaRun at all.
 */
export function SetupChecklist() {
  const { version, bump, pushToast } = useApp();
  const { data, loading, setData, reload } = useFetch<{ items: TmSetupItem[] }>(
    "/api/trader-media/setup",
    version
  );
  const items = data?.items ?? [];
  const done = items.filter((i) => i.done).length;
  const allDone = items.length > 0 && done === items.length;

  // Collapsed by default once everything's checked off — recomputed from
  // server state each load rather than persisted, which matches "checked
  // once, ever" (nothing to remember once it's done).
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const open = manualOpen ?? !allDone;

  const toggle = async (item: TmSetupItem, next: boolean) => {
    setData((prev) =>
      prev
        ? {
            items: prev.items.map((i) => (i.id === item.id ? { ...i, done: next } : i)),
          }
        : prev
    );
    try {
      await api.patch(`/api/trader-media/setup/${item.id}`, { done: next });
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

  if (loading && !data) {
    return (
      <Card title="Access & Setup" bodyClass="card-body flush">
        <div className="card-body tight">
          <SkeletonList rows={3} />
        </div>
      </Card>
    );
  }

  if (items.length === 0) return null;

  return (
    <Card
      title={
        <button
          type="button"
          className="tb-setup-toggle"
          onClick={() => setManualOpen(!open)}
          aria-expanded={open}
        >
          <IconChevron
            size={15}
            style={{
              transform: open ? undefined : "rotate(-90deg)",
              transition: "transform 0.15s ease",
            }}
          />
          Access & Setup
        </button>
      }
      subtitle={`${done} of ${items.length} done`}
      bodyClass="card-body flush"
    >
      {open && (
        <div className="card-body tight">
          <div className="checklist">
            {items.map((item) => (
              <div className={`check-row${item.done ? " done" : ""}`} key={item.id}>
                <input
                  id={`tm-setup-${item.id}`}
                  type="checkbox"
                  className="check-box"
                  checked={item.done}
                  onChange={(e) => toggle(item, e.target.checked)}
                />
                <label className="check-text" htmlFor={`tm-setup-${item.id}`}>
                  {item.text}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
