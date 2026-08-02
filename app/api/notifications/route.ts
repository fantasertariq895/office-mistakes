import { route } from "@/lib/api-helpers";
import { getNotificationSnapshot } from "@/lib/notifications";

/**
 * The browser polls this every 30s while a tab is open. Stateless: the full
 * due/overdue picture is recomputed on every call, and the client decides
 * which alerts it has already shown (see AppProvider) — nothing to drain,
 * nothing to go stale on the server between requests.
 */
export const GET = route(async () => getNotificationSnapshot());
