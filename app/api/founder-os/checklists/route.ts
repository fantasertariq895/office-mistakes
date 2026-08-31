import { route } from "@/lib/api-helpers";
import { serialiseChecklistItem } from "@/lib/founder-os/server";
import { prisma } from "@/lib/prisma";
import type { FoChecklist } from "@/lib/types";

/** Every Founder OS checklist (Legal & Compliance, First Customer Plan) with its items, in one round trip. */
export const GET = route(async () => {
  const rows = await prisma.founderChecklist.findMany({
    include: { items: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  });
  const checklists: FoChecklist[] = rows.map((c) => ({
    id: c.id,
    key: c.key,
    title: c.title,
    items: c.items.map(serialiseChecklistItem),
  }));
  return { checklists };
});
