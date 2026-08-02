import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  badRequest,
  commissionIdParam,
  optionalString,
  readJson,
  requireString,
  route,
} from "@/lib/api-helpers";
import { isTaskPriority, isTaskStatus } from "@/lib/constants";
import { sortTasks } from "@/lib/task-utils";
import { TASK_INCLUDE, parseDueDate } from "@/lib/task-server";

/**
 * `?scope=open|completed|all` plus optional status / priority / commissionId / q.
 */
export const GET = route(async (req) => {
  const params = req.nextUrl.searchParams;
  const scope = params.get("scope") ?? "all";
  const where: Prisma.TaskWhereInput = {};

  if (scope === "open") where.status = { not: "completed" };
  if (scope === "completed") where.status = "completed";

  const status = params.get("status");
  if (status && status !== "all") {
    if (!isTaskStatus(status)) throw badRequest("Invalid status");
    where.status = status;
  }

  const priority = params.get("priority");
  if (priority && priority !== "all") {
    if (!isTaskPriority(priority)) throw badRequest("Invalid priority");
    where.priority = priority;
  }

  const commissionId = commissionIdParam(req);
  if (commissionId !== undefined) where.commissionId = commissionId;

  const q = params.get("q")?.trim();
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { notes: { contains: q } },
    ];
  }

  const tasks = await prisma.task.findMany({ where, include: TASK_INCLUDE });
  return sortTasks(tasks);
});

export const POST = route(async (req) => {
  const body = await readJson(req);
  const title = requireString(body, "title");

  const priority = optionalString(body, "priority") ?? "medium";
  if (!isTaskPriority(priority)) throw badRequest("Invalid priority");

  const status = optionalString(body, "status") ?? "not_started";
  if (!isTaskStatus(status)) throw badRequest("Invalid status");

  let commissionId: number | null = null;
  if (body.commissionId !== undefined && body.commissionId !== null) {
    if (typeof body.commissionId !== "number") {
      throw badRequest('"commissionId" must be a number or null');
    }
    const exists = await prisma.commission.count({ where: { id: body.commissionId } });
    if (!exists) throw badRequest("Commission not found");
    commissionId = body.commissionId;
  }

  return prisma.task.create({
    data: {
      title,
      description: optionalString(body, "description") ?? null,
      notes: optionalString(body, "notes") ?? null,
      priority,
      status,
      dueDate: "dueDate" in body ? parseDueDate(body.dueDate) : null,
      commissionId,
      completedAt: status === "completed" ? new Date() : null,
    },
    include: TASK_INCLUDE,
  });
});
