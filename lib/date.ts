/**
 * All date handling is calendar-day based in the machine's local timezone.
 *
 * Due dates are stored as the local-midnight instant of the chosen day, so
 * "overdue"/"due today"/"upcoming" are pure calendar-day comparisons and never
 * depend on the time of day.
 */

export function startOfDay(d: Date | string = new Date()): Date {
  const date = typeof d === "string" ? new Date(d) : new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfDay(d: Date | string = new Date()): Date {
  const date = typeof d === "string" ? new Date(d) : new Date(d.getTime());
  date.setHours(23, 59, 59, 999);
  return date;
}

export function addDays(d: Date, days: number): Date {
  const date = new Date(d.getTime());
  date.setDate(date.getDate() + days);
  return date;
}

/** "YYYY-MM-DD" in local time — the value an <input type="date"> expects. */
export function toDateInputValue(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parse "YYYY-MM-DD" as local midnight (not UTC, which `new Date(str)` does). */
export function fromDateInputValue(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
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

export function formatDay(d: Date | string | null | undefined): string {
  if (!d) return "No due date";
  const date = typeof d === "string" ? new Date(d) : d;
  return DAY_FMT.format(date);
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
  return formatDay(d);
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
