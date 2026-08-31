import {
  badRequest,
  optionalString,
  readJson,
  requireString,
  route,
} from "@/lib/api-helpers";
import { isFounderPipelineStatus } from "@/lib/constants";
import { parseFounderDate, serialisePipelineContact } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

export const GET = route(async (req) => {
  const status = req.nextUrl.searchParams.get("status");
  if (status && !isFounderPipelineStatus(status)) {
    throw badRequest('"status" is not a valid pipeline status');
  }

  const rows = await prisma.founderPipelineContact.findMany({
    where: status ? { status } : undefined,
    orderBy: [{ dateContacted: "desc" }, { createdAt: "desc" }],
  });
  return { contacts: rows.map(serialisePipelineContact) };
});

export const POST = route(async (req) => {
  const body = await readJson(req);
  const name = requireString(body, "name");
  const company = optionalString(body, "company") ?? null;
  const channel = optionalString(body, "channel") ?? null;
  const notes = optionalString(body, "notes") ?? null;
  const dateContacted = parseFounderDate(body.dateContacted);

  let status = "contacted";
  if (body.status !== undefined) {
    if (!isFounderPipelineStatus(body.status)) throw badRequest('"status" is invalid');
    status = body.status;
  }

  const row = await prisma.founderPipelineContact.create({
    data: { name, company, channel, notes, dateContacted, status },
  });
  return { contact: serialisePipelineContact(row) };
});
