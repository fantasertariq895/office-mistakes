# PRD — Personal Office Operations Dashboard

**Owner:** you (single-user, internal tool)
**Status:** Ready for MVP build
**Purpose:** A second-monitor dashboard that (a) organizes daily tasks and (b) prevents repeating known commission-processing mistakes, by surfacing the right checklist automatically based on what you're working on.

---

## 1. Problem Statement

Mistakes aren't a knowledge problem — you already know the rules, you've written them down. They're a *retrieval* problem: the right reminder doesn't surface at the moment you need it. This dashboard's entire job is to close that gap by staying visible, and by connecting "what I'm working on" to "what I need to remember" automatically.

## 2. Goals / Non-Goals

**Goals**
- One glance tells you: what's due today, what's overdue, and what mistakes apply to what you're doing right now.
- Zero friction to log a new mistake the moment it happens.
- Reliable — data must never be the thing that fails you.

**Non-goals (for now)**
- Multi-user support, team features, permissions.
- Replacing Notion entirely (open question, see §10).
- Deep Outlook/email inbox integration (Phase 3+).

## 3. Tech Stack

Single-user, personal, runs on your machine, needs real persistence and background scheduling for notifications.

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (React) | Fast to build a ChatGPT-style two-column layout; can later be wrapped in Tauri/Electron as a real desktop app if you want it out of the browser. |
| Backend | Next.js API routes (Node) | Same language as frontend — Claude Code can move across the whole stack without context-switching. |
| Database | SQLite via Prisma ORM | Zero-config, single file, trivial to back up (copy the `.db` file), plenty for single-user scale. |
| Scheduler | `node-cron` running inside the app process | Checks for due/overdue tasks on an interval while the app is running. |
| In-app notifications | Web Notifications API + in-app toast/badge | No external account needed — ships day one. |
| Email (Phase 2) | Nodemailer + SMTP (Gmail app password or a provider like Resend) | You provide credentials in Settings. |
| WhatsApp (Phase 3) | Twilio WhatsApp Business API | Requires a Twilio account, a WhatsApp-enabled number, and template approval — treat as its own mini-project. |
| Auth | Simple local PIN/passcode lock | This holds real client and payout data — worth a lock screen even single-user. |
| Hosting | Local (`npm run dev`, open on second monitor) for MVP | Matches your stated use case. Moving to an always-on box (small VPS or home server) is what makes overnight/off-hours notifications possible — that's a deliberate Phase 3 decision, not a default. |

## 4. Information Architecture

Left sidebar (fixed, ChatGPT-style):

1. **Home** — daily overview
2. **Tasks** — planner
3. **Commissions** — per-commission workspace (checklist, mistakes, contacts, approvals)
4. **Mistake Prevention** — universal/cross-commission rules only
5. **Settings** — commissions, contacts, notifications, backup, PIN

## 5. Data Model

```
Commission
  id, name, color, description

ChecklistItem
  id, commission_id (null = universal), text, category, is_high_risk, is_custom

MistakeLogEntry
  id, commission_id, text, date_logged, resolved (bool)

Contact
  id, commission_id, name, role, email, phone

ApprovalRequirement
  id, commission_id, description

Task
  id, title, description, priority (low/med/high),
  status (not_started/in_progress/completed/waiting),
  due_date, commission_id (nullable), notes, created_at, completed_at

NotificationRule
  id, type (task_due/task_overdue/daily_digest),
  channel (in_app/email/whatsapp), enabled

Settings
  pin_hash, notification_channels, quiet_hours_start, quiet_hours_end,
  email_smtp_config, whatsapp_config, theme
```

## 6. Feature Specs (phased)

### Phase 1 — MVP

**Home**
- Today's date, current-commission selector
- Today's tasks, overdue tasks, upcoming important tasks
- High-risk reminders for the selected commission
- Recently completed tasks

**Tasks**
- Add/edit/delete a task: title, description, priority, due date, commission tag, notes
- Status: Not Started / In Progress / Completed / Waiting
- Views: Today, Upcoming, Completed, By Commission
- Selecting a commission on a task auto-surfaces that commission's checklist inline (Feature 3 behavior)

**Commissions** (6: ActiveX Sales, ActiveX PM, Consumer Retention PM, Traffic, X-Time, EasyDealer)
- Per commission: checklist (checkable, flaggable high-risk, add-new — carried over from the existing checklist tool), mistake log, contacts, approval requirements
- Seeded from your existing 20-point list; Consumer Retention PM ships empty pending your input (see Open Questions)

**Mistake Prevention**
- The universal ALWAYS rules only, same checkable/flaggable/add-new pattern

**In-app notifications**
- Browser desktop notification + in-app badge for due/overdue tasks, while the app is open

**Settings**
- Manage commissions/contacts/checklist items
- Notification channel toggles (in-app only, enabled by default)
- PIN lock on/off
- Manual data export (JSON/DB file download)

### Phase 2

- Email notifications: due/overdue alerts + a morning daily digest
- Automated scheduled backups
- Simple reports view (weekly: tasks completed, mistakes flagged) — echoes the "weekly review" habit

### Phase 3

- WhatsApp notifications via Twilio
- Outlook/email integration (link emails to tasks)
- Document linking (attach files/links to tasks or commissions)
- AI assistant ("what do I need to do today")
- Always-on hosting so notifications fire outside work hours

## 7. UI/UX Requirements

- Two-column layout, ChatGPT-inspired: fixed sidebar + content area
- Minimal palette, card-based, checkboxes, tabs, filters
- No heavy animation, no color overload
- Designed to be glanced at, not read — density stays low even as data grows
- North star: *"I should immediately know what I need to do today and what mistakes I must avoid."*

## 8. Non-Functional Requirements

- **Privacy:** contains real client/commission data — local-only by default, PIN-lockable, never deployed publicly without auth.
- **Reliability:** automatic local backup of the SQLite file (daily), since this system failing is worse than not having it.
- **Offline-first:** Tasks/Commissions/Mistake Prevention work with no internet connection. Notifications (email/WhatsApp phases) naturally require it.

## 9. Milestones

1. Scaffold app (Next.js + Prisma + SQLite), data model, seed data from existing checklist
2. Build Tasks + Home
3. Build Commissions + Mistake Prevention (port over checklist/flag/add-new logic)
4. Wire Feature 3 (context-based surfacing)
5. In-app notifications + Settings + PIN lock
6. Phase 2: email + backups + reports
7. Phase 3: WhatsApp, Outlook, documents, AI assistant, always-on hosting

## 10. Open Questions (resolve before/during build)

1. **Consumer Retention PM content** — needs its actual checklist/mistakes/contacts from you; ships as an empty scaffold otherwise.
2. **Notification service choice** — Gmail app password vs. a transactional email API (Resend/SendGrid) for Phase 2; Twilio account setup for Phase 3 WhatsApp.
3. **Hosting** — local-only (simple, only works while open) vs. small always-on server (needed for off-hours/overnight reminders).
4. **Remote access** — desktop-only (second monitor), or do you also want to check tasks from your phone?
5. **PIN lock** — on by default, given the data sensitivity?
6. **Notion** — does this replace it, or run alongside it for general (non-commission) tasks?
