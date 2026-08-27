/**
 * Server-side helpers for the Trader Media workspace.
 *
 * A note on weeks: which Monday starts "this week" is deliberately NOT
 * computed here, for the same reason lib/traffic-billing/server.ts doesn't
 * compute "this month" — the server runs in UTC on Vercel while the viewer is
 * somewhere else, and near a week boundary those disagree. The client sends
 * its own local week (via lib/trader-media/week.ts's localCurrentWeekKey)
 * when starting a run; the server only ever validates the string and looks
 * up what already exists.
 *
 * The one exception is ensureThisWeekRun below, the cron backstop — it has no
 * viewer to be faithful to, so it uses the server's own clock on purpose. See
 * that function's doc comment.
 */
import { badRequest } from "@/lib/api-helpers";
import { fromDateInputValue, toDateInputValue } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { serverCurrentWeekKey } from "@/lib/trader-media/week";
import type {
  TmIssue,
  TmMistake,
  TmPhase,
  TmRun,
  TmStep,
  TmStepStateRow,
  TmWorkspace,
} from "@/lib/types";
import type { TmRunStatus, TmStepState } from "@/lib/constants";

const WEEK_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Validates "YYYY-MM-DD" *and* that it's a real Monday — a run only ever starts on one. */
export function requireWeek(value: unknown): string {
  if (typeof value !== "string" || !WEEK_RE.test(value)) {
    throw badRequest('"week" must look like "2026-08-24"');
  }
  const d = fromDateInputValue(value);
  if (!d || toDateInputValue(d) !== value) {
    throw badRequest('"week" is not a real calendar date');
  }
  if (d.getUTCDay() !== 1) {
    throw badRequest('"week" must be a Monday');
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

export function serialiseStep(row: StepRow): TmStep {
  return { ...row, notes: parseNotes(row.notes) };
}

export function serialiseRun(row: {
  id: number;
  week: string;
  status: string;
  startedAt: Date;
  completedAt: Date | null;
}): TmRun {
  return {
    id: row.id,
    week: row.week,
    status: row.status as TmRunStatus,
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
}): TmIssue {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

/**
 * The whole workspace in one round trip, mirroring
 * lib/traffic-billing/server.ts's loadWorkspace. 13 phases / ~30 steps is
 * small, but the same "one request, not one per click" shape is worth
 * keeping consistent across both features.
 */
export async function loadWorkspace(week?: string | null): Promise<TmWorkspace> {
  const [phaseRows, mistakeRows, runRows] = await Promise.all([
    prisma.traderMediaPhase.findMany({
      orderBy: [{ sortOrder: "asc" }, { number: "asc" }],
      include: {
        steps: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
        mistakes: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
      },
    }),
    prisma.traderMediaMistake.findMany({
      where: { phaseId: null },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    }),
    prisma.traderMediaRun.findMany({ orderBy: { week: "desc" } }),
  ]);

  const runs = runRows.map(serialiseRun);
  // No week asked for -> the newest run. Never "this week" computed here:
  // that would silently create a phantom selection the client's timezone
  // disagrees with.
  const run = week ? (runs.find((r) => r.week === week) ?? null) : (runs[0] ?? null);

  let states: TmStepStateRow[] = [];
  let issues: TmIssue[] = [];

  if (run) {
    const [stateRows, issueRows] = await Promise.all([
      prisma.traderMediaStepState.findMany({
        where: { runId: run.id },
        select: { stepId: true, state: true, note: true },
      }),
      prisma.traderMediaIssue.findMany({
        where: { runId: run.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    states = stateRows.map((s) => ({
      stepId: s.stepId,
      state: s.state as TmStepState,
      note: s.note,
    }));
    issues = issueRows.map(serialiseIssue);
  }

  const phases: TmPhase[] = phaseRows.map((p) => ({
    id: p.id,
    key: p.key,
    number: p.number,
    title: p.title,
    intro: p.intro,
    isOwnerPending: p.isOwnerPending,
    sortOrder: p.sortOrder,
    isCustom: p.isCustom,
    steps: p.steps.map(serialiseStep),
    mistakes: p.mistakes as TmMistake[],
  }));

  return {
    phases,
    globalMistakes: mistakeRows as TmMistake[],
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

export type EnsureWeekResult = { created: boolean; week: string };

/**
 * Backstop for the recurring weekly run. The primary trigger is the page
 * itself, which auto-starts the viewer's current week on load (see
 * app/trader-media/page.tsx) — this only matters if nobody opens the app on
 * a given Monday, e.g. away that week. Uses the server's own clock
 * (serverCurrentWeekKey), not a viewer's, since a cron call has no viewer.
 * Idempotent — find-or-create on `week`, same as the runs POST route, so a
 * duplicate or retried call is a harmless no-op. Scheduled Monday-only in
 * vercel.json (unlike the monthly reset's daily schedule), since there's no
 * "every day until it matters" case here — the week key only changes weekly.
 */
export async function ensureThisWeekRun(): Promise<EnsureWeekResult> {
  const week = serverCurrentWeekKey();
  const existing = await prisma.traderMediaRun.findUnique({ where: { week } });
  if (existing) return { created: false, week };

  await prisma.traderMediaRun.create({ data: { week } });
  return { created: true, week };
}
