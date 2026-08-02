"use client";

import type { CSSProperties } from "react";
import { useApp } from "./AppProvider";
import { ChecklistRow } from "./Checklist";
import { Empty, InlineAdd } from "./ui";
import type { BoardCommission, ChecklistItem } from "@/lib/types";

/* ------------------------------------------------------- commission card -- */

export function CommissionCard({
  commission,
  active,
  onSelect,
}: {
  commission: BoardCommission;
  active: boolean;
  onSelect: () => void;
}) {
  const total = commission.checklistItems.length;
  const checked = commission.checklistItems.filter((i) => i.checkedAt).length;
  const highRisk = commission.checklistItems.filter((i) => i.isHighRisk).length;
  const pct = total ? (checked / total) * 100 : 0;

  return (
    <button
      type="button"
      className="commission-card"
      aria-pressed={active}
      onClick={onSelect}
      style={{ "--card-accent": commission.color } as CSSProperties}
    >
      <span className="commission-card-name">
        <span className="dot" style={{ background: commission.color }} />
        <span>{commission.name}</span>
      </span>
      <span className="commission-card-stats">
        {total > 0 ? (
          <>
            <span className="mini-progress">
              <span style={{ width: `${pct}%` }} />
            </span>
            <span>
              {checked}/{total} checked
              {highRisk > 0 && ` · ${highRisk} high risk`}
            </span>
          </>
        ) : (
          <span className="subtle">No rules yet</span>
        )}
        <span className="subtle">
          {commission.openTaskCount} open task
          {commission.openTaskCount === 1 ? "" : "s"}
        </span>
      </span>
    </button>
  );
}

/* ------------------------------------------------------- checklist panel -- */

export function ChecklistBox({
  title,
  color,
  items,
  emptyHint,
  onToggle,
  onFlag,
  onAdd,
  addPlaceholder,
  addLabel,
  highlight,
}: {
  title: string;
  color?: string;
  items: ChecklistItem[];
  emptyHint?: string;
  onToggle: (item: ChecklistItem, checked: boolean) => void;
  onFlag: (item: ChecklistItem, next: boolean) => void;
  onAdd: (text: string) => Promise<void>;
  addPlaceholder: string;
  addLabel: string;
  highlight?: boolean;
}) {
  const checked = items.filter((i) => i.checkedAt).length;

  return (
    <div
      className="inset-group"
      style={highlight ? { borderColor: "var(--text)" } : undefined}
    >
      <div className="inset-head">
        <span className="inset-title">
          {color && <span className="dot" style={{ background: color }} />}
          <span>{title}</span>
        </span>
        <span className="spacer" />
        {items.length > 0 && (
          <span className="progress-label">
            {checked}/{items.length}
          </span>
        )}
      </div>

      <div className="inset-body">
        {items.length === 0 ? (
          <Empty title="Nothing here yet" hint={emptyHint} />
        ) : (
          <div className="checklist">
            {items.map((item) => (
              <ChecklistRow
                key={item.id}
                item={item}
                onToggle={(next) => onToggle(item, next)}
                onFlag={(next) => onFlag(item, next)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="inset-foot">
        <InlineAdd placeholder={addPlaceholder} label={addLabel} onAdd={onAdd} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------ commission picker -- */

export function CommissionPicker({
  value,
  onChange,
  allowNone = true,
  noneLabel = "None",
}: {
  value: number | null;
  onChange: (id: number | null) => void;
  allowNone?: boolean;
  noneLabel?: string;
}) {
  const { commissions } = useApp();

  return (
    <div className="commission-picker" role="group" aria-label="Commission">
      {allowNone && (
        <button
          type="button"
          className="commission-pill"
          aria-pressed={value === null}
          onClick={() => onChange(null)}
        >
          {noneLabel}
        </button>
      )}
      {commissions.map((commission) => (
        <button
          key={commission.id}
          type="button"
          className="commission-pill"
          aria-pressed={value === commission.id}
          onClick={() => onChange(commission.id)}
        >
          <span
            className="dot"
            style={{ background: commission.color }}
            aria-hidden="true"
          />
          {commission.name}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------- who to CC / approvals -- */

/** Compact reference strip — the CC list and sign-off rules for a commission. */
export function ContactStrip({ commission }: { commission: BoardCommission }) {
  if (
    commission.contacts.length === 0 &&
    commission.approvalRequirements.length === 0
  ) {
    return null;
  }

  return (
    <div className="contact-strip">
      {commission.contacts.length > 0 && (
        <div className="contact-strip-group">
          <span className="section-label">Who to CC</span>
          <div className="row row-wrap" style={{ gap: 6 }}>
            {commission.contacts.map((contact) => (
              <span
                className="person-pill"
                key={contact.id}
                title={
                  [contact.role, contact.email, contact.phone]
                    .filter(Boolean)
                    .join(" · ") || contact.name
                }
              >
                <span
                  className="person-avatar sm"
                  style={{ background: commission.color }}
                  aria-hidden="true"
                >
                  {initials(contact.name)}
                </span>
                {contact.name}
                {contact.role && <span className="subtle">· {contact.role}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {commission.approvalRequirements.length > 0 && (
        <div className="contact-strip-group">
          <span className="section-label">Approvals</span>
          <div className="stack" style={{ gap: 3 }}>
            {commission.approvalRequirements.map((approval) => (
              <span className="small muted" key={approval.id}>
                • {approval.description}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------- people & rules -- */

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
