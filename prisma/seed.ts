/**
 * Seed data for the Office Operations Dashboard.
 *
 * Idempotent: every record is matched on its natural key (commission name,
 * checklist text, contact name, approval description) and skipped if it already
 * exists. Safe to re-run; it will never duplicate rows or overwrite edits made
 * in the app.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedChecklistItem = {
  text: string;
  category?: string;
  isHighRisk?: boolean;
};

type SeedCommission = {
  name: string;
  color: string;
  description: string;
  contacts: { name: string; role?: string }[];
  approvals: string[];
  checklist: SeedChecklistItem[];
};

/**
 * Universal ALWAYS rules — ChecklistItem rows with commissionId = null.
 * These power the Mistake Prevention page and are surfaced on top of every
 * commission's checklist, because they apply everywhere.
 */
const UNIVERSAL_CHECKLIST: SeedChecklistItem[] = [
  {
    text: "Have I CC'd the rep's performance consultant and manager? (applies to every email to reps)",
    category: "Email",
  },
  {
    text: "Has this been approved by BOTH the manager and the jury before sending?",
    category: "Approvals",
  },
  {
    text: "Does this email need Ian McDonald CC'd? (e.g. payout delays, mass sends)",
    category: "Escalation",
    isHighRisk: true,
  },
];

const COMMISSIONS: SeedCommission[] = [
  {
    name: "ActiveX Sales",
    color: "#2563EB",
    description: "ActiveX sales commission processing.",
    contacts: [{ name: "Kathy", role: "CC on emails" }],
    approvals: [],
    checklist: [
      {
        text: "Have I checked Notion filters for duplicate rep names?",
        category: "Data check",
        isHighRisk: true,
      },
    ],
  },
  {
    name: "ActiveX PM",
    color: "#7C3AED",
    description: "ActiveX performance-management commission, billing and churn.",
    contacts: [
      { name: "Emmy", role: "CC on reps / approvals" },
      { name: "Mary Christine", role: "CC on reps / approvals" },
      { name: "Fred", role: "CC on reps / approvals" },
      { name: "Daniel", role: "Churn report" },
      { name: "Matthew Bank", role: "Churn report" },
    ],
    approvals: ["Emmy, Mary Christine and Fred must be CC'd on approvals."],
    checklist: [
      {
        text: "Is the billing cycle based on the software activation date?",
        category: "Billing",
      },
      {
        text: "Are churn penalties limited to Cubic reps only?",
        category: "Churn",
      },
      {
        text: "Have I double-checked Talent's billing file?",
        category: "Billing",
      },
      {
        text: "Have I verified the activation date against both the client name and the contract?",
        category: "Billing",
        isHighRisk: true,
      },
      {
        text: "Have I sent the churn report to Fred?",
        category: "Churn report",
      },
      {
        text: "Have I added the churn report to the current month's file (ask Umul for access if needed)?",
        category: "Churn report",
      },
      {
        text: "Have I contacted Daniel and Matthew Bank about the churn report?",
        category: "Churn report",
      },
    ],
  },
  {
    name: "Consumer Retention PM",
    color: "#0D9488",
    // Deliberately empty — PRD §10 open question 1.
    description:
      "Checklist, mistakes, contacts and approvals still to be filled in.",
    contacts: [],
    approvals: [],
    checklist: [],
  },
  {
    name: "Traffic",
    color: "#D97706",
    description: "Traffic commission — raw data entry, dedup, enrollment checks.",
    contacts: [
      {
        name: "Matt Cardi",
        role: "CC on reps / approvals, and on anything unresolved",
      },
    ],
    approvals: ["Matt Cardi must be CC'd on approvals."],
    checklist: [
      {
        text: "Did I enter raw data before calculating anything?",
        category: "Shared with X-Time",
        isHighRisk: true,
      },
      { text: "Have I checked for duplicates?", category: "Data check" },
      { text: "Have I summed matching items?", category: "Data check" },
      {
        text: "Have I re-checked for duplicates (same vs. different product)?",
        category: "Data check",
      },
      {
        text: "Have I checked for missing event numbers?",
        category: "Data check",
      },
      {
        text: "Have I checked for any other missing data or errors?",
        category: "Data check",
      },
      {
        text: "Have I sent anything unresolved to Matt Cardi?",
        category: "Escalation",
      },
      {
        text: "Have I checked the Honda enrollment program?",
        category: "Enrollment",
      },
      { text: "Have I checked OEM enrollment?", category: "Enrollment" },
    ],
  },
  {
    name: "X-Time",
    color: "#DB2777",
    description: "X-Time commission.",
    contacts: [],
    approvals: [],
    checklist: [
      {
        text: "Did I enter raw data before calculating anything?",
        category: "Shared with Traffic",
        isHighRisk: true,
      },
    ],
  },
  {
    name: "EasyDealer",
    color: "#059669",
    description: "EasyDealer commission.",
    contacts: [{ name: "Matt Cardi", role: "CC on reps / approvals" }],
    approvals: ["Matt Cardi must be CC'd on approvals."],
    checklist: [
      {
        text: "Have I excluded Dealer Track (DTK)?",
        category: "Data check",
        isHighRisk: true,
      },
    ],
  },
];

