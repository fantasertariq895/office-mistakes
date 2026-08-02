import { prisma } from "@/lib/prisma";
import { badRequest, readJson, route } from "@/lib/api-helpers";

export const GET = route(async () => {
  return prisma.notificationRule.findMany({
    orderBy: [{ channel: "asc" }, { type: "asc" }],
  });
});

/**
 * Bulk toggle: { rules: [{ id, enabled }] }.
 * Only the in-app channel can be enabled in the Phase 1 MVP — email (Phase 2)
 * and WhatsApp (Phase 3) have no delivery implementation, so turning them on
 * would silently do nothing.
 */
export const PATCH = route(async (req) => {
  const body = await readJson(req);
  const rules = body.rules;
  if (!Array.isArray(rules)) throw badRequest('"rules" must be an array');

  for (const rule of rules) {
    if (
      typeof rule?.id !== "number" ||
      typeof (rule as { enabled?: unknown }).enabled !== "boolean"
    ) {
      throw badRequest("Each rule needs { id, enabled }");
    }
    const existing = await prisma.notificationRule.findUnique({
      where: { id: rule.id },
    });
    if (!existing) throw badRequest(`Unknown notification rule ${rule.id}`);
    if (existing.channel !== "in_app" && rule.enabled) {
      throw badRequest(
        `The ${existing.channel} channel is not available yet (coming in a later phase)`
      );
    }
    await prisma.notificationRule.update({
      where: { id: rule.id },
      data: { enabled: rule.enabled },
    });
  }

  return prisma.notificationRule.findMany({
    orderBy: [{ channel: "asc" }, { type: "asc" }],
  });
});
