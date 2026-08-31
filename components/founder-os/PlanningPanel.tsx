"use client";

import { DecisionLog } from "./DecisionLog";
import { TextBlockGroup } from "./TextBlockGroup";
import { WeeklyPlanner } from "./WeeklyPlanner";

export function PlanningPanel() {
  return (
    <div className="fo-stack">
      <WeeklyPlanner />
      <TextBlockGroup section="roadmap" title="12-Month Roadmap" subtitle="Months 1-3 from the 30/60/90 plan; 4-12 are yours to fill in as you go" />
      <DecisionLog />
    </div>
  );
}
