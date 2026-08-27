/**
 * Trader Media SOP — canonical seed content.
 *
 * Transcribed from "Media Related steps (1).docx" at the repo root (Yuvika's
 * Zoom notes + full transcript, combined into one walkthrough of the weekly
 * media revenue reporting process). This module is the *seed*, not the live
 * content: prisma/seed-trader-media.ts writes it into the database, where it
 * becomes editable in the app. Re-running the seed matches on `key` and never
 * overwrites an edit or duplicates a row — see that file's own doc comment.
 *
 * Transcription rules applied (mirrors lib/traffic-billing/sop-template.ts's
 * own rules, adjusted for this SOP's shape):
 *
 * - Each "Step N — ..." heading in the doc becomes one step. The doc's own
 *   "PHASE 2 — Update the 3 Source Tabs" contains three such headings (Step
 *   2/3/4, one per source tab); each becomes its own step with a `groupLabel`
 *   rather than being flattened into one giant step, since PIO / Salesforce /
 *   Programmatic are genuinely independent weekly actions.
 * - The prose under each step (What is X? / Source / Update process /
 *   Critical check) is reference material, not itself a checkable action —
 *   it becomes that step's `notes` and renders indented and untickable, same
 *   convention as Traffic Billing.
 * - `highRisk` marks the steps the doc itself flags as a "do not / critical /
 *   always" line — overwriting PIO's formulas, Salesforce rows silently
 *   dropping, BERT needing a full replace, the control-date-minus-one rule,
 *   and the Estimate tab's stale-date bug Yuvika actually caught.
 * - `isOwnerPending` marks phases 7–13, which the doc's own "Your Role RIGHT
 *   NOW" section explicitly excludes from the user's current job (Yuvika's
 *   FP&A judgment, the 12:15 call, the Benoit review, locking the forecast,
 *   and deck production). Phases 1–6 cover exactly the doc's own 10-item
 *   "Your Role RIGHT NOW" recap.
 * - The "Access / Things You Need" section is deliberately NOT here — it's a
 *   one-time setup checklist, not a weekly step, and lives in
 *   lib/trader-media/setup-items.ts instead.
 */

export type SopStepSeed = {
  /** Unique within its phase; combined with the phase key to form the row key. */
  key: string;
  text: string;
  groupLabel?: string;
  notes?: string[];
  highRisk?: boolean;
};

export type SopPhaseSeed = {
  key: string;
  title: string;
  intro?: string;
  /** True for phases 7–13 — Yuvika's, not yet the user's job. See module doc. */
  isOwnerPending?: boolean;
  steps: SopStepSeed[];
};
/**
 * Note there is no `number` here on purpose, same reasoning as Traffic
 * Billing: the displayed phase number is derived from position in
 * SOP_PHASES when seeding, so inserting a phase later doesn't mean
 * renumbering every object below it by hand.
 */

