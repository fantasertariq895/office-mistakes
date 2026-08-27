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
    cron fires, and likewise `/api/cron/trader-media-weekly` (added later,
    Monday-only) returns 500 too — both use the same bearer-token check. Both
    are backstops only: the monthly reset's primary trigger is every
    `/api/board` load, and the weekly Trader Media run's primary trigger is
    every `/trader-media` page load — both work regardless of this var, but
    the backstops themselves are unverified.
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

## Traffic Billing workspace (second tab, `/traffic-billing`)

A separate execution workspace for the monthly Traffic Billing SOP — **39
phases, 331 steps, 39 "mistakes to avoid"**. It shares the shell (sidebar,
theme, toasts, lock) and nothing else: **it does not touch Commission,
ChecklistItem, Task or any existing route.**

**Sources.** Originally seeded from [Traffic Billing SOP.md](Traffic%20Billing%20SOP.md),
then extended from two training-transcript documents
(`TRFFK_Billing_Complete_Documentation_Sessions_1_to_3.md` and
`TRFFK_Billing_Sessions_1_to_3_03_Walkthrough_by_Sections.md`). Where the two
disagreed the user ruled explicitly, and those rulings are load-bearing —
do not "correct" them back from the training docs:
- Final batches go to **Ryan**, CC Gagan Roop and Duska Adzovic (the training
  docs say DSS Billing; the user's version is current).
- **Nissan/Infiniti use New and Used only** — not the docs' "avoid Other /
  Finance / Acquisition" framing.
- The post-decision summary to Mahi / Marie-Christine / Justin is
  **deliberately not included**.
- "Exclude FCA" in the OEM phases is correct *and* FCA is billed — the
  exclusion is scoped to the OEM/Other-OEM filters. Phase 34 is its own FCA
  path. Getting this wrong means never invoicing FCA.
- `Step 3.1` / `5.1` / `6A` etc. already carry their full sheet names; the
  training docs' "roll-up / adjusted tabs" vocabulary is the same thing.
  Use the `Step X.Y <Sheet Name>` form for anything new.

**Still unresolved** (raised, not yet ruled on): whether to add the
reconciliation file stage, a standalone Google fee phase, the combined
Cam Clark / Superior Auto Group and JLR batch files, and the
Demand Gen / Display splits. Phase 34 references the Google fee because
FCA's fee rule depends on it, but there is no Google fee phase of its own.
The exact sheet name for the Adjusted FCA Billing tab is also unconfirmed.

- **Its own tables, on purpose** (`TrafficBilling*` in `prisma/schema.prisma`).
  Two reasons, both load-bearing:
  1. `lib/monthly-reset.ts` unticks *every* `ChecklistItem` with no
     `commissionId` filter. A month-long 304-step procedure whose ticks are
     the record of what was done cannot live in a table that gets wiped on
     the 1st.
  2. Traffic Billing has a **run** dimension — one execution per billing
     month, kept indefinitely — that `ChecklistItem.checkedAt` (a single
     mutable slot) can't express.
- **Content in the DB, seeded from code.** `lib/traffic-billing/sop-template.ts`
  is the seed; `prisma/seed-traffic-billing.ts` writes it in, matching on a
  stable `key` so it's idempotent and **never overwrites an in-app edit**.
  Steps/phases/mistakes are all editable and addable in the UI (user's
  explicit requirement). Re-run with `npm run db:seed-traffic-billing` — safe
  any time, adds only what's missing.
- **Custom rows get a `custom-` key prefix** so they can't collide with a
  seeded `<phaseKey>-sNN` key. A collision would make the seed *skip* a real
  SOP step, which is the quiet failure mode to avoid here.
- **A key is bound to its content for life.** The seed matches on key, so
  reusing an existing key for different wording silently skips the new step
  and leaves the old one — this was nearly shipped when the Social alignment
  step was given the Shopping step's `s16`. New steps get new keys; order
  comes from array position, never from key order.
- **Phase `number` is derived from position in `SOP_PHASES`**, and the seed
  re-syncs `number`/`sortOrder`/`stageKey` on every run. That is what lets a
  phase be inserted mid-list (Phase 1 and Phase 34 both were) without
  renumbering 37 objects by hand. `title`, `intro` and step `text` are
  deliberately **never** re-synced — those are what the user edits in the
  app, and re-seeding must not revert their wording.
- **Tri-state steps** (`open`/`done`/`na`), not checkboxes. The SOP says
  "applicable"/"where applicable" throughout; without N/A a month that
  skipped a branch reads as permanently incomplete. **N/A counts as settled**
  in every progress figure (`lib/traffic-billing/progress.ts`) — that rule
  lives in one place so the rail, header and phase card can't disagree.
- **State rows are created lazily.** A step with no row is "open", so
  starting a month is one insert, not 304.
- **The client supplies the month**, server never computes "this month"
  (`lib/traffic-billing/month.ts`). Same UTC-vs-viewer trap `lib/date.ts`
  documents: near a month boundary the server's month and the viewer's
  disagree. `formatMonthLabel` also deliberately never builds a `Date` from
  "YYYY-MM" — `new Date("2026-08")` is UTC midnight on the 1st, which renders
  as *July* west of UTC.
- **Soft gating on "Next phase".** The SOP says "do not continue until…", but
  hard-blocking a 304-step process teaches people to tick boxes they haven't
  done. Warn once, then allow.
- **Completed runs render read-only** so a past month can be read back
  without being silently rewritten.
- **Transcription rules** (how the irregular markdown was mapped) are
  documented at the top of `lib/traffic-billing/sop-template.ts` — read that
  before re-syncing the `.md`. The one deliberate deviation: Phase 1's file
  list was promoted from reference bullets to real per-file checkboxes.

Responsive behaviour, measured at 375 / 768 / 1280 rather than assumed:
- Below 900px the layout collapses to one column and the rail moves **below**
  the phase card (`order: 2`). Stacked above, 37 entries put ~320px of index
  between the top of the screen and the first step.
- `.nav-sub` (the "Aug 2026 · 62%" caption) is hidden below 760px, where the
  sidebar collapses to a 62px icon rail — it overflowed before.
- `.tb-step-text` has `min-width: 140px` and `.tb-step-main` wraps. On touch
  the action row is permanently visible and ~166px wide, which squeezed the
  step text to a **17px** column; the floor makes the actions wrap instead.
- `.tb-step-actions` is `opacity: 0` **and `pointer-events: none`** when
  hidden. Without the second half there's an invisible-but-tappable Delete
  beside every step — the same trap `.check-actions` guards against, and it
  was live here until it got measured.
- Touch targets bumped to 38–44px under `(hover: none), (pointer: coarse)`,
  scoped to `.tb-*` so the rest of the app keeps its audited sizing.

Verified end-to-end against the live API (not just the rendered UI): run
create is idempotent on month, invalid month/state/status are rejected 400,
per-month state is isolated, a completed month's ticks and notes survive the
next month starting, and deleting a step/phase/run cascades with no orphans.
Test runs created during that check were deleted afterwards — the SOP ships
seeded with **zero runs**, so the first "Start <month>" is the user's.

## Trader Media workspace (third tab, `/trader-media`)

A weekly (Monday-anchored, spilling into Tuesday for the exec deck)
checklist for the "Weekly Media Revenue Reporting" process — updating a
media-revenue forecast workbook, sense-checking it, handing it to Yuvika.
**13 phases, 29 steps, 7 mistakes-to-avoid, 6 one-time setup items.**
Architecturally a clone of Traffic Billing above — same reasons (a
`ChecklistItem` can't survive the monthly wipe or express a run history) —
with "month" swapped for "Monday-dated week" throughout. Own tables
(`TraderMedia*` in `prisma/schema.prisma`), own route, own `lib/trader-media/`
— **no contact with Commission, ChecklistItem, Task, or any `TrafficBilling*`
table.**

**Source**: [Media Related steps (1).docx](Media%20Related%20steps%20(1).docx)
(Yuvika's Zoom notes + full transcript). Transcribed into
`lib/trader-media/sop-template.ts`, whose own doc comment records the
transcription rules — read that before re-syncing the `.docx`.

**Content ownership is load-bearing.** The doc's own "Your Role RIGHT NOW"
section is explicit that the user's current job is only Phases 1–6 (locate
file → update PIO/Salesforce/Programmatic → set the control date → Refresh
All → sense checks → hand off to Yuvika). Phases 7–13 (Yuvika's FP&A
judgment, the 12:15 call, the Benoit review, locking the forecast, and deck
production) are seeded `isOwnerPending: true` on `TraderMediaPhase` — shown
as a "Not yet yours" badge in the phase card and a small user-icon marker in
the rail, but **left fully interactive, not locked**, so ownership can grow
into them later without a schema change. Getting this flag wrong on a phase
either hides real ownership or overstates it — if the user's responsibilities
shift, update `isOwnerPending` in `sop-template.ts` and re-seed; the seed
re-syncs it on every run for non-custom phases (unlike `title`/`intro`,
which the seed never touches once a phase exists).

**Differences from Traffic Billing, deliberately:**
- **No stage grouping** (no `stages.ts`, no `stageKey`) — 13 phases is too
  few to need it; the rail is a flat list.
- **One-time "Access / Things You Need" checklist** lives in its own table,
  `TraderMediaSetupItem` — no `runId`, no relation to `TraderMediaRun` at
  all. It's seeded once (ShareDrive access, BERT distribution, recurring
  call invites), checked off once, never resets. Folding it into the
  Phase/Step/Run system would have meant faking a permanent "run" just to
  hang state off.
- **`lib/trader-media/week.ts`** is the week analogue of
  `lib/traffic-billing/month.ts`, but reuses `lib/date.ts`'s
  `fromDateInputValue`/`toDateInputValue` for the UTC round-trip rather than
  reimplementing it. `requireWeek` (in `server.ts`) rejects any date that
  isn't a real, actual Monday with a 400 — the server never computes "this
  week" itself, same reasoning as `requireMonth`.
- **The current week starts itself — unlike Traffic Billing's manual "Start
  <month>".** The user explicitly asked for this: complete one Monday, and
  the next Monday's checklist should just be there, no button to remember.
  `app/trader-media/page.tsx` auto-calls `startWeek` on load whenever the
  viewer's current week (`localCurrentWeekKey`) has no run yet. This doesn't
  lose anything — every week is its own permanent `TraderMediaRun` row, so
  auto-starting a new one never touches a completed one. A Vercel Cron
  backstop (`/api/cron/trader-media-weekly`, Monday-only in `vercel.json`,
  `ensureThisWeekRun` in `lib/trader-media/server.ts`) covers the case where
  nobody opens the app on the Monday itself — same primary-trigger-plus-cron
  shape as the monthly checklist reset, mirrored on purpose. That backstop
  needs `CRON_SECRET` set in Vercel, same as the monthly reset's — see
  "Needs verification" under Current live status.

Verified end-to-end against the live API and the rendered UI: non-Monday /
malformed / nonexistent dates rejected 400, run creation idempotent on
`week`, per-week state isolation, cascading deletes leave no orphans, the
owner-pending badge/marker render exactly on phases 7–13 and stay fully
interactive, and the setup checklist is provably unaffected by run
mutations. Test runs and the test setup-toggle from that check were removed
afterward — ships with **zero runs** and all setup items unchecked, so the
first "Start <week>" and the first access-item tick are the user's.

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
  Turbopack's native binary), not a project requirement. `vercel-build`
  currently also passes `--webpack` (it is `prisma generate && next build
  --webpack`); `dev:turbo`/`build:turbo` are the Turbopack escape hatches if
  you ever want them.
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
