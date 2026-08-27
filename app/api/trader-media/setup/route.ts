import { route } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

/**
 * The one-time "Access / Things You Need" checklist. Not scoped to any
 * weekly run — see TraderMediaSetupItem in prisma/schema.prisma.
 */
export const GET = route(async () => {
  const items = await prisma.traderMediaSetupItem.findMany({ orderBy: { sortOrder: "asc" } });
  return { items };
});
