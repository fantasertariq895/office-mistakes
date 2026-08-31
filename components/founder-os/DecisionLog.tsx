"use client";

import { useState, type FormEvent } from "react";
import { useApp } from "../AppProvider";
import { Card, Empty, SkeletonList } from "../ui";
import { IconTrash } from "../icons";
import { api } from "@/lib/client";
import { formatFullDate } from "@/lib/date";
import { useFetch } from "@/lib/hooks";
import type { FoLogEntry } from "@/lib/types";

function AddEntryForm({ onAdd }: { onAdd: (fields: Record<string, string>) => Promise<void> }) {
  const [decision, setDecision] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [alternatives, setAlternatives] = useState("");
  const [outcome, setOutcome] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!decision.trim() || busy) return;
    setBusy(true);
    try {
      await onAdd({ decision: decision.trim(), reasoning: reasoning.trim(), alternatives: alternatives.trim(), outcome: outcome.trim() });
      setDecision("");
      setReasoning("");
      setAlternatives("");
      setOutcome("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="fo-log-add" onSubmit={submit}>
      <input className="input" placeholder="What did you decide?" aria-label="Decision" value={decision} onChange={(e) => setDecision(e.target.value)} disabled={busy} />
      <textarea className="input" placeholder="Reasoning" aria-label="Reasoning" rows={2} value={reasoning} onChange={(e) => setReasoning(e.target.value)} disabled={busy} />
      <textarea className="input" placeholder="Alternatives considered" aria-label="Alternatives considered" rows={2} value={alternatives} onChange={(e) => setAlternatives(e.target.value)} disabled={busy} />
      <input className="input" placeholder="Outcome (fill in later)" aria-label="Outcome" value={outcome} onChange={(e) => setOutcome(e.target.value)} disabled={busy} />
      <button type="submit" className="btn btn-sm btn-primary" disabled={busy || !decision.trim()}>
        Log decision
      </button>
    </form>
  );
}

/** A running record of decisions, the reasoning behind them, and the outcome — the founder's own memory, not a workflow. */
export function DecisionLog() {
  const { bump, version, pushToast } = useApp();
  const { data, loading, reload } = useFetch<{ entries: FoLogEntry[] }>("/api/founder-os/log-entries", version);
  const entries = data?.entries ?? [];

  const addEntry = async (fields: Record<string, string>) => {
    try {
      await api.post("/api/founder-os/log-entries", {
        decision: fields.decision,
        reasoning: fields.reasoning || undefined,
        alternatives: fields.alternatives || undefined,
        outcome: fields.outcome || undefined,
      });
      await reload();
      bump();
    } catch (err) {
      pushToast({ title: "Could not log that", body: err instanceof Error ? err.message : undefined, tone: "error" });
    }
  };

  const remove = async (entry: FoLogEntry) => {
    try {
      await api.del(`/api/founder-os/log-entries/${entry.id}`);
      await reload();
      bump();
    } catch (err) {
      pushToast({ title: "Could not delete", body: err instanceof Error ? err.message : undefined, tone: "error" });
    }
  };

  return (
    <Card title="Decision Log" subtitle={`${entries.length} decision${entries.length === 1 ? "" : "s"} logged`} bodyClass="card-body flush">
      <div className="card-body tight">
        <AddEntryForm onAdd={addEntry} />
      </div>
      <div className="card-body tight">
        {loading && entries.length === 0 ? (
          <SkeletonList rows={3} />
        ) : entries.length === 0 ? (
          <Empty title="No decisions logged yet" hint="Log the first one above." />
        ) : (
          <div className="fo-log-list">
            {entries.map((entry) => (
              <div className="fo-log-entry list-row" key={entry.id}>
                <div className="fo-log-entry-main">
                  <div className="fo-log-entry-decision">{entry.decision}</div>
                  <div className="fo-log-entry-date">{formatFullDate(entry.createdAt)}</div>
                  {entry.reasoning && <p className="fo-log-entry-detail"><strong>Reasoning:</strong> {entry.reasoning}</p>}
                  {entry.alternatives && <p className="fo-log-entry-detail"><strong>Alternatives:</strong> {entry.alternatives}</p>}
                  {entry.outcome && <p className="fo-log-entry-detail"><strong>Outcome:</strong> {entry.outcome}</p>}
                </div>
                <div className="row-actions">
                  <button type="button" className="btn btn-icon" onClick={() => remove(entry)} title="Delete" aria-label="Delete this decision">
                    <IconTrash size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
