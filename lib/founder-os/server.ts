/**
 * Server-side helpers for Founder OS — serialization, sort order, and the
 * Dashboard's aggregate build. Deliberately has zero imports from
 * lib/task-server.ts / lib/task-utils.ts even though the shapes rhyme
 * (dueDate parsing, priority ranking) — same isolation reasoning as Traffic
 * Billing and Trader Media never importing from each other or from the
 * Home-page Tasks feature: an edit to one is not allowed to ripple into
 * the other.
 */
import { badRequest } from "@/lib/api-helpers";
import { daysBetween, fromDateInputValue, todayAsCalendarDay } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import {
  FOUNDER_STARTUP_BUDGET_CAP_CAD,
  type FounderCostType,
  type FounderPipelineStatus,
  type FounderPlanStepState,
  type FounderRiskLevel,
  type FounderTaskPriority,
  type FounderTaskStatus,
  type FounderTechStatus,
} from "@/lib/constants";
import type {
  FoChecklistItem,
  FoCompetitor,
  FoCostItem,
  FoDashboard,
  FoDocument,
  FoDoNowItem,
  FoLogEntry,
  FoMarketingWeek,
  FoPipelineContact,
  FoPlan,
  FoPlanMistake,
  FoPlanPhase,
  FoPlanStep,
  FoPricingTier,
  FoRevenueMonth,
  FoRiskItem,
  FoScore,
  FoSettings,
  FoStatTile,
  FoTask,
  FoTechStackItem,
  FoTextBlock,
} from "@/lib/types";

/**
 * Accepts "YYYY-MM-DD", a full ISO string, null to clear, or undefined (a
 * POST body that simply omits an optional date field) — all three of the
 * latter mean "no date".
 */
export function parseFounderDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") {
    throw badRequest("Date must be a string or null");
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = fromDateInputValue(value);
    if (!parsed) throw badRequest("Invalid date");
    return parsed;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw badRequest("Invalid date");
  return parsed;
}

