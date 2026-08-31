"use client";

import { Card, Empty } from "../ui";
import { IconTrash } from "../icons";
import { EditableCell } from "./EditableCell";

export type SimpleTableColumn<Row> = {
  key: keyof Row & string;
  label: string;
  type: "text" | "number" | "select";
  options?: { value: string; label: string }[];
  width?: string;
};

/**
 * One generic CSS-grid table, reused for every Phase-2/3 module that's
 * fundamentally "a short table of a few text/select/number columns"
 * (Competitor Matrix, Tech Stack Tracker, Risk Register) — rather than a
 * bespoke Table+Row pair per module, which would be four copies of nearly
 * identical code. No `<table>` element, consistent with the rest of this
 * app. Reuses `EditableCell` for text columns (same click-to-edit,
 * Enter/Escape/blur-commit contract already proven in the Sales Pipeline).
 */
export function SimpleTable<Row extends { id: number; isCustom?: boolean }>({
  title,
  subtitle,
  columns,
  rows,
  onSaveField,
  onDelete,
  onAdd,
  addLabel,
  emptyHint,
}: {
  title: string;
  subtitle?: string;
  columns: SimpleTableColumn<Row>[];
  rows: Row[];
  onSaveField: (row: Row, field: string, value: unknown) => void;
  onDelete?: (row: Row) => void;
  onAdd?: () => void;
  addLabel?: string;
  emptyHint?: string;
}) {
  const gridTemplate = columns.map((c) => c.width ?? "1fr").join(" ") + (onDelete ? " auto" : "");

  return (
    <Card
      title={title}
      subtitle={subtitle}
      actions={
        onAdd && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={onAdd}>
            {addLabel ?? "Add row"}
          </button>
        )
      }
      bodyClass="card-body flush"
    >
      {rows.length === 0 ? (
        <div className="card-body tight">
          <Empty title="Nothing here yet" hint={emptyHint} />
        </div>
      ) : (
        <div className="fo-table" style={{ overflowX: "auto" }}>
          <div className="fo-table-head" style={{ gridTemplateColumns: gridTemplate }} aria-hidden="true">
            {columns.map((c) => (
              <span key={c.key}>{c.label}</span>
            ))}
            {onDelete && <span />}
          </div>
          {rows.map((row) => (
            <div className="fo-table-row list-row" style={{ gridTemplateColumns: gridTemplate }} key={row.id}>
              {columns.map((col) => (
                <div key={col.key}>
                  {col.type === "select" ? (
                    <select
                      className="status-select"
                      aria-label={`${col.label} for row ${row.id}`}
                      value={String(row[col.key] ?? "")}
                      onChange={(e) => onSaveField(row, col.key, e.target.value)}
                    >
                      {col.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : col.type === "number" ? (
                    <input
                      type="number"
                      className="input"
                      aria-label={`${col.label} for row ${row.id}`}
                      value={row[col.key] === null || row[col.key] === undefined ? "" : String(row[col.key])}
                      onChange={(e) => onSaveField(row, col.key, e.target.value === "" ? null : Number(e.target.value))}
                    />
                  ) : (
                    <EditableCell
                      value={row[col.key] == null ? "" : String(row[col.key])}
                      label={`${col.label} for row ${row.id}`}
                      onSave={(v) => onSaveField(row, col.key, v || null)}
                    />
                  )}
                </div>
              ))}
              {onDelete && (
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn btn-icon"
                    onClick={() => onDelete(row)}
                    title="Delete"
                    aria-label={`Delete row ${row.id}`}
                  >
                    <IconTrash size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
