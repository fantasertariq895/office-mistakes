/**
 * Shapes as they cross the API boundary (dates serialised to ISO strings).
 */
import type {
  FounderCostType,
  FounderPipelineStatus,
  FounderPlanStepState,
  FounderRiskLevel,
  FounderTaskPriority,
  FounderTaskStatus,
  FounderTechStatus,
  TaskPriority,
  TaskStatus,
  TbRunStatus,
  TbStepState,
  TmRunStatus,
  TmStepState,
} from "./constants";

export type Commission = {
  id: number;
  name: string;
  color: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
};

export type ChecklistItem = {
  id: number;
  commissionId: number | null;
  text: string;
  category: string | null;
  isHighRisk: boolean;
  isCustom: boolean;
  checkedAt: string | null;
  sortOrder: number;
  createdAt: string;
};

export type MistakeLogEntry = {
  id: number;
  commissionId: number;
  text: string;
  dateLogged: string;
  resolved: boolean;
};

export type Contact = {
  id: number;
  commissionId: number;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
};

export type ApprovalRequirement = {
  id: number;
  commissionId: number;
  description: string;
};

export type Task = {
  id: number;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  commissionId: number | null;
  notes: string | null;
  createdAt: string;
  completedAt: string | null;
  commission?: Pick<Commission, "id" | "name" | "color"> | null;
};

export type NotificationRule = {
  id: number;
  type: string;
  channel: string;
  enabled: boolean;
};

export type AppSettings = {
  id: number;
  pinSet: boolean;
  /** True on a deployment where FORCE_PIN=true — the lock can't be turned off. */
  forcePin: boolean;
  notificationChannels: string[];
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  theme: "light" | "dark";
  updatedAt: string;
};

/** Everything needed to render a commission workspace or inline context panel. */
export type CommissionDetail = Commission & {
  checklistItems: ChecklistItem[];
  mistakes: MistakeLogEntry[];
  contacts: Contact[];
  approvalRequirements: ApprovalRequirement[];
  openTaskCount: number;
};

export type TaskAlert = {
  taskId: number;
  kind: "task_due" | "task_overdue";
  title: string;
  body: string;
};

export type NotificationPoll = {
  dueToday: number;
  overdue: number;
  badge: number;
  alerts: TaskAlert[];
  suppressed: "quiet_hours" | "disabled" | null;
};

/** One-shot payload for the single-canvas Home. */
export type BoardCommission = Commission & {
  checklistItems: ChecklistItem[];
  contacts: Contact[];
  approvalRequirements: ApprovalRequirement[];
  mistakes: MistakeLogEntry[];
  openTaskCount: number;
};

export type BoardData = {
  universal: ChecklistItem[];
  commissions: BoardCommission[];
  /** Present only on the exact request where the new-month reset just ran. */
  monthlyReset: { itemsReset: number; month: string } | null;
};

/* --------------------------------------------------------- Traffic Billing -- */

export type TbStep = {
  id: number;
  phaseId: number;
  key: string;
  groupLabel: string | null;
  text: string;
  /** Reference bullets from the SOP — displayed under the step, not tickable. */
  notes: string[];
  isHighRisk: boolean;
  isCustom: boolean;
  sortOrder: number;
};

export type TbMistake = {
  id: number;
  phaseId: number | null;
  text: string;
  sortOrder: number;
  isCustom: boolean;
};

export type TbPhase = {
  id: number;
  key: string;
  number: number;
  stageKey: string;
  title: string;
  intro: string | null;
  sortOrder: number;
  isCustom: boolean;
  steps: TbStep[];
  mistakes: TbMistake[];
};

export type TbRun = {
  id: number;
  month: string;
  status: TbRunStatus;
  startedAt: string;
  completedAt: string | null;
};

export type TbIssue = {
  id: number;
  runId: number;
  phaseId: number;
  text: string;
  resolved: boolean;
  createdAt: string;
};

/**
 * Per-run step state. Only touched steps have a row — a step missing from
 * this list is "open", which is what keeps starting a new month a single
 * insert rather than 304.
 */
export type TbStepStateRow = {
  stepId: number;
  state: TbStepState;
  note: string | null;
};

/** Everything the workspace needs for one run, in a single request. */
export type TbWorkspace = {
  phases: TbPhase[];
  /** Mistakes not tied to any phase — they apply throughout the SOP. */
  globalMistakes: TbMistake[];
  runs: TbRun[];
  /** Null before the first run has ever been started. */
  run: TbRun | null;
  states: TbStepStateRow[];
  issues: TbIssue[];
};

/* ------------------------------------------------------------ Trader Media -- */

export type TmStep = {
  id: number;
  phaseId: number;
  key: string;
  groupLabel: string | null;
  text: string;
  /** Reference bullets from the SOP — displayed under the step, not tickable. */
  notes: string[];
  isHighRisk: boolean;
  isCustom: boolean;
  sortOrder: number;
};

export type TmMistake = {
  id: number;
  phaseId: number | null;
  text: string;
  sortOrder: number;
  isCustom: boolean;
};

export type TmPhase = {
  id: number;
  key: string;
  number: number;
  title: string;
  intro: string | null;
  /** True for phases that are Yuvika's / not yet the user's job. */
  isOwnerPending: boolean;
  sortOrder: number;
  isCustom: boolean;
  steps: TmStep[];
  mistakes: TmMistake[];
};

export type TmRun = {
  id: number;
  week: string;
  status: TmRunStatus;
  startedAt: string;
  completedAt: string | null;
};

export type TmIssue = {
  id: number;
  runId: number;
  phaseId: number;
  text: string;
  resolved: boolean;
  createdAt: string;
};

