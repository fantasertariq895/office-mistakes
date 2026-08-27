import { badRequest, optionalBoolean, paramId, readJson, route } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

/**
 * Toggle one setup item. No POST/DELETE — the 6 items are fixed; adding a
 * "let me add my own item" affordance is a small follow-up, not needed here.
 */
export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);
  const done = optionalBoolean(body, "done");
  if (done === undefined) throw badRequest('"done" is required');

  const item = await prisma.traderMediaSetupItem.update({
    where: { id },
    data: { done, doneAt: done ? new Date() : null },
  });

  return { item };
});
