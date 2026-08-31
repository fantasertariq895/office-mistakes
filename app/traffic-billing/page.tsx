"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { PhaseCard } from "@/components/traffic-billing/PhaseCard";
import { PhaseRail } from "@/components/traffic-billing/PhaseRail";
import { TbProgressBar, TbProgressLabel } from "@/components/traffic-billing/ProgressBar";
import { Card, Empty, ErrorState, SkeletonList } from "@/components/ui";
import { api } from "@/lib/client";
import type { TbStepState } from "@/lib/constants";
import { useFetch } from "@/lib/hooks";
import { formatMonthLabel, localMonthKey } from "@/lib/traffic-billing/month";
import {
  buildStateMap,
  firstOpenPhaseId,
  overallProgress,
} from "@/lib/traffic-billing/progress";
import type { TbWorkspace } from "@/lib/types";

/**
 * Traffic Billing — the execution workspace for the monthly SOP.
 *
 * One phase at a time with prev/next, not a 37-phase accordion: the SOP is
 * explicitly sequential, and a single focused phase is what turns a long
 * document into something you can actually work through. The rail on the left
 * keeps the whole shape visible so it never feels like a tunnel.
 *
 * Everything is scoped to a *run* — one execution per billing month, kept
 * afterwards. A completed run renders read-only so last month's record can be
 * read back without being accidentally rewritten.
 */
