/**
 * Monday-dated week keys for the Weekly Planner's `FounderTask.plannedForWeek`.
 * Own copy of the same logic lib/trader-media/week.ts already has — not
 * imported from there, same cross-feature isolation reasoning documented
 * throughout this app (Traffic Billing and Trader Media don't import each
 * other's helpers either, even the trivially pure ones).
 */
import { fromDateInputValue, toDateInputValue } from "@/lib/date";

function mondayOfWeek(d: Date): Date {
  const day = d.getUTCDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(d.getTime());
  monday.setUTCDate(monday.getUTCDate() - diff);
  return monday;
}

const WEEK_LABEL_FMT = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-08-24" → "Week of Aug 24, 2026". */
export function formatWeekLabel(weekKey: string): string {
  const d = fromDateInputValue(weekKey);
  return d ? `Week of ${WEEK_LABEL_FMT.format(d)}` : weekKey;
}

/** The Monday that starts "this week" for the viewer, right now. Client-only by intent. */
export function localCurrentWeekKey(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const localTodayValue = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const asCalendarDay = fromDateInputValue(localTodayValue)!;
  return toDateInputValue(mondayOfWeek(asCalendarDay));
}
