"use client";

import { useState } from "react";
import { useApp } from "../AppProvider";
import { Card, Empty, InlineAdd, SkeletonList } from "../ui";
import { IconTrash } from "../icons";
import { api } from "@/lib/client";
import { useFetch } from "@/lib/hooks";
import type { FoDocument } from "@/lib/types";

function DocumentRow({ doc, onSave, onDelete }: { doc: FoDocument; onSave: (content: string) => void; onDelete: () => void }) {
  const [draft, setDraft] = useState(doc.content ?? "");

  return (
    <div className="fo-document list-row">
      <div className="fo-document-main">
        <div className="fo-document-title">{doc.title}</div>
        <textarea
          className="input fo-document-body"
          rows={4}
          placeholder="Not written yet…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            if (draft !== (doc.content ?? "")) onSave(draft);
          }}
        />
      </div>
      {doc.isCustom && (
        <div className="row-actions">
          <button type="button" className="btn btn-icon" onClick={onDelete} title="Delete" aria-label={`Delete "${doc.title}"`}>
            <IconTrash size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Generic named-document library, reused for the Operations/SOPs section
 * (starts as empty headers to fill in) and the Document Templates section
 * (starts with real starter content) — both are "a list of titled text
 * blocks you can add more of," identical underneath.
 */
export function DocumentLibrary({
  section,
  title,
  subtitle,
  addLabel = "Add a document…",
}: {
  section: "sop" | "template";
  title: string;
  subtitle?: string;
  addLabel?: string;
}) {
  const { bump, version, pushToast } = useApp();
  const { data, loading, reload } = useFetch<{ documents: FoDocument[] }>(
    `/api/founder-os/documents?section=${section}`,
    version
  );
  const documents = data?.documents ?? [];

  const fail = (err: unknown, msg: string) =>
    pushToast({ title: msg, body: err instanceof Error ? err.message : undefined, tone: "error" });

  const save = async (doc: FoDocument, content: string) => {
    try {
      await api.patch(`/api/founder-os/documents/${doc.id}`, { content });
      await reload();
      bump();
    } catch (err) {
      fail(err, "Could not save");
    }
  };

  const add = async (docTitle: string) => {
    try {
      await api.post("/api/founder-os/documents", { section, title: docTitle });
      await reload();
      bump();
    } catch (err) {
      fail(err, "Could not add document");
    }
  };

  const remove = async (doc: FoDocument) => {
    try {
      await api.del(`/api/founder-os/documents/${doc.id}`);
      await reload();
      bump();
    } catch (err) {
      fail(err, "Could not delete");
    }
  };

  return (
    <Card title={title} subtitle={subtitle} bodyClass="card-body flush">
      <div className="card-body tight">
        {loading && documents.length === 0 ? (
          <SkeletonList rows={3} />
        ) : documents.length === 0 ? (
          <Empty title="Nothing here yet" />
        ) : (
          <div className="fo-document-list">
            {documents.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} onSave={(content) => save(doc, content)} onDelete={() => remove(doc)} />
            ))}
          </div>
        )}
      </div>
      <div className="card-footer">
        <InlineAdd placeholder={addLabel} label={`Add a document to ${title}`} onAdd={add} />
      </div>
    </Card>
  );
}
