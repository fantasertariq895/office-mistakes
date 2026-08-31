"use client";

import { useId, useState } from "react";
import { BrandPanel } from "@/components/founder-os/BrandPanel";
import { BusinessAnalysisPanel } from "@/components/founder-os/BusinessAnalysisPanel";
import { DashboardPanel } from "@/components/founder-os/DashboardPanel";
import { FinancePanel } from "@/components/founder-os/FinancePanel";
import { GrowthPanel } from "@/components/founder-os/GrowthPanel";
import { KanbanBoard } from "@/components/founder-os/KanbanBoard";
import { KpiDashboardPanel } from "@/components/founder-os/KpiDashboardPanel";
import { LegalPanel } from "@/components/founder-os/LegalPanel";
import { OperationsPanel } from "@/components/founder-os/OperationsPanel";
import { PipelineTable } from "@/components/founder-os/PipelineTable";
import { PlanningPanel } from "@/components/founder-os/PlanningPanel";
import { PlanPanel } from "@/components/founder-os/plan/PlanPanel";
import { TabPanel, Tabs, type TabDef } from "@/components/ui";

type FounderModule =
  | "plan"
  | "dashboard"
  | "strategy"
  | "finance"
  | "legal"
  | "brand"
  | "pipeline"
  | "growth"
  | "tasks"
  | "ops"
  | "planning"
  | "kpis";

const TABS: TabDef<FounderModule>[] = [
  { id: "plan", label: "Plan" },
  { id: "dashboard", label: "Dashboard" },
  { id: "strategy", label: "Strategy" },
  { id: "finance", label: "Finance" },
  { id: "legal", label: "Legal" },
  { id: "brand", label: "Brand & Website" },
  { id: "pipeline", label: "Sales Pipeline" },
  { id: "growth", label: "Growth" },
  { id: "tasks", label: "Task List" },
  { id: "ops", label: "Operations" },
  { id: "planning", label: "Planning" },
  { id: "kpis", label: "KPI Dashboard" },
];

/**
 * Founder OS — the full 20-module spec from claude-code-prompt-founder-os.md,
 * grouped into 12 tabs rather than 20 top-level entries. One sidebar
 * doorway, many rooms — the same "internal module switcher behind one nav
 * item" mechanism Traffic Billing / Trader Media each use for their own
 * internal navigation, applied here to independent modules instead of a
 * sequence. Modules that are naturally small (Business Model Canvas, Risk
 * Register, Funding Notes, Hiring, Roadmap, Decision Log) are grouped
 * together under a related bigger module's tab rather than each getting its
 * own — see each panel component's own composition.
 *
 * "Plan" is the FIRST tab, ahead of Dashboard on purpose — it's the
 * Traffic-Billing/Trader-Media-style master checklist (a phase rail,
 * progress bar, sequential week-by-week navigation) walking the whole
 * 90-day journey start to end, which the other 11 tabs don't replace —
 * they're the supporting data (Finance, Legal, Brand, etc.) the Plan's
 * steps point back to.
 */
export default function FounderOsPage() {
  const [tab, setTab] = useState<FounderModule>("plan");
  const idBase = useId().replace(/:/g, "");

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Founder OS</h1>
          <p className="page-subtitle">Your side venture, in one place.</p>
        </div>
      </header>

      <Tabs tabs={TABS} active={tab} onChange={setTab} idBase={idBase} label="Founder OS sections" />

      <div style={{ marginTop: 16 }}>
        <TabPanel idBase={idBase} id={tab}>
          {tab === "plan" && <PlanPanel />}
          {tab === "dashboard" && <DashboardPanel onNavigate={(m) => setTab(m)} />}
          {tab === "strategy" && <BusinessAnalysisPanel />}
          {tab === "finance" && <FinancePanel />}
          {tab === "legal" && <LegalPanel />}
          {tab === "brand" && <BrandPanel />}
          {tab === "pipeline" && <PipelineTable />}
          {tab === "growth" && <GrowthPanel />}
          {tab === "tasks" && <KanbanBoard />}
          {tab === "ops" && <OperationsPanel />}
          {tab === "planning" && <PlanningPanel />}
          {tab === "kpis" && <KpiDashboardPanel />}
        </TabPanel>
      </div>
    </div>
  );
}