const NOTIFICATION_RULES: {
  type: string;
  channel: string;
  enabled: boolean;
}[] = [
  // In-app is the only channel implemented in Phase 1.
  { type: "task_due", channel: "in_app", enabled: true },
  { type: "task_overdue", channel: "in_app", enabled: true },
  { type: "daily_digest", channel: "in_app", enabled: false },
  // Phase 2 — email. Rows exist so Settings can render them disabled.
  { type: "task_due", channel: "email", enabled: false },
  { type: "task_overdue", channel: "email", enabled: false },
  { type: "daily_digest", channel: "email", enabled: false },
  // Phase 3 — WhatsApp.
  { type: "task_due", channel: "whatsapp", enabled: false },
  { type: "task_overdue", channel: "whatsapp", enabled: false },
  { type: "daily_digest", channel: "whatsapp", enabled: false },
];

async function seedChecklistItem(
  commissionId: number | null,
  item: SeedChecklistItem,
  sortOrder: number
) {
  const existing = await prisma.checklistItem.findFirst({
    where: { commissionId, text: item.text },
  });
  if (existing) return false;
  await prisma.checklistItem.create({
    data: {
      commissionId,
      text: item.text,
      category: item.category ?? null,
      isHighRisk: item.isHighRisk ?? false,
      isCustom: false,
      sortOrder,
    },
  });
  return true;
}

async function main() {
  let created = { commissions: 0, checklist: 0, contacts: 0, approvals: 0 };

  // ---- Settings singleton -------------------------------------------------
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, theme: "light", notificationChannels: '["in_app"]' },
  });

  // ---- Notification rules -------------------------------------------------
  for (const rule of NOTIFICATION_RULES) {
    await prisma.notificationRule.upsert({
      where: { type_channel: { type: rule.type, channel: rule.channel } },
      update: {},
      create: rule,
    });
  }

  // ---- Universal (Mistake Prevention) rules -------------------------------
  for (const [i, item] of UNIVERSAL_CHECKLIST.entries()) {
    if (await seedChecklistItem(null, item, i)) created.checklist++;
  }

  // ---- Commissions and their content --------------------------------------
  for (const [index, c] of COMMISSIONS.entries()) {
    const existing = await prisma.commission.findUnique({
      where: { name: c.name },
    });

    const commission =
      existing ??
      (await prisma.commission.create({
        data: {
          name: c.name,
          color: c.color,
          description: c.description,
          sortOrder: index,
        },
      }));
    if (!existing) created.commissions++;

    for (const [i, item] of c.checklist.entries()) {
      if (await seedChecklistItem(commission.id, item, i)) created.checklist++;
    }

    for (const contact of c.contacts) {
      const found = await prisma.contact.findFirst({
        where: { commissionId: commission.id, name: contact.name },
      });
      if (!found) {
        await prisma.contact.create({
          data: {
            commissionId: commission.id,
            name: contact.name,
            role: contact.role ?? null,
          },
        });
        created.contacts++;
      }
    }

    for (const description of c.approvals) {
      const found = await prisma.approvalRequirement.findFirst({
        where: { commissionId: commission.id, description },
      });
      if (!found) {
        await prisma.approvalRequirement.create({
          data: { commissionId: commission.id, description },
        });
        created.approvals++;
      }
    }
  }

  console.log("Seed complete.");
  console.log(
    `  commissions: +${created.commissions}  checklist items: +${created.checklist}  contacts: +${created.contacts}  approval rules: +${created.approvals}`
  );
  const totals = {
    commissions: await prisma.commission.count(),
    universalRules: await prisma.checklistItem.count({
      where: { commissionId: null },
    }),
    checklistItems: await prisma.checklistItem.count(),
    contacts: await prisma.contact.count(),
    approvals: await prisma.approvalRequirement.count(),
  };
  console.log("  totals:", totals);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
