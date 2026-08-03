/**
 * Traffic Billing SOP — canonical seed content.
 *
 * Transcribed from "Traffic Billing SOP.md" at the repo root, which stays the
 * human-readable source of truth. This module is the *seed*, not the live
 * content: `prisma/seed-traffic-billing.ts` writes it into the database, where
 * it becomes editable in the app. Re-running the seed matches on `key` and
 * never overwrites an edit or duplicates a row.
 *
 * Transcription rules applied (the .md's structure is irregular, so these
 * matter if you ever re-sync it):
 *
 * - A `☐` line becomes a step.
 * - A bullet list *under* a step is reference material, not work — it becomes
 *   that step's `notes` and renders indented and untickable. The one
 *   deliberate exception is Phase 1's file list, promoted to real steps:
 *   "confirm receipt of the following applicable files" is genuinely
 *   per-file trackable, and starting before every file has landed is the
 *   first entry in "Common Mistakes to Avoid".
 * - A bold sub-heading inside a section becomes `groupLabel` on the steps
 *   that follow it.
 * - Non-checkbox lead-in prose ("After all raw data has been entered:")
 *   becomes the phase `intro`, or a `groupLabel` when it introduces a subset.
 * - `highRisk` marks the steps the SOP itself calls out as blocking — the
 *   "do not continue until…", "never…", "always…" lines.
 *
 * The 30 "Common Mistakes to Avoid" are mapped to the phase each one belongs
 * to, so they surface in context during the run. The two that are procedural
 * rather than phase-specific are left global (`phase: null`).
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
  stageKey: string;
  title: string;
  intro?: string;
  steps: SopStepSeed[];
};
/**
 * Note there is no `number` here on purpose: the displayed phase number is
 * derived from position in SOP_PHASES when seeding. Inserting a phase in the
 * middle (which has already happened twice) otherwise means renumbering every
 * object below it by hand, and one missed edit puts the rail out of order.
 */

/**
 * 37 phases is too many for a flat list, so the rail groups them into stages
 * (see ./stages). Those boundaries follow the SOP's own workflow shifts:
 * intake -> load -> classify -> enrich -> pace -> roll up -> fee -> batch ->
 * send.
 */
