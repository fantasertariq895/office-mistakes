import { route } from "@/lib/api-helpers";
import { loadDashboard } from "@/lib/founder-os/server";

/** The whole Founder OS dashboard — settings, stat tiles, Do This Now — in one round trip. */
export const GET = route(async () => loadDashboard());
