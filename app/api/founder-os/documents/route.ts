import { badRequest, optionalString, readJson, requireString, route } from "@/lib/api-helpers";
import { nextSortOrder, serialiseDocument } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

const SECTIONS = ["sop", "template"];

/** SOPs library (?section=sop) and Document Templates library (?section=template). */
export const GET = route(async (req) => {
  const section = req.nextUrl.searchParams.get("section");
  if (section && !SECTIONS.includes(section)) throw badRequest('"section" must be "sop" or "template"');

  const rows = await prisma.founderDocument.findMany({
    where: section ? { section } : undefined,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  return { documents: rows.map(serialiseDocument) };
});

export const POST = route(async (req) => {
  const body = await readJson(req);
  const title = requireString(body, "title");
  const section = requireString(body, "section");
  if (!SECTIONS.includes(section)) throw badRequest('"section" must be "sop" or "template"');

  const siblings = await prisma.founderDocument.findMany({
    where: { section },
    select: { sortOrder: true },
  });
  const row = await prisma.founderDocument.create({
    data: {
      title,
      section,
      content: optionalString(body, "content") ?? null,
      isCustom: true,
      sortOrder: nextSortOrder(siblings),
    },
  });
  return { document: serialiseDocument(row) };
});
