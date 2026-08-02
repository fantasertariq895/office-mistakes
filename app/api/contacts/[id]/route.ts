import { prisma } from "@/lib/prisma";
import { badRequest, optionalString, paramId, readJson, route } from "@/lib/api-helpers";

export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const data: Record<string, unknown> = {};
  if ("name" in body) {
    const name = optionalString(body, "name");
    if (!name) throw badRequest('"name" is required');
    data.name = name;
  }
  if ("role" in body) data.role = optionalString(body, "role");
  if ("email" in body) data.email = optionalString(body, "email");
  if ("phone" in body) data.phone = optionalString(body, "phone");
  if ("commissionId" in body && typeof body.commissionId === "number") {
    data.commissionId = body.commissionId;
  }

  return prisma.contact.update({ where: { id }, data });
});

export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.contact.delete({ where: { id } });
  return { ok: true };
});
