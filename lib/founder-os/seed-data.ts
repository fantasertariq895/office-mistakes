/**
 * Seed content for Founder OS Phase 2/3, transcribed from
 * claude-code-prompt-founder-os.md. Real business context throughout — no
 * "Lorem ipsum" — per that doc's own explicit instruction. Where the doc
 * gives a range rather than a number (costs), the midpoint is seeded, since
 * every number here is editable in the app anyway. Where the doc explicitly
 * wants the founder's own honest judgment rather than a fabricated number
 * (the Opportunity Scorecard), every score seeds at a neutral 5 — inventing
 * scores here would directly violate "do not inflate opportunity scores...
 * this founder explicitly wants realistic numbers, not motivational ones."
 */

export type TextBlockSeed = { key: string; section: string; label: string; content?: string };

export const TEXT_BLOCKS: TextBlockSeed[] = [
  // Business Model Canvas
  {
    key: "bmc-value-proposition",
    section: "bmc",
    label: "Value Proposition",
    content:
      "Fast, personal managed IT support for small businesses (1-10 employees) that established MSPs ignore — reliable help without enterprise pricing or a 150-user minimum.",
  },
  {
    key: "bmc-customer-segments",
    section: "bmc",
    label: "Customer Segments",
    content:
      "Small businesses (1-10 employees) in Mississauga/GTA — starting with one vertical (accounting, medical/dental, law, or retail) rather than spreading across all.",
  },
  {
    key: "bmc-revenue-streams",
    section: "bmc",
    label: "Revenue Streams",
    content:
      "Monthly recurring managed IT contracts (per-user or flat-rate), plus ad-hoc IT consulting and cloud solutions projects.",
  },
  {
    key: "bmc-pricing",
    section: "bmc",
    label: "Pricing",
    content:
      "Anchored against the $100–200/user/month competitor benchmark — see the Pricing Tiers in Finance for the actual packages.",
  },
  {
    key: "bmc-cost-structure",
    section: "bmc",
    label: "Cost Structure",
    content:
      "Near-zero fixed costs at launch (~$2,000 CAD one-time): trade name registration, domain, basic branding, website builder and business email subscriptions. Delivery cost scales with the Pakistan-based team once there are paying clients.",
  },
  {
    key: "bmc-channels",
    section: "bmc",
    label: "Channels",
    content:
      "Direct outreach (LinkedIn + cold email, 10–20 contacts/week), a lean 4-page website, and word of mouth once the first client is live.",
  },
  {
    key: "bmc-customer-relationships",
    section: "bmc",
    label: "Customer Relationships",
    content:
      "Personal, high-touch — fast response time is the wedge against incumbents' \"years of experience\" positioning, not price.",
  },
  {
    key: "bmc-key-activities",
    section: "bmc",
    label: "Key Activities",
    content:
      "Outreach and discovery calls, IT support delivery (helpdesk/monitoring/backup), and managing the Pakistan-based delivery team.",
  },
  {
    key: "bmc-key-resources",
    section: "bmc",
    label: "Key Resources",
    content:
      "The existing Ontario corporation, the founder's own time (under 10 hrs/week), and the Pakistan-based delivery team once hired.",
  },
  {
    key: "bmc-key-partners",
    section: "bmc",
    label: "Key Partners",
    content:
      "The Pakistan-based delivery team/contractors — the model mirrors Pathway Communications' Canadian-front + offshore-delivery structure.",
  },

  // Ideal Customer Profile
  {
    key: "icp-industry",
    section: "icp",
    label: "Industry",
    content:
      "To be decided: accounting firms, medical/dental offices, law firms, or retail — pick one vertical to start, don't spread across all.",
  },
  {
    key: "icp-company-size",
    section: "icp",
    label: "Company Size",
    content: "1–10 employees — the underserved tier established competitors (10–150 users) ignore.",
  },
  { key: "icp-pain-points", section: "icp", label: "Pain Points" },
  { key: "icp-budget", section: "icp", label: "Budget" },
  { key: "icp-decision-maker", section: "icp", label: "Decision Maker" },
  { key: "icp-objections", section: "icp", label: "Objections" },
  { key: "icp-where-online", section: "icp", label: "Where They Spend Time Online" },

  // Brand & Website
  {
    key: "brand-headline",
    section: "brand",
    label: "Headline",
    content: "IT support built for businesses too small for the big guys.",
  },
  {
    key: "brand-subheadline",
    section: "brand",
    label: "Subheadline",
    content: "Fast, personal managed IT and outsourced support for Mississauga & GTA businesses with 1–10 employees.",
  },
  {
    key: "brand-problem",
    section: "brand",
    label: "Problem Statement",
    content:
      "Small businesses are stuck choosing between doing IT themselves or paying enterprise MSP rates built for 150-user companies.",
  },
  {
    key: "brand-solution",
    section: "brand",
    label: "Solution Statement",
    content:
      "Right-sized IT staffing and support, delivered fast and personally, at a price that makes sense for a 5-person office.",
  },
  { key: "brand-cta", section: "brand", label: "Call to Action", content: "Book a free 15-minute IT check-in." },
  {
    key: "brand-sitemap-home",
    section: "brand",
    label: "Site Map — Home",
    content: "Landing page: headline, subheadline, 3 pillars, CTA.",
  },
  {
    key: "brand-sitemap-services",
    section: "brand",
    label: "Site Map — Services",
    content:
      "Managed IT Services / IT Consulting / Cloud Solutions. \"IT Staffing & Outsourced Support\" is nested under Managed IT Services — never its own top-level nav item, never labeled \"BPO\" anywhere client-facing.",
  },
  {
    key: "brand-sitemap-industries",
    section: "brand",
    label: "Site Map — Industries We Serve",
    content: "Whichever vertical is chosen as the initial focus (see the ICP above).",
  },
  {
    key: "brand-sitemap-about",
    section: "brand",
    label: "Site Map — About",
    content: "Founder story, why the 1–10 employee tier, Mississauga/GTA focus.",
  },
  {
    key: "brand-sitemap-contact",
    section: "brand",
    label: "Site Map — Contact",
    content: "Contact form + the CTA above.",
  },

  // Hiring & Team
  {
    key: "hiring-current-role",
    section: "hiring",
    label: "Current Role",
    content: "Founder, solo — no other roles yet.",
  },
  {
    key: "hiring-next-hire-trigger",
    section: "hiring",
    label: "Next Hire Trigger",
    content: "After the first signed client.",
  },
  {
    key: "hiring-first-hire",
    section: "hiring",
    label: "First Pakistan-Based Hire",
    content:
      "Helpdesk/support technician — skills, expected pay range and exact timing still to be defined. IT Consulting and technical helpdesk delivery require different skillsets and should not be treated as interchangeable roles.",
  },

  // Funding
  {
    key: "funding-notes",
    section: "funding",
    label: "Funding Approach",
    content:
      "Bootstrapping is the current and recommended path given the $2,000 CAD budget and 90-day goal — no funding-round planning needed at this stage. Revisit this section if/when the business scales past what bootstrapping can support.",
  },

  // 12-Month Roadmap
  {
    key: "roadmap-month-1",
    section: "roadmap",
    label: "Month 1",
    content: "Foundation: register trade name, buy domain, build the 4-page site, start outreach (10–15 contacts/week).",
  },
  {
    key: "roadmap-month-2",
    section: "roadmap",
    label: "Month 2",
    content: "Outreach Ramp: sustain 15–20 contacts/week, refine the pitch from real replies, book discovery calls.",
  },
  {
    key: "roadmap-month-3",
    section: "roadmap",
    label: "Month 3",
    content: "Close: run discovery calls, send proposals for a small pilot, close the first client, prepare Pakistan-side delivery logistics.",
  },
  { key: "roadmap-month-4", section: "roadmap", label: "Month 4" },
  { key: "roadmap-month-5", section: "roadmap", label: "Month 5" },
  { key: "roadmap-month-6", section: "roadmap", label: "Month 6" },
  { key: "roadmap-month-7", section: "roadmap", label: "Month 7" },
  { key: "roadmap-month-8", section: "roadmap", label: "Month 8" },
  { key: "roadmap-month-9", section: "roadmap", label: "Month 9" },
  { key: "roadmap-month-10", section: "roadmap", label: "Month 10" },
  { key: "roadmap-month-11", section: "roadmap", label: "Month 11" },
  { key: "roadmap-month-12", section: "roadmap", label: "Month 12" },
];

