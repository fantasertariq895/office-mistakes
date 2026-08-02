import cron from "node-cron";
import { getNotificationSnapshot } from "./notifications";

/**
 * Local-dev-only heartbeat. Not required for correctness — /api/notifications
 * is fully stateless and recomputes the current picture on every browser
 * poll (see lib/notifications.ts), so nothing here needs to run for
 * reminders to work. This just logs a periodic summary to the terminal when
 * running `npm run dev`/`npm start` on your own machine.
 *
 * It deliberately does not run on Vercel: a node-cron `setInterval` has
 * nothing to live in there — serverless functions don't persist between
 * requests — and the monthly checklist reset instead runs via Vercel Cron
 * hitting /api/cron/monthly-reset (see vercel.json).
 */
const globalForCron = globalThis as unknown as { __opsCronStarted?: boolean };

const SCHEDULE = "*/5 * * * *";

async function run(reason: string) {
  try {
    const snapshot = await getNotificationSnapshot();
    if (snapshot.alerts.length > 0 || snapshot.suppressed) {
      console.log(
        `[heartbeat:${reason}] due today ${snapshot.dueToday}, overdue ${snapshot.overdue}` +
          (snapshot.suppressed ? ` (suppressed: ${snapshot.suppressed})` : "")
      );
    }
  } catch (err) {
    console.error("[heartbeat] scan failed", err);
  }
}

export function startScheduler() {
  if (process.env.VERCEL) return;
  if (globalForCron.__opsCronStarted) return;
  globalForCron.__opsCronStarted = true;

  cron.schedule(SCHEDULE, () => {
    void run("tick");
  });
  setTimeout(() => void run("boot"), 4000);

  console.log(`[heartbeat] local reminder heartbeat started (${SCHEDULE})`);
}
