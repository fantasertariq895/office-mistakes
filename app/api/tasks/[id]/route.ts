import { prisma } from "@/lib/prisma";
import {
  badRequest,
  notFound,
  optionalString,
  paramId,
  readJson,
  route,
} from "@/lib/api-helpers";
import { isTaskPriority, isTaskStatus } from "@/lib/constants";
import { TASK_INCLUDE, parseDueDate } from "@/lib/task-server";

export const GET = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  const task = await prisma.task.findUnique({ where: { id }, include: TASK_INCLUDE });
  if (!task) throw notFound("Task not found");
  return task;
});

export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) throw notFound("Task not found");

  const data: Record<string, unknown> = {};

  if ("title" in body) {
    const title = optionalString(body, "title");
    if (!title) throw badRequest('"title" is required');
    data.title = title;
  }
  if ("description" in body) data.description = optionalString(body, "description");
  if ("notes" in body) data.notes = optionalString(body, "notes");

  if ("priority" in body) {
    const priority = optionalString(body, "priority");
    if (!isTaskPriority(priority)) throw badRequest("Invalid priority");
    data.priority = priority;
  }

  if ("status" in body) {
    const status = optionalString(body, "status");
    if (!isTaskStatus(status)) throw badRequest("Invalid status");
    data.status = status;
    // completedAt tracks the transition in both directions.
    if (status === "completed" && existing.status !== "completed") {
      data.completedAt = new Date();
    } else if (status !== "completed") {
      data.completedAt = null;
    }
  }

  if ("dueDate" in body) data.dueDate = parseDueDate(body.dueDate);

  if ("commissionId" in body) {
    if (body.commissionId === null) {
      data.commissionId = null;
    } else if (typeof body.commissionId === "number") {
      const exists = await prisma.commission.count({
        where: { id: body.commissionId },
      });
      if (!exists) throw badRequest("Commission not found");
      data.commissionId = body.commissionId;
    } else {
      throw badRequest('"commissionId" must be a number or null');
    }
  }

  return prisma.task.update({ where: { id }, data, include: TASK_INCLUDE });
});

export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.task.delete({ where: { id } });
  return { ok: true };
});
