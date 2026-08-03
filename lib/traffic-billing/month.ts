/**
 * Billing months are "YYYY-MM" strings, formatted without ever constructing a
 * Date from them.
 *
 * That's deliberate, and it's the same trap lib/date.ts documents at length:
 * `new Date("2026-08")` parses as UTC midnight on the 1st, which in any
 * timezone west of UTC formats as *July*. Since a billing month is a pure
 * label with no instant behind it, the safe move is not to involve Date in
 * the round trip at all.
 */

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "2026-08" → "August 2026". */
export function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-");
  const name = MONTH_NAMES[Number(m) - 1];
  return name ? `${name} ${year}` : month;
}

/** "2026-08" → "Aug 2026", for tight spots like the sidebar badge. */
export function formatMonthShort(month: string): string {
  const [year, m] = month.split("-");
  const name = MONTH_NAMES[Number(m) - 1];
  return name ? `${name.slice(0, 3)} ${year}` : month;
}

/**
 * The current month in the *viewer's* timezone. Client-only by intent: called
 * on the server it would report UTC's month, which near a month boundary is
 * not the month the person looking at the screen is in.
 */
export function localMonthKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** The month before the given key — "2026-01" → "2025-12". */
export function previousMonth(month: string): string {
  const [year, m] = month.split("-").map(Number);
  return m === 1
    ? `${year - 1}-12`
    : `${year}-${String(m - 1).padStart(2, "0")}`;
}
