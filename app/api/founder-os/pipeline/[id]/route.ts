import { badRequest, optionalString, paramId, readJson, route } from "@/lib/api-helpers";
import { isFounderPipelineStatus } from "@/lib/constants";
import { parseFounderDate, serialisePipelineContact } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

/**
 * Partial update — any subset of fields. This is the single endpoint every
 * per-cell inline edit in the Pipeline table calls (one field per request).
 */
export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);

  const name = optionalString(body, "name");
  const company = optionalString(body, "company");
  const channel = optionalString(body, "channel");
  const notes = optionalString(body, "notes");

  let status: string | undefined;
  if (body.status !== undefined) {
    if (!isFounderPipelineStatus(body.status)) throw badRequest('"status" is invalid');
    status = body.status;
  }

  const data: Record<string, unknown> = {};
  if (name !== undefined && name !== null) data.name = name;
  if (company !== undefined) data.company = company;
  if (channel !== undefined) data.channel = channel;
  if (notes !== undefined) data.notes = notes;
  if (status !== undefined) data.status = status;
  if ("dateContacted" in body) data.dateContacted = parseFounderDate(body.dateContacted);

  const row = await prisma.founderPipelineContact.update({ where: { id }, data });
  return { contact: serialisePipelineContact(row) };
});

export const DELETE = route(async (_req, ctx) => {
  const id = await paramId(ctx);
  await prisma.founderPipelineContact.delete({ where: { id } });
  return { ok: true };
});
