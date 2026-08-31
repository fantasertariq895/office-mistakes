# Prompt for Claude Code: Build "Founder OS" — a full business operating system

Copy everything below into Claude Code (in the project folder where you want the app built) and let it run. Review checkpoints are marked where you should pause and confirm before continuing.

---

## ROLE

Act as a senior full-stack engineer building a personal business-operations web app for a solo, part-time founder. This is not a demo or a template — it needs to be a genuinely usable daily tool for someone running a business in under 10 hours a week, so prioritize clarity, low friction, and fast data entry over visual flourish.

## BUSINESS CONTEXT (seed all data with this — do not use generic placeholders)

**Founder situation:**
- Based in Canada, already owns a registered Ontario corporation
- Registering a new trade name (DBA) under that corporation for this venture
- Starting budget: under $2,000 CAD
- Available time: under 10 hours/week (side project, not full-time)
- Primary 90-day goal: build a web presence and land a first paying client — specifically for IT staffing/outsourcing support (the BPO delivery angle), not the full managed-IT stack yet

**The business:**
- A Managed IT Services company targeting SMBs in Mississauga/GTA, Ontario, Canada
- Three public-facing service pillars: **Managed IT Services**, **IT Consulting**, **Cloud Solutions**
- A fourth capability — IT staffing / outsourcing support, delivered via a team based in Pakistan — exists as the **delivery engine**, not a publicly marketed "BPO" service. It should never appear as a client-facing label; it's internal capacity/staffing, sold to clients as "IT support" or "outsourced IT staffing."
- Model mirrors an already-validated competitor pattern: Canadian client-facing entity + offshore delivery team (Pathway Communications runs this exact structure with a Pune, India office alongside their Markham HQ)

**Target customer / niche:**
- Underserved segment: businesses with 1–10 employees (established competitors mostly serve 10–150 user companies and ignore this smaller tier)
- Industries to consider for initial vertical focus: accounting firms, medical/dental offices, law firms, retail — pick one to start, don't spread across all
- Geographic focus: Mississauga and the broader GTA

**Competitive landscape (already researched — seed the competitor matrix with this real data):**

| Competitor | Notes |
|---|---|
| CG Technologies | Est. 1996, 100+ SMB clients, pricing $100–200/user/month, serves 10–150 user companies, industries: law/accounting/healthcare/manufacturing/logistics/retail/construction, 95% client retention |
| Pathway Communications | Markham HQ + Pune, India delivery office — proof this offshore-delivery model is normal and credible in this market |
| IT Force | 26 years, 50+ clients, differentiates on speed (2-min call answer, 10-min email reply), flexible/no-commitment contracts |
| XBASE Technologies | 31 years, flat-rate "unlimited" support model, strong accordion-style service breakdown (Service Desk, 24/7 Monitoring, Backup Management, Reporting) |
| Clutch.co / Cloudtango listings | 20+ established MSPs in Toronto/Mississauga, most 18–30 years in business — market is credible but crowded |

**Honest strategic read:** This is a proven, real market with recurring revenue potential, but it is not a differentiated idea — the founder wins on execution, niche selection, and speed, not on having a unique concept. Competing head-on with incumbents' "years of experience" positioning is a losing game; the wedge is the underserved small-business tier and being fast/personal rather than established.

**Business structure decision already made:** Keep the existing Ontario corporation; register one trade name under it. No new corporation needed.

**Startup budget already modeled (seed the Finance module with this):**

| Item | Type | Cost (CAD) |
|---|---|---|
| Trade name registration (Ontario Business Registry) | One-time | $60 |
| NUANS name search | One-time | $15–26 |
| Domain name (1yr) | One-time | $15–20 |
| Logo/basic branding | One-time | $0–50 |
| Website builder subscription | Monthly | $20–35 |
| Business email (Google Workspace) | Monthly | $8–10 |

Cap: $2,000 CAD total one-time spend. Recurring costs tracked separately against future client revenue.

**90-day plan already drafted (seed the roadmap module with this):**
- **Days 1–30 (Foundation):** register trade name, buy domain, build lean 4-page site (Home/Services/About/Contact), set up LinkedIn presence, draft outreach pitch, start outreach at 10–15 contacts/week
- **Days 31–60 (Outreach Ramp):** sustain 15–20 contacts/week, refine pitch from real replies, book discovery calls
- **Days 61–90 (Close):** run discovery calls, send proposals for a small pilot engagement, close first client, prepare Pakistan-side delivery logistics

