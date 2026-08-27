/**
 * Weekly runs are Monday-dated "YYYY-MM-DD" strings — the Monday that opens
 * the week, not any particular day worked in it. Same trap lib/date.ts and
 * lib/traffic-billing/month.ts document at length: the server runs in UTC
 * (Vercel) while the viewer is in their own timezone, so "what week is it
 * right now" must be computed from the viewer's LOCAL calendar day, while the
 * stored/round-tripped week key itself stays UTC-anchored throughout — it
 * reuses lib/date.ts's fromDateInputValue/toDateInputValue for that round
 * trip rather than reimplementing the UTC date math here.
 */
import { fromDateInputValue, toDateInputValue } from "@/lib/date";

const WEEK_LABEL_FMT = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC", // pinned UTC so the calendar day never shifts on display
});

const WEEK_SHORT_FMT = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/**
 * Walks a UTC-anchored calendar-day Date back to that week's Monday. Uses
 * getUTCDay() so the walk-back never depends on which timezone happens to be
 * running the code — `d` is already a pure calendar date by the time it gets
 * here (built via fromDateInputValue).
 */
export function mondayOfWeek(d: Date): Date {
  const day = d.getUTCDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? 6 : day - 1; // days back to Monday
  const monday = new Date(d.getTime());
  monday.setUTCDate(monday.getUTCDate() - diff);
  return monday;
}

/** "2026-08-24" → "Week of Aug 24, 2026". */
export function formatWeekLabel(weekKey: string): string {
  const d = fromDateInputValue(weekKey);
  return d ? `Week of ${WEEK_LABEL_FMT.format(d)}` : weekKey;
}

/** "2026-08-24" → "Aug 24", for tight spots like the sidebar badge. */
export function formatWeekShort(weekKey: string): string {
  const d = fromDateInputValue(weekKey);
  return d ? WEEK_SHORT_FMT.format(d) : weekKey;
}

/**
 * The Monday that starts "this week" in the *viewer's* timezone right now.
 * Client-only by intent, analogous to lib/traffic-billing/month.ts's
 * localMonthKey: builds today's calendar day from LOCAL getters first (the
 * viewer's today, not UTC's — same reasoning as lib/date.ts's
 * localTodayInputValue), then walks back to Monday through the same
 * UTC-anchored round trip every stored week key uses.
 */
export function localCurrentWeekKey(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const localTodayValue = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const asCalendarDay = fromDateInputValue(localTodayValue)!;
  return toDateInputValue(mondayOfWeek(asCalendarDay));
}

/** The Monday 7 days before the given week key. */
export function previousWeek(weekKey: string): string {
  const d = fromDateInputValue(weekKey);
  if (!d) return weekKey;
  d.setUTCDate(d.getUTCDate() - 7);
  return toDateInputValue(d);
}

/**
 * The Monday for "this week" using the *server's* clock (UTC on Vercel) —
 * for the cron backstop only (see app/api/cron/trader-media-weekly), which
 * runs with no viewer attached and so has no local timezone to be faithful
 * to. Never use this for anything user-facing: localCurrentWeekKey is the
 * one that matters when a person is actually looking at the screen, same
 * split lib/monthly-reset.ts's server-local monthKey() accepts for the same
 * reason — a backstop firing a few hours off near a Monday-morning boundary
 * is a much smaller problem than showing someone the wrong week.
 */
export function serverCurrentWeekKey(d = new Date()): string {
  return toDateInputValue(mondayOfWeek(d));
}
