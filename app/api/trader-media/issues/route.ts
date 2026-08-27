import { badRequest, readJson, requireString, route } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { serialiseIssue } from "@/lib/trader-media/server";

/**
 * Log something that actually went wrong during this week's run, against the
 * phase it happened in.
 *
 * Separate from "mistakes to avoid": that list is the standing guidance, this
 * is the record of what bit you this week. Keeping them apart is what makes
 * the guidance list stay short enough to read.
 */
export const POST = route(async (req) => {
  const body = await readJson(req);
  const text = requireString(body, "text");
  const runId = Number(body.runId);
  const phaseId = Number(body.phaseId);

  if (!Number.isInteger(runId)) throw badRequest('"runId" is required');
  if (!Number.isInteger(phaseId)) throw badRequest('"phaseId" is required');

  const issue = await prisma.traderMediaIssue.create({
    data: { runId, phaseId, text },
  });

  return { issue: serialiseIssue(issue) };
});