export const SOP_PHASES: SopPhaseSeed[] = [
  {
    key: "p01",
    title: "Monday Morning: Prepare the Excel Working File",
    intro:
      "Go to National Sales SLT ShareDrive → Revenue Estimate → 2026. Important: this is a heavy/confidential FP&A file — do not share it with the AEs.",
    steps: [
      {
        key: "s01",
        text: "Locate this week's version of the master Excel file (e.g. \"17th V1\") and keep last week's file open alongside it",
        notes: [
          "Yuvika creates/uses a new weekly version of this file each Monday.",
          "Keeping the previous week's file open lets you compare the two versions side by side and catch anything unusual before you even start updating tabs.",
        ],
      },
    ],
  },
  {
    key: "p02",
    title: "Update the 3 Source Tabs",
    intro:
      "There are only 3 raw-data reports to update every week — everything else largely flows from these: PIO Data, Salesforce/Pipeline, and Programmatic Data.",
    steps: [
      {
        key: "s02",
        groupLabel: "Update PIO Data",
        text: "Update the PIO Data tab from the latest Placements export",
        highRisk: true,
        notes: [
          "What is PIO? Campaigns that are already booked — GM signs a campaign, AdOps reserves impressions/ad units, it gets booked, and it appears in PIO. High-confidence revenue: \"We know this money is coming in.\"",
          "Source: the third-party Placements dashboard — manually pulled, unlike the other two reports.",
          "Raw exported data runs approximately through Column Z; columns after that are formulas.",
          "The file maintains two comparison weeks — shift them forward: remove the oldest week, the previous current week becomes the previous week.",
          "Download the new Placements report, paste the raw data through approximately Column Z, and enter the appropriate dates in the manual date columns.",
          "Copy/drag formulas for the new rows where necessary.",
          "Do not overwrite the formula columns.",
        ],
      },
      {
        key: "s03",
        groupLabel: "Update Salesforce / Pipeline",
        text: "Update the Salesforce / Pipeline tab from the latest Salesforce report",
        highRisk: true,
        notes: [
          "What is this data? Revenue that is not booked yet — opportunities AEs believe may happen, with an opportunity/campaign name, expected amount, probability, start/end dates.",
          "Source: normally a Salesforce report. Yuvika lost Salesforce access after migration — Sharma has access and has been manually exporting it, and set up an automated Monday email report. Get yourself added to that forwarding.",
          "The raw report begins around Column CE; everything to the left is largely formulas/calculations.",
          "Delete the old raw report data from that section, then paste the entire latest Salesforce report in.",
          "Critical check: check the bottom of the dataset and make sure formulas extend far enough to cover every new row. If the new report has more rows than the old one and formulas aren't dragged down to match, those new opportunities silently never flow through to the rest of the workbook.",
        ],
      },
      {
        key: "s04",
        groupLabel: "Update Programmatic Data",
        text: "Update the Programmatic Data tab from the latest BERT YTD report",
        highRisk: true,
        notes: [
          "What is this data? Open Exchange, PMP/Private Marketplace, and other programmatic transaction activity. BERT captures actual revenue; the workbook projects the rest of the month from the run rate (e.g. ~$100 over 7 days → $100 ÷ 7 × 30 as an approximate monthly projection).",
          "Source: BERT, a third-party reporting/dashboard system, usually received daily. Contact Todd Graham to be added directly to the BERT distribution list rather than relying permanently on Yuvika forwarding it.",
          "Important difference from PIO: the BERT export is YTD (e.g. January → August 23), not just new incremental rows for the week — every week you replace the entire existing raw dataset with the latest complete YTD report.",
          "Delete the old raw programmatic dataset, paste the complete latest YTD report — raw data runs approximately through Column L.",
          "Drag formulas down to cover any newly added rows and make sure downstream pivots refresh.",
        ],
      },
    ],
  },
  {
    key: "p03",
    title: "Update the Control Date",
    intro:
      "Once all 3 source tabs have been updated, go to the input/control section of the workbook.",
    steps: [
      {
        key: "s05",
        text: "Set the input date to file-preparation-date minus one day",
        highRisk: true,
        notes: [
          "Example: if the file is being updated Monday, August 24, the input date = August 23.",
          "This is because the reports generally contain data through the prior night's close — never enter the same-day date.",
        ],
      },
    ],
  },
  {
    key: "p04",
    title: "Refresh Everything",
    steps: [
      {
        key: "s06",
        text: "Go to Data → Refresh All",
        notes: [
          "This refreshes pivots, formulas/connections, charts, summary views, estimate tables, PIO comparisons, programmatic calculations, and other downstream outputs.",
          "Refresh All does not mean the file is automatically correct — you still need to validate it in the sense checks below.",
        ],
      },
    ],
  },
  {
    key: "p05",
    title: "Perform the Sense Checks",
    intro: "This is one of the most important parts of your role.",
    steps: [
      {
        key: "s07",
        text: "Check PIO Delta shows the correct two comparison weeks",
        notes: [
          "Example for August 24: previous = August 17, current = August 24. The older August 10 period should have disappeared.",
          "If you still see the old pair (e.g. 10th / 17th), something has not updated correctly.",
        ],
      },
      {
        key: "s08",
        text: "Review the week-over-week PIO movements",
        notes: [
          "You're not necessarily expected to explain everything initially — you're looking for unexpected movements, no change where you expected one, strange declines, missing bookings, or clearly incorrect values.",
          "Keep the previous week's workbook open beside the new one for comparison.",
        ],
      },
      {
        key: "s09",
        text: "Check the Programmatic/OA view (revenue so far, average daily revenue, days remaining, projected month-end)",
        notes: [
          "With N days remaining, the workbook uses the run rate to estimate them.",
          "Programmatic revenue can show seasonality (may increase later in the month) — Yuvika prefers being conservative rather than overestimating.",
        ],
      },
      {
        key: "s10",
        text: "Check the Estimate tab — confirm the Booked section is pulling from the latest PIO date",
        highRisk: true,
        notes: [
          "The Estimate tab breaks into Booked (from PIO), Pipeline (from Salesforce), and Weighted/Estimate (calculated from both).",
          "Real example: Yuvika refreshed the workbook but the Estimate tab was still referencing the 10th instead of the 17th. She caught it because ~$16K had changed in PIO yet the estimate didn't move.",
          "Do not rely blindly on Refresh All — explicitly verify: Estimate tab → booked source date = newest PIO date.",
        ],
      },
      {
        key: "s11",
        text: "Scan for obvious errors before handing off",
        notes: [
          "Negative values that don't make sense, blank calculations, missing formulas, numbers unchanged despite new activity, wrong reporting date, wrong PIO comparison weeks, charts or pivots not refreshing, formula ranges ending before the new raw data, large unexplained movements.",
          "This is the same sense check Sharma previously performed before telling Yuvika the file was ready.",
        ],
      },
    ],
  },
  {
    key: "p06",
    title: "Hand File to Yuvika",
    steps: [
      {
        key: "s12",
        text: "Tell Yuvika the workbook is ready",
        notes: [
          "Something like: \"The three source tabs are updated, Refresh All is complete, and the basic checks look good.\"",
          "Your immediate ownership of the process ends roughly here — Yuvika takes over from this point.",
        ],
      },
    ],
  },
  {
    key: "p07",
    title: "Yuvika's FP&A Analysis",
    isOwnerPending: true,
    intro:
      "Not yet your responsibility — Yuvika intends to keep doing this herself while you learn the process.",
    steps: [
      {
        key: "s13",
        text: "Yuvika reviews and adjusts the estimate",
        notes: [
          "Booked revenue, pipeline, weighted pipeline, month/quarter estimate, budget comparison, YoY comparison, AE assumptions.",
          "She may manually adjust numbers — e.g. an AE's $100K opportunity at an overly optimistic probability gets reduced, or an opportunity not yet in Salesforce but known to management gets manually incorporated.",
        ],
      },
    ],
  },
  {
    key: "p08",
    title: "Monday 12:15 PM Sales/Pipeline Call",
    isOwnerPending: true,
    intro:
      "Not yet your responsibility to run — attend to learn, per the Access checklist's recurring-invite item.",
    steps: [
      {
        key: "s14",
        text: "Attend Amar's team call, where Yuvika asks the sales team about changes",
        notes: [
          "Examples: \"Ford declined by $X — what changed?\", \"GM increased by $XXK — is there a new campaign?\", \"Did the probability change?\", \"Did an opportunity move between months?\"",
          "There's a separate AE-friendly working file for this — the master FP&A workbook is confidential and the AEs never see it directly.",
        ],
      },
    ],
  },
  {
    key: "p09",
    title: "Monday Benoit Review",
    isOwnerPending: true,
    intro:
      "Not yet your responsibility — start attending to gradually understand the analysis side, per Yuvika.",
    steps: [
      {
        key: "s15",
        text: "Attend Benoit's review, usually ~1:30–2:00 PM Monday (time can move)",
        notes: [
          "Yuvika leads this meeting. Participants can include Yuvika, Benoit, Amar, Bimal, and others as required.",
        ],
      },
      {
        key: "s16",
        text: "Review the monthly and quarterly estimates against budget and YoY",
        notes: [
          "Example from the recording — Monthly: estimate $1.67M vs budget $1.735M. Quarterly: estimate $5.1M vs budget $5.4M.",
        ],
      },
      {
        key: "s17",
        text: "Agree on the final forecast",
        notes: [
          "Yuvika explains changes, Benoit challenges assumptions, Amar provides sales context, Bimal contributes where needed, adjustments may be requested.",
          "The group agrees on the number they're comfortable reporting; Yuvika makes the requested forecast changes.",
        ],
      },
    ],
  },
  {
    key: "p10",
    title: "Lock the Excel Forecast",
    isOwnerPending: true,
    steps: [
      {
        key: "s18",
        text: "Yuvika confirms no more forecast changes are coming",
        notes: [
          "Sharma previously would check with Yuvika: \"Are you finished making changes?\" Once confirmed final, the deck-production work starts.",
          "This eventually becomes part of your responsibility.",
        ],
      },
    ],
  },
  {
    key: "p11",
    title: "Prepare the Excel Output Tabs for the Deck",
    isOwnerPending: true,
    intro:
      "Approximately 5–6 tabs need to be prepared after the forecast is finalized. Polygraph Quarter and VCharts together provide roughly 70% of the executive deck content.",
    steps: [
      {
        key: "s19",
        text: "Update the presentation-support tabs after the forecast is finalized",
      },
      {
        key: "s20",
        text: "Check the Polygraph Quarter tab",
        notes: [
          "Needs more manual attention: check formulas, check charts, make sure current periods are showing, make sure charts aren't \"wonky\", prepare visuals for copy/paste.",
          "Yuvika said she'd train this separately.",
        ],
      },
      {
        key: "s21",
        text: "Check the VCharts tab",
        notes: ["Refresh/check outputs, verify charts, prepare for copy/paste."],
      },
      {
        key: "s22",
        text: "Check the Top 10 tab",
        notes: [
          "Requires very little work — it automatically refreshes. You mainly validate it looks correct, copy it, and paste it into the executive deck.",
        ],
      },
    ],
  },
  {
    key: "p12",
    title: "Update the Executive Deck",
    isOwnerPending: true,
    intro:
      "The deck goes out Tuesday. Yuvika's recommended split: Monday, get the Excel workbook completely stable/final; Tuesday morning, do most of the deck copy/paste — avoids rushing both in the last two hours on Monday.",
    steps: [
      {
        key: "s23",
        text: "Start updating the deck Tuesday morning once the workbook is stable",
      },
      {
        key: "s24",
        text: "Update approximately slides 1–16, mostly sourced from Excel",
        notes: [
          "Main sources: Summary tab, Summary/\"Journey\" tab, Polygraph Quarter, VCharts, Top 10, pacing-related outputs, and other workbook views.",
          "Yuvika is supposed to add source links/names to the PowerPoint speaker notes so you know where each slide comes from.",
        ],
      },
      {
        key: "s25",
        text: "Know which slides/tabs don't need substantial weekly work",
        notes: [
          "Some pacing slides, certain pipeline slides, and other lower-priority slides may stay unchanged unless something material happens.",
        ],
      },
      {
        key: "s26",
        text: "Copy in slides 17–21 from the separate weekly Sales Tech / sales deck",
        notes: [
          "The AdOps/sales teams update this deck themselves, generally by Monday afternoon or evening. You don't recreate these slides — open their deck, copy, paste into the executive deck.",
        ],
      },
      {
        key: "s27",
        text: "Source and copy the slides after 21",
        notes: [
          "Examples: Matrix (owned by Yuvika, updated monthly), Davis-related content, other Sales/AdOps slides copied from other existing decks.",
          "Mostly sourcing and copying here, not rebuilding the analysis.",
        ],
      },
    ],
  },
  {
    key: "p13",
    title: "Final Tuesday Deck",
    isOwnerPending: true,
    steps: [
      {
        key: "s28",
        text: "Check the complete executive deck before distribution",
        notes: [
          "Correct reporting week, correct month/quarter, numbers match the final Excel, charts aren't broken, no stale prior-week numbers, copy/pasted slides are updated, Top 10 is current, Sales Tech slides are current.",
        ],
      },
      {
        key: "s29",
        text: "Executive deck goes out Tuesday",
        notes: [
          "Audience can include Benoit, Aaron, Chris, Andrew, CFO/global CFO stakeholders, AutoScout stakeholders, and other executives.",
          "Purpose: show how Media is trending toward month-end and quarter-end targets. Note: formal reporting cadence moved to monthly around May, but this weekly view continues internally for senior stakeholders.",
        ],
      },
    ],
  },
];

export const SOP_MISTAKES: { text: string; phase: string | null }[] = [
  {
    text: "Never share this file with the AEs — it's a heavy/confidential FP&A workbook.",
    phase: "p01",
  },
  {
    text: "Don't overwrite PIO's formula columns when pasting in the new raw export.",
    phase: "p02",
  },
  {
    text: "If the new Salesforce report has more rows than the old one and formulas aren't dragged down to cover them, those new opportunities silently never flow through the workbook.",
    phase: "p02",
  },
  {
    text: "BERT's export is YTD, not incremental — always replace the entire raw dataset, never just append new rows.",
    phase: "p02",
  },
  {
    text: "The control date is always file-preparation-date minus one day, never the same day — reports contain data through the prior night's close.",
    phase: "p03",
  },
  {
    text: "Refresh All is not a correctness guarantee. Always verify PIO Delta shows the correct two comparison weeks and that the Estimate tab's booked section is pulling from the newest PIO date, not a stale one.",
    phase: "p05",
  },
  {
    text: "Keep the previous week's workbook open side by side — most bad data reads as an unexpected or missing movement you'd otherwise miss.",
    phase: null,
  },
];
