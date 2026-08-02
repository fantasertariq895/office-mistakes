import { prisma } from "./prisma";
import { endOfDay, isWithinQuietHours, startOfDay } from "./date";

/**
 * Fully stateless — everything here is recomputed fresh from the database on
 * every call, with no in-memory queue or dedupe set. A serverless deployment
 * has no single process to hold that state in: different requests can land on
 * different, freshly-cold instances, so anything kept in memory here would be
 * invisible to the next request and silently reset. Deduping "have I already
 * shown this alert" happens client-side instead (see AppProvider), scoped to
 * the browser that's actually looking at it — which is arguably more correct
 * anyway.
 */

export type TaskAlert = {
  taskId: number;
  kind: "task_due" | "task_overdue";
  title: string;
  body: string;
};

export type NotificationSnapshot = {
  dueToday: number;
  overdue: number;
  badge: number;
  alerts: TaskAlert[];
  suppressed: "quiet_hours" | "disabled" | null;
};

export async function getNotificationSnapshot(
  now = new Date()
): Promise<NotificationSnapshot> {
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const [settings, rules, tasks] = await Promise.all([
    prisma.settings.findUnique({ where: { id: 1 } }),
    prisma.notificationRule.findMany({ where: { channel: "in_app" } }),
    prisma.task.findMany({
      where: { status: { not: "completed" }, dueDate: { not: null } },
      include: { commission: { select: { id: true, name: true, color: true } } },
      orderBy: [{ dueDate: "asc" }],
    }),
  ]);

  const dueTodayTasks = tasks.filter(
    (t) => t.dueDate! >= todayStart && t.dueDate! <= todayEnd
  );
  const overdueTasks = tasks.filter((t) => t.dueDate! < todayStart);

  const dueEnabled = rules.find((r) => r.type === "task_due")?.enabled ?? false;
  const overdueEnabled =
    rules.find((r) => r.type === "task_overdue")?.enabled ?? false;

  const badge = { dueToday: dueTodayTasks.length, overdue: overdueTasks.length };

  if (!dueEnabled && !overdueEnabled) {
    return { ...badge, badge: badge.dueToday + badge.overdue, alerts: [], suppressed: "disabled" };
  }

  if (isWithinQuietHours(settings?.quietHoursStart ?? null, settings?.quietHoursEnd ?? null, now)) {
    return { ...badge, badge: badge.dueToday + badge.overdue, alerts: [], suppressed: "quiet_hours" };
  }

  const alerts: TaskAlert[] = [];
  const describe = (t: (typeof tasks)[number]) =>
    `${t.title}${t.commission ? ` · ${t.commission.name}` : ""}`;

  if (dueEnabled) {
    for (const t of dueTodayTasks) {
      alerts.push({ taskId: t.id, kind: "task_due", title: "Due today", body: describe(t) });
    }
  }
  if (overdueEnabled) {
    for (const t of overdueTasks) {
      alerts.push({ taskId: t.id, kind: "task_overdue", title: "Overdue", body: describe(t) });
    }
  }

  return { ...badge, badge: badge.dueToday + badge.overdue, alerts, suppressed: null };
}
