# CLAUDE.md — context for future sessions

Personal, single-user office operations dashboard (tasks + per-commission
mistake-prevention checklists). Full spec: [PRD.md](PRD.md). User-facing
setup/deploy instructions: [README.md](README.md) — that file is kept
accurate and complete; don't duplicate it here. This file is the "what's
actually true right now, and why" handoff for picking the project back up.

**Never write real secret values into this file.** It's a tracked project
file and will likely end up in the git history. Reference `.env.example` and
variable *names* only.

## Stack, in one paragraph

Next.js 16 (App Router) + Prisma 6 + Postgres (Neon), one single-page UI at
`app/page.tsx`, deployed on Vercel. Originally scaffolded on SQLite for local
use only; migrated to Postgres specifically so the same database works both
locally and once deployed serverless — Vercel's filesystem is read-only, so
the original SQLite file approach could not survive deployment at all.

## Current live status

- **GitHub:** `fantasertariq895/office-mistakes`, branch `main`.
- **Vercel project:** `fantaser-tariqs-projects/office-mistakes`, connected to
  the GitHub repo — pushes to `main` auto-deploy.
- **Live URL:** `https://office-mistakes-delta.vercel.app`
- **Database:** Neon Postgres, provisioned through Vercel's Storage tab
  (resource name `office-mistakes-db`, region Washington D.C./`iad1`),
  Neon's bundled Auth feature deliberately turned off (not used — this app
  has its own PIN lock).
- **Confirmed working live** (verified by direct API inspection, not just
  eyeballing the UI): commissions/checklists seeded correctly, task
  create/save round-trips the exact due date picked, `/api/tasks` and
  `/api/board` return real data.
- **Needs verification, not confirmed in this session:**
  - Whether `CRON_SECRET` is actually set in Vercel's environment variables.
    Without it, `/api/cron/monthly-reset` returns 500 when Vercel's daily
    cron fires. This is a backstop only — the monthly reset's *primary*
    trigger is every `/api/board` load (see `lib/monthly-reset.ts`), which
    works regardless — but the backstop itself is unverified.
  - Whether `FORCE_PIN`/`INITIAL_PIN` are set. **They should NOT be** — the
    user explicitly said "don't set any pin for this project." If a future
    session finds them set, that was not an intentional instruction and is
    worth flagging back to the user rather than assuming it's correct.

## Outstanding from the last round of requests

The user's last multi-part ask was: (1) automatic monthly checklist reset,
(2) deploy to Vercel, (3) "make it more stylish and simpler with good CSS."

1. **Done and verified** — `lib/monthly-reset.ts`, wired into `/api/board`
   and backed by a Vercel Cron hitting `/api/cron/monthly-reset` daily.
2. **Done** — live and working, per the status above.
3. **Unclear / likely not done.** `git log -- app/globals.css` shows the file
   has not been touched since the very first commit
   (`8a84781`, "Office operations dashboard — Phase 1 MVP"). That initial
   commit already contains a fairly complete Linear/Notion-inspired design
   system (CSS custom-property tokens, dark mode, accessibility-audited
   contrast and touch targets — see the design-audit history in the repo's
   conversation, not reproduced here). But the specific *follow-up* request
   for a further styling pass doesn't appear to have produced any change.
   **Confirm with the user whether they still want additional visual
   polish, or whether the existing design already satisfies that ask** —
   don't assume either answer.

## Architecture decisions and why (read before changing these)

- **Postgres, not SQLite** (`prisma/schema.prisma`): Vercel serverless
  functions have a read-only filesystem; a SQLite file can't persist there.
  `DATABASE_URL` (pooled) + `DIRECT_URL` (unpooled, for `db push`) are both
  required — standard Neon/Prisma serverless pattern.
- **Stateless signed-cookie sessions** (`lib/auth.ts`), not a server-side
  session store: serverless instances don't share memory, so an in-memory
  `Set` of "logged in" tokens (the original local-only design) silently
  breaks — different requests can land on different cold instances. Sessions
  are HMAC-signed tokens carrying an expiry and a `sessionVersion`; changing
  or removing the PIN bumps that version in the `Settings` row, which
  invalidates every previously-issued token at once with no store to clear.
- **Stateless notifications** (`lib/notifications.ts`): same reasoning. The
  full due/overdue picture is recomputed from the database on every poll;
  which alerts have already been shown is tracked in the browser's
  `localStorage` (see `AppProvider.tsx`), not server memory.
- **`node-cron` (`lib/cron.ts`) is local-dev-only**, explicitly guarded
  (`if (process.env.VERCEL) return;`). It's not required for correctness —
  it's a convenience heartbeat when running `npm run dev` on your own
  machine. On Vercel, Vercel Cron (`vercel.json`) is the only scheduler, and
  it's a backstop for the monthly reset, not something day-to-day
  functionality depends on.
