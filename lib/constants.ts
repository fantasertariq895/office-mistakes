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

/* ------------------------------------------------------------- Founder OS --
 * Own status/priority sets, deliberately not reused from TASK_STATUSES/
 * TaskPriority above: the Kanban board needs a 5th status (Blocked) and a
 * 4th priority (Critical) that the Home-page Tasks feature doesn't have —
 * extending those would scope-creep an unrelated feature.
 */

export const FOUNDER_PIPELINE_STATUSES = [
  "contacted",
  "replied",
  "call_booked",
  "proposal_sent",
  "closed",
  "no_response",
] as const;
export type FounderPipelineStatus = (typeof FOUNDER_PIPELINE_STATUSES)[number];

export const FOUNDER_PIPELINE_STATUS_LABELS: Record<FounderPipelineStatus, string> = {
  contacted: "Contacted",
  replied: "Replied",
  call_booked: "Call booked",
  proposal_sent: "Proposal sent",
  closed: "Closed",
  no_response: "No response",
};

export function isFounderPipelineStatus(v: unknown): v is FounderPipelineStatus {
  return (
    typeof v === "string" &&
    (FOUNDER_PIPELINE_STATUSES as readonly string[]).includes(v)
  );
}

/** Array order IS the Kanban column order — the board maps over this directly. */
export const FOUNDER_TASK_STATUSES = [
  "not_started",
  "in_progress",
  "waiting",
  "completed",
  "blocked",
] as const;
export type FounderTaskStatus = (typeof FOUNDER_TASK_STATUSES)[number];

export const FOUNDER_TASK_STATUS_LABELS: Record<FounderTaskStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  waiting: "Waiting",
  completed: "Completed",
  blocked: "Blocked",
};

export function isFounderTaskStatus(v: unknown): v is FounderTaskStatus {
  return (
    typeof v === "string" && (FOUNDER_TASK_STATUSES as readonly string[]).includes(v)
  );
}

export const FOUNDER_TASK_PRIORITIES = ["critical", "high", "medium", "low"] as const;
export type FounderTaskPriority = (typeof FOUNDER_TASK_PRIORITIES)[number];

export const FOUNDER_TASK_PRIORITY_LABELS: Record<FounderTaskPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function isFounderTaskPriority(v: unknown): v is FounderTaskPriority {
  return (
    typeof v === "string" &&
    (FOUNDER_TASK_PRIORITIES as readonly string[]).includes(v)
  );
}

/* --------------------------------------------------- Founder OS, Phase 2/3 */

export const FOUNDER_COST_TYPES = ["one_time", "recurring"] as const;
export type FounderCostType = (typeof FOUNDER_COST_TYPES)[number];
export const FOUNDER_COST_TYPE_LABELS: Record<FounderCostType, string> = {
  one_time: "One-time",
  recurring: "Recurring",
};
export function isFounderCostType(v: unknown): v is FounderCostType {
  return typeof v === "string" && (FOUNDER_COST_TYPES as readonly string[]).includes(v);
}

export const FOUNDER_TECH_STATUSES = ["not_set_up", "set_up"] as const;
export type FounderTechStatus = (typeof FOUNDER_TECH_STATUSES)[number];
export const FOUNDER_TECH_STATUS_LABELS: Record<FounderTechStatus, string> = {
  not_set_up: "Not set up",
  set_up: "Set up",
};
export function isFounderTechStatus(v: unknown): v is FounderTechStatus {
  return typeof v === "string" && (FOUNDER_TECH_STATUSES as readonly string[]).includes(v);
}

export const FOUNDER_RISK_LEVELS = ["low", "medium", "high"] as const;
export type FounderRiskLevel = (typeof FOUNDER_RISK_LEVELS)[number];
export const FOUNDER_RISK_LEVEL_LABELS: Record<FounderRiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};
export function isFounderRiskLevel(v: unknown): v is FounderRiskLevel {
  return typeof v === "string" && (FOUNDER_RISK_LEVELS as readonly string[]).includes(v);
}

/** $30,000/yr is the CRA's HST-registration trigger — surfaced in the Legal checklist and Finance module. */
export const HST_REGISTRATION_THRESHOLD_CAD = 30_000;

/** The $2,000 CAD one-time-spend cap from the source doc's budget. */
export const FOUNDER_STARTUP_BUDGET_CAP_CAD = 2_000;

/** Tri-state for the master 90-day Plan checklist — same shape as TM_STEP_STATES. */
export const FOUNDER_PLAN_STEP_STATES = ["open", "done", "na"] as const;
export type FounderPlanStepState = (typeof FOUNDER_PLAN_STEP_STATES)[number];
export function isFounderPlanStepState(v: unknown): v is FounderPlanStepState {
  return typeof v === "string" && (FOUNDER_PLAN_STEP_STATES as readonly string[]).includes(v);
}

/** The Plan checklist's single phase-accent color — no stage grouping, 13 phases is a flat rail. */
export const FOUNDER_PLAN_ACCENT_COLOR = "#0D9488";
