/**
 * Seed content for the Founder OS master 90-day Plan checklist — one
 * continuous phase-by-phase, step-by-step walkthrough from Day 1 to Day 90,
 * built from claude-code-prompt-founder-os.md's own 30/60/90 plan (Days
 * 1-30 Foundation / 31-60 Outreach Ramp / 61-90 Close), expanded to weekly
 * granularity (13 phases, one per week, matching the Marketing Calendar's
 * own week numbering) and folding in the Legal checklist's real
 * requirements and tooling/access needs at the point in the journey they
 * actually come up, rather than leaving them scattered across separate
 * tabs. This is the SOP counterpart to the Legal Checklist / First Customer
 * Plan (lib/founder-os/seed-data.ts's CHECKLISTS) — those stay as their own
 * standalone checklists too (some people want the flat reference view);
 * this is the sequenced, week-by-week walkthrough version.
 */

export type PlanStepSeed = {
  key: string;
  text: string;
  groupLabel?: string;
  notes?: string[];
  highRisk?: boolean;
};

export type PlanPhaseSeed = {
  key: string;
  title: string;
  dayRange: string;
  intro?: string;
  steps: PlanStepSeed[];
};

export const PLAN_PHASES: PlanPhaseSeed[] = [
  {
    key: "w01",
    title: "Legal & Setup",
    dayRange: "Days 1–7",
    intro: "Foundation phase, week 1. Get the legal and financial basics in place before spending on anything else.",
    steps: [
      {
        key: "s01",
        text: "Register your trade name (DBA) with the Ontario Business Registry",
        notes: ["This is what lets you operate publicly under a name other than your corporation's legal name. ~$60."],
      },
      {
        key: "s02",
        text: "Run a NUANS name search before registering",
        notes: ["Confirms your trade name isn't already taken or too similar to an existing one. ~$15–26."],
      },
      {
        key: "s03",
        text: "Confirm your CRA Business Number is active",
        notes: ["Your existing Ontario corporation should already have one — confirm it before invoicing anyone."],
      },
      { key: "s04", text: "Open a separate business bank account" },
      { key: "s05", text: "Buy the domain name" },
      { key: "s06", text: "Set up business email (Google Workspace)" },
    ],
  },
  {
    key: "w02",
    title: "Website & Brand",
    dayRange: "Days 8–14",
    steps: [
      {
        key: "s07",
        text: "Build the lean 4-page website (Home / Services / About / Contact)",
        notes: ["\"IT Staffing & Outsourced Support\" nests under Managed IT Services — never its own top-level nav item, never labeled \"BPO\"."],
        highRisk: true,
      },
      { key: "s08", text: "Draft the homepage copy — headline, subheadline, problem, solution, CTA", notes: ["See the Brand & Website tab — this is already pre-filled with a draft, refine it here."] },
      { key: "s09", text: "Basic logo / branding" },
      { key: "s10", text: "Set up the LinkedIn company presence" },
    ],
  },
  {
    key: "w03",
    title: "Positioning & Pitch",
    dayRange: "Days 15–21",
    steps: [
      { key: "s11", text: "Finalize the ICP / initial target vertical", notes: ["Accounting, medical/dental, law, or retail — pick one to start. See the Strategy tab's ICP fields."] },
      { key: "s12", text: "Draft the cold email and LinkedIn outreach templates" },
      { key: "s13", text: "Draft the discovery call script" },
      { key: "s14", text: "Set up the free CRM/invoicing tools (Wave) and confirm LinkedIn is ready", notes: ["See the Tech Stack Tracker in Brand & Website — flag anything over $30/month before adding it."] },
    ],
  },
  {
    key: "w04",
    title: "Start Outreach",
    dayRange: "Days 22–30",
    intro: "Last week of Foundation — the first real outreach push.",
    steps: [
      { key: "s15", text: "Start outreach — 10–15 contacts this week", notes: ["Log every contact in the Sales Pipeline tab as you go."] },
      { key: "s16", text: "Track every contact in the Sales Pipeline" },
      { key: "s17", text: "Review Foundation-phase progress before moving into the Outreach Ramp" },
    ],
  },
  {
    key: "w05",
    title: "Scale Up",
    dayRange: "Days 31–37",
    intro: "Outreach Ramp begins — sustain a higher weekly volume and start learning from real replies.",
    steps: [
      { key: "s18", text: "Increase outreach to 15–20 contacts this week" },
      { key: "s19", text: "Refine the pitch based on real replies so far" },
    ],
  },
  {
    key: "w06",
    title: "Outreach Ramp",
    dayRange: "Days 38–44",
    steps: [
      { key: "s20", text: "Sustain 15–20 contacts this week" },
      { key: "s21", text: "Follow up on stale contacts (3+ days with no reply)", notes: ["The Dashboard's \"Do This Now\" surfaces these automatically."] },
    ],
  },
  {
    key: "w07",
    title: "Outreach Ramp",
    dayRange: "Days 45–51",
    steps: [
      { key: "s22", text: "Sustain 15–20 contacts this week" },
      { key: "s23", text: "Book the first discovery calls" },
    ],
  },
  {
    key: "w08",
    title: "Outreach Ramp: Review",
    dayRange: "Days 52–60",
    intro: "Last week of the Outreach Ramp.",
    steps: [
      { key: "s24", text: "Sustain outreach this week" },
      { key: "s25", text: "Review Outreach Ramp progress before moving into Close" },
    ],
  },
  {
    key: "w09",
    title: "Discovery Calls",
    dayRange: "Days 61–67",
    intro: "Close phase begins.",
    steps: [
      { key: "s26", text: "Run discovery calls with booked contacts", notes: ["Use the Discovery Call Agenda template in Operations."] },
      { key: "s27", text: "Log call outcomes and next steps in the Decision Log" },
    ],
  },
  {
    key: "w10",
    title: "Proposals",
    dayRange: "Days 68–74",
    steps: [
      { key: "s28", text: "Send proposals for a small pilot engagement", notes: ["Use the Sales Proposal Outline template in Operations."] },
      {
        key: "s29",
        text: "Draft the contractor agreement for the Pakistan-based team",
        notes: ["Covers scope, confidentiality and payment terms — needs a real lawyer's review before use."],
        highRisk: true,
      },
    ],
  },
  {
    key: "w11",
    title: "Negotiate",
    dayRange: "Days 75–81",
    steps: [
      { key: "s30", text: "Follow up on outstanding proposals" },
      { key: "s31", text: "Address objections", notes: ["Trust deficit vs. established competitors is the top risk here — lean on speed/personal service, or offer a small pilot/free check-in."] },
    ],
  },
  {
    key: "w12",
    title: "Sign the First Client",
    dayRange: "Days 82–88",
    steps: [
      {
        key: "s32",
        text: "Close the first client",
        notes: ["This is the 90-day goal."],
        highRisk: true,
      },
      {
        key: "s33",
        text: "Register for HST once you're near $30,000 in revenue",
        notes: ["The CRA requires HST registration once revenue crosses $30,000/year — not before. Don't register early unless you want to."],
      },
    ],
  },
  {
    key: "w13",
    title: "Delivery Prep",
    dayRange: "Days 89–90",
    intro: "Prepare Pakistan-side delivery logistics for the first client.",
    steps: [
      { key: "s34", text: "Brief the Pakistan-based delivery team on the client's scope" },
      { key: "s35", text: "Kick off onboarding", notes: ["Use the Client Onboarding Checklist template in Operations."] },
      { key: "s36", text: "Set a reminder to revisit the First Customer Plan and 12-Month Roadmap for months 4–12" },
    ],
  },
];

export const PLAN_MISTAKES: { text: string; phase: string | null }[] = [
  {
    text: "Never label the Pakistan-based delivery/staffing capability as \"BPO\" or \"call center\" anywhere client-facing — it's \"IT staffing\" or \"outsourced support capacity,\" internal-facing only.",
    phase: null,
  },
  {
    text: "Be honest in the Opportunity Scorecard and any revenue projections — don't inflate numbers to feel encouraging.",
    phase: null,
  },
  {
    text: "Don't spread effort across Managed IT / IT Consulting / Cloud Solutions too early — focus outreach on the IT staffing/outsourcing niche offer until the first client is signed.",
    phase: "w04",
  },
  {
    text: "\"IT Staffing & Outsourced Support\" must stay nested under Managed IT Services in the site nav — never its own top-level item.",
    phase: "w02",
  },
  {
    text: "Don't register for HST before revenue actually crosses $30,000/year.",
    phase: "w12",
  },
  {
    text: "Service agreements and contractor agreements are drafts, not finished legal documents — a real lawyer needs to review both before they're used.",
    phase: "w10",
  },
];
