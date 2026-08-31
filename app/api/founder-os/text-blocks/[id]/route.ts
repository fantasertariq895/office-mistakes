import { optionalString, paramId, readJson, route } from "@/lib/api-helpers";
import { serialiseTextBlock } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";

export const PATCH = route(async (req, ctx) => {
  const id = await paramId(ctx);
  const body = await readJson(req);
  const content = optionalString(body, "content");

  const row = await prisma.founderTextBlock.update({
    where: { id },
    data: content !== undefined ? { content } : {},
  });
  return { block: serialiseTextBlock(row) };
});
