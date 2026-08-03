/**
 * Due dates are pure calendar dates — "August 4th" — with no time-of-day or
 * timezone meaning attached. They're stored as UTC midnight of the chosen
 * day and read back the same way, so the calendar day never depends on which
 * timezone happened to parse or display it.
 *
 * That distinction matters here specifically: API routes run on a server
 * (UTC on Vercel) while the UI runs in the visitor's browser (their own
 * timezone). A due date built with *local* midnight on the server landed on
 * a different calendar day once read back with *local* getters in the
 * browser — a date picked as "Aug 4" would save and redisplay as "Aug 3" for
 * anyone west of UTC. Every function below that touches a due date
 * (fromDateInputValue, toDateInputValue, startOfDay/endOfDay, daysBetween,
 * relativeDayLabel/formatCalendarDay) is UTC-anchored on purpose, so the
 * calendar day round-trips identically everywhere.
 *
 * Real timestamps — when a task was completed, when a mistake was logged —
 * are a different thing: a genuine instant, correctly shown in the viewer's
 * own local time. formatDay/formatFullDate/formatDateTime are for those and
 * deliberately unaffected by any of this.
 */

export function startOfDay(d: Date | string = new Date()): Date {
  const date = typeof d === "string" ? new Date(d) : new Date(d.getTime());
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

export function endOfDay(d: Date | string = new Date()): Date {
  const date = typeof d === "string" ? new Date(d) : new Date(d.getTime());
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999)
  );
}

export function addDays(d: Date, days: number): Date {
  const date = new Date(d.getTime());
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

/** "YYYY-MM-DD" for the calendar day this (UTC-anchored) date represents. */
export function toDateInputValue(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** Parse "YYYY-MM-DD" as UTC midnight — see the module doc for why UTC, not local. */
export function fromDateInputValue(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

export function daysBetween(a: Date | string, b: Date | string): number {
  const start = startOfDay(a).getTime();
  const end = startOfDay(b).getTime();
  return Math.round((end - start) / 86_400_000);
}

export function isToday(d: Date | string | null | undefined): boolean {
  if (!d) return false;
  return daysBetween(new Date(), d) === 0;
}

export function isPast(d: Date | string | null | undefined): boolean {
  if (!d) return false;
  return daysBetween(new Date(), d) < 0;
}

export function isFuture(d: Date | string | null | undefined): boolean {
  if (!d) return false;
  return daysBetween(new Date(), d) > 0;
}

const DAY_FMT = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
});

// Same format as DAY_FMT, but pinned to UTC so a calendar-day value (a due
// date) reads as the day it was picked, not whatever day that UTC instant
// happens to fall on in the viewer's own timezone.
const CALENDAR_DAY_FMT = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const FULL_FMT = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const TIME_FMT = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

/** For real timestamps (dateLogged, completedAt) — shown in the viewer's local time. */
export function formatDay(d: Date | string | null | undefined): string {
  if (!d) return "No due date";
  const date = typeof d === "string" ? new Date(d) : d;
  return DAY_FMT.format(date);
}

/** For due dates (calendar days) — shown as the day it was picked, timezone-independent. */
export function formatCalendarDay(d: Date | string | null | undefined): string {
  if (!d) return "No due date";
  const date = typeof d === "string" ? new Date(d) : d;
  return CALENDAR_DAY_FMT.format(date);
}

export function formatFullDate(d: Date | string = new Date()): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return FULL_FMT.format(date);
}

export function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${DAY_FMT.format(date)} · ${TIME_FMT.format(date)}`;
}

/** "Today", "Tomorrow", "3 days overdue", "in 5 days", else a short date. */
export function relativeDayLabel(d: Date | string | null | undefined): string {
  if (!d) return "No due date";
  const diff = daysBetween(new Date(), d);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  if (diff <= 7) return `In ${diff} days`;
  return formatCalendarDay(d);
}

/** "HH:MM" → minutes since local midnight. */
export function minutesFromTimeString(value: string | null): number | null {
  if (!value) return null;
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

/**
 * Quiet hours may wrap midnight (e.g. 22:00 → 07:00), so treat the window as a
 * circular range.
 */
export function isWithinQuietHours(
  start: string | null,
  end: string | null,
  at: Date = new Date()
): boolean {
  const s = minutesFromTimeString(start);
  const e = minutesFromTimeString(end);
  if (s === null || e === null || s === e) return false;
  const now = at.getHours() * 60 + at.getMinutes();
  return s < e ? now >= s && now < e : now >= s || now < e;
}
