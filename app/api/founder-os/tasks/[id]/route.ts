import { badRequest, optionalString, paramId, readJson, route } from "@/lib/api-helpers";
import { isFounderTaskPriority, isFounderTaskStatus } from "@/lib/constants";
import { parseFounderDate, serialiseTask } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

/**
 * Partial update including `status` — this is the move-card endpoint for
 * the Kanban board. No separate state sub-route needed since status lives
 * directly on the row (unlike Traffic Billing's run-scoped step state).
 */
export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const title = optionalString(body, "title");
  const description = optionalString(body, "description");

  let priority: string | undefined;
  if (body.priority !== undefined) {
    if (!isFounderTaskPriority(body.priority)) throw badRequest('"priority" is invalid');
    priority = body.priority;
  }

  let status: string | undefined;
  if (body.status !== undefined) {
    if (!isFounderTaskStatus(body.status)) throw badRequest('"status" is invalid');
    status = body.status;
  }

  const data: Record<string, unknown> = {};
  if (title !== undefined && title !== null) data.title = title;
  if (description !== undefined) data.description = description;
  if (priority !== undefined) data.priority = priority;
  if ("dueDate" in body) data.dueDate = parseFounderDate(body.dueDate);
  if (status !== undefined) {
    data.status = status;
    data.completedAt = status === "completed" ? new Date() : null;
  }
  // Weekly Planner: a Monday-dated week key ("2026-08-24"), or null to
  // un-plan the task. Not otherwise validated here — the client always
  // supplies a key it already computed via lib/trader-media/week.ts's same
  // UTC-anchored pattern; this field is advisory, not a scheduling system.
  const plannedForWeek = optionalString(body, "plannedForWeek");
  if (plannedForWeek !== undefined) data.plannedForWeek = plannedForWeek;

  const row = await prisma.founderTask.update({ where: { id }, data });
  return { task: serialiseTask(row) };
});

export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.founderTask.delete({ where: { id } });
  return { ok: true };
});
