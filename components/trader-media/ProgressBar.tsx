"use client";

import type { Progress } from "@/lib/trader-media/progress";

/**
 * Segmented progress: done and N/A are drawn as separate bands rather than
 * merged into one fill. Verbatim mirror of
 * components/traffic-billing/ProgressBar.tsx — see that file's doc comment
 * for the reasoning, and note it reuses the same `.tb-progress*` CSS classes
 * (no Trader-Media-specific styling needed).
 */
export function TmProgressBar({
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
export function TmProgressLabel({ progress }: { progress: Progress }) {
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