- **`FORCE_PIN` / `INITIAL_PIN`**: a deployment can force the PIN lock on
  permanently (Settings can't disable it) and bootstrap its first PIN from
  an env var, so the very first visit to a public URL is never unlocked by
  default. Currently **not** set for this deployment, per explicit
  instruction — see "Outstanding" above.
- **Due dates are UTC-anchored calendar days, deliberately, everywhere**
  (`lib/date.ts`) — this was the subject of two real bugs, both fixed and
  worth understanding before touching date code again:
  1. Parsing a picked "YYYY-MM-DD" with `new Date(y, m-1, d)` builds *local*
     midnight in whichever timezone the *executing process* happens to be
     in. That's the server (UTC on Vercel) for API routes, not the visitor's
     browser. Displaying it back with local getters used the *browser's*
     timezone instead. Any offset between the two shifted the calendar day
     by exactly one — reproduced and confirmed: pick Aug 4, a US-timezone
     browser would see Aug 3 after saving. Fixed by anchoring every due-date
     round-trip (`fromDateInputValue`/`toDateInputValue`/`startOfDay`/
     `endOfDay`/`daysBetween`) to UTC consistently, so no timezone can
     reinterpret it.
  2. That fix over-corrected: "what's today, right now" (for defaulting a
     new task's date, notification dedup) is a *different* question from
     "what calendar day does this stored date represent" — the first one
     genuinely wants the browser's local today, not UTC's. Conflating them
     made the New Task modal default to a different day than the page
     header during the hours where a browser's local day hasn't rolled over
     yet but UTC's already has. Fixed by splitting into `toDateInputValue`
     (UTC, for reading back a stored date) vs. `localTodayInputValue()`/
     `todayAsCalendarDay()` (local, for "today" as the viewer experiences
     it right now). **If you touch `lib/date.ts` again, re-read the module
     doc comment at the top of that file before changing anything** — it
     explains this distinction in full and every function's exact contract.
  3. **Known remaining gap, not fixed**: `lib/notifications.ts` runs
     server-side with no visibility into the viewer's timezone, so the
     due/overdue *badge and toast* classification still anchors to the
     server's UTC "today" — narrower than bug #1 (a few hours near a
     timezone's midnight, not a full day, every time), but real. Would need
     the client to pass its local date into the poll request to close
     properly.
- **`components/LockGate.tsx`**: a failed `/api/auth/status` call renders a
  visibly distinct red error screen with the real error message, not the
  normal PIN prompt. This was a real bug too — the original fallback
  rendered `{ pinSet: true, unlocked: false }` on *any* fetch failure, which
  looked pixel-identical to a working, locked app. On this deployment's very
  first attempt, that fallback made a completely broken deployment (zero
  environment variables configured, `/api/auth/status` returning 500) look
  like a normal lock screen — actively misleading. If you ever add another
  early-boot client fetch like this, make sure its failure path is visually
  distinct from a legitimate state, on principle.

## Practical notes for working in this repo

- **Local dev requires a real Postgres connection** — there is no SQLite
  fallback anymore. `.env` needs `DATABASE_URL`/`DIRECT_URL` pointed at a
  Neon project (currently the same one the Vercel deployment uses, so local
  changes and production share data — be careful running destructive
  scripts like `db:DANGER-erase-all-tasks-and-mistakes-then-reseed` locally).
- **`--webpack` in `dev`/`build` scripts is a workaround for this specific
  development machine** (a Windows Application Control policy blocks
  Turbopack's native binary), not a project requirement. Vercel's build uses
  plain `next build` (Turbopack) via the separate `vercel-build` script,
  since Vercel's Linux build servers have no such restriction.
- **Clear `.next` before typechecking/building after deleting or renaming any
  route file.** Next generates route-type files under `.next/types` that
  reference the old path and fail `tsc --noEmit` with a confusing "cannot
  find module" error until the cache is cleared — this has come up multiple
  times across sessions. `Remove-Item -Recurse -Force .next` fixes it.
- **`git` will warn `LF will be replaced by CRLF`** on every commit — that's
  `core.autocrlf=true` on Windows doing its normal job, not a problem.
- **Every route runs `isUnlocked()` (via the `route()` wrapper in
  `lib/api-helpers.ts`)**, which calls `cookies()` — this is what makes every
  API route dynamic (never statically optimized), which is correct and
  expected; don't try to "fix" a route showing as `ƒ Dynamic` in the build
  output.
- Before pushing anything: `npx tsc --noEmit` then `npm run vercel-build`
  (mirrors what Vercel actually runs) — cheaper to catch a build failure
  locally than to wait on a Vercel deploy.
- When verifying a live fix, prefer checking the actual API response
  (`fetch`/`curl` the route, read the raw JSON) over trusting what the
  rendered UI appears to show — the LockGate bug above is a direct example
  of a UI that looked correct while being completely broken underneath.
