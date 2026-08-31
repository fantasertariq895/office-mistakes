"use client";

import { useApp } from "../AppProvider";
import { api } from "@/lib/client";
import { FOUNDER_RISK_LEVELS, FOUNDER_RISK_LEVEL_LABELS } from "@/lib/constants";
import { useFetch } from "@/lib/hooks";
import type { FoRiskItem } from "@/lib/types";
import { SimpleTable, type SimpleTableColumn } from "./SimpleTable";

export function RiskRegister() {
  const { bump, version, pushToast } = useApp();
  const { data, reload } = useFetch<{ risks: FoRiskItem[] }>("/api/founder-os/risks", version);
  const risks = data?.risks ?? [];

  const levelOptions = FOUNDER_RISK_LEVELS.map((l) => ({ value: l, label: FOUNDER_RISK_LEVEL_LABELS[l] }));

  const columns: SimpleTableColumn<FoRiskItem>[] = [
    { key: "risk", label: "Risk", type: "text", width: "1.4fr" },
    { key: "probability", label: "Probability", type: "select", width: "0.8fr", options: levelOptions },
    { key: "impact", label: "Impact", type: "select", width: "0.8fr", options: levelOptions },
    { key: "prevention", label: "Prevention", type: "text", width: "1.4fr" },
    { key: "backupPlan", label: "Backup Plan", type: "text", width: "1.4fr" },
  ];

  const saveField = async (row: FoRiskItem, field: string, value: unknown) => {
    try {
      await api.patch(`/api/founder-os/risks/${row.id}`, { [field]: value });
      await reload();
      bump();
    } catch (err) {
      pushToast({ title: "Could not save", body: err instanceof Error ? err.message : undefined, tone: "error" });
    }
  };

  const remove = async (row: FoRiskItem) => {
    try {
      await api.del(`/api/founder-os/risks/${row.id}`);
      await reload();
      bump();
    } catch (err) {
      pushToast({ title: "Could not delete", body: err instanceof Error ? err.message : undefined, tone: "error" });
    }
  };

  const add = async () => {
    try {
      await api.post("/api/founder-os/risks", { risk: "New risk" });
      await reload();
      bump();
    } catch (err) {
      pushToast({ title: "Could not add", body: err instanceof Error ? err.message : undefined, tone: "error" });
    }
  };

  return (
    <SimpleTable
      title="Risk Register"
      columns={columns}
      rows={risks}
      onSaveField={saveField}
      onDelete={remove}
      onAdd={add}
      addLabel="Add risk"
    />
  );
}
