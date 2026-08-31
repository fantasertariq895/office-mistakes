import { route } from "@/lib/api-helpers";
import { loadPlan } from "@/lib/founder-os/server";

/** The whole master 90-day Plan — phases, steps, mistakes — in one round trip. */
export const GET = route(async () => loadPlan());
