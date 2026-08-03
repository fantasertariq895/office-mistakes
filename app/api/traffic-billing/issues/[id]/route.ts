import { optionalBoolean, optionalString, paramId, readJson, route } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { serialiseIssue } from "@/lib/traffic-billing/server";

export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const text = optionalString(body, "text");
  const resolved = optionalBoolean(body, "resolved");

  const issue = await prisma.trafficBillingIssue.update({
    where: { id },
    data: {
      ...(text !== undefined && text !== null ? { text } : {}),
      ...(resolved !== undefined ? { resolved } : {}),
    },
  });

  return { issue: serialiseIssue(issue) };
});

export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.trafficBillingIssue.delete({ where: { id } });
  return { ok: true };
});