export const SCORES: { key: string; label: string }[] = [
  { key: "market_demand", label: "Market Demand" },
  { key: "customer_pain", label: "Customer Pain" },
  { key: "competition", label: "Competition (favorability)" },
  { key: "profit_potential", label: "Profit Potential" },
  { key: "startup_cost", label: "Startup Cost (favorability, i.e. how low)" },
  { key: "difficulty", label: "Difficulty (favorability, i.e. how easy)" },
  { key: "scalability", label: "Scalability" },
  { key: "recurring_revenue_potential", label: "Recurring Revenue Potential" },
  { key: "customer_acquisition_difficulty", label: "Customer Acquisition Difficulty (favorability, i.e. how easy)" },
];

export const COMPETITORS: Omit<import("@/lib/types").FoCompetitor, "id" | "isCustom" | "sortOrder">[] = [
  {
    name: "CG Technologies",
    service: null,
    price: "$100–200/user/month",
    targetCustomer: "10–150 user companies",
    strengths: "Est. 1996, 100+ SMB clients, 95% client retention. Industries: law/accounting/healthcare/manufacturing/logistics/retail/construction.",
    weaknesses: null,
    positioning: null,
    opportunity: "Doesn't serve the 1–10 employee tier.",
  },
  {
    name: "Pathway Communications",
    service: null,
    price: null,
    targetCustomer: null,
    strengths: "Markham HQ + Pune, India delivery office — proof this offshore-delivery model is normal and credible in this market.",
    weaknesses: null,
    positioning: null,
    opportunity: "The structural blueprint for this business, not a direct competitor for the 1–10 employee tier.",
  },
  {
    name: "IT Force",
    service: null,
    price: null,
    targetCustomer: null,
    strengths: "26 years, 50+ clients. Differentiates on speed (2-min call answer, 10-min email reply), flexible/no-commitment contracts.",
    weaknesses: null,
    positioning: null,
    opportunity: "Speed is their wedge too — worth watching how they position it.",
  },
  {
    name: "XBASE Technologies",
    service: null,
    price: null,
    targetCustomer: null,
    strengths: "31 years, flat-rate \"unlimited\" support model, strong accordion-style service breakdown (Service Desk, 24/7 Monitoring, Backup Management, Reporting).",
    weaknesses: null,
    positioning: null,
    opportunity: null,
  },
  {
    name: "Clutch.co / Cloudtango listings",
    service: null,
    price: null,
    targetCustomer: null,
    strengths: "20+ established MSPs in Toronto/Mississauga, most 18–30 years in business.",
    weaknesses: null,
    positioning: null,
    opportunity: "Market is credible but crowded — win on niche + speed, not tenure.",
  },
];

