"use client";

import type { Progress } from "@/lib/traffic-billing/progress";

/**
 * Segmented progress: done and N/A are drawn as separate bands rather than
 * merged into one fill.
 *
 * They both count as settled, so a single bar would show a phase at 100% with
 * no hint that most of it was skipped this month — which is exactly the thing
 * worth noticing when you review a past run. Two tones, one bar.
 */
export function TbProgressBar({
  progress,
  label,
  size = "md",
}: {
  progress: Progress;
  /** Accessible description, e.g. "12 of 20 steps settled in this phase". */
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

/** The "8 done · 2 N/A · 5 left" caption, kept consistent everywhere. */
export function TbProgressLabel({ progress }: { progress: Progress }) {
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