export default function TrafficBillingPage() {
  const { bump, version, pushToast } = useApp();

  const [month, setMonth] = useState<string | null>(null);
  const url = month ? `/api/traffic-billing?month=${month}` : "/api/traffic-billing";
  const workspace = useFetch<TbWorkspace>(url, version);

  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);

  const data = workspace.data;
  const phases = useMemo(() => data?.phases ?? [], [data]);
  const stateMap = useMemo(() => buildStateMap(data?.states ?? []), [data]);
  const run = data?.run ?? null;
  const readOnly = !run || run.status === "completed";

  const progress = useMemo(() => overallProgress(phases, stateMap), [phases, stateMap]);

  // Land on the first phase with work outstanding rather than always phase 1 —
  // picking the SOP back up mid-month is the normal case, not the exception.
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
  const patchStateLocally = (stepId: number, patch: Partial<{ state: TbStepState; note: string | null }>) => {
    workspace.setData((prev) => {
      if (!prev) return prev;
      const existing = prev.states.find((s) => s.stepId === stepId);
      const next = existing
        ? prev.states.map((s) => (s.stepId === stepId ? { ...s, ...patch } : s))
        : [...prev.states, { stepId, state: "open" as TbStepState, note: null, ...patch }];
      return { ...prev, states: next };
    });
  };

  const withRun = <T,>(fn: (runId: number) => T): T | undefined => {
    if (!run) return undefined;
    return fn(run.id);
  };

  /* ---------------------------------------------------------- mutations -- */

  const startMonth = async (target: string) => {
    setStarting(true);
    try {
      await api.post("/api/traffic-billing/runs", { month: target });
      setMonth(target);
      setActivePhaseId(null);
      await workspace.reload();
      bump();
      pushToast({
        title: `${formatMonthLabel(target)} started`,
        body: "Every step is back to open for the new billing month.",
        tone: "success",
      });
    } catch (err) {
      fail(err, "Could not start the month");
    } finally {
      setStarting(false);
    }
  };

  const setRunStatus = async (status: "in_progress" | "completed") => {
    if (!run) return;
    try {
      await api.patch(`/api/traffic-billing/runs/${run.id}`, { status });
      await workspace.reload();
      bump();
      pushToast({
        title: status === "completed" ? "Month marked complete" : "Month re-opened",
        tone: "success",
      });
    } catch (err) {
      fail(err, "Could not update the run");
    }
  };

  const setStepState = (stepId: number, next: TbStepState) =>
    withRun(async (runId) => {
      patchStateLocally(stepId, { state: next });
      try {
        await api.patch(`/api/traffic-billing/steps/${stepId}/state`, {
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
        await api.patch(`/api/traffic-billing/steps/${stepId}/state`, { runId, note });
        bump();
      } catch {
        await workspace.reload();
      }
    });

  const setPhaseState = (phaseId: number, next: TbStepState) =>
    withRun(async (runId) => {
      try {
        await api.post(`/api/traffic-billing/phases/${phaseId}/state`, {
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
      await api.patch(`/api/traffic-billing/steps/${stepId}`, { text });
      await workspace.reload();
      bump();
    } catch (err) {
      fail(err, "Could not save the step");
    }
  };

  const deleteStep = async (stepId: number) => {
    const step = phases.flatMap((p) => p.steps).find((s) => s.id === stepId);
    try {
      await api.del(`/api/traffic-billing/steps/${stepId}`);
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
      await api.post("/api/traffic-billing/steps", { phaseId, text, groupLabel });
      await workspace.reload();
      bump();
    } catch (err) {
      fail(err, "Could not add the step");
    }
  };

  const renamePhase = async (phaseId: number, title: string) => {
    try {
      await api.patch(`/api/traffic-billing/phases/${phaseId}`, { title });
      await workspace.reload();
      bump();
    } catch (err) {
      fail(err, "Could not rename the phase");
    }
  };

  const addMistake = async (phaseId: number, text: string) => {
    try {
      await api.post("/api/traffic-billing/mistakes", { phaseId, text });
      await workspace.reload();
      bump();
    } catch (err) {
      fail(err, "Could not add that");
    }
  };

  const deleteMistake = async (id: number) => {
    try {
      await api.del(`/api/traffic-billing/mistakes/${id}`);
      await workspace.reload();
      bump();
    } catch (err) {
      fail(err, "Could not remove that");
    }
  };

  const addIssue = (phaseId: number, text: string) =>
    withRun(async (runId) => {
      try {
        await api.post("/api/traffic-billing/issues", { runId, phaseId, text });
        await workspace.reload();
        bump();
      } catch (err) {
        fail(err, "Could not log that");
      }
    }) ?? Promise.resolve();

  const toggleIssue = async (id: number, resolved: boolean) => {
    try {
      await api.patch(`/api/traffic-billing/issues/${id}`, { resolved });
      await workspace.reload();
      bump();
    } catch (err) {
      fail(err, "Could not update the issue");
    }
  };

  const deleteIssue = async (id: number) => {
    try {
      await api.del(`/api/traffic-billing/issues/${id}`);
      await workspace.reload();
      bump();
    } catch (err) {
      fail(err, "Could not delete the issue");
    }
  };

  /* ------------------------------------------------------------- render -- */

  const thisMonth = localMonthKey();
  const thisMonthStarted = (data?.runs ?? []).some((r) => r.month === thisMonth);

  // Recurring by default: the current month starts itself the moment the
  // page loads, so there's nothing to remember to click each 1st. History
  // isn't lost by this — every month is its own permanent run row (see
  // TrafficBillingRun in prisma/schema.prisma), so auto-starting a new
  // month never touches a previous one, completed or not — every past
  // month stays exactly where it already was, selectable from the month
  // dropdown. A Vercel Cron backstop (app/api/cron/traffic-billing-monthly)
  // covers the case where nobody opens the app on the 1st itself.
  useEffect(() => {
    if (!data || phases.length === 0 || thisMonthStarted || starting) return;
    void startMonth(thisMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, phases.length, thisMonthStarted, starting, thisMonth]);

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
          <h1 className="page-title">Traffic Billing</h1>
          <p className="page-subtitle">
            {run
              ? `${formatMonthLabel(run.month)}${run.status === "completed" ? " · completed" : ""}`
              : "No billing month started yet"}
          </p>
        </div>

        <div className="page-actions">
          {(data?.runs.length ?? 0) > 0 && (
            <>
              <label className="visually-hidden" htmlFor="tb-month">
                Billing month
              </label>
              <select
                id="tb-month"
                className="input"
                value={run?.month ?? ""}
                onChange={(e) => {
                  setMonth(e.target.value);
                  setActivePhaseId(null);
                }}
              >
                {data?.runs.map((r) => (
                  <option key={r.id} value={r.month}>
                    {formatMonthLabel(r.month)}
                    {r.status === "completed" ? " (completed)" : ""}
                  </option>
                ))}
              </select>
            </>
          )}

          {!thisMonthStarted && (
            <button
              className="btn btn-primary"
              onClick={() => startMonth(thisMonth)}
              disabled={starting}
            >
              Start {formatMonthLabel(thisMonth)}
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
                  : "Mark this billing month complete"
              }
            >
              Mark month complete
            </button>
          )}

          {run && run.status === "completed" && (
            <button className="btn" onClick={() => setRunStatus("in_progress")}>
              Re-open month
            </button>
          )}
        </div>
      </header>

      {run && (
        <div className="tb-overall">
          <div className="tb-overall-head">
            <span className="tb-overall-pct">{progress.percent}%</span>
            <span className="tb-overall-count">
              {progress.settled} of {progress.total} steps
            </span>
            <TbProgressLabel progress={progress} />
          </div>
          <TbProgressBar
            progress={progress}
            size="md"
            label={`${progress.settled} of ${progress.total} steps settled this month`}
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
            hint="Run `npm run db:seed-traffic-billing` to populate the phases and steps from Traffic Billing SOP.md."
          />
        </Card>
      ) : !run ? (
        <Card headerless>
          <Empty
            title="No billing month started"
            hint={`Start ${formatMonthLabel(thisMonth)} to begin ticking off the SOP. Each month keeps its own record.`}
            action={
              <button
                className="btn btn-primary"
                onClick={() => startMonth(thisMonth)}
                disabled={starting}
              >
                Start {formatMonthLabel(thisMonth)}
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
