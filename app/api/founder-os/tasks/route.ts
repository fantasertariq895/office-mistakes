import {
  badRequest,
  optionalString,
  readJson,
  requireString,
  route,
} from "@/lib/api-helpers";
import { isFounderTaskPriority, isFounderTaskStatus } from "@/lib/constants";
import { nextSortOrder, parseFounderDate, serialiseTask } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

const PRIORITY_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export const GET = route(async (req) => {
  const status = req.nextUrl.searchParams.get("status");
  if (status && !isFounderTaskStatus(status)) {
    throw badRequest('"status" is not a valid task status');
  }

  const rows = await prisma.founderTask.findMany({
    where: status ? { status } : undefined,
  });
  const tasks = rows
    .map(serialiseTask)
    .sort((a, b) => {
      const rank = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (rank !== 0) return rank;
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  return { tasks };
});

export const POST = route(async (req) => {
  const body = await readJson(req);
  const title = requireString(body, "title");
  const description = optionalString(body, "description") ?? null;
  const dueDate = parseFounderDate(body.dueDate);

  let priority = "medium";
  if (body.priority !== undefined) {
    if (!isFounderTaskPriority(body.priority)) throw badRequest('"priority" is invalid');
    priority = body.priority;
  }

  let status = "not_started";
  if (body.status !== undefined) {
    if (!isFounderTaskStatus(body.status)) throw badRequest('"status" is invalid');
    status = body.status;
  }

  const siblings = await prisma.founderTask.findMany({
    where: { status },
    select: { sortOrder: true },
  });

  const row = await prisma.founderTask.create({
    data: {
      title,
      description,
      dueDate,
      priority,
      status,
      sortOrder: nextSortOrder(siblings),
    },
  });
  return { task: serialiseTask(row) };
});