export const COST_ITEMS: { name: string; type: "one_time" | "recurring"; amountCad: number }[] = [
  { name: "Trade name registration (Ontario Business Registry)", type: "one_time", amountCad: 60 },
  { name: "NUANS name search", type: "one_time", amountCad: 20 },
  { name: "Domain name (1yr)", type: "one_time", amountCad: 18 },
  { name: "Logo/basic branding", type: "one_time", amountCad: 25 },
  { name: "Website builder subscription", type: "recurring", amountCad: 27 },
  { name: "Business email (Google Workspace)", type: "recurring", amountCad: 9 },
];

export const PRICING_TIERS: { name: string; description: string }[] = [
  { name: "Basic", description: "Reference anchor: competitors price $100–200/user/month for the 10–150 user tier." },
  { name: "Professional", description: "" },
  { name: "Premium", description: "" },
];

export const TECH_STACK: { tool: string; purpose: string; costCad: number; priority: string }[] = [
  { tool: "Website builder", purpose: "Lean 4-page site (Home/Services/About/Contact)", costCad: 27, priority: "high" },
  { tool: "Business email (Google Workspace)", purpose: "Professional email for outreach", costCad: 9, priority: "critical" },
  { tool: "Free CRM tier", purpose: "Backup to the Sales Pipeline tab", costCad: 0, priority: "medium" },
  { tool: "Free invoicing (Wave)", purpose: "Invoice the first client", costCad: 0, priority: "low" },
  { tool: "LinkedIn", purpose: "Outreach + company presence", costCad: 0, priority: "high" },
];