export function serialisePipelineContact(row: {
  id: number;
  name: string;
  company: string | null;
  channel: string | null;
  dateContacted: Date | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): FoPipelineContact {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    channel: row.channel,
    dateContacted: row.dateContacted?.toISOString() ?? null,
    status: row.status as FounderPipelineStatus,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function serialiseTask(row: {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  sortOrder: number;
  plannedForWeek: string | null;
  createdAt: Date;
  completedAt: Date | null;
}): FoTask {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as FounderTaskStatus,
    priority: row.priority as FounderTaskPriority,
    dueDate: row.dueDate?.toISOString() ?? null,
    sortOrder: row.sortOrder,
    plannedForWeek: row.plannedForWeek,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
  };
}

export function serialiseSettings(row: {
  id: number;
  startDate: Date | null;
  updatedAt: Date;
}): FoSettings {
  return {
    id: row.id,
    startDate: row.startDate?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Next sortOrder in a list, leaving room to insert between existing rows. */
export function nextSortOrder(existing: { sortOrder: number }[]): number {
  return existing.reduce((max, row) => Math.max(max, row.sortOrder), 0) + 100;
}

const FOUNDER_TASK_PRIORITY_RANK: Record<FounderTaskPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/** A pipeline contact untouched this many days (still active) needs follow-up. */
const FOLLOWUP_STALE_DAYS = 3;

const ACTIVE_PIPELINE_STATUSES: FounderPipelineStatus[] = [
  "contacted",
  "replied",
  "call_booked",
  "proposal_sent",
];

/**
 * Phase 1 always has all three sources (pipeline + tasks), so this always
 * returns 3 tiles — 0%/"—" on empty data, never a hidden tile. Phase 2
 * (Finance/Legal) extends `input` with more optional fields and appends more
 * `tiles.push(...)` lines here; StatsStrip never changes, it only ever
 * renders whatever array it's handed.
 */
export function buildStatTiles(input: {
  pipelineActive: number;
  clientsClosed: number;
  taskTotal: number;
  taskCompleted: number;
  /** Phase 2: present once Finance data exists. */
  oneTimeSpendCad?: number;
  legalTotal?: number;
  legalDone?: number;
}): FoStatTile[] {
  const tiles: FoStatTile[] = [];

  tiles.push({
    id: "pipeline_active",
    label: "Active pipeline",
    value: String(input.pipelineActive),
  });

  tiles.push({
    id: "clients_closed",
    label: "Clients closed",
    value: String(input.clientsClosed),
    tone: input.clientsClosed > 0 ? "success" : "default",
  });

  const taskPercent =
    input.taskTotal === 0 ? null : Math.round((input.taskCompleted / input.taskTotal) * 100);
  tiles.push({
    id: "task_completion",
    label: "Tasks complete",
    value: taskPercent === null ? "—" : `${taskPercent}%`,
  });

  if (input.oneTimeSpendCad !== undefined) {
    tiles.push({
      id: "budget_spent",
      label: `Spent vs $${FOUNDER_STARTUP_BUDGET_CAP_CAD.toLocaleString()} cap`,
      value: `$${input.oneTimeSpendCad.toLocaleString()}`,
      tone: input.oneTimeSpendCad > FOUNDER_STARTUP_BUDGET_CAP_CAD ? "danger" : "default",
    });
  }

  if (input.legalTotal !== undefined && input.legalDone !== undefined) {
    const legalPercent = input.legalTotal === 0 ? null : Math.round((input.legalDone / input.legalTotal) * 100);
    tiles.push({
      id: "legal_checklist",
      label: "Legal checklist",
      value: legalPercent === null ? "—" : `${legalPercent}%`,
    });
  }

  return tiles;
}

/**
 * Tasks first (a Critical task always outranks a stale-contact nudge), then
 * pipeline follow-ups, sliced to `limit`. Phase 2 adds more named arrays to
 * `sources` and interleaves them the same way.
 */
export function buildDoNowList(
  sources: { tasks: FoTask[]; pipeline: FoPipelineContact[] },
  limit = 5
): FoDoNowItem[] {
  const openTasks = sources.tasks
    .filter((t) => t.status !== "completed" && t.status !== "blocked")
    .sort((a, b) => {
      const rank = FOUNDER_TASK_PRIORITY_RANK[a.priority] - FOUNDER_TASK_PRIORITY_RANK[b.priority];
      if (rank !== 0) return rank;
      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : null;
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : null;
      if (aDue !== bDue) {
        if (aDue === null) return 1;
        if (bDue === null) return -1;
        return aDue - bDue;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const staleContacts = sources.pipeline
    .filter((c) => ACTIVE_PIPELINE_STATUSES.includes(c.status))
    .filter((c) => !c.dateContacted || daysBetween(c.dateContacted, todayAsCalendarDay()) >= FOLLOWUP_STALE_DAYS)
    .sort((a, b) => {
      const aDays = a.dateContacted ? daysBetween(a.dateContacted, todayAsCalendarDay()) : Infinity;
      const bDays = b.dateContacted ? daysBetween(b.dateContacted, todayAsCalendarDay()) : Infinity;
      return bDays - aDays;
    });

  const items: FoDoNowItem[] = [
    ...openTasks.map((t) => ({
      id: `task:${t.id}`,
      source: "task" as const,
      title: t.title,
      detail: t.dueDate ? `Due ${new Date(t.dueDate).toISOString().slice(0, 10)}` : null,
    })),
    ...staleContacts.map((c) => ({
      id: `pipeline:${c.id}`,
      source: "pipeline" as const,
      title: `Follow up with ${c.name}`,
      detail: c.company,
    })),
  ];

  return items.slice(0, limit);
}

/**
 * The whole Dashboard in one round trip, mirroring how loadWorkspace backs
 * Traffic Billing / Trader Media. Never defaults `startDate` to "today" —
 * that's a founder decision, not a computed one.
 */
export async function loadDashboard(): Promise<FoDashboard> {
  const [settingsRow, pipelineRows, taskRows, costRows, legalChecklist] = await Promise.all([
    prisma.founderSettings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    }),
    prisma.founderPipelineContact.findMany(),
    prisma.founderTask.findMany(),
    prisma.founderCostItem.findMany({ where: { type: "one_time" } }),
    prisma.founderChecklist.findUnique({
      where: { key: "legal" },
      include: { items: true },
    }),
  ]);

  const pipeline = pipelineRows.map(serialisePipelineContact);
  const tasks = taskRows.map(serialiseTask);

  const pipelineActive = pipeline.filter((c) =>
    (ACTIVE_PIPELINE_STATUSES as string[]).includes(c.status)
  ).length;
  const clientsClosed = pipeline.filter((c) => c.status === "closed").length;
  const taskCompleted = tasks.filter((t) => t.status === "completed").length;
  const oneTimeSpendCad = costRows.reduce((sum, c) => sum + c.amountCad, 0);

  const stats = buildStatTiles({
    pipelineActive,
    clientsClosed,
    taskTotal: tasks.length,
    taskCompleted,
    oneTimeSpendCad,
    legalTotal: legalChecklist?.items.length,
    legalDone: legalChecklist?.items.filter((i) => i.done).length,
  });
  const doNow = buildDoNowList({ tasks, pipeline });

  return {
    settings: serialiseSettings(settingsRow),
    stats,
    doNow,
  };
}

/* ----------------------------------------------- Founder OS, Phase 2/3 serializers */

export function serialiseTextBlock(row: {
  id: number;
  key: string;
  section: string;
  label: string;
  content: string | null;
  sortOrder: number;
  updatedAt: Date;
}): FoTextBlock {
  return { ...row, updatedAt: row.updatedAt.toISOString() };
}

export function serialiseScore(row: { id: number; key: string; label: string; score: number; sortOrder: number }): FoScore {
  return row;
}

export function serialiseCompetitor(row: {
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
}): FoCompetitor {
  return row;
}

export function serialiseCostItem(row: {
  id: number;
  name: string;
  type: string;
  amountCad: number;
  isCustom: boolean;
  sortOrder: number;
}): FoCostItem {
  return { ...row, type: row.type as FounderCostType };
}

export function serialiseRevenueMonth(row: {
  id: number;
  monthNumber: number;
  clients: number;
  avgRevenuePerClient: number;
  costOfDelivery: number;
}): FoRevenueMonth {
  return row;
}

export function serialisePricingTier(row: {
  id: number;
  name: string;
  priceCad: number | null;
  description: string | null;
  sortOrder: number;
}): FoPricingTier {
  return row;
}

export function serialiseTechStackItem(row: {
  id: number;
  tool: string;
  purpose: string | null;
  costCad: number | null;
  priority: string;
  status: string;
  isCustom: boolean;
  sortOrder: number;
}): FoTechStackItem {
  return {
    ...row,
    priority: row.priority as FounderTaskPriority,
    status: row.status as FounderTechStatus,
  };
}

export function serialiseRiskItem(row: {
  id: number;
  risk: string;
  probability: string;
  impact: string;
  prevention: string | null;
  backupPlan: string | null;
  isCustom: boolean;
  sortOrder: number;
}): FoRiskItem {
  return {
    ...row,
    probability: row.probability as FounderRiskLevel,
    impact: row.impact as FounderRiskLevel,
  };
}

export function serialiseMarketingWeek(row: {
  id: number;
  weekNumber: number;
  plannedOutreach: number | null;
  plannedContent: string | null;
  notes: string | null;
}): FoMarketingWeek {
  return row;
}

export function serialiseChecklistItem(row: {
  id: number;
  checklistId: number;
  text: string;
  explanation: string | null;
  dayLabel: string | null;
  done: boolean;
  doneAt: Date | null;
  isCustom: boolean;
  sortOrder: number;
}): FoChecklistItem {
  return { ...row, doneAt: row.doneAt?.toISOString() ?? null };
}

export function serialiseDocument(row: {
  id: number;
  key: string | null;
  section: string;
  title: string;
  content: string | null;
  isCustom: boolean;
  sortOrder: number;
  updatedAt: Date;
}): FoDocument {
  return { ...row, updatedAt: row.updatedAt.toISOString() };
}

export function serialiseLogEntry(row: {
  id: number;
  decision: string;
  reasoning: string | null;
  alternatives: string | null;
  outcome: string | null;
  createdAt: Date;
}): FoLogEntry {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

/* --------------------------------------------------------- Founder OS Plan */

/** Prisma rows carry `notes` as a JSON string; the client wants a real array. */
function parsePlanNotes(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "string") : [];
  } catch {
    return [];
  }
}

export function serialisePlanStep(row: {
  id: number;
  phaseId: number;
  key: string;
  groupLabel: string | null;
  text: string;
  notes: string | null;
  state: string;
  note: string | null;
  doneAt: Date | null;
  isHighRisk: boolean;
  isCustom: boolean;
  sortOrder: number;
}): FoPlanStep {
  return {
    id: row.id,
    phaseId: row.phaseId,
    key: row.key,
    groupLabel: row.groupLabel,
    text: row.text,
    notes: parsePlanNotes(row.notes),
    state: row.state as FounderPlanStepState,
    note: row.note,
    doneAt: row.doneAt?.toISOString() ?? null,
    isHighRisk: row.isHighRisk,
    isCustom: row.isCustom,
    sortOrder: row.sortOrder,
  };
}

/**
 * The whole 90-day Plan in one round trip, mirroring how loadWorkspace backs
 * Traffic Billing / Trader Media — no run dimension here, just phases,
 * steps (with state baked directly into each row) and mistakes.
 */
export async function loadPlan(): Promise<FoPlan> {
  const [phaseRows, mistakeRows] = await Promise.all([
    prisma.founderPlanPhase.findMany({
      orderBy: [{ sortOrder: "asc" }, { number: "asc" }],
      include: {
        steps: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
        mistakes: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
      },
    }),
    prisma.founderPlanMistake.findMany({
      where: { phaseId: null },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    }),
  ]);

  const phases: FoPlanPhase[] = phaseRows.map((p) => ({
    id: p.id,
    key: p.key,
    number: p.number,
    title: p.title,
    intro: p.intro,
    dayRange: p.dayRange,
    sortOrder: p.sortOrder,
    isCustom: p.isCustom,
    steps: p.steps.map(serialisePlanStep),
    mistakes: p.mistakes as FoPlanMistake[],
  }));

  return { phases, globalMistakes: mistakeRows as FoPlanMistake[] };
}
