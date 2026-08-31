"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "../../AppProvider";
import { Card, Empty, ErrorState, SkeletonList } from "../../ui";
import { api } from "@/lib/client";
import type { FounderPlanStepState } from "@/lib/constants";
import { useFetch } from "@/lib/hooks";
import { firstOpenPhaseId, overallProgress } from "@/lib/founder-os/plan-progress";
import type { FoPlan } from "@/lib/types";
import { PlanCard } from "./PlanCard";
import { PlanProgressBar, PlanProgressLabel } from "./PlanProgressBar";
import { PlanRail } from "./PlanRail";

/**
 * The master 90-day Plan — one phase (week) at a time with prev/next, same
 * "focused phase + a rail that keeps the whole shape visible" pattern as
 * Traffic Billing / Trader Media. No run/week wrapper: this is one
 * continuous checklist for the whole journey, not a recurring SOP, so
 * there's nothing to "start" — it's just always there.
 */
export function PlanPanel() {
  const { bump, version, pushToast } = useApp();
  const { data, loading, error, reload, setData } = useFetch<FoPlan>("/api/founder-os/plan", version);
  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);

  const phases = useMemo(() => data?.phases ?? [], [data]);

  useEffect(() => {
    if (activePhaseId !== null || phases.length === 0) return;
    setActivePhaseId(firstOpenPhaseId(phases));
  }, [activePhaseId, phases]);

  const activeIndex = phases.findIndex((p) => p.id === activePhaseId);
  const activePhase = activeIndex === -1 ? (phases[0] ?? null) : phases[activeIndex];
  const progress = useMemo(() => overallProgress(phases), [phases]);

  const fail = (err: unknown, title: string) =>
    pushToast({ title, body: err instanceof Error ? err.message : undefined, tone: "error" });

  const patchStepLocally = (stepId: number, patch: Partial<{ state: FounderPlanStepState; note: string | null }>) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            phases: prev.phases.map((p) => ({
              ...p,
              steps: p.steps.map((s) => (s.id === stepId ? { ...s, ...patch } : s)),
            })),
          }
        : prev
    );
  };

  const setStepState = async (stepId: number, next: FounderPlanStepState) => {
    patchStepLocally(stepId, { state: next });
    try {
      await api.patch(`/api/founder-os/plan/steps/${stepId}`, { state: next });
      bump();
    } catch {
      await reload();
    }
  };

  const setStepNote = async (stepId: number, note: string | null) => {
    patchStepLocally(stepId, { note });
    try {
      await api.patch(`/api/founder-os/plan/steps/${stepId}`, { note });
      bump();
    } catch {
      await reload();
    }
  };

  const setPhaseState = async (phaseId: number, next: FounderPlanStepState) => {
    try {
      await api.post(`/api/founder-os/plan/phases/${phaseId}/state`, { state: next });
      await reload();
      bump();
    } catch (err) {
      fail(err, "Could not update the week");
    }
  };

  const renameStep = async (stepId: number, text: string) => {
    try {
      await api.patch(`/api/founder-os/plan/steps/${stepId}`, { text });
      await reload();
      bump();
    } catch (err) {
      fail(err, "Could not save the step");
    }
  };

  const deleteStep = async (stepId: number) => {
    try {
      await api.del(`/api/founder-os/plan/steps/${stepId}`);
      await reload();
      bump();
    } catch (err) {
      fail(err, "Could not delete the step");
    }
  };

  const addStep = async (phaseId: number, text: string, groupLabel: string | null) => {
    try {
      await api.post("/api/founder-os/plan/steps", { phaseId, text, groupLabel });
      await reload();
      bump();
    } catch (err) {
      fail(err, "Could not add the step");
    }
  };

  const renamePhase = async (phaseId: number, title: string) => {
    try {
      await api.patch(`/api/founder-os/plan/phases/${phaseId}`, { title });
      await reload();
      bump();
    } catch (err) {
      fail(err, "Could not rename the week");
    }
  };

  const addMistake = async (phaseId: number, text: string) => {
    try {
      await api.post("/api/founder-os/plan/mistakes", { phaseId, text });
      await reload();
      bump();
    } catch (err) {
      fail(err, "Could not add that");
    }
  };

  const deleteMistake = async (id: number) => {
    try {
      await api.del(`/api/founder-os/plan/mistakes/${id}`);
      await reload();
      bump();
    } catch (err) {
      fail(err, "Could not remove that");
    }
  };

  if (error && !data) {
    return (
      <Card headerless>
        <ErrorState message={error} onRetry={reload} />
      </Card>
    );
  }

  if (loading && !data) {
    return (
      <Card headerless>
        <SkeletonList rows={5} />
      </Card>
    );
  }

  if (phases.length === 0) {
    return (
      <Card headerless>
        <Empty title="The plan hasn't been loaded yet" hint="Run `npm run db:seed-founder-plan` to populate the 90-day walkthrough." />
      </Card>
    );
  }

  return (
    <div className="fo-plan">
      <div className="tb-overall">
        <div className="tb-overall-head">
          <span className="tb-overall-pct">{progress.percent}%</span>
          <span className="tb-overall-count">
            {progress.settled} of {progress.total} steps
          </span>
          <PlanProgressLabel progress={progress} />
        </div>
        <PlanProgressBar progress={progress} size="md" label={`${progress.settled} of ${progress.total} steps settled overall`} />
      </div>

      <div className="tb-layout">
        <aside className="tb-rail-wrap">
          <PlanRail phases={phases} activePhaseId={activePhase?.id ?? null} onSelect={setActivePhaseId} />
        </aside>

        <div className="tb-detail">
          {activePhase && (
            <PlanCard
              key={activePhase.id}
              phase={activePhase}
              globalMistakes={data?.globalMistakes ?? []}
              position={{
                index: Math.max(activeIndex, 0),
                total: phases.length,
                hasPrev: activeIndex > 0,
                hasNext: activeIndex < phases.length - 1,
              }}
              onPrev={() => {
                setActivePhaseId(phases[activeIndex - 1]?.id ?? null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onNext={() => {
                setActivePhaseId(phases[activeIndex + 1]?.id ?? null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              handlers={{
                setStepState,
                setStepNote,
                renameStep,
                deleteStep,
                addStep,
                renamePhase,
                setPhaseState,
                addMistake,
                deleteMistake,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
