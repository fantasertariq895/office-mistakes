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

/* ---------------------------------------------------------- Traffic Billing */

/**
 * Three states, not a checkbox. The SOP says "applicable" or "where
 * applicable" throughout — without an explicit N/A, a month where (say)
 * TikTok wasn't billed reads as permanently incomplete and the progress
 * figure stops meaning anything.
 */
export const TB_STEP_STATES = ["open", "done", "na"] as const;
export type TbStepState = (typeof TB_STEP_STATES)[number];

export const TB_STEP_STATE_LABELS: Record<TbStepState, string> = {
  open: "Not done",
  done: "Done",
  na: "Not applicable",
};

export const TB_RUN_STATUSES = ["in_progress", "completed"] as const;
export type TbRunStatus = (typeof TB_RUN_STATUSES)[number];

export function isTbStepState(v: unknown): v is TbStepState {
  return typeof v === "string" && (TB_STEP_STATES as readonly string[]).includes(v);
}

export function isTbRunStatus(v: unknown): v is TbRunStatus {
  return typeof v === "string" && (TB_RUN_STATUSES as readonly string[]).includes(v);
}

/**
 * Trader Media — same tri-state/run-status shape as Traffic Billing above,
 * just renamed. Kept as a separate set of constants (not shared) so the two
 * features stay fully independent, matching how their DB tables don't touch.
 */
export const TM_STEP_STATES = ["open", "done", "na"] as const;
export type TmStepState = (typeof TM_STEP_STATES)[number];

export const TM_STEP_STATE_LABELS: Record<TmStepState, string> = {
  open: "Not done",
  done: "Done",
  na: "Not applicable",
};

export const TM_RUN_STATUSES = ["in_progress", "completed"] as const;
export type TmRunStatus = (typeof TM_RUN_STATUSES)[number];

export function isTmStepState(v: unknown): v is TmStepState {
  return typeof v === "string" && (TM_STEP_STATES as readonly string[]).includes(v);
}

export function isTmRunStatus(v: unknown): v is TmRunStatus {
  return typeof v === "string" && (TM_RUN_STATUSES as readonly string[]).includes(v);
}

/**
 * Trader Media's single phase-accent color. There's no stage grouping (only
 * 13 phases, too few to need Traffic Billing's 9-stage rail sections), so
 * one color drives the "--stage" CSS variable everywhere Traffic Billing
 * would look up a per-stage color.
 */
export const TM_ACCENT_COLOR = "#4F46E5";

export function isTaskStatus(v: unknown): v is TaskStatus {
  return typeof v === "string" && (TASK_STATUSES as readonly string[]).includes(v);
}

export function isTaskPriority(v: unknown): v is TaskPriority {
  return (
    typeof v === "string" && (TASK_PRIORITIES as readonly string[]).includes(v)
  );
}
