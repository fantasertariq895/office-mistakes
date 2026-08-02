import { prisma } from "@/lib/prisma";
import { badRequest, optionalString, paramId, readJson, route } from "@/lib/api-helpers";

export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const description = optionalString(body, "description");
  if (description === undefined) throw badRequest('"description" is required');
  if (!description) throw badRequest('"description" cannot be empty');

  return prisma.approvalRequirement.update({
    where: { id },
    data: { description },
  });
});

export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.approvalRequirement.delete({ where: { id } });
  return { ok: true };
});
