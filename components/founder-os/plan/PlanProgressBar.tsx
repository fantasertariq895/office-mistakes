"use client";

import type { Progress } from "@/lib/founder-os/plan-progress";

/** Verbatim mirror of components/trader-media/ProgressBar.tsx, reusing the same `.tb-progress*` CSS classes. */
export function PlanProgressBar({
  progress,
  label,
  size = "md",
}: {
  progress: Progress;
  label: string;
  size?: "sm" | "md";
}) {
  const donePct = progress.total === 0 ? 0 : (progress.done / progress.total) * 100;
  const naPct = progress.total === 0 ? 0 : (progress.na / progress.total) * 100;

  return (
    <div
      className={`tb-progress ${size}${progress.complete ? " complete" : ""}`}
      role="progressbar"
      aria-valuenow={progress.settled}
      aria-valuemin={0}
      aria-valuemax={progress.total}
      aria-label={label}
    >
      <div className="tb-progress-done" style={{ width: `${donePct}%` }} />
      <div className="tb-progress-na" style={{ width: `${naPct}%` }} />
    </div>
  );
}

export function PlanProgressLabel({ progress }: { progress: Progress }) {
  return (
    <span className="tb-progress-label">
      <span className="tb-legend done">{progress.done} done</span>
      {progress.na > 0 && <span className="tb-legend na">{progress.na} N/A</span>}
      {progress.open > 0 ? (
        <span className="tb-legend open">{progress.open} left</span>
      ) : (
        <span className="tb-legend finished">complete</span>
      )}
    </span>
  );
}
