import { badRequest, readJson, route } from "@/lib/api-helpers";
import { isTaskPriority } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { TASK_INCLUDE, parseDueDate } from "@/lib/task-server";

/**
 * Creates a confirmed batch of dictated tasks and records the note behind it.
 *
 * One transaction, so a dictation either lands whole or not at all — a partial
 * batch is the worst outcome here, because you'd have to work out which half
 * of what you said actually saved.
 *
 * Reuses parseDueDate() so a voice-set date goes through exactly the same
 * UTC-anchoring as one picked in the task form. Two different date paths is
 * how lib/date.ts's bugs happened in the first place.
 */
export const POST = route(async (req) => {
  const body = await readJson(req);

  const transcript = typeof body.transcript === "string" ? body.transcript.trim() : "";
  if (!Array.isArray(body.tasks) || body.tasks.length === 0) {
    throw badRequest("No tasks to create");
  }
  if (body.tasks.length > 25) {
    throw badRequest("That's more than 25 tasks — split the note up");
  }

  // Validate everything before writing anything, so the transaction can't
  // fail halfway on the fifth task's bad date.
  const commissionIds = new Set<number>();
  const prepared = body.tasks.map((raw: unknown, i: number) => {
    if (!raw || typeof raw !== "object") throw badRequest(`Task ${i + 1} is malformed`);
    const t = raw as Record<string, unknown>;

    const title = typeof t.title === "string" ? t.title.trim() : "";
    if (!title) throw badRequest(`Task ${i + 1} has no title`);

    const priority = typeof t.priority === "string" ? t.priority : "medium";
    if (!isTaskPriority(priority)) throw badRequest(`Task ${i + 1} has an invalid priority`);

    let commissionId: number | null = null;
    if (t.commissionId !== null && t.commissionId !== undefined) {
      if (typeof t.commissionId !== "number") {
        throw badRequest(`Task ${i + 1} has an invalid commission`);
      }
      commissionId = t.commissionId;
      commissionIds.add(commissionId);
    }

    return {
      title,
      priority,
      commissionId,
      dueDate: parseDueDate(t.dueDate ?? null),
      notes: transcript ? `Dictated: "${transcript}"` : null,
    };
  });

  if (commissionIds.size > 0) {
    const found = await prisma.commission.count({
      where: { id: { in: [...commissionIds] } },
    });
    if (found !== commissionIds.size) throw badRequest("Commission not found");
  }

  const created = await prisma.$transaction(async (tx) => {
    const rows = [];
    for (const data of prepared) {
      rows.push(await tx.task.create({ data, include: TASK_INCLUDE }));
    }
    await tx.voiceNote.create({
      data: {
        transcript,
        taskIds: JSON.stringify(rows.map((r) => r.id)),
      },
    });
    return rows;
  });

  return { tasks: created, count: created.length };
});
