"use client";

import { useState, type FormEvent } from "react";
import { useApp } from "../AppProvider";
import { Card, Empty, ErrorState, SkeletonList } from "../ui";
import { api } from "@/lib/client";
import { useFetch } from "@/lib/hooks";
import type { FoPipelineContact } from "@/lib/types";
import { PipelineRow } from "./PipelineRow";

/**
 * Pinned add-row: plain inputs bound to local draft state, Enter-to-submit
 * on the name field — a pipeline contact needs a few fields captured at
 * once (name + optional company/channel), which is what `InlineAdd`'s
 * single-string shape doesn't fit.
 */
function AddContactRow({ onAdd }: { onAdd: (fields: Record<string, string>) => Promise<void> }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [channel, setChannel] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await onAdd({ name: trimmed, company: company.trim(), channel: channel.trim() });
      setName("");
      setCompany("");
      setChannel("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="fo-pipeline-add" onSubmit={submit}>
      <input
        className="input"
        placeholder="New contact's name…"
        aria-label="New contact's name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={busy}
      />
      <input
        className="input"
        placeholder="Company"
        aria-label="New contact's company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        disabled={busy}
      />
      <input
        className="input"
        placeholder="Channel"
        aria-label="New contact's channel"
        value={channel}
        onChange={(e) => setChannel(e.target.value)}
        disabled={busy}
      />
      <button className="btn btn-sm btn-primary" type="submit" disabled={busy || !name.trim()}>
        Add
      </button>
    </form>
  );
}

export function PipelineTable() {
  const { bump, version, pushToast } = useApp();
  const { data, loading, error, reload, setData } = useFetch<{ contacts: FoPipelineContact[] }>(
    "/api/founder-os/pipeline",
    version
  );
  const contacts = data?.contacts ?? [];

  const fail = (err: unknown, title: string) =>
    pushToast({ title, body: err instanceof Error ? err.message : undefined, tone: "error" });

  const addContact = async (fields: Record<string, string>) => {
    try {
      await api.post("/api/founder-os/pipeline", {
        name: fields.name,
        company: fields.company || undefined,
        channel: fields.channel || undefined,
      });
      await reload();
      bump();
    } catch (err) {
      fail(err, "Could not add contact");
    }
  };

  const saveField = async (contact: FoPipelineContact, field: string, value: unknown) => {
    setData((prev) =>
      prev
        ? { contacts: prev.contacts.map((c) => (c.id === contact.id ? { ...c, [field]: value } : c)) }
        : prev
    );
    try {
      await api.patch(`/api/founder-os/pipeline/${contact.id}`, { [field]: value });
      bump();
    } catch (err) {
      fail(err, "Could not save");
      await reload();
    }
  };

  const deleteContact = async (contact: FoPipelineContact) => {
    setData((prev) => (prev ? { contacts: prev.contacts.filter((c) => c.id !== contact.id) } : prev));
    try {
      await api.del(`/api/founder-os/pipeline/${contact.id}`);
      bump();
      pushToast({
        title: "Contact deleted",
        body: contact.name,
        tone: "success",
        undo: {
          label: "Undo",
          run: async () => {
            await api.post("/api/founder-os/pipeline", {
              name: contact.name,
              company: contact.company ?? undefined,
              channel: contact.channel ?? undefined,
              notes: contact.notes ?? undefined,
              dateContacted: contact.dateContacted,
              status: contact.status,
            });
            await reload();
            bump();
          },
        },
      });
    } catch (err) {
      fail(err, "Could not delete contact");
      await reload();
    }
  };

  return (
    <Card title="Sales Pipeline" subtitle={`${contacts.length} contact${contacts.length === 1 ? "" : "s"}`} bodyClass="card-body flush">
      <div className="fo-pipeline-table">
        <AddContactRow onAdd={addContact} />

        {error && contacts.length === 0 ? (
          <div className="card-body tight">
            <ErrorState message={error} onRetry={reload} />
          </div>
        ) : loading && contacts.length === 0 ? (
          <div className="card-body tight">
            <SkeletonList rows={3} />
          </div>
        ) : contacts.length === 0 ? (
          <div className="card-body tight">
            <Empty
              title="No contacts yet"
              hint="Add the first one above — anyone you've reached out to for the first client."
            />
          </div>
        ) : (
          <>
            <div className="fo-pipeline-head" aria-hidden="true">
              <span>Name</span>
              <span>Company</span>
              <span>Channel</span>
              <span>Contacted</span>
              <span>Status</span>
              <span>Notes</span>
              <span />
            </div>
            {contacts.map((contact) => (
              <PipelineRow
                key={contact.id}
                contact={contact}
                onSaveField={(field, value) => saveField(contact, field, value)}
                onDelete={() => deleteContact(contact)}
              />
            ))}
          </>
        )}
      </div>
    </Card>
  );
}
