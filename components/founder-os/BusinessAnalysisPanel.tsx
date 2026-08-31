"use client";

import { useApp } from "../AppProvider";
import { api } from "@/lib/client";
import { useFetch } from "@/lib/hooks";
import type { FoCompetitor } from "@/lib/types";
import { RiskRegister } from "./RiskRegister";
import { ScoreCard } from "./ScoreCard";
import { SimpleTable, type SimpleTableColumn } from "./SimpleTable";
import { TextBlockGroup } from "./TextBlockGroup";

function CompetitorMatrix() {
  const { bump, version, pushToast } = useApp();
  const { data, reload } = useFetch<{ competitors: FoCompetitor[] }>("/api/founder-os/competitors", version);
  const competitors = data?.competitors ?? [];

  const columns: SimpleTableColumn<FoCompetitor>[] = [
    { key: "name", label: "Competitor", type: "text", width: "1.1fr" },
    { key: "price", label: "Price", type: "text", width: "0.9fr" },
    { key: "targetCustomer", label: "Target Customer", type: "text", width: "1fr" },
    { key: "strengths", label: "Strengths", type: "text", width: "1.4fr" },
    { key: "opportunity", label: "Opportunity for Us", type: "text", width: "1.2fr" },
  ];

  const saveField = async (row: FoCompetitor, field: string, value: unknown) => {
    try {
      await api.patch(`/api/founder-os/competitors/${row.id}`, { [field]: value });
      await reload();
      bump();
    } catch (err) {
      pushToast({ title: "Could not save", body: err instanceof Error ? err.message : undefined, tone: "error" });
    }
  };

  const remove = async (row: FoCompetitor) => {
    try {
      await api.del(`/api/founder-os/competitors/${row.id}`);
      await reload();
      bump();
    } catch (err) {
      pushToast({ title: "Could not delete", body: err instanceof Error ? err.message : undefined, tone: "error" });
    }
  };

  const add = async () => {
    try {
      await api.post("/api/founder-os/competitors", { name: "New competitor" });
      await reload();
      bump();
    } catch (err) {
      pushToast({ title: "Could not add", body: err instanceof Error ? err.message : undefined, tone: "error" });
    }
  };

  return (
    <SimpleTable
      title="Competitor Matrix"
      subtitle={`${competitors.length} competitor${competitors.length === 1 ? "" : "s"}`}
      columns={columns}
      rows={competitors}
      onSaveField={saveField}
      onDelete={remove}
      onAdd={add}
      addLabel="Add competitor"
    />
  );
}

export function BusinessAnalysisPanel() {
  return (
    <div className="fo-stack">
      <ScoreCard />
      <CompetitorMatrix />
      <TextBlockGroup section="icp" title="Ideal Customer Profile" subtitle="Who exactly you're building this for" />
      <TextBlockGroup section="bmc" title="Business Model Canvas" />
      <RiskRegister />
      <TextBlockGroup section="funding" title="Funding Notes" />
    </div>
  );
}
