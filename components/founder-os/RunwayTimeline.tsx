"use client";

import { useState } from "react";
import { RUNWAY_MARKERS, runwayDayNumber, runwayMarkerPercent } from "@/lib/founder-os/timeline";
import { toDateInputValue } from "@/lib/date";

export function RunwayTimeline({
  startDate,
  onSetStartDate,
}: {
  startDate: string | null;
  onSetStartDate: (value: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(toDateInputValue(startDate));
  const [busy, setBusy] = useState(false);

  if (!startDate) {
    return (
      <div className="fo-timeline-prompt">
        <label htmlFor="fo-start-date">
          When does Day 1 of the 90-day plan start?
        </label>
        <div className="row">
          <input
            id="fo-start-date"
            type="date"
            className="input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-sm btn-primary"
            disabled={!draft || busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onSetStartDate(draft);
              } finally {
                setBusy(false);
              }
            }}
          >
            Set Day 1
          </button>
        </div>
      </div>
    );
  }

  const today = runwayDayNumber(startDate) ?? 1;
  const todayPct = runwayMarkerPercent(today);

  return (
    <div className="fo-timeline" role="img" aria-label={`Day ${today} of the 90-day runway`}>
      <div className="fo-timeline-track" />
      {RUNWAY_MARKERS.map((day) => (
        <span
          key={day}
          className="fo-timeline-marker"
          style={{ left: `${runwayMarkerPercent(day)}%` }}
          aria-hidden="true"
        >
          Day {day}
        </span>
      ))}
      <span className="fo-timeline-today" style={{ left: `${todayPct}%` }} aria-hidden="true" />
    </div>
  );
}
