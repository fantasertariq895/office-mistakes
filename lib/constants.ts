/** Enum-ish values. SQLite has no enums, so these are validated in app code. */

export const TASK_STATUSES = [
  "not_started",
  "in_progress",
  "waiting",
  "completed",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  waiting: "Waiting",
  completed: "Completed",
};

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const NOTIFICATION_TYPES = [
  "task_due",
  "task_overdue",
  "daily_digest",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  task_due: "Task due today",
  task_overdue: "Task overdue",
  daily_digest: "Daily digest",
};

export const NOTIFICATION_CHANNELS = ["in_app", "email", "whatsapp"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  in_app: "In-app + desktop",
  email: "Email",
  whatsapp: "WhatsApp",
};

/** Channels not implemented in the Phase 1 MVP — rendered disabled in Settings. */
export const CHANNEL_PHASE: Record<NotificationChannel, string | null> = {
  in_app: null,
  email: "Phase 2",
  whatsapp: "Phase 3",
};

/** Palette offered when creating/editing a commission. */
export const COMMISSION_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#0D9488",
  "#D97706",
  "#DB2777",
  "#059669",
  "#DC2626",
  "#0891B2",
  "#65A30D",
  "#6B7280",
];

export function isTaskStatus(v: unknown): v is TaskStatus {
  return typeof v === "string" && (TASK_STATUSES as readonly string[]).includes(v);
}

export function isTaskPriority(v: unknown): v is TaskPriority {
  return (
    typeof v === "string" && (TASK_PRIORITIES as readonly string[]).includes(v)
  );
}