---

## WHAT TO BUILD

A single web application called **Founder OS** implementing the following modules. Build it as a genuinely working, data-persisted tool — not a mockup. Every module should load pre-seeded with the real data above, editable by the founder from day one.

### 1. Dashboard (home view)
- 90-day runway visual: a horizontal timeline showing Day 1/30/60/90 markers and a "today" position calculated from a founder-set start date
- At-a-glance strip: checklist completion %, budget spent vs. $2,000 cap, active pipeline count, clients closed
- "Do This Now" widget — surfaces only the next 3–5 highest-priority incomplete tasks across all modules (never the full backlog) — this is important, the founder should never feel overwhelmed opening the app

### 2. Business Analysis
- Business Opportunity Scorecard (editable 1–10 scores across market demand, customer pain, competition, profit potential, startup cost, difficulty, scalability, recurring revenue potential, customer acquisition difficulty) with an auto-calculated overall score
- Competitor matrix (table: Competitor / Service / Price / Target Customer / Strengths / Weaknesses / Positioning / Opportunity for Us) — seed with the 5 competitors listed above, allow adding more
- Ideal Customer Profile builder — structured fields (industry, company size, pain points, budget, decision maker, objections, where they spend time online) seeded with the 1–10 employee SMB niche

### 3. Business Model Canvas
- Standard 9-block canvas (value proposition, customer segments, revenue streams, pricing, cost structure, channels, customer relationships, key activities, key resources, key partners) as an editable grid, pre-filled with what's known from context above

### 4. Finance / CFO
- Startup cost tracker (one-time vs. recurring, seeded with the budget table above, capped at $2,000 with a visual warning if exceeded)
- Simple revenue forecast: month 1–12, editable fields for # of clients, average revenue per client, computed gross revenue, and a naive cost-of-delivery estimate
- Key metrics calculator with plain-language explanations inline (not just formulas) for: CAC, LTV, LTV:CAC ratio, MRR, break-even point, revenue per contractor/employee — each metric should show a one-line definition on hover or expand, since the founder is new to these terms
- Pricing tier builder: 3 editable packages (Basic / Professional / Premium), seeded with the $100–200/user/month competitor benchmark as a reference anchor

### 5. Legal & Compliance Checklist
- Ontario-specific checklist: trade name registration, NUANS search, CRA Business Number, HST registration threshold ($30,000 revenue trigger), business bank account, basic service agreement template, contractor agreement checklist for the Pakistan-based team
- Each item should be a checkbox with a short explanation of why it matters and a note when something requires a real lawyer/accountant rather than DIY

### 6. Brand & Website Planner
- Site map builder matching the 3-pillar structure: Home / Managed IT Services / IT Consulting / Cloud Solutions / Industries We Serve / About / Contact — with "IT Staffing & Outsourced Support" nested under Managed IT Services, never as its own top-level nav item, and never labeled "BPO" anywhere client-facing
- Homepage copy workspace: fields for headline, subheadline, problem statement, solution statement, CTA — pre-filled with a draft pitch for the "IT staffing & outsourcing support" niche offer as the current homepage focus

### 7. Tech Stack Tracker
- Simple table: Tool / Purpose / Cost / Priority / Status (not yet set up / set up) — seeded with website builder, business email, free CRM tier, free invoicing (e.g. Wave), LinkedIn — keep this list deliberately short and cheap given the budget constraint; flag any tool over $30/month for founder review before adding

### 8. Operations / SOPs
- A simple document library area where the founder can create and store SOPs (lead capture → qualification → sales → onboarding → delivery → support → retention) as editable text blocks, starting empty with just section headers to fill in as the business operates

### 9. Sales System
- Pipeline/CRM view: contact name, company, channel, date contacted, status (Contacted → Replied → Call Booked → Proposal Sent → Closed / No Response), notes — this is the highest-use module given the founder's time constraints, so make data entry as fast as possible (inline editing, no modal dialogs)
- Script library: editable text blocks for cold email template, LinkedIn outreach message, discovery call script, objection-handling notes — start with a draft pitch for the IT staffing/outsourcing niche offer

### 10. Marketing
- Simple 90-day content/outreach calendar (not a full marketing suite — this founder has no marketing budget or time for paid channels right now). Focus fields: week number, planned outreach volume, planned content/post (if any), notes

### 11. First Customer Plan
- Day-by-day checklist for the first 7 days, then week-by-week for weeks 2–4, pulling from the 30/60/90 plan already defined above

