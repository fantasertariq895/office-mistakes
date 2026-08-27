"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { PhaseCard } from "@/components/trader-media/PhaseCard";
import { PhaseRail } from "@/components/trader-media/PhaseRail";
import { SetupChecklist } from "@/components/trader-media/SetupChecklist";
import { TmProgressBar, TmProgressLabel } from "@/components/trader-media/ProgressBar";
import { Card, Empty, ErrorState, SkeletonList } from "@/components/ui";
import { api } from "@/lib/client";
import type { TmStepState } from "@/lib/constants";
import { useFetch } from "@/lib/hooks";
import { formatWeekLabel, localCurrentWeekKey } from "@/lib/trader-media/week";
import {
  buildStateMap,
  firstOpenPhaseId,
  overallProgress,
} from "@/lib/trader-media/progress";
import type { TmWorkspace } from "@/lib/types";

/**
 * Trader Media — the execution workspace for the weekly media revenue
 * reporting SOP. Mirrors app/traffic-billing/page.tsx almost exactly; see
 * that file's doc comment for the reasoning behind one-phase-at-a-time
 * navigation and read-only completed runs. The difference here is the run
 * dimension is a Monday-anchored week, not a billing month, and phases 7–13
 * carry an "isOwnerPending" flag the Traffic Billing SOP has no equivalent
 * of — see lib/trader-media/sop-template.ts's doc comment.
 */
