/**
 * Server-side helpers for the Traffic Billing workspace.
 *
 * A note on months: which month it is "right now" is deliberately NOT computed
 * here. lib/date.ts documents why — the server runs in UTC on Vercel while the
 * viewer is somewhere else, and near a month boundary those disagree. The
 * client sends its own local month when starting a run; the server only ever
 * validates the string and looks up what already exists.
 */
import { badRequest } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import type {
  TbIssue,
  TbMistake,
  TbPhase,
  TbRun,
  TbStep,
  TbStepStateRow,
  TbWorkspace,
} from "@/lib/types";
import type { TbRunStatus, TbStepState } from "@/lib/constants";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function requireMonth(value: unknown): string {
  if (typeof value !== "string" || !MONTH_RE.test(value)) {
    throw badRequest('"month" must look like "2026-08"');
  }
  return value;
}

/** Prisma rows carry `notes` as a JSON string; the client wants a real array. */
function parseNotes(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "string") : [];
  } catch {
    return [];
  }
}

type StepRow = {
  id: number;
  phaseId: number;
  key: string;
  groupLabel: string | null;
  text: string;
  notes: string | null;
  isHighRisk: boolean;
  isCustom: boolean;
  sortOrder: number;
};

export function serialiseStep(row: StepRow): TbStep {
  return { ...row, notes: parseNotes(row.notes) };
}

export function serialiseRun(row: {
  id: number;
  month: string;
  status: string;
  startedAt: Date;
  completedAt: Date | null;
}): TbRun {
  return {
    id: row.id,
    month: row.month,
    status: row.status as TbRunStatus,
    startedAt: row.startedAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
  };
}

export function serialiseIssue(row: {
  id: number;
  runId: number;
  phaseId: number;
  text: string;
  resolved: boolean;
  createdAt: Date;
}): TbIssue {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

/**
 * The whole workspace in one round trip, mirroring how /api/board serves Home.
 * The SOP is ~300 steps across 37 phases and the user moves between them
 * constantly — per-phase fetching would mean a request per click for data
 * that's a few KB in total.
 */
export async function loadWorkspace(month?: string | null): Promise<TbWorkspace> {
  const [phaseRows, mistakeRows, runRows] = await Promise.all([
    prisma.trafficBillingPhase.findMany({
      orderBy: [{ sortOrder: "asc" }, { number: "asc" }],
      include: {
        steps: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
        mistakes: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
      },
    }),
    prisma.trafficBillingMistake.findMany({
      where: { phaseId: null },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    }),
    prisma.trafficBillingRun.findMany({ orderBy: { month: "desc" } }),
  ]);

  const runs = runRows.map(serialiseRun);
  // No month asked for -> the newest run. Never "today's month": that would
  // silently create a phantom selection the client's timezone disagrees with.
  const run = month ? (runs.find((r) => r.month === month) ?? null) : (runs[0] ?? null);

  let states: TbStepStateRow[] = [];
  let issues: TbIssue[] = [];

  if (run) {
    const [stateRows, issueRows] = await Promise.all([
      prisma.trafficBillingStepState.findMany({
        where: { runId: run.id },
        select: { stepId: true, state: true, note: true },
      }),
      prisma.trafficBillingIssue.findMany({
        where: { runId: run.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    states = stateRows.map((s) => ({
      stepId: s.stepId,
      state: s.state as TbStepState,
      note: s.note,
    }));
    issues = issueRows.map(serialiseIssue);
  }

  const phases: TbPhase[] = phaseRows.map((p) => ({
    id: p.id,
    key: p.key,
    number: p.number,
    stageKey: p.stageKey,
    title: p.title,
    intro: p.intro,
    sortOrder: p.sortOrder,
    isCustom: p.isCustom,
    steps: p.steps.map(serialiseStep),
    mistakes: p.mistakes as TbMistake[],
  }));

  return {
    phases,
    globalMistakes: mistakeRows as TbMistake[],
    runs,
    run,
    states,
    issues,
  };
}

/** Next sortOrder in a list, leaving room to insert between existing rows. */
export function nextSortOrder(existing: { sortOrder: number }[]): number {
  return existing.reduce((max, row) => Math.max(max, row.sortOrder), 0) + 100;
}