export const SOP_PHASES: SopPhaseSeed[] = [
  /* ------------------------------------------- A. Intake & Validation ---- */
  {
    key: "p00",
    stageKey: "a",
    title: "Set Up the Month's Files",
    steps: [
      {
        key: "s01",
        text: "Make a copy of last month's Monthly Accrual Report to start this month's file.",
        notes: [
          "Working from a copy preserves the formulas, formatting, pivot tables and check areas.",
        ],
      },
      {
        key: "s02",
        text: "Make a copy of last month's Traffic Billing workbook.",
      },
      {
        key: "s03",
        text: "Update the month in every highlighted month cell.",
        highRisk: true,
      },
      {
        key: "s04",
        text: "Confirm the formulas are pulling the correct billing period before loading any data.",
        highRisk: true,
      },
    ],
  },
  {
    key: "p01",
    stageKey: "a",
    title: "Receive and Confirm Raw Data Files",
    steps: [
      { key: "s01", text: "Confirm that Justin has sent all required monthly raw data files." },
      {
        key: "s02",
        text: "Confirm receipt of every applicable raw data file (tick each one below).",
      },
      { key: "s03", groupLabel: "Files received", text: "Google" },
      { key: "s04", groupLabel: "Files received", text: "Bing" },
      { key: "s05", groupLabel: "Files received", text: "TikTok" },
      { key: "s06", groupLabel: "Files received", text: "Facebook Canada" },
      { key: "s07", groupLabel: "Files received", text: "Facebook US" },
      { key: "s08", groupLabel: "Files received", text: "Social Canada" },
      { key: "s09", groupLabel: "Files received", text: "Social US" },
      { key: "s10", groupLabel: "Files received", text: "Pacing Report" },
      {
        key: "s11",
        groupLabel: "Files received",
        text: "Any additional platform files required for the billing month",
      },
      {
        key: "s12",
        text: "Do not begin processing until all required files have been received.",
        highRisk: true,
      },
    ],
  },
  {
    key: "p02",
    stageKey: "a",
    title: "Validate Traffic Data in Every Raw Data File",
    intro: "Complete this check for every applicable raw data file.",
    steps: [
      { key: "s01", text: "Open the raw data file." },
      { key: "s02", text: "Locate the Traffic Name column." },
      { key: "s03", text: "Apply a filter to the Traffic Name column." },
      { key: "s04", text: "Search for the keyword TRFFK." },
      {
        key: "s05",
        text: "Apply the condition: Text Does Not Contain → TRFFK",
      },
      {
        key: "s06",
        text: "Review whether any records appear.",
        notes: [
          "If no records appear, confirm that the file contains only TRFFK Traffic data.",
          "If records appear, investigate the non-TRFFK records before continuing.",
        ],
      },
      { key: "s07", text: "Clear the previous filter." },
      { key: "s08", text: "Search for TRFFK again." },
      { key: "s09", text: "Filter the file so that only TRFFK records are displayed." },
      {
        key: "s10",
        text: "Confirm that only Traffic billing data is visible before copying the data.",
        highRisk: true,
      },
      {
        key: "s11",
        groupLabel: "TikTok file only",
        text: "Confirm the TikTok Cost column is stored as numbers and not as text.",
        notes: [
          "If the cost values arrive as text the totals read as zero, so the spend disappears silently rather than erroring.",
          "Convert the Cost column to numbers before continuing.",
        ],
        highRisk: true,
      },
    ],
  },

  /* --------------------------------- B. Accrual Load & Delta Review ------ */
  {
    key: "p03",
    stageKey: "b",
    title: "Copy Raw Data into the Monthly Accrual Report",
    steps: [
      { key: "s01", text: "Open the Monthly Accrual Report." },
      { key: "s02", text: "Process one raw data platform at a time." },
      { key: "s03", text: "Within each platform, process one campaign type at a time." },
      {
        key: "s04",
        groupLabel: "For each campaign type",
        text: "Filter the raw file to show only the required campaign type.",
      },
      {
        key: "s05",
        groupLabel: "For each campaign type",
        text: "Copy all applicable campaign records.",
      },
      {
        key: "s06",
        groupLabel: "For each campaign type",
        text: "Open the matching campaign tab in the Monthly Accrual Report.",
      },
      {
        key: "s07",
        groupLabel: "For each campaign type",
        text: "Paste the data into the correct tab.",
      },
      {
        key: "s08",
        groupLabel: "For each campaign type",
        text: "Confirm that all rows have been copied successfully.",
      },
      { key: "s09", groupLabel: "Applicable campaign types", text: "Search" },
      { key: "s10", groupLabel: "Applicable campaign types", text: "Performance Max" },
      { key: "s11", groupLabel: "Applicable campaign types", text: "Video" },
      { key: "s12", groupLabel: "Applicable campaign types", text: "Geofencing" },
      { key: "s13", groupLabel: "Applicable campaign types", text: "Reddit" },
      { key: "s14", groupLabel: "Applicable campaign types", text: "Shopping" },
      {
        key: "s15",
        groupLabel: "Applicable campaign types",
        text: "Other applicable campaign types",
      },
      // Keys are bound to their content for life — the seed matches on key, so
      // reusing s16 for different text would silently skip the new step and
      // leave the old one in place. New steps get new keys and are ordered by
      // their position in this array, not by key.
      {
        key: "s17",
        groupLabel: "Social Canada and Social US",
        text: "Line up the Social Canada and Social US column headers before pasting either file.",
        notes: [
          "The US layout can differ from the Canadian one, so pasting without aligning first puts values under the wrong headings.",
        ],
        highRisk: true,
      },
      {
        key: "s18",
        groupLabel: "Social Canada and Social US",
        text: "Confirm both Social files landed in the Social tab with their columns aligned.",
      },
      {
        key: "s16",
        groupLabel: "Performance Max Classification",
        text: "Always include Shopping campaign data under Performance Max.",
        highRisk: true,
      },
    ],
  },
  {
    key: "p04",
    stageKey: "b",
    title: "Review Delta Differences in the Monthly Accrual Report",
    intro: "After all raw data has been entered:",
    steps: [
      { key: "s01", text: "Review the Delta column in every applicable tab." },
      { key: "s02", text: "Identify all large or unusual differences." },
      { key: "s03", text: "Investigate every significant Delta before moving forward." },
      {
        key: "s04",
        text: "Confirm whether the difference is caused by any of the following.",
        notes: [
          "A missing account",
          "An incorrect source file",
          "A US account",
          "An account-name mismatch",
          "Incorrect spacing",
          "A missing campaign",
          "An incorrect formula reference",
        ],
      },
      {
        key: "s05",
        text: "Do not continue until every major difference has been explained or corrected.",
        highRisk: true,
      },
    ],
  },
  {
    key: "p05",
    stageKey: "b",
    title: "Validate Search Campaign Differences",
    steps: [
      { key: "s01", text: "Open the Search tab in the Monthly Accrual Report." },
      { key: "s02", text: "Review the Search Pivot Table." },
      { key: "s03", text: "Check the Account Name field for accounts containing US." },
      {
        key: "s04",
        groupLabel: "For every US account",
        text: "Click the affected Pivot Table cell.",
      },
      {
        key: "s05",
        groupLabel: "For every US account",
        text: "Review the formula in the Formula Bar.",
      },
      {
        key: "s06",
        groupLabel: "For every US account",
        text: "Confirm whether the formula is extracting information from the correct source.",
        notes: ["TRFFK Canada file", "TRFFK US file"],
      },
      {
        key: "s07",
        groupLabel: "For every US account",
        text: "Correct the formula or add the required US reference where necessary.",
      },
      { key: "s08", groupLabel: "For every US account", text: "Recalculate or refresh the data." },
      {
        key: "s09",
        groupLabel: "For every US account",
        text: "Confirm that the Delta has been corrected.",
      },
    ],
  },
  {
    key: "p06",
    stageKey: "b",
    title: "Validate Social Campaign Differences",
    steps: [
      { key: "s01", text: "Open the Social campaign tab." },
      { key: "s02", text: "Locate the Bills Toyota account." },
      { key: "s03", text: "Check the exact account-name formatting." },
      {
        key: "s04",
        text: "Look for extra, missing, or incorrect spaces in the account name.",
        highRisk: true,
      },
      { key: "s05", text: "Correct the spacing where required." },
      { key: "s06", text: "Recheck the Delta after correcting the account name." },
    ],
  },
  {
    key: "p07",
    stageKey: "b",
    title: "Validate Performance Max Differences",
    steps: [
      { key: "s01", text: "Open the Performance Max tab." },
      { key: "s02", text: "Review the Performance Max Pivot Table." },
      { key: "s03", text: "Check for US accounts." },
      { key: "s04", text: "Review formulas for US accounts." },
      {
        key: "s05",
        text: "Confirm that every formula references the correct TRFFK Canada or TRFFK US source.",
      },
      { key: "s06", text: "Correct any incorrect source references." },
      { key: "s07", text: "Refresh the calculations." },
      { key: "s08", text: "Confirm that the Delta differences have been corrected." },
      {
        key: "s09",
        text: "Confirm again that Shopping campaign data has been included under Performance Max.",
        highRisk: true,
      },
    ],
  },

  /* ------------------------------------------ C. OEM Classification ------ */
  {
    key: "p08",
    stageKey: "c",
    title: "Classify Nissan and Infiniti Campaigns",
    intro: "After filling the raw data and reviewing the initial differences:",
    steps: [
      { key: "s01", text: "Open the Pivot Tables in the Monthly Accrual Report." },
      { key: "s02", text: "Open the OEM Program section." },
      { key: "s03", text: "Go to Column G." },
      {
        key: "s04",
        text: "Filter for Nissan and Infiniti accounts.",
        notes: [
          "Nissan and Infiniti should only use the campaign classifications New and Used.",
        ],
      },
      {
        key: "s05",
        groupLabel: "Classification rules",
        text: "If the campaign says Parts and Service, classify it as Used.",
      },
      {
        key: "s06",
        groupLabel: "Classification rules",
        text: "If the campaign says Conquest, classify it as New.",
      },
      {
        key: "s07",
        groupLabel: "Classification rules",
        text: "If the campaign contains a vehicle model name, classify it as New.",
      },
      {
        key: "s08",
        groupLabel: "Classification rules",
        text: "If the campaign says Static, classify it as New.",
      },
      {
        key: "s09",
        groupLabel: "Classification rules",
        text: "If the campaign says Ongoing, classify it as New.",
      },
      {
        key: "s10",
        groupLabel: "Classification rules",
        text: "If the campaign says Test Drive, classify it as New.",
      },
      {
        key: "s11",
        groupLabel: "Classification rules",
        text: "If the campaign contains Rogue, classify it as New.",
      },
      {
        key: "s12",
        groupLabel: "Classification rules",
        text: "If the campaign contains Kicks, classify it as New.",
      },
      {
        key: "s13",
        text: "Review all Nissan and Infiniti records and confirm that every campaign is classified as either New or Used.",
        highRisk: true,
      },
    ],
  },
  {
    key: "p09",
    stageKey: "c",
    title: "Classify GM and Cadillac Campaigns",
    steps: [
      { key: "s01", text: "In the same OEM Program section, remain in Column G." },
      { key: "s02", text: "Clear the Nissan and Infiniti filter." },
      {
        key: "s03",
        text: "Filter for GM and Cadillac accounts.",
        notes: ["GM and Cadillac should use the classifications New, Used and CPO."],
      },
      {
        key: "s04",
        groupLabel: "Classification rules",
        text: "If the campaign says Acquisition, classify it as Used.",
      },
      {
        key: "s05",
        groupLabel: "Classification rules",
        text: "If the campaign contains 2026 or the applicable current/new model year, classify it as New.",
      },
      {
        key: "s06",
        groupLabel: "Classification rules",
        text: "If the campaign says Parts and Service, classify it as Used.",
      },
      {
        key: "s07",
        groupLabel: "Classification rules",
        text: "If the campaign says Static, classify it as New.",
      },
      {
        key: "s08",
        groupLabel: "Classification rules",
        text: "If the campaign already says New, classify it as New.",
      },
      {
        key: "s09",
        groupLabel: "Classification rules",
        text: "If the campaign says Service New, classify it as Used, because it is a servicing campaign.",
      },
      {
        key: "s10",
        groupLabel: "Classification rules",
        text: "If the campaign says Promo Event 2026, classify it as New.",
      },
      {
        key: "s11",
        text: "Review the remaining GM and Cadillac campaigns and classify them as New, Used, or CPO as required.",
      },
    ],
  },
  {
    key: "p10",
    stageKey: "c",
    title: "Complete OEM Program Validation",
    intro: "After completing the Nissan, Infiniti, GM, and Cadillac classifications:",
    steps: [
      { key: "s01", text: "Review all checks in the OEM Program tab." },
      {
        key: "s02",
        text: "Filter the validation columns to identify any red flags or red checks.",
      },
      { key: "s03", text: "Investigate every red validation result." },
      { key: "s04", text: "Confirm that the Activity Month is correct." },
      { key: "s05", text: "Confirm that the End Date is correct." },
      { key: "s06", text: "Review the date or month value in Cell AC1." },
      { key: "s07", text: "Confirm that Cell AC1 reflects the correct billing or activity month." },
      {
        key: "s08",
        text: "Resolve all significant OEM Program errors before proceeding.",
        highRisk: true,
      },
    ],
  },

  /* ------------------------------------- D. Salesforce Account Data ------ */
  {
    key: "p11",
    stageKey: "d",
    title: "Update the Account Data Sheet from Salesforce",
    steps: [
      { key: "s01", text: "Open the second sheet named Account Data." },
      { key: "s02", text: "Use the Salesforce report link available in the sheet." },
      { key: "s03", text: "Open the Salesforce report." },
      {
        key: "s04",
        text: "Export the report in both formats.",
        notes: ["CSV", "XLS"],
      },
      {
        key: "s05",
        groupLabel: "Copying the Salesforce Data",
        text: "Copy all applicable non-date data from the CSV export.",
      },
      {
        key: "s06",
        groupLabel: "Copying the Salesforce Data",
        text: "Do not copy the date values from the CSV export.",
        highRisk: true,
      },
      {
        key: "s07",
        groupLabel: "Copying the Salesforce Data",
        text: "Copy the date values from the XLS export.",
      },
      {
        key: "s08",
        groupLabel: "Copying the Salesforce Data",
        text: "Paste the data into the matching columns in the Account Data sheet.",
      },
      {
        key: "s09",
        groupLabel: "Copying the Salesforce Data",
        text: "Confirm that all columns align correctly.",
      },
      {
        key: "s10",
        groupLabel: "Copying the Salesforce Data",
        text: "Confirm that the date columns were populated using the XLS file.",
      },
    ],
  },
  {
    key: "p12",
    stageKey: "d",
    title: "Review Red Rows after Updating Account Data",
    steps: [
      {
        key: "s01",
        text: "After pasting the Salesforce Account Data, review the raw-data validations.",
      },
      { key: "s02", text: "Confirm that most red rows have disappeared." },
      { key: "s03", text: "Investigate any remaining red rows." },
      {
        key: "s04",
        text: "Determine whether the remaining red rows are caused only by penny-level differences.",
      },
      { key: "s05", text: "Ignore only the rows that are confirmed to be caused by pennies." },
      { key: "s06", text: "Do not ignore material red differences.", highRisk: true },
    ],
  },
  {
    key: "p13",
    stageKey: "d",
    title: "Update the Duped ID Data Sheet",
    steps: [
      { key: "s01", text: "Open the third sheet named Duped ID Data." },
      { key: "s02", text: "Open the separate Salesforce report used for duplicated ID data." },
      { key: "s03", text: "Export or download the Salesforce report." },
      {
        key: "s04",
        text: "Before copying, compare the Salesforce report columns with the Duped ID Data sheet.",
      },
      {
        key: "s05",
        text: "Confirm that the Field column in the report matches the corresponding column in the destination sheet.",
      },
      { key: "s06", text: "Locate the Case Notes column in the Salesforce report." },
      { key: "s07", text: "Confirm that the Case Notes column is not present in the destination sheet." },
      {
        key: "s08",
        text: "Remove or exclude the Case Notes column before copying the data.",
        highRisk: true,
      },
      {
        key: "s09",
        text: "Confirm that the remaining Salesforce columns align with the destination sheet.",
      },
      { key: "s10", text: "Copy and paste all applicable data into the Duped ID Data sheet." },
      { key: "s11", text: "Refresh the workbook after updating the data." },
      { key: "s12", text: "Review the reports for any remaining errors." },
    ],
  },
  {
    key: "p14",
    stageKey: "d",
    title: "Handle Penny-Level Salesforce ID Records",
    steps: [
      { key: "s01", text: "Filter the applicable penny-related report or validation area." },
      { key: "s02", text: "Identify the rows caused by penny-level differences." },
      {
        key: "s03",
        text: "Copy the Salesforce Account IDs for the confirmed penny records into a temporary separate file or area.",
      },
      { key: "s04", text: "Clear the penny filter." },
      {
        key: "s05",
        text: "Paste the copied Salesforce Account IDs into the designated green-bar exclusion area in the same penny report.",
      },
      {
        key: "s06",
        text: "Confirm that these approved penny records are no longer being picked up as exceptions.",
      },
    ],
  },

  /* --------------------------------------- E. Pacing & Overbudget -------- */
  {
    key: "p15",
    stageKey: "e",
    title: "Update the Pacing Report in Step 3.1",
    steps: [
      { key: "s01", text: "Open the Step 3.1 Pacing tab in the main Traffic Billing workbook." },
      { key: "s02", text: "Update the applicable date or month in the Step 3.1 date cell." },
      { key: "s03", text: "Confirm that the month is correct before loading new Pacing data." },
      {
        key: "s04",
        text: "Delete the previous month's data from the Step 3.1 Pacing tab.",
        highRisk: true,
      },
      { key: "s05", text: "Open the Pacing Report received from Justin." },
      { key: "s06", text: "Locate the TRFFK Status column." },
      {
        key: "s07",
        text: "Filter the TRFFK Status column for the required statuses.",
        notes: ["Partial", "Ongoing", "Paused", "Applicable flagged records"],
      },
      { key: "s08", text: "Copy all filtered Pacing Report data." },
      { key: "s09", text: "Paste the data into the Step 3.1 Pacing tab." },
      {
        key: "s10",
        text: "Confirm that Paused records have also been included where required.",
        highRisk: true,
      },
    ],
  },
  {
    key: "p16",
    stageKey: "e",
    title: "Add US Accounts to the Pacing Tab",
    steps: [
      { key: "s01", text: "In the Pacing Report, filter for US accounts." },
      { key: "s02", text: "Copy all applicable US account records." },
      { key: "s03", text: "Paste the US account records into the Step 3.1 Pacing tab." },
      {
        key: "s04",
        text: "Update or label the account/source value as TRFFK US where required.",
        highRisk: true,
      },
      { key: "s05", text: "Confirm that Canadian and US accounts can be identified separately." },
    ],
  },
  {
    key: "p17",
    stageKey: "e",
    title: "Refresh the Step 3 Overbudget Pivot",
    steps: [
      { key: "s01", text: "Refresh the Step 3 Pivot Overbudget section." },
      { key: "s02", text: "Review the formula in the right-side validation column." },
      { key: "s03", text: "Confirm that the formula has filled down for all new records." },
      { key: "s04", text: "Correct or extend the formula if it has not picked up every row." },
      { key: "s05", text: "Review the Overbudget Pivot results." },
    ],
  },
  {
    key: "p18",
    stageKey: "e",
    title: "Update the Step 3.2 Overbudget Table",
    steps: [
      { key: "s01", text: "Open the Step 3.2 Overbudget Table." },
      {
        key: "s02",
        text: "Delete the old data from the applicable input area, including the old data in Columns G to I where applicable.",
      },
      { key: "s03", text: "Return to the Step 3 Overbudget Pivot." },
      { key: "s04", text: "Filter the Pivot Table to show Overbudget accounts only." },
      {
        key: "s08",
        text: "Confirm the filter is catching every account above 105% of budget.",
        notes: [
          "An account at 105.01% is still over budget and must be included — do not round it down into range.",
        ],
        highRisk: true,
      },
      { key: "s05", text: "Copy the filtered Overbudget records." },
      { key: "s06", text: "Paste the records into the Step 3.2 Overbudget Table." },
      { key: "s07", text: "Confirm that only Overbudget accounts were copied." },
    ],
  },
  {
    key: "p19",
    stageKey: "e",
    title: "Prepare and Send the Overbudget File",
    steps: [
      { key: "s01", text: "Open the separate Overbudget file." },
      { key: "s02", text: "Copy the required data from the Step 3.2 Overbudget Table." },
      {
        key: "s03",
        text: "Copy the required range, including the applicable data from approximately Columns E to AE.",
      },
      { key: "s04", text: "Paste the data into the Overbudget file." },
      { key: "s05", text: "Update the sheet name to the current billing month." },
      { key: "s06", text: "Review the final file for missing accounts or columns." },
      {
        key: "s10",
        text: "Send only the separate Overbudget file — never the full billing workbook.",
        notes: [
          "The full workbook carries sensitive formula-driven data that Strategists should not receive.",
        ],
        highRisk: true,
      },
      {
        key: "s11",
        text: "Ask each Strategist for a billing decision and the reason behind it.",
        notes: [
          "Bill the overage in full",
          "Cap at 105%",
          "Cap at 100%",
          "The reason matters as much as the decision — it is the audit trail.",
        ],
      },
      { key: "s07", text: "Send the Overbudget file to all Strategists.", highRisk: true },
      { key: "s08", text: "Use the Strategist recipient list from the previous email." },
      { key: "s09", text: "Refer to Bimal's previous email to confirm the complete recipient list." },
    ],
  },
  {
    key: "p20",
    stageKey: "e",
    title: "Add Strategist Comments to the Overbudget Table",
    intro: "After receiving feedback from the Strategists:",
    steps: [
      { key: "s01", text: "Review every Strategist response." },
      { key: "s02", text: "Open the Step 3.2 Overbudget Table." },
      {
        key: "s06",
        text: "Look up each Strategist response by Salesforce Account ID.",
      },
      { key: "s03", text: "Add the Strategist comments or results into Column AJ." },
      { key: "s04", text: "Match each comment to the correct account." },
      {
        key: "s07",
        groupLabel: "Turn each comment into a decision",
        text: "Translate every Strategist comment into one of the three standard billing decisions in the manual decision column.",
        notes: [
          "Bill in full",
          "Cap at 105%",
          "Cap at 100%",
          "Leaving the response as free text means the formulas cannot calculate the approved amount.",
        ],
        highRisk: true,
      },
      {
        key: "s08",
        groupLabel: "Turn each comment into a decision",
        text: "Confirm the approved-to-invoice and not-approved-to-invoice amounts update after each decision is set.",
      },
      {
        key: "s05",
        text: "Confirm that all Overbudget accounts have an updated comment or status.",
      },
    ],
  },

  /* ---------------------------------------------- F. TRFFK Rollup -------- */
  {
    key: "p21",
    stageKey: "f",
    title: "Build the TRFFK Rollup",
    steps: [
      { key: "s01", groupLabel: "Non-OEM Data", text: "Open the Step 3 Pivot TRFFK section." },
      { key: "s02", groupLabel: "Non-OEM Data", text: "Filter the OEM Program value to 0." },
      {
        key: "s03",
        groupLabel: "Non-OEM Data",
        text: "Confirm that this filter selects Non-OEM program records.",
      },
      { key: "s04", groupLabel: "Non-OEM Data", text: "Copy all filtered Non-OEM data." },
      {
        key: "s05",
        groupLabel: "Non-OEM Data",
        text: "Paste the data into the Step 4 TRFFK Rollup sheet.",
      },
      { key: "s06", groupLabel: "OEM Data", text: "Open the Step 2.1 OEM Program Pivot." },
      {
        key: "s07",
        groupLabel: "OEM Data",
        text: "Filter the OEM Program field to include all applicable OEM records and exclude 0.",
      },
      { key: "s08", groupLabel: "OEM Data", text: "Copy all filtered OEM data." },
      {
        key: "s09",
        groupLabel: "OEM Data",
        text: "Paste the OEM data into the Step 4 TRFFK Rollup sheet.",
      },
      {
        key: "s10",
        groupLabel: "OEM Data",
        text: "Confirm that the TRFFK Rollup now contains both OEM and Non-OEM data.",
        notes: ["OEM data", "Non-OEM data"],
        highRisk: true,
      },
    ],
  },
  {
    key: "p22",
    stageKey: "f",
    title: "Add Overbudget Comments to the TRFFK Rollup",
    steps: [
      { key: "s01", text: "Filter the TRFFK Rollup to identify accounts that are Overbudget." },
      {
        key: "s02",
        text: "Use the Step 3.2 Overbudget Table to obtain the corresponding account IDs.",
      },
      { key: "s03", text: "Match the Overbudget accounts to the TRFFK Rollup." },
      { key: "s04", text: "Add the applicable Overbudget comments into Column P of the TRFFK Rollup." },
      {
        key: "s06",
        groupLabel: "Approved to bill in full",
        text: "Leave the amount unreduced.",
      },
      {
        key: "s07",
        groupLabel: "Approved to bill in full",
        text: "Add a note recording that the overage was reviewed and approved to bill in full.",
      },
      {
        key: "s08",
        groupLabel: "Capped accounts",
        text: "Identify the channel carrying the largest overage.",
      },
      {
        key: "s09",
        groupLabel: "Capped accounts",
        text: "Reduce that channel's line so the customer's total invoice lands exactly on the approved cap.",
        notes: [
          "Reduce the single largest-overage channel rather than spreading the reduction across channels.",
        ],
        highRisk: true,
      },
      {
        key: "s10",
        groupLabel: "Capped accounts",
        text: "Add a note explaining the cap applied and the reduction made.",
      },
      { key: "s05", text: "Confirm that each Overbudget account has the correct comment." },
    ],
  },

  /* ------------------------------------------- G. Management Fees -------- */
  {
    key: "p23",
    stageKey: "g",
    title: "Update the Management Fee Data",
    steps: [
      { key: "s01", text: "Open the TRFFK Management Fee Intake File." },
      { key: "s02", text: "Open the Special Terms information, where applicable." },
      { key: "s03", text: "Copy the required management-fee and special-term data." },
      { key: "s04", text: "Paste the data into Step 5.1 Management Fee Data." },
      { key: "s05", text: "Confirm that all required rows and columns have been copied." },
      { key: "s06", text: "Refresh the Pivot Table in Step 5A Management Fee Calculator." },
    ],
  },
  {
    key: "p24",
    stageKey: "g",
    title: "Filter OEM Data in the Management Fee Calculator",
    steps: [
      { key: "s01", text: "Open the Step 5A Management Fee Calculator." },
      { key: "s02", text: "Filter for OEM data." },
      { key: "s03", text: "Exclude OEM Program value 0." },
      { key: "s04", text: "Exclude FCA.", highRisk: true },
      { key: "s05", text: "Turn off or exclude penny-level records." },
      { key: "s06", text: "Confirm that only applicable OEM management-fee records remain." },
    ],
  },
  {
    key: "p25",
    stageKey: "g",
    title: "Resolve Management Fee Errors",
    steps: [
      { key: "s01", text: "Review the management-fee validation columns." },
      {
        key: "s02",
        text: "Check for zero values or missing fee values in the applicable validation column, including Column X where applicable.",
      },
      { key: "s03", text: "Investigate every zero or missing management fee." },
      {
        key: "s04",
        text: "Review the Management Fee Intake File for known causes.",
        notes: [
          "Missing fee information",
          "Incorrect account information",
          "Special-term issues",
          "Legacy fee arrangements",
        ],
      },
      { key: "s05", text: "Use the previous month's billing file as a reference where needed." },
      {
        key: "s06",
        text: "Resolve every material management-fee issue before continuing.",
        highRisk: true,
      },
    ],
  },
  {
    key: "p26",
    stageKey: "g",
    title: "Create the Step 5.2 Fee Dump Clean Data",
    intro: "After completing the management-fee adjustments:",
    steps: [
      { key: "s01", text: "Copy the applicable Pivot Table data from Column A through Column X." },
      { key: "s02", text: "Open Step 5.2 Fee Dump Clean." },
      { key: "s03", text: "Paste the copied Pivot Table data into the Step 5.2 sheet." },
      { key: "s04", text: "Locate the column named Total." },
      { key: "s05", text: "Locate the column named Type of Spend." },
      {
        key: "s06",
        text: "Remove all unwanted columns beginning with Total and continuing up to, but not including, Type of Spend.",
      },
      {
        key: "s07",
        text: "Confirm that the Type of Spend column remains in the final data.",
        highRisk: true,
      },
      { key: "s08", text: "Confirm that OEM Program value 0 was excluded." },
      { key: "s09", text: "Confirm that FCA was excluded." },
      { key: "s10", text: "Confirm that penny-level records were excluded." },
    ],
  },

  /* ------------------------------- H. Adjusted Data & Batch Prep --------- */
  {
    key: "p27",
    stageKey: "h",
    title: "Create the 6A Adjusted Other OEM Data",
    steps: [
      { key: "s01", text: "Return to the Step 4 TRFFK Rollup." },
      { key: "s02", text: "Filter for OEM records." },
      { key: "s03", text: "Exclude OEM Program value 0." },
      { key: "s04", text: "Exclude FCA." },
      { key: "s05", text: "Remove penny-level records." },
      { key: "s06", text: "Copy the complete applicable data through the Total column." },
      { key: "s07", text: "Open Step 6A Adjusted Other OEM." },
      { key: "s08", text: "Paste the TRFFK Rollup OEM data into the Step 6A sheet." },
      { key: "s09", text: "Copy the clean management-fee data from Step 5.2 Fee Dump Clean." },
      {
        key: "s10",
        text: "Paste the Step 5.2 data below the previously pasted OEM data in Step 6A.",
      },
      {
        key: "s11",
        text: "Confirm that no FCA records are present in Step 6A Adjusted Other OEM.",
        highRisk: true,
      },
    ],
  },
  {
    key: "p28",
    stageKey: "h",
    title: "Complete the 6A Validation Checks",
    steps: [
      { key: "s01", text: "Review every validation/check column in Step 6A Adjusted Other OEM." },
      { key: "s02", text: "Filter the validation columns for False results." },
      { key: "s03", text: "Pay particular attention to False results highlighted in red." },
      { key: "s04", text: "Select and review all False checks." },
      { key: "s05", text: "Investigate each red False result." },
      {
        key: "s06",
        text: "Correct the source data, formula, management fee, or classification causing the False result.",
      },
      { key: "s07", text: "Refresh or recalculate the checks after making corrections." },
      {
        key: "s08",
        text: "Confirm that all material validation checks return True before continuing.",
        highRisk: true,
      },
    ],
  },
  {
    key: "p29",
    stageKey: "h",
    title: "Prepare Individual OEM Batch Data",
    steps: [
      { key: "s01", text: "Remain in Step 6A Adjusted Other OEM." },
      { key: "s02", text: "Filter one OEM batch at a time." },
      {
        key: "s03",
        groupLabel: "Example",
        text: "Filter the applicable batch indicator for Mitsubishi.",
      },
      { key: "s04", groupLabel: "Example", text: "Copy all Mitsubishi records." },
      {
        key: "s05",
        groupLabel: "Example",
        text: "Paste them into the Mitsubishi individual batch tab or file.",
      },
      { key: "s06", text: "Repeat the same process for every applicable OEM batch." },
      { key: "s07", text: "Process the new batches last.", highRisk: true },
    ],
  },
  {
    key: "p30",
    stageKey: "h",
    title: "Validate OEM Management Fees before Finalizing Batches",
    intro: "Before finalizing each OEM batch:",
    steps: [
      { key: "s01", text: "Review how much management fee was charged previously." },
      { key: "s02", text: "Refer to the previous fee information sent by Ryan." },
      { key: "s03", text: "Use Bimal's email as the source for the previous fee reference." },
      { key: "s04", text: "Compare the current management fee with the previous month." },
      { key: "s05", text: "Investigate any unexpected fee change.", highRisk: true },
    ],
  },
  {
    key: "p31",
    stageKey: "h",
    title: "Validate O'Regan Cadillac",
    steps: [
      { key: "s01", text: "Locate O'Regan Cadillac in the Management Fee Data tab." },
      { key: "s02", text: "Confirm that the GM/CAD indicator is marked correctly." },
      { key: "s03", text: "Confirm that the required indicator contains X, where applicable." },
      { key: "s04", text: "Review the OEM Legacy Dealers tab in the Management Fee Intake File." },
      { key: "s05", text: "Confirm the correct AutoSync fee rate." },
      { key: "s06", text: "Check whether the Salesforce Account ID has changed." },
      { key: "s07", text: "Compare the Account ID against the applicable activity or historical tab." },
      {
        key: "s08",
        text: "Always verify the updated Account ID for O'Regan Cadillac.",
        highRisk: true,
      },
      {
        key: "s09",
        groupLabel: "If the fee or ID is not correct",
        text: "Manually update the management fee in the final column of Step 5.1 Management Fee Data according to the AutoSync fee.",
      },
      {
        key: "s10",
        groupLabel: "If the fee or ID is not correct",
        text: "Manually update the applicable account total in Step 6A.",
      },
      {
        key: "s11",
        groupLabel: "If the fee or ID is not correct",
        text: "Confirm that the validation checks now pass.",
      },
    ],
  },
  {
    key: "p32",
    stageKey: "h",
    title: "Review Other-Month Fee Differences",
    steps: [
      {
        key: "s01",
        text: "Compare the current fee with the fee communicated in Bimal's or Ryan's email.",
      },
      {
        key: "s02",
        text: "Check whether the current-month fee is different from the approved/reference fee.",
      },
      { key: "s03", text: "Update the fee in Step 6A where required." },
      { key: "s04", text: "Document any manual adjustment." },
    ],
  },
  {
    key: "pfca",
    stageKey: "h",
    title: "Create the Adjusted FCA Billing Data",
    intro:
      "FCA is excluded from the Step 6A Adjusted Other OEM and Step 6D Adjusted Non-OEM filters because it is billed on its own path — not because it is not billed.",
    steps: [
      { key: "s01", text: "Return to the Step 4 TRFFK Rollup." },
      { key: "s02", text: "Filter for FCA records." },
      { key: "s03", text: "Copy the filtered FCA data." },
      { key: "s04", text: "Open the Adjusted FCA Billing tab." },
      { key: "s05", text: "Paste the FCA data into the Adjusted FCA Billing tab." },
      {
        key: "s06",
        text: "Confirm the FCA management fee is calculated on ad spend plus the Google fee.",
        notes: [
          "FCA is the exception — every other group calculates the management fee on ad spend alone.",
        ],
        highRisk: true,
      },
      {
        key: "s07",
        text: "Review the FCA validation checks and resolve every False result.",
      },
      {
        key: "s08",
        text: "Prepare the FCA batch separately from the OEM and Non-OEM batches.",
        highRisk: true,
      },
    ],
  },
  {
    key: "p33",
    stageKey: "h",
    title: "Create the 6D Adjusted Non-OEM Data",
    steps: [
      { key: "s01", text: "Return to the Step 4 TRFFK Rollup." },
      { key: "s02", text: "Filter the OEM Program value to 0." },
      { key: "s03", text: "Confirm that only Non-OEM records are selected." },
      { key: "s04", text: "Copy all filtered Non-OEM data." },
      { key: "s05", text: "Open Step 6D Adjusted Non-OEM." },
      { key: "s06", text: "Paste the Non-OEM TRFFK Rollup data into the Step 6D sheet." },
      { key: "s07", text: "Open Step 5A Management Fee Calculator." },
      { key: "s08", text: "Filter for OEM Program value 0." },
      { key: "s09", text: "Exclude penny-level records." },
      { key: "s10", text: "Copy the applicable Non-OEM management-fee data." },
      { key: "s11", text: "Paste the management-fee data below the TRFFK data in Step 6D." },
    ],
  },
  {
    key: "p34",
    stageKey: "h",
    title: "Prepare Individual Non-OEM Batch Data",
    steps: [
      {
        key: "s01",
        text: "Use the Step 6D Adjusted Non-OEM data to prepare the individual Non-OEM batch tabs.",
      },
      { key: "s02", text: "Copy one Non-OEM batch at a time." },
      { key: "s03", text: "Paste each batch into its appropriate individual tab or file." },
      {
        key: "s04",
        groupLabel: "Kia Non-OEM",
        text: "Use the purple Pivot Table tab named Kia (Non-OEM) to identify and copy the Kia batch data.",
      },
      {
        key: "s05",
        groupLabel: "Kia Non-OEM",
        text: "Copy the applicable Kia management-fee adjustment from the Adjusted Non-OEM data.",
      },
      {
        key: "s06",
        groupLabel: "Kia Non-OEM",
        text: "Paste the Kia management-fee data into the appropriate Kia batch file or tab.",
      },
      {
        key: "s07",
        groupLabel: "Kia Non-OEM",
        text: "Confirm that the Kia batch includes both the billing data and the applicable management-fee adjustment.",
      },
    ],
  },
  {
    key: "p35",
    stageKey: "h",
    title: "Prepare Final Individual Batch Files",
    steps: [
      {
        key: "s01",
        text: "Separate every individual OEM batch into its required individual sheet or workbook.",
      },
      {
        key: "s02",
        text: "Separate every individual Non-OEM batch into its required individual sheet or workbook.",
      },
      { key: "s03", text: "Save OEM batch files in the OEM folder." },
      {
        key: "s04",
        text: "Save Non-OEM batch files separately in the appropriate Non-OEM location.",
      },
      { key: "s05", text: "Confirm that every expected batch file has been created." },
      {
        key: "s06",
        groupLabel: "Kia Workbook Requirement",
        text: "Always break external workbook links in the Kia file before sending it.",
        highRisk: true,
      },
      {
        key: "s07",
        groupLabel: "Kia Workbook Requirement",
        text: "Confirm that the Kia workbook no longer contains external links.",
      },
    ],
  },

  /* ------------------------------------- I. Final Review & Send ---------- */
  {
    key: "p36",
    stageKey: "i",
    title: "Final File Review",
    intro: "Before sending the batch files:",
    steps: [
      { key: "s01", text: "Confirm that all OEM batches are complete." },
      { key: "s02", text: "Confirm that all Non-OEM batches are complete." },
      { key: "s03", text: "Confirm that the management fees are correct." },
      { key: "s04", text: "Confirm that there are no unresolved False checks." },
      { key: "s05", text: "Confirm that FCA is not present in Step 6A Adjusted Other OEM." },
      {
        key: "s10",
        text: "Confirm the FCA batch has been prepared and is complete on its own path.",
        highRisk: true,
      },
      { key: "s06", text: "Confirm that penny-level exceptions were handled correctly." },
      { key: "s07", text: "Confirm that all manual adjustments are reflected in the final files." },
      { key: "s08", text: "Confirm that workbook links have been broken for Kia." },
      { key: "s09", text: "Confirm that the file names and billing month are correct." },
    ],
  },
  {
    key: "p37",
    stageKey: "i",
    title: "Send the Final Batch Files",
    steps: [
      { key: "s01", text: "Send the completed batch files to Ryan." },
      { key: "s02", text: "CC Gagan Roop." },
      { key: "s03", text: "CC Duska Adzovic." },
      { key: "s04", text: "Review Bimal's previous email before sending." },
      {
        key: "s05",
        text: "Confirm whether any additional recipients from Bimal's email must be included.",
      },
      { key: "s06", text: "Attach all required OEM and Non-OEM files." },
      { key: "s07", text: "Verify the attachments before sending.", highRisk: true },
    ],
  },
];

