"use client";

import { useApp } from "../AppProvider";
import { Card, Empty, SkeletonList } from "../ui";
import { api } from "@/lib/client";
import { useFetch } from "@/lib/hooks";
import { formatWeekLabel, localCurrentWeekKey } from "@/lib/founder-os/week";
import type { FoTask } from "@/lib/types";

const WEEK_CAP = 6;

/**
 * A generator that surfaces a realistic weekly plan capped at what's
 * achievable in under 10 hours — never more than 5-6 concrete action items.
 * Reuses FounderTask.plannedForWeek rather than a separate table: "this
 * week's plan" is just a filtered, capped view of the same task list the
 * Kanban board already manages.
 */
export function WeeklyPlanner() {
  const { bump, version, pushToast } = useApp();
  const { data, loading, reload } = useFetch<{ tasks: FoTask[] }>("/api/founder-os/tasks", version);
  const tasks = data?.tasks ?? [];
  const thisWeek = localCurrentWeekKey();

  const planned = tasks.filter((t) => t.plannedForWeek === thisWeek);
  const unplanned = tasks.filter((t) => t.plannedForWeek !== thisWeek && t.status !== "completed");

  const setPlanned = async (task: FoTask, plan: boolean) => {
    try {
      await api.patch(`/api/founder-os/tasks/${task.id}`, { plannedForWeek: plan ? thisWeek : null });
      await reload();
      bump();
    } catch (err) {
      pushToast({ title: "Could not save", body: err instanceof Error ? err.message : undefined, tone: "error" });
    }
  };

  return (
    <Card title="Weekly Planner" subtitle={formatWeekLabel(thisWeek)} bodyClass="card-body flush">
      <div className="card-body tight">
        <h3 className="fo-planner-heading">
          This week ({planned.length} of {WEEK_CAP})
        </h3>
        {loading && tasks.length === 0 ? (
          <SkeletonList rows={2} />
        ) : planned.length === 0 ? (
          <Empty title="Nothing planned for this week yet" hint="Pick a few tasks below." />
        ) : (
          <div className="checklist">
            {planned.map((task) => (
              <div className="check-row" key={task.id}>
                <input
                  type="checkbox"
                  className="check-box"
                  checked
                  onChange={() => setPlanned(task, false)}
                  aria-label={`Remove "${task.title}" from this week`}
                  id={`fo-planned-${task.id}`}
                />
                <label className="check-text" htmlFor={`fo-planned-${task.id}`}>
                  {task.title}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card-body tight">
        <h3 className="fo-planner-heading">Pick from the rest</h3>
        {unplanned.length === 0 ? (
          <Empty title="No other open tasks" />
        ) : (
          <div className="checklist">
            {unplanned.map((task) => (
              <div className="check-row" key={task.id}>
                <input
                  type="checkbox"
                  className="check-box"
                  checked={false}
                  disabled={planned.length >= WEEK_CAP}
                  onChange={() => setPlanned(task, true)}
                  aria-label={`Add "${task.title}" to this week`}
                  id={`fo-unplanned-${task.id}`}
                />
                <label className="check-text" htmlFor={`fo-unplanned-${task.id}`}>
                  {task.title}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
