"use client";

import { Card, Empty } from "../ui";
import type { FoDoNowItem } from "@/lib/types";

/**
 * Never the full backlog — 3-5 items, tasks first (a Critical task always
 * outranks a stale-contact nudge; see buildDoNowList). Clicking a row jumps
 * the parent's internal Tabs to the module that item lives in.
 */
export function DoNowWidget({
  items,
  onSelect,
}: {
  items: FoDoNowItem[];
  onSelect: (item: FoDoNowItem) => void;
}) {
  return (
    <Card title="Do This Now" bodyClass="card-body flush">
      <div className="card-body tight">
        {items.length === 0 ? (
          <Empty title="You're all caught up" hint="Nothing urgent right now." />
        ) : (
          <div className="fo-donow-list">
            {items.map((item) => (
              <button
                type="button"
                key={item.id}
                className="fo-donow-row"
                onClick={() => onSelect(item)}
              >
                <span className="fo-donow-title">{item.title}</span>
                {item.detail && <span className="badge plain">{item.detail}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
