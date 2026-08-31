"use client";

import { useApp } from "../AppProvider";
import { api } from "@/lib/client";
import { FOUNDER_TASK_PRIORITIES, FOUNDER_TASK_PRIORITY_LABELS, FOUNDER_TECH_STATUSES, FOUNDER_TECH_STATUS_LABELS } from "@/lib/constants";
import { useFetch } from "@/lib/hooks";
import type { FoTechStackItem } from "@/lib/types";
import { SimpleTable, type SimpleTableColumn } from "./SimpleTable";
import { TextBlockGroup } from "./TextBlockGroup";

function TechStackTracker() {
  const { bump, version, pushToast } = useApp();
  const { data, reload } = useFetch<{ items: FoTechStackItem[] }>("/api/founder-os/tech-stack", version);
  const items = data?.items ?? [];

  const columns: SimpleTableColumn<FoTechStackItem>[] = [
    { key: "tool", label: "Tool", type: "text", width: "1.2fr" },
    { key: "purpose", label: "Purpose", type: "text", width: "1.4fr" },
    { key: "costCad", label: "Cost/mo", type: "number", width: "0.6fr" },
    {
      key: "priority",
      label: "Priority",
      type: "select",
      width: "0.8fr",
      options: FOUNDER_TASK_PRIORITIES.map((p) => ({ value: p, label: FOUNDER_TASK_PRIORITY_LABELS[p] })),
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      width: "0.8fr",
      options: FOUNDER_TECH_STATUSES.map((s) => ({ value: s, label: FOUNDER_TECH_STATUS_LABELS[s] })),
    },
  ];

  const saveField = async (row: FoTechStackItem, field: string, value: unknown) => {
    try {
      await api.patch(`/api/founder-os/tech-stack/${row.id}`, { [field]: value });
      await reload();
      bump();
    } catch (err) {
      pushToast({ title: "Could not save", body: err instanceof Error ? err.message : undefined, tone: "error" });
    }
  };

  const remove = async (row: FoTechStackItem) => {
    try {
      await api.del(`/api/founder-os/tech-stack/${row.id}`);
      await reload();
      bump();
    } catch (err) {
      pushToast({ title: "Could not delete", body: err instanceof Error ? err.message : undefined, tone: "error" });
    }
  };

  const add = async () => {
    try {
      await api.post("/api/founder-os/tech-stack", { tool: "New tool" });
      await reload();
      bump();
    } catch (err) {
      pushToast({ title: "Could not add", body: err instanceof Error ? err.message : undefined, tone: "error" });
    }
  };

  return (
    <SimpleTable
      title="Tech Stack Tracker"
      subtitle="Keep this short and cheap — flag anything over $30/month before adding it"
      columns={columns}
      rows={items}
      onSaveField={saveField}
      onDelete={remove}
      onAdd={add}
      addLabel="Add tool"
    />
  );
}

export function BrandPanel() {
  return (
    <div className="fo-stack">
      <TextBlockGroup section="brand" title="Brand & Website Planner" subtitle="Homepage copy and site map — the 3-pillar structure, IT Staffing nested under Managed IT Services" />
      <TechStackTracker />
    </div>
  );
}
