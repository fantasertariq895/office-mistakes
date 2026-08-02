# Office Operations Dashboard

Personal, single-user dashboard for daily tasks and commission mistake
prevention. Phase 1 MVP of [PRD.md](PRD.md).

Next.js (App Router) · Prisma · Postgres (Neon). Runs locally against the same
database it uses once deployed, so there's one source of truth either way.

## Running it locally

```bash
npm run dev
```

Then open http://localhost:3000.

## First-time setup

1. Create a free [Neon](https://neon.tech) project (or a Vercel Postgres
   database, which is Neon underneath). Copy its **pooled** connection string
   and its **direct** connection string.
2. Copy `.env.example` to `.env` and paste those in as `DATABASE_URL` and
   `DIRECT_URL`. Generate a `SESSION_SECRET` with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Push the schema and seed the six commissions:
   ```bash
   npm install
   npm run setup
   ```

`setup` generates the Prisma client, creates the tables in your Neon database,
and seeds the six commissions with their checklists, contacts and approval
rules.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server + a local console heartbeat (see Notifications below) |
| `npm run build` / `npm start` | Production build and serve |
| `npm run dev:turbo` / `build:turbo` | Same, but with Turbopack (see below) |
| `npm run db:push` | Push schema changes to the database (no formal migrations — this is a solo tool) |
| `npm run db:seed` | Re-run the seed (idempotent — never duplicates) |
| `npm run db:DANGER-erase-all-tasks-and-mistakes-then-reseed` | **Wipes every task and logged mistake**, then re-seeds commissions/checklists/contacts/approvals only. Renamed deliberately so it can't be run by muscle memory — back up first if you ever need this. |
| `npm run db:studio` | Prisma Studio, for poking at the data directly |
| `npm run typecheck` | `tsc --noEmit` |

## Deploying to Vercel

The app is stateless-server-friendly by design — no server-side session store,
no in-process cron it depends on — specifically so it can run on Vercel's
serverless functions.

1. **Database.** Same Neon project as local dev, or a separate one for
   production — either works, since `DATABASE_URL`/`DIRECT_URL` are just
   environment variables. If you want production data kept apart from
   whatever you test with locally, create a second Neon project and use its
   connection strings only in Vercel's env vars, not your local `.env`.

2. **Push this repo to GitHub**, then import it in the
   [Vercel dashboard](https://vercel.com/new) — Vercel auto-detects Next.js,
   no config needed beyond the environment variables below.

3. **Environment variables** (Vercel project → Settings → Environment
   Variables):

   | Variable | Required | What it's for |
   |---|---|---|
   | `DATABASE_URL` | Yes | Pooled Postgres connection string |
   | `DIRECT_URL` | Yes | Unpooled connection string (Prisma needs it for `db push`) |
   | `SESSION_SECRET` | Yes | Signs the PIN-unlock cookie. The app refuses to boot without one here — a missing secret would mean falling back to a guessable value, which isn't acceptable on a public URL |
   | `FORCE_PIN` | Recommended | Set to `true` so the PIN lock can't be turned off from Settings on the live site |
   | `INITIAL_PIN` | If `FORCE_PIN=true` | 4–8 digits. The PIN the app locks itself with the moment it first boots, before anyone's visited Settings. Change it from inside the app after your first login, then you can delete this variable — it's only read when no PIN exists yet |
   | `CRON_SECRET` | Recommended | Authorizes the scheduled monthly-reset backstop (see below) |

4. **Push the schema** to whichever Neon project production points at (run
   this from your machine, pointed at the production `DATABASE_URL`/
   `DIRECT_URL` via a temporary `.env` or inline env vars):
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. Deploy. First load will be behind the PIN if `FORCE_PIN=true`.

**What changes on Vercel vs. local:**
- Sessions are stateless signed cookies, not server memory — see
  `lib/auth.ts`. They survive redeploys and cold starts; only a PIN
  change/removal invalidates them (by bumping a version stored in the
  database, not by tracking individual tokens).
- The old always-on `node-cron` job doesn't run there (there's no long-lived
  process for it to live in) and isn't needed: `/api/notifications` recomputes
  the full due/overdue picture from the database on every poll, and the
  browser itself decides which alerts it's already shown (via `localStorage`,
  scoped to the day).