/**
 * "Common Mistakes to Avoid", mapped onto the phase each one guards so it
 * shows up while you're actually in that phase — not only in a list at the end
 * that nobody reads mid-run. `phase: null` means it applies throughout.
 */
export const SOP_MISTAKES: { text: string; phase: string | null }[] = [
  {
    text: "Do not start processing until all required raw data files have been received.",
    phase: "p01",
  },
  {
    text: "Always verify that only Traffic data is included before importing.",
    phase: "p02",
  },
  {
    text: "Always classify Shopping campaign data under Performance Max.",
    phase: "p03",
  },
  {
    text: "Never ignore large Delta values; investigate them immediately.",
    phase: "p04",
  },
  {
    text: "Always check formulas for US accounts to ensure they reference the correct Traffic or Traffic US file.",
    phase: "p05",
  },
  {
    text: "Watch for spacing inconsistencies in account names, especially Bills Toyota.",
    phase: "p06",
  },
  {
    text: "Do not classify Nissan or Infiniti campaigns outside the approved New and Used categories.",
    phase: "p08",
  },
  {
    text: "Always review GM and Cadillac campaigns for the correct New, Used, or CPO classification.",
    phase: "p09",
  },
  {
    text: "Do not forget to check the Activity Month, End Date, and Cell AC1 in the OEM Program tab.",
    phase: "p10",
  },
  {
    text: "Do not copy Salesforce dates from the CSV export; use the XLS export for date values.",
    phase: "p11",
  },
  {
    text: "Do not ignore material red rows by assuming they are pennies.",
    phase: "p12",
  },
  {
    text: "Always remove or exclude the Case Notes column before copying the Duped ID Salesforce report.",
    phase: "p13",
  },
  {
    text: "Always delete the previous month's data before importing the new Pacing Report.",
    phase: "p15",
  },
  {
    text: "Do not forget to include the required Paused or flagged Pacing records.",
    phase: "p15",
  },
  {
    text: "Always label US Pacing accounts correctly as TRFFK US.",
    phase: "p16",
  },
  {
    text: "Do not send the Overbudget file before confirming that it contains Overbudget accounts only.",
    phase: "p19",
  },
  {
    text: "Always use the Strategist recipient list from the previous email when sending the Overbudget file.",
    phase: "p19",
  },
  {
    text: "Always add Strategist responses to Column AJ of the Step 3.2 Overbudget Table.",
    phase: "p20",
  },
  {
    text: "Do not mix OEM and Non-OEM filters when creating the TRFFK Rollup.",
    phase: "p21",
  },
  {
    text: "Always exclude 0, FCA, and penny-level records when preparing applicable OEM management-fee data.",
    phase: "p24",
  },
  {
    text: "Do not remove the Type of Spend column when cleaning the Step 5.2 Fee Dump.",
    phase: "p26",
  },
  {
    text: "Never allow FCA records to remain in Step 6A Adjusted Other OEM.",
    phase: "p27",
  },
  {
    text: "Do not proceed while red False validation checks remain unresolved.",
    phase: "p28",
  },
  {
    text: "Do not forget to process new batches last.",
    phase: "p29",
  },
  {
    text: "Always compare current management fees against the previous approved fees.",
    phase: "p30",
  },
  {
    text: "Always verify the O'Regan Cadillac Account ID and AutoSync fee.",
    phase: "p31",
  },
  {
    text: "Always break external workbook links in the Kia file before sending.",
    phase: "p35",
  },
  {
    text: "Always send the final files to Ryan and CC Gagan Roop and Duska Adzovic.",
    phase: "p37",
  },
  { text: "Complete all validation steps before moving to the next phase.", phase: null },
  {
    text: "Never proceed to the next stage while unresolved discrepancies remain.",
    phase: null,
  },

  /* Added from the Sessions 1–3 training documentation. */
  {
    text: "Do not forget to update the month cells — every formula pulls the wrong period until you do.",
    phase: "p00",
  },
  {
    text: "TikTok cost values can arrive as text. If a total reads zero, convert the column to numbers before trusting it.",
    phase: "p02",
  },
  {
    text: "Always align the Social Canada and Social US column headers before pasting — the US layout can differ.",
    phase: "p03",
  },
  {
    text: "Do not treat 105.01% as within budget — anything above 105% is over budget and must be reviewed.",
    phase: "p18",
  },
  {
    text: "Never send Strategists the full billing workbook; send only the separate Overbudget file.",
    phase: "p19",
  },
  {
    text: "Always convert a Strategist's free-text comment into one of the three standard decisions — the formulas cannot read free text.",
    phase: "p20",
  },
  {
    text: "When capping an account, reduce the single channel with the largest overage; spreading the reduction will not land the invoice on the cap.",
    phase: "p22",
  },
  {
    text: "Excluding FCA from the OEM filters does not mean FCA is not billed — it has its own billing path.",
    phase: "pfca",
  },
  {
    text: "FCA management fee is calculated on ad spend plus the Google fee, not on ad spend alone.",
    phase: "pfca",
  },
];