export const RISK_ITEMS: {
  risk: string;
  probability: string;
  impact: string;
  prevention: string;
  backupPlan: string;
}[] = [
  {
    risk: "Trust deficit vs. established competitors",
    probability: "high",
    impact: "high",
    prevention: "Lean on speed/personal-service positioning and the Pathway Communications precedent rather than competing on tenure.",
    backupPlan: "Offer a small pilot engagement or a free initial IT check-in to build trust before asking for a full contract.",
  },
  {
    risk: "Spreading effort across too many service pillars too early",
    probability: "medium",
    impact: "medium",
    prevention: "Focus the 90-day plan and outreach on the IT staffing/outsourcing support angle only, not the full managed-IT stack.",
    backupPlan: "Pause outreach for weaker pillars until Managed IT Services / IT Consulting / Cloud Solutions gets committed founder time.",
  },
  {
    risk: "Offshore delivery quality risk on the first client engagement",
    probability: "medium",
    impact: "high",
    prevention: "Vet the Pakistan-based team thoroughly and start with a small pilot scope before a full contract.",
    backupPlan: "Have the founder personally review or shadow delivery on the first engagement.",
  },
];

export const MARKETING_WEEKS: { weekNumber: number; plannedOutreach: number | null; notes: string | null }[] = [
  { weekNumber: 1, plannedOutreach: 10, notes: "Foundation: register trade name, buy domain, build site, start outreach." },
  { weekNumber: 2, plannedOutreach: 10, notes: null },
  { weekNumber: 3, plannedOutreach: 10, notes: null },
  { weekNumber: 4, plannedOutreach: 10, notes: null },
  { weekNumber: 5, plannedOutreach: 15, notes: "Outreach Ramp: refine pitch from real replies, book discovery calls." },
  { weekNumber: 6, plannedOutreach: 15, notes: null },
  { weekNumber: 7, plannedOutreach: 15, notes: null },
  { weekNumber: 8, plannedOutreach: 15, notes: null },
  { weekNumber: 9, plannedOutreach: null, notes: "Close: discovery calls, proposals, close first client." },
  { weekNumber: 10, plannedOutreach: null, notes: null },
  { weekNumber: 11, plannedOutreach: null, notes: null },
  { weekNumber: 12, plannedOutreach: null, notes: null },
  { weekNumber: 13, plannedOutreach: null, notes: null },
];

export type ChecklistSeed = {
  key: string;
  title: string;
  items: { text: string; explanation?: string; dayLabel?: string }[];
};

