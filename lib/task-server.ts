import type { Prisma } from "@prisma/client";
import { badRequest } from "./api-helpers";
import { fromDateInputValue } from "./date";

export const TASK_INCLUDE = {
  commission: { select: { id: true, name: true, color: true } },
} satisfies Prisma.TaskInclude;

/**
 * Accepts "YYYY-MM-DD" (stored as local midnight of that day), a full ISO
 * string, or null to clear.
 */
export function parseDueDate(value: unknown): Date | null {
  if (value === null || value === "") return null;
  if (typeof value !== "string") {
    throw badRequest('"dueDate" must be a string or null');
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = fromDateInputValue(value);
    if (!parsed) throw badRequest("Invalid due date");
    return parsed;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw badRequest("Invalid due date");
  return parsed;
}
