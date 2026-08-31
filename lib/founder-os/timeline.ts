/**
 * 90-day runway math for the Founder OS Dashboard. Reuses lib/date.ts's
 * UTC-anchored calendar-day helpers directly rather than reimplementing date
 * math — startDate is stored the same way Task.dueDate is (a calendar day,
 * not an instant), so the same round trip applies.
 */
import { daysBetween, todayAsCalendarDay } from "@/lib/date";

/** Fixed markers shown on the runway track, out of a 90-day span. */
export const RUNWAY_MARKERS = [1, 30, 60, 90] as const;

/**
 * Day 1 = the start date itself, not day 0 — so "today" on the start date
 * reads as "Day 1", matching how a founder would count it out loud. Null
 * when no start date has been set yet.
 */
export function runwayDayNumber(startDate: Date | string | null): number | null {
  if (!startDate) return null;
  return daysBetween(startDate, todayAsCalendarDay()) + 1;
}

/** Where a given day number sits on the 0–100% track, clamped to the ends. */
export function runwayMarkerPercent(day: number): number {
  return Math.min(100, Math.max(0, (day / 90) * 100));
}