export default function TraderMediaPage() {
  const { bump, version, pushToast } = useApp();

  const [week, setWeek] = useState<string | null>(null);
  const url = week ? `/api/trader-media?week=${week}` : "/api/trader-media";
  const workspace = useFetch<TmWorkspace>(url, version);

  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);

  const data = workspace.data;
  const phases = useMemo(() => data?.phases ?? [], [data]);
  const stateMap = useMemo(() => buildStateMap(data?.states ?? []), [data]);
  const run = data?.run ?? null;
  const readOnly = !run || run.status === "completed";

  const progress = useMemo(() => overallProgress(phases, stateMap), [phases, stateMap]);

  // Land on the first phase with work outstanding rather than always phase 1
  // — picking the SOP back up mid-week is the normal case, not the exception.
  useEffect(() => {
    if (activePhaseId !== null || phases.length === 0) return;
    setActivePhaseId(firstOpenPhaseId(phases, stateMap));
  }, [activePhaseId, phases, stateMap]);

  const activeIndex = phases.findIndex((p) => p.id === activePhaseId);
  const activePhase = activeIndex === -1 ? (phases[0] ?? null) : phases[activeIndex];

  const issuesByPhase = useMemo(() => {
    const map = new Map<number, number>();
    for (const issue of data?.issues ?? []) {
      if (issue.resolved) continue;
      map.set(issue.phaseId, (map.get(issue.phaseId) ?? 0) + 1);
    }
    return map;
  }, [data]);

  /* ------------------------------------------------------------ helpers -- */

  const fail = (err: unknown, title: string) =>
    pushToast({
      title,
      body: err instanceof Error ? err.message : undefined,
      tone: "error",
    });

  /** Applies a state change locally first, then reconciles with the server. */
  const patchStateLocally = (stepId: number, patch: Partial<{ state: TmStepState; note: string | null }>) => {
    workspace.setData((prev) => {
      if (!prev) return prev;
      const existing = prev.states.find((s) => s.stepId === stepId);
      const next = existing
        ? prev.states.map((s) => (s.stepId === stepId ? { ...s, ...patch } : s))
        : [...prev.states, { stepId, state: "open" as TmStepState, note: null, ...patch }];
      return { ...prev, states: next };
    });
  };

  const withRun = <T,>(fn: (runId: number) => T): T | undefined => {
    if (!run) return undefined;
    return fn(run.id);
  };

  /* ---------------------------------------------------------- mutations -- */

  const startWeek = async (target: string) => {
    setStarting(true);
    try {
      await api.post("/api/trader-media/runs", { week: target });
      setWeek(target);
      setActivePhaseId(null);
      await workspace.reload();
      bump();
      pushToast({
        title: `${formatWeekLabel(target)} started`,
        body: "Every step is back to open for the new week.",
        tone: "success",
      });
    } catch (err) {
      fail(err, "Could not start the week");
    } finally {
      setStarting(false);
    }
  };

  const setRunStatus = async (status: "in_progress" | "completed") => {
    if (!run) return;
    try {
      await api.patch(`/api/trader-media/runs/${run.id}`, { status });
      await workspace.reload();
      bump();
      pushToast({
        title: status === "completed" ? "Week marked complete" : "Week re-opened",
        tone: "success",
      });
    } catch (err) {
      fail(err, "Could not update the run");
    }
  };

  const setStepState = (stepId: number, next: TmStepState) =>
    withRun(async (runId) => {
      patchStateLocally(stepId, { state: next });
      try {
        await api.patch(`/api/trader-media/steps/${stepId}/state`, {
          runId,
          state: next,
        });
        bump();
      } catch {
        await workspace.reload();
      }
    });

  const setStepNote = (stepId: number, note: string | null) =>
    withRun(async (runId) => {
      patchStateLocally(stepId, { note });
      try {
        await api.patch(`/api/trader-media/steps/${stepId}/state`, { runId, note });
        bump();
      } catch {
        await workspace.reload();
      }
    });

  const setPhaseState = (phaseId: number, next: TmStepState) =>
    withRun(async (runId) => {
      try {
        await api.post(`/api/trader-media/phases/${phaseId}/state`, {
          runId,
          state: next,
        });
        await workspace.reload();
        bump();
      } catch (err) {
        fail(err, "Could not update the phase");
      }
    });

  const renameStep = async (stepId: number, text: string) => {
    try {
      await api.patch(`/api/trader-media/steps/${stepId}`, { text });
      await workspace.reload();
      bump();
    } catch (err) {
      fail(err, "Could not save the step");
    }
  };

  const deleteStep = async (stepId: number) => {
    const step = phases.flatMap((p) => p.steps).find((s) => s.id === stepId);
    try {
      await api.del(`/api/trader-media/steps/${stepId}`);
      await workspace.reload();
      bump();
      pushToast({
        title: "Step deleted",
        body: step?.text,
        tone: "success",
      });
    } catch (err) {
      fail(err, "Could not delete the step");
    }
  };

  const addStep = async (phaseId: number, text: string, groupLabel: string | null) => {
    try {
      await api.post("/api/trader-media/steps", { phaseId, text, groupLabel });
      await workspace.reload();
      bump();
    } catch (err) {
      fail(err, "Could not add the step");
    }
  };

  const renamePhase = async (phaseId: number, title: string) => {
    try {
      await api.patch(`/api/trader-media/phases/${phaseId}`, { title });
      await workspace.reload();
      bump();
    } catch (err) {
      fail(err, "Could not rename the phase");
    }
  };

  const addMistake = async (phaseId: number, text: string) => {
    try {
      await api.post("/api/trader-media/mistakes", { phaseId, text });
      await workspace.reload();
      bump();
    } catch (err) {
      fail(err, "Could not add that");
    }
  };

  const deleteMistake = async (id: number) => {
    try {
      await api.del(`/api/trader-media/mistakes/${id}`);
      await workspace.reload();
      bump();
    } catch (err) {
      fail(err, "Could not remove that");
    }
  };

  const addIssue = (phaseId: number, text: string) =>
    withRun(async (runId) => {
      try {
        await api.post("/api/trader-media/issues", { runId, phaseId, text });
        await workspace.reload();
        bump();
      } catch (err) {
        fail(err, "Could not log that");
      }
    }) ?? Promise.resolve();

  const toggleIssue = async (id: number, resolved: boolean) => {
    try {
      await api.patch(`/api/trader-media/issues/${id}`, { resolved });
      await workspace.reload();
      bump();
    } catch (err) {
      fail(err, "Could not update the issue");
    }
  };

  const deleteIssue = async (id: number) => {
    try {
      await api.del(`/api/trader-media/issues/${id}`);
      await workspace.reload();
      bump();
    } catch (err) {
      fail(err, "Could not delete the issue");
    }
  };

  /* ------------------------------------------------------------- render -- */

  const thisWeek = localCurrentWeekKey();
  const thisWeekStarted = (data?.runs ?? []).some((r) => r.week === thisWeek);

  // Recurring by default: the current week starts itself the moment the page
  // loads, so there's nothing to remember to click each Monday. History isn't
  // lost by this — every week is its own permanent run row (see
  // TraderMediaRun in prisma/schema.prisma), so "starting" a new week never
  // touches the previous one, completed or not. A Vercel Cron backstop
  // (app/api/cron/trader-media-weekly) covers the case where nobody opens the
  // app on the Monday itself.
  useEffect(() => {
    if (!data || phases.length === 0 || thisWeekStarted || starting) return;
    void startWeek(thisWeek);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, phases.length, thisWeekStarted, starting, thisWeek]);

  if (workspace.error && !data) {
    return (
      <div className="page">
        <Card headerless>
          <ErrorState message={workspace.error} onRetry={workspace.reload} />
        </Card>
      </div>
    );
  }

  return (
    <div className="page tb-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Trader Media</h1>
          <p className="page-subtitle">
            {run
              ? `${formatWeekLabel(run.week)}${run.status === "completed" ? " · completed" : ""}`
              : "No week started yet"}
          </p>
        </div>

        <div className="page-actions">
          {(data?.runs.length ?? 0) > 0 && (
            <>
              <label className="visually-hidden" htmlFor="tm-week">
                Reporting week
              </label>
              <select
                id="tm-week"
                className="input"
                value={run?.week ?? ""}
                onChange={(e) => {
                  setWeek(e.target.value);
                  setActivePhaseId(null);
                }}
              >
                {data?.runs.map((r) => (
                  <option key={r.id} value={r.week}>
                    {formatWeekLabel(r.week)}
                    {r.status === "completed" ? " (completed)" : ""}
                  </option>
                ))}
              </select>
            </>
          )}

          {!thisWeekStarted && (
            <button
              className="btn btn-primary"
              onClick={() => startWeek(thisWeek)}
              disabled={starting}
            >
              Start {formatWeekLabel(thisWeek)}
            </button>
          )}

          {run && run.status === "in_progress" && (
            <button
              className="btn"
              onClick={() => setRunStatus("completed")}
              disabled={progress.open > 0}
              title={
                progress.open > 0
                  ? `${progress.open} step${progress.open === 1 ? "" : "s"} still open`
                  : "Mark this week complete"
              }
            >
              Mark week complete
            </button>
          )}

          {run && run.status === "completed" && (
            <button className="btn" onClick={() => setRunStatus("in_progress")}>
              Re-open week
            </button>
          )}
        </div>
      </header>

      <SetupChecklist />

      {run && (
        <div className="tb-overall">
          <div className="tb-overall-head">
            <span className="tb-overall-pct">{progress.percent}%</span>
            <span className="tb-overall-count">
              {progress.settled} of {progress.total} steps
            </span>
            <TmProgressLabel progress={progress} />
          </div>
          <TmProgressBar
            progress={progress}
            size="md"
            label={`${progress.settled} of ${progress.total} steps settled this week`}
          />
        </div>
      )}

      {workspace.loading && !data ? (
        <Card headerless>
          <SkeletonList rows={5} />
        </Card>
      ) : phases.length === 0 ? (
        <Card headerless>
          <Empty
            title="The SOP hasn't been loaded yet"
            hint="Run `npm run db:seed-trader-media` to populate the phases and steps."
          />
        </Card>
      ) : !run ? (
        <Card headerless>
          <Empty
            title="No week started"
            hint={`Start ${formatWeekLabel(thisWeek)} to begin ticking off the SOP. Each week keeps its own record.`}
            action={
              <button
                className="btn btn-primary"
                onClick={() => startWeek(thisWeek)}
                disabled={starting}
              >
                Start {formatWeekLabel(thisWeek)}
              </button>
            }
          />
        </Card>
      ) : (
        <div className="tb-layout">
          <aside className="tb-rail-wrap">
            <PhaseRail
              phases={phases}
              stateMap={stateMap}
              activePhaseId={activePhase?.id ?? null}
              onSelect={setActivePhaseId}
              issueCountByPhase={issuesByPhase}
            />
          </aside>

          <div className="tb-detail">
            {activePhase && (
              <PhaseCard
                key={activePhase.id}
                phase={activePhase}
                stateMap={stateMap}
                globalMistakes={data?.globalMistakes ?? []}
                issues={(data?.issues ?? []).filter((i) => i.phaseId === activePhase.id)}
                readOnly={readOnly}
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
                  addIssue,
                  toggleIssue,
                  deleteIssue,
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