/**
 * Per-run step state. Only touched steps have a row — a step missing from
 * this list is "open", which is what keeps starting a new week a single
 * insert rather than N.
 */
export type TmStepStateRow = {
  stepId: number;
  state: TmStepState;
  note: string | null;
};

/** Everything the workspace needs for one run, in a single request. */
export type TmWorkspace = {
  phases: TmPhase[];
  /** Mistakes not tied to any phase — they apply throughout the SOP. */
  globalMistakes: TmMistake[];
  runs: TmRun[];
  /** Null before the first run has ever been started. */
  run: TmRun | null;
  states: TmStepStateRow[];
  issues: TmIssue[];
};

export type TmSetupItem = {
  id: number;
  key: string;
  text: string;
  sortOrder: number;
  done: boolean;
  doneAt: string | null;
};

/* ------------------------------------------------------------- Founder OS -- */

export type FoPipelineContact = {
  id: number;
  name: string;
  company: string | null;
  channel: string | null;
  dateContacted: string | null;
  status: FounderPipelineStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FoTask = {
  id: number;
  title: string;
  description: string | null;
  status: FounderTaskStatus;
  priority: FounderTaskPriority;
  dueDate: string | null;
  sortOrder: number;
  /** Monday-dated week key ("2026-08-24") if picked for the Weekly Planner. */
  plannedForWeek: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type FoSettings = {
  id: number;
  startDate: string | null;
  updatedAt: string;
};

/** One stat tile — Phase 2 (Finance/Legal) adds more; the strip component never changes. */
export type FoStatTile = {
  id: string;
  label: string;
  value: string;
  tone?: "default" | "danger" | "success";
};

/** One "Do This Now" row. */
export type FoDoNowItem = {
  id: string;
  source: "task" | "pipeline";
  title: string;
  detail: string | null;
};

export type FoDashboard = {
  settings: FoSettings;
  stats: FoStatTile[];
  doNow: FoDoNowItem[];
};

/* --------------------------------------------------- Founder OS, Phase 2/3 */

/** BMC blocks, ICP fields, Brand copy, Funding Notes, Hiring notes, Roadmap months. */
export type FoTextBlock = {
  id: number;
  key: string;
  section: string;
  label: string;
  content: string | null;
  sortOrder: number;
  updatedAt: string;
};

export type FoScore = {
  id: number;
  key: string;
  label: string;
  score: number;
  sortOrder: number;
};

export type FoCompetitor = {
  id: number;
  name: string;
  service: string | null;
  price: string | null;
  targetCustomer: string | null;
  strengths: string | null;
  weaknesses: string | null;
  positioning: string | null;
  opportunity: string | null;
  isCustom: boolean;
  sortOrder: number;
};

export type FoCostItem = {
  id: number;
  name: string;
  type: FounderCostType;
  amountCad: number;
  isCustom: boolean;
  sortOrder: number;
};

export type FoRevenueMonth = {
  id: number;
  monthNumber: number;
  clients: number;
  avgRevenuePerClient: number;
  costOfDelivery: number;
};

export type FoPricingTier = {
  id: number;
  name: string;
  priceCad: number | null;
  description: string | null;
  sortOrder: number;
};

export type FoTechStackItem = {
  id: number;
  tool: string;
  purpose: string | null;
  costCad: number | null;
  priority: FounderTaskPriority;
  status: FounderTechStatus;
  isCustom: boolean;
  sortOrder: number;
};

export type FoRiskItem = {
  id: number;
  risk: string;
  probability: FounderRiskLevel;
  impact: FounderRiskLevel;
  prevention: string | null;
  backupPlan: string | null;
  isCustom: boolean;
  sortOrder: number;
};

export type FoMarketingWeek = {
  id: number;
  weekNumber: number;
  plannedOutreach: number | null;
  plannedContent: string | null;
  notes: string | null;
};

export type FoChecklistItem = {
  id: number;
  checklistId: number;
  text: string;
  explanation: string | null;
  dayLabel: string | null;
  done: boolean;
  doneAt: string | null;
  isCustom: boolean;
  sortOrder: number;
};

export type FoChecklist = {
  id: number;
  key: string;
  title: string;
  items: FoChecklistItem[];
};

/** SOPs library (section "sop") and Document Templates (section "template"). */
export type FoDocument = {
  id: number;
  key: string | null;
  section: string;
  title: string;
  content: string | null;
  isCustom: boolean;
  sortOrder: number;
  updatedAt: string;
};

export type FoLogEntry = {
  id: number;
  decision: string;
  reasoning: string | null;
  alternatives: string | null;
  outcome: string | null;
  createdAt: string;
};

/* -------------------------------------------------------- Founder OS Plan -- */

export type FoPlanStep = {
  id: number;
  phaseId: number;
  key: string;
  groupLabel: string | null;
  text: string;
  notes: string[];
  state: FounderPlanStepState;
  note: string | null;
  doneAt: string | null;
  isHighRisk: boolean;
  isCustom: boolean;
  sortOrder: number;
};

export type FoPlanMistake = {
  id: number;
  phaseId: number | null;
  text: string;
  sortOrder: number;
  isCustom: boolean;
};

export type FoPlanPhase = {
  id: number;
  key: string;
  number: number;
  title: string;
  intro: string | null;
  dayRange: string | null;
  sortOrder: number;
  isCustom: boolean;
  steps: FoPlanStep[];
  mistakes: FoPlanMistake[];
};

export type FoPlan = {
  phases: FoPlanPhase[];
  globalMistakes: FoPlanMistake[];
};