### 12. Hiring & Team Structure
- A simple planner: current role (founder, solo), next hire trigger (e.g. "after first signed client"), first Pakistan-based hire role description (helpdesk/support technician — skills, expected pay range, when to hire), with an explicit note that IT Consulting and technical helpdesk delivery require different skillsets and should not be treated as interchangeable roles

### 13. KPI Dashboard
- Financial: revenue, expenses, cash remaining vs. $2,000 cap
- Sales: contacts made, reply rate (auto-calculated), calls booked, proposals sent, conversion rate
- Customer: clients closed, retention (once applicable)
- Show only the metrics relevant at this stage (pre-revenue) prominently; hide/gray out metrics that don't apply yet (e.g. churn, MRR) until there's at least one client

### 14. Risk Register
- Table: Risk / Probability / Impact / Prevention / Backup Plan — seed with: trust deficit vs. established competitors, spreading effort across too many service pillars too early, offshore delivery quality risk on the first client engagement

### 15. Funding Notes
- A simple text module noting that bootstrapping is the current and recommended path given the budget and goals — no funding-round planning needed at this stage, but leave a placeholder section for later if the business scales

### 16. 12-Month Roadmap + 30/60/90
- Visual timeline view, pre-populated with the 30/60/90 plan above, extendable to months 4–12 with placeholder objectives the founder fills in as they go

### 17. Master Task List
- Kanban-style board: Not Started / In Progress / Waiting / Completed / Blocked, with priority tags (Critical/High/Medium/Low), seeded with the Phase 1 (Days 1–30) checklist items as the initial task set

### 18. Weekly Planner
- A generator that, given current task list state, surfaces a realistic weekly plan capped at what's achievable in under 10 hours — never more than 5–6 concrete action items per week

### 19. Decision Log
- A simple running log where the founder can record a decision, the reasoning, alternatives considered, and the outcome — useful for the founder to track their own reasoning over time

### 20. Document Templates
- A small library of starter templates: sales proposal outline, discovery call agenda, client onboarding checklist, simple service agreement outline (with a clear disclaimer that legal documents need a real lawyer's review before use)

---

## DESIGN REQUIREMENTS

- Dark, functional "command center" aesthetic — not a marketing site. Prioritize information density and fast scanning over decoration.
- Fully responsive — the founder has limited hours and will likely check this on mobile between other tasks
- No unnecessary animation or visual flourish; every element should earn its place
- Fast data entry everywhere — inline editing over modals, minimal clicks to update a status or check off a task
- Every currency figure should be clearly labeled CAD

## TECHNICAL REQUIREMENTS

- Given the near-zero budget, prioritize a stack with free or near-free hosting: a React or Next.js frontend with local persistence (IndexedDB/localStorage) is acceptable for a single-user tool, or a lightweight backend with SQLite if you want data to survive browser resets more robustly
- No paid third-party services required to run the app
- Should run locally during development and be deployable to a free tier host (e.g. Vercel, Netlify, or Cloudflare Pages) with minimal configuration
- Include a basic README explaining how to run it locally and how to deploy it

## BUILD APPROACH

1. Scaffold the project structure and confirm the module list and data model with me before writing UI code
2. Build the Dashboard, Sales Pipeline, and Master Task List modules first — these are the highest-value modules given the 90-day goal is landing a client through outreach
3. Then build Finance, Business Analysis, and the remaining planning modules
4. Seed every module with the real business data above — do not use "Lorem ipsum" or generic sample data anywhere
5. After the core build, do a pass checking: does every number/date entry field work correctly, does data persist on reload, is anything overflowing or broken on a narrow mobile viewport
6. Stop and summarize what's built after each major module group, rather than building everything silently in one pass

---

## IMPORTANT PRINCIPLES TO CARRY THROUGH THE WHOLE APP

- Never let the UI present more than a handful of "next actions" at once — the founder explicitly does not want to feel overwhelmed
- Never label the Pakistan-based delivery/staffing capability as "BPO" or "call center" anywhere in the UI copy — it's "IT staffing" or "outsourced support capacity," internal-facing only
- Be honest in any auto-generated scoring or projections — do not inflate opportunity scores or revenue forecasts to seem encouraging; this founder explicitly wants realistic numbers, not motivational ones
- Keep the tone of all in-app copy plain and direct, written for someone new to business terminology — briefly explain any business term (CAC, MRR, etc.) the first time it appears in a module