export const CHECKLISTS: ChecklistSeed[] = [
  {
    key: "legal",
    title: "Legal & Compliance Checklist",
    items: [
      {
        text: "Register your trade name (DBA) with the Ontario Business Registry",
        explanation: "This is what lets you operate publicly under a name other than your corporation's legal name. ~$60.",
      },
      {
        text: "Run a NUANS name search before registering",
        explanation: "Confirms your trade name isn't already taken or too similar to an existing one. ~$15–26.",
      },
      {
        text: "Confirm your CRA Business Number is active",
        explanation: "Your existing Ontario corporation should already have one — confirm it before invoicing anyone.",
      },
      {
        text: "Register for HST once you're near $30,000 in revenue",
        explanation: "The CRA requires HST registration once revenue crosses $30,000/year — not before. Don't register early unless you want to.",
      },
      {
        text: "Open a separate business bank account",
        explanation: "Keeps the $2,000 startup budget and any client revenue cleanly separated from personal finances.",
      },
      {
        text: "Draft a basic service agreement template",
        explanation: "Needs a real lawyer's review before you send it to a client — this is a starting draft, not a finished legal document.",
      },
      {
        text: "Draft a contractor agreement for the Pakistan-based team",
        explanation: "Covers scope, confidentiality and payment terms for offshore delivery staff — also needs a lawyer's review before use.",
      },
    ],
  },
  {
    key: "first-customer",
    title: "First Customer Plan",
    items: [
      { text: "Register the trade name and run the NUANS search", dayLabel: "Day 1" },
      { text: "Buy the domain name", dayLabel: "Day 2" },
      { text: "Start the lean 4-page website (Home/Services/About/Contact)", dayLabel: "Day 3" },
      { text: "Set up the LinkedIn company presence", dayLabel: "Day 4" },
      { text: "Draft the outreach pitch", dayLabel: "Day 5" },
      { text: "Finish the website's first draft", dayLabel: "Day 6" },
      { text: "Start outreach — first 10–15 contacts", dayLabel: "Day 7" },
      { text: "Sustain outreach, refine the pitch from real replies", dayLabel: "Week 2" },
      { text: "Book the first discovery calls", dayLabel: "Week 3" },
      { text: "Review Foundation-phase progress before moving into the Outreach Ramp", dayLabel: "Week 4" },
    ],
  },
];

export type DocumentSeed = { key: string; section: "sop" | "template"; title: string; content?: string };

export const DOCUMENTS: DocumentSeed[] = [
  // SOPs — start empty, just section headers to fill in as the business operates
  { key: "sop-lead-capture", section: "sop", title: "Lead Capture" },
  { key: "sop-qualification", section: "sop", title: "Qualification" },
  { key: "sop-sales", section: "sop", title: "Sales" },
  { key: "sop-onboarding", section: "sop", title: "Onboarding" },
  { key: "sop-delivery", section: "sop", title: "Delivery" },
  { key: "sop-support", section: "sop", title: "Support" },
  { key: "sop-retention", section: "sop", title: "Retention" },

  // Document Templates — starter content, all explicitly non-legal-advice where relevant
  {
    key: "template-sales-proposal",
    section: "template",
    title: "Sales Proposal Outline",
    content:
      "1. Client's situation & goals\n2. Proposed scope (Managed IT / IT Consulting / Cloud Solutions)\n3. What's included month-to-month\n4. Pricing (see Pricing Tiers)\n5. Timeline to start\n6. Next steps / how to accept",
  },
  {
    key: "template-discovery-call",
    section: "template",
    title: "Discovery Call Agenda",
    content:
      "1. Intro (2 min)\n2. Their current IT setup & pain points (10 min)\n3. Team size, tools in use, budget signals (5 min)\n4. Explain the offer, right-sized for their size (5 min)\n5. Next steps: proposal or a second call (3 min)",
  },
  {
    key: "template-onboarding-checklist",
    section: "template",
    title: "Client Onboarding Checklist",
    content:
      "- Signed service agreement on file\n- Access/credentials collected securely\n- Delivery team briefed on scope\n- First check-in call scheduled\n- Invoicing set up in Wave (or chosen tool)",
  },
  {
    key: "template-service-agreement",
    section: "template",
    title: "Simple Service Agreement Outline",
    content:
      "DISCLAIMER: this is a starting outline only — have a real lawyer review before sending to a client.\n\n1. Parties & effective date\n2. Scope of services\n3. Term & renewal\n4. Pricing & payment terms\n5. Confidentiality\n6. Termination\n7. Liability limitations",
  },
];
