import { badRequest, paramId, readJson, route } from "@/lib/api-helpers";
import { isTbRunStatus } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { serialiseRun } from "@/lib/traffic-billing/server";

/** Mark a month's run complete, or re-open it if something turns up later. */
export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  if (!isTbRunStatus(body.status)) {
    throw badRequest('"status" must be "in_progress" or "completed"');
  }

  const run = await prisma.trafficBillingRun.update({
    where: { id },
    data: {
      status: body.status,
      completedAt: body.status === "completed" ? new Date() : null,
    },
  });

  return { run: serialiseRun(run) };
});