- The monthly checklist reset (below) is triggered primarily by page loads,
  with Vercel Cron as a backstop — not by an always-running scheduler.

## How it's laid out

One page. Top to bottom:

1. **Commission cards** — each shows its checklist progress, high-risk count
   and open tasks. Tap one to focus everything below on it; tap again (or pick
   *All tasks*) to clear.
2. **Tasks** — everything, or just the picked commission's, with a one-line
   quick-add.
3. **Before you send** — **left: Checklist** for the picked commission (only
   shown once one's picked), **right: Always check before sending** — the
   rules that apply no matter which commission you're on. With nothing
   picked, only the Always list shows, full width.
4. **What went wrong** (last section, always there) — the single log of every
   mistake across every commission. It appears nowhere else on the page —
   earlier drafts showed the same entries twice, scoped and unscoped, which
   read as duplicates rather than a filter.

**Settings** sits at the bottom of the sidebar rather than in the page. It's
the only route to data export, the PIN lock and notification toggles, so it's
kept out of the daily flow rather than removed.

## Automatic monthly checklist reset

Every checklist — Always rules and every commission's — unticks itself the
first time the app is opened in a new month. Nothing to configure; it's a
single "last reset month" value on the Settings row, checked cheaply on every
page load (`lib/monthly-reset.ts`). On a fresh install this doesn't wipe
anything mid-month — the very first check only records the current month,
the reset itself only fires on an actual month change after that.

If deployed to Vercel, `vercel.json` also schedules a daily call to
`/api/cron/monthly-reset` as a backstop, in case the app happens to sit
unopened across a month boundary. It's a no-op on every day except the one
where the month actually changed, and requires `CRON_SECRET` to authorize the
request.

## Deleting things

Anything reversible — tasks, checklist items, contacts, approvals, log entries
— deletes immediately and offers **Undo** in a toast for ten seconds. Only
deleting a whole commission asks for confirmation, because it cascades to that
commission's checklist, contacts, approvals and mistake log and cannot be
undone.

## Backups

`Settings → Data` downloads a JSON snapshot of everything. Neon also keeps its
own automatic point-in-time backups — check the **Backups**/**Restore** tab in
your Neon project dashboard for a full database-level restore point.

## Webpack instead of Turbopack

This development machine's Windows Application Control policy blocks Next.js's
native SWC binary. Next falls back to WASM, and Turbopack (the Next 16
default) requires the native bindings, so it refuses to start here — `dev` and
`build` pass `--webpack` to work around it. This is a local-machine quirk, not
a project requirement: Vercel's Linux build servers have no such restriction,
so the `vercel-build` script Vercel picks up automatically uses plain
`next build` (Turbopack) there. `npm run dev:turbo` / `build:turbo` get
Turbopack back locally too, if this machine's policy is ever lifted.

## Notes

- **PIN lock** is off by default locally; turn it on in
  `Settings → Security`. A session lasts 30 days or until the PIN
  changes/is removed, whichever comes first — not "until restart" like
  earlier local-only versions of this app.
- **If you forget the PIN there is no in-app recovery.** Reset it directly:
  run `npm run db:studio` pointed at the same `DATABASE_URL` this app is
  using, open the `Settings` table, clear the `pinHash` field on row 1. Keep
  the PIN written down somewhere safe.
- Phase 2/3 features (email, WhatsApp, Outlook, AI assistant, automatic
  scheduled backups, weekly reports) appear as disabled "coming soon" toggles
  in Settings. None of them are implemented.
