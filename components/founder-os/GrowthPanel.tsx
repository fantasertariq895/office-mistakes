"use client";

import { useApp } from "../AppProvider";
import { Card } from "../ui";
import { api } from "@/lib/client";
import { useFetch } from "@/lib/hooks";
import type { FoMarketingWeek } from "@/lib/types";
import { FounderChecklistPanel } from "./FounderChecklistPanel";

function MarketingCalendar() {
  const { bump, version, pushToast } = useApp();
  const { data, reload } = useFetch<{ weeks: FoMarketingWeek[] }>("/api/founder-os/marketing", version);
  const weeks = data?.weeks ?? [];

  const save = async (row: FoMarketingWeek, field: string, value: unknown) => {
    try {
      await api.patch(`/api/founder-os/marketing/${row.id}`, { [field]: value });
      await reload();
      bump();
    } catch (err) {
      pushToast({ title: "Could not save", body: err instanceof Error ? err.message : undefined, tone: "error" });
    }
  };

  return (
    <Card title="90-Day Content / Outreach Calendar" subtitle="No paid channels — this founder has no marketing budget or time for them yet" bodyClass="card-body flush">
      <div className="fo-table" style={{ overflowX: "auto" }}>
        <div className="fo-table-head" style={{ gridTemplateColumns: "0.5fr 0.8fr 1.2fr 1.2fr" }} aria-hidden="true">
          <span>Week</span>
          <span>Outreach</span>
          <span>Planned Content</span>
          <span>Notes</span>
        </div>
        {weeks.map((w) => (
          <div className="fo-table-row" style={{ gridTemplateColumns: "0.5fr 0.8fr 1.2fr 1.2fr" }} key={w.id}>
            <span>Week {w.weekNumber}</span>
            <input
              type="number"
              className="input"
              aria-label={`Planned outreach for week ${w.weekNumber}`}
              value={w.plannedOutreach ?? ""}
              onChange={(e) => save(w, "plannedOutreach", e.target.value === "" ? null : Number(e.target.value))}
            />
            <input
              className="input"
              aria-label={`Planned content for week ${w.weekNumber}`}
              defaultValue={w.plannedContent ?? ""}
              onBlur={(e) => {
                if (e.target.value !== (w.plannedContent ?? "")) save(w, "plannedContent", e.target.value || null);
              }}
            />
            <input
              className="input"
              aria-label={`Notes for week ${w.weekNumber}`}
              defaultValue={w.notes ?? ""}
              onBlur={(e) => {
                if (e.target.value !== (w.notes ?? "")) save(w, "notes", e.target.value || null);
              }}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function GrowthPanel() {
  return (
    <div className="fo-stack">
      <MarketingCalendar />
      <FounderChecklistPanel checklistKey="first-customer" title="First Customer Plan" />
    </div>
  );
}
