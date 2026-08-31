import { route } from "@/lib/api-helpers";
import { serialiseTextBlock } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

/** BMC blocks, ICP fields, Brand copy, Funding Notes, Hiring notes, Roadmap months — grouped by ?section=. */
export const GET = route(async (req) => {
  const section = req.nextUrl.searchParams.get("section");
  const rows = await prisma.founderTextBlock.findMany({
    where: section ? { section } : undefined,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  return { blocks: rows.map(serialiseTextBlock) };
});
