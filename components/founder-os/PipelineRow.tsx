"use client";

import {
  FOUNDER_PIPELINE_STATUSES,
  FOUNDER_PIPELINE_STATUS_LABELS,
  type FounderPipelineStatus,
} from "@/lib/constants";
import { toDateInputValue } from "@/lib/date";
import type { FoPipelineContact } from "@/lib/types";
import { IconTrash } from "../icons";
import { EditableCell } from "./EditableCell";

export function PipelineRow({
  contact,
  onSaveField,
  onDelete,
}: {
  contact: FoPipelineContact;
  onSaveField: (field: string, value: unknown) => void;
  onDelete: () => void;
}) {
  return (
    <div className="fo-pipeline-row list-row">
      <EditableCell
        value={contact.name}
        label={`Name for ${contact.name || "this contact"}`}
        placeholder="Name"
        onSave={(v) => onSaveField("name", v)}
      />
      <EditableCell
        value={contact.company ?? ""}
        label={`Company for ${contact.name}`}
        placeholder="Company"
        onSave={(v) => onSaveField("company", v || null)}
      />
      <EditableCell
        value={contact.channel ?? ""}
        label={`Channel for ${contact.name}`}
        placeholder="LinkedIn / Email / …"
        onSave={(v) => onSaveField("channel", v || null)}
      />
      <input
        type="date"
        className="input fo-pipeline-date"
        aria-label={`Date contacted for ${contact.name}`}
        value={toDateInputValue(contact.dateContacted)}
        onChange={(e) => onSaveField("dateContacted", e.target.value || null)}
      />
      <select
        className="status-select"
        aria-label={`Status for ${contact.name}`}
        value={contact.status}
        onChange={(e) => onSaveField("status", e.target.value)}
      >
        {FOUNDER_PIPELINE_STATUSES.map((s: FounderPipelineStatus) => (
          <option key={s} value={s}>
            {FOUNDER_PIPELINE_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <EditableCell
        value={contact.notes ?? ""}
        label={`Notes for ${contact.name}`}
        placeholder="Notes"
        onSave={(v) => onSaveField("notes", v || null)}
      />
      <div className="row-actions">
        <button
          type="button"
          className="btn btn-icon"
          onClick={onDelete}
          title="Delete"
          aria-label={`Delete ${contact.name}`}
        >
          <IconTrash size={14} />
        </button>
      </div>
    </div>
  );
}
