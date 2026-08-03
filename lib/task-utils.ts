import { daysBetween, todayAsCalendarDay } from "./date";

type SortableTask = {
  dueDate: Date | string | null;
  priority: string;
  createdAt: Date | string;
  id: number;
};

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

/**
 * Soonest due date first, undated last, then high priority first, then newest.
 * (SQLite can't express "nulls last" through Prisma, so ordering happens here
 * and is shared by the API and the client filters.)
 */
export function sortTasks<T extends SortableTask>(tasks: T[]): T[] {
  return [...tasks].sort((a, b) => {
    const aDue = a.dueDate ? new Date(a.dueDate).getTime() : null;
    const bDue = b.dueDate ? new Date(b.dueDate).getTime() : null;
    if (aDue !== bDue) {
      if (aDue === null) return 1;
      if (bDue === null) return -1;
      return aDue - bDue;
    }
    const aP = PRIORITY_RANK[a.priority] ?? 1;
    const bP = PRIORITY_RANK[b.priority] ?? 1;
    if (aP !== bP) return aP - bP;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

type DatedTask = { dueDate: Date | string | null; status: string };

export const isOpen = (t: DatedTask) => t.status !== "completed";

export function isOverdueTask(t: DatedTask): boolean {
  return isOpen(t) && !!t.dueDate && daysBetween(todayAsCalendarDay(), t.dueDate) < 0;
}

export function isDueTodayTask(t: DatedTask): boolean {
  return isOpen(t) && !!t.dueDate && daysBetween(todayAsCalendarDay(), t.dueDate) === 0;
}

export function isUpcomingTask(t: DatedTask, withinDays?: number): boolean {
  if (!isOpen(t) || !t.dueDate) return false;
  const diff = daysBetween(todayAsCalendarDay(), t.dueDate);
  if (diff <= 0) return false;
  return withinDays === undefined ? true : diff <= withinDays;
}
