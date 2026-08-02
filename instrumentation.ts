/**
 * Runs once when the Next.js server process starts. Boots the local-dev-only
 * reminder heartbeat (lib/cron.ts) — it no-ops on Vercel, where there's no
 * long-lived process for a setInterval-based scheduler to live in, and where
 * it isn't needed anyway (see lib/notifications.ts and vercel.json).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startScheduler } = await import("./lib/cron");
  startScheduler();
}
