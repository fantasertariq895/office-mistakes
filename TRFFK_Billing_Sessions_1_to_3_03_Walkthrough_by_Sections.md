# TRFFK Billing Training - Sessions 1 to 3

**03 - Walkthrough by Sections**

Based on TRFFK Billing Training Session 1 (20250509), Session 2 (20250515), and Session 3 (20250521) transcripts

**How to use this walkthrough:** Read this beside the videos. It follows the training order and explains what is happening and why.

# Session 1 walkthrough - Build the spend base

## 1\. Start from last month's files and update the month

The trainer begins with copies of last month's accrual and billing files. This preserves formulas, formatting, pivots and check areas. The month in highlighted cells must be updated because formulas rely on it to pull the right period.

## 2\. Receive raw platform data from Justin

Justin provides raw spend files from platforms. The call with him is mainly to work through discrepancies, not necessarily to build the whole file together. They may wait until the second business day because late month-end spend can trickle into platform reporting.

## 3\. Split Google data

The Google file is filtered by campaign type and pasted into different tabs: Performance Max, Demand Gen, Search and Video. The trainer filters for account names containing Traffic and flags anything that may be a subtotal, non-Traffic account or old DBSM/migration account.

## 4\. Load Bing, Display, Social and TikTok

Bing goes directly into the Bing tab. Display goes into the separate Display tab. Social CAD and USD both go into Social after column alignment. TikTok is pasted into TikTok, but the cost field can come in as text, so sums can show zero until cost values are converted to numbers.

## 5\. Pull Geofencing / Simplify data from pacing report

Geofencing comes from the monthly pacing report. The trainer clears filters, unhides rows, pulls Salesforce IDs from account names, filters to accounts with spend, and copies the data into the geofencing accrual tab. CAD and US spend use different columns.

## 6\. Compare accrual totals to the pacing report

The accrual report links to pacing report totals and calculates deltas. Small variances are normal because of timing. Larger variances are investigated by refreshing pivots, comparing by Salesforce ID, checking for duplicates, missing accounts or classification differences.

## 7\. Understand the Demand Gen/Search variance example

Demand Gen is split out in billing because it has a separate billing purpose or rate card, but the pacing report may include it under Search. A large Search delta may simply mean Demand Gen needs to be included in the comparison, not that spend is double counted.

## 8\. Add comments for discrepancies

The trainer adds comments even when variances are tiny, such as trickle spend with no variance greater than a few dollars. This is for audit trail: it proves the variance was reviewed and accepted.

## 9\. Paste summarized accrual data into the billing file

Each accrual tab has a pivot. The pivot is refreshed, checked against the raw total, and pasted as values into the billing file raw data tab. Only the gray input columns are cleared; formula columns are left intact.

## 10\. Update Account Data and Dup ID Data

The billing file needs Salesforce data to identify the customer, parent account, PBGID, AVIS, status and OEM program. Account Data and Dup ID Data reports are overwritten each month, then formulas and pivots are refreshed.

## 11\. Review billing checks

The file checks AVIS length, Salesforce ID length, traffic status, activation and cancellation timing. If an account was cancelled before the billing month, it usually should not be billed. If it cancelled during the month, spend before cancellation may be legitimate.

## 12\. Review campaign type classification

Campaign type is formula-driven by keywords, but keyword logic can misread customer names. BMW Newmarket may trigger New, and Etobicoke may trigger acquisition because it contains ICO. The trainer manually overrides flagged rows and highlights overrides.

## 13\. Watch Nissan and Infiniti campaign-type rules

Nissan and Infiniti do not want certain campaign types such as Other, Finance or Acquisition. If those appear, the trainer reviews and overwrites them or asks Justin when the proper classification is unclear.

## 14\. Run Step 2 pivots, penny report and low spend checks

Step 2 begins splitting data into OEM, other OEM, FCA and non-OEM. The penny report identifies tiny spend amounts that are automatically excluded. Low spend under around 150 is reviewed to determine whether the account was paused, cancelled, newly active or accidentally left running.

## 15\. Build the over-budget report

Budget data from the pacing report is pasted into the over-budget section. Accounts above 105 percent of budget are flagged, even if they are only slightly above 105 percent. The over-budget rows are copied into a separate file.

## 16\. Send over-budget file to strategists

The strategist file asks for a billing decision and a reason: bill overage in full, cap at 105 percent or cap at 100 percent. The full billing workbook is not shared because it has too much sensitive formula-driven data.

# Session 2 walkthrough - Apply decisions and calculate fees

## 1\. Bring strategist feedback back into billing

Strategist comments are looked up by Salesforce ID. The billing owner uses a manual column to translate each comment into a clean billing decision. Formulas then update approved-to-invoice and not-approved-to-invoice amounts.

## 2\. Send the summary to Mahi / Marie-Christine / Justin

After decisions are applied, a summarized over-budget file shows total overage, approved amount, not-approved amount and decision. This is generally a notification summary rather than a new approval round.

## 3\. Move refreshed data into the roll-up

The trainer copies refreshed pivot data into the roll-up for non-OEM and OEM. Penny and over-budget flags appear here. The roll-up is where billing notes and reductions are applied before adjusted tabs.

## 4\. Handle over-budget accounts approved to bill in full

If strategists approve bill in full, no amount is reduced. The trainer adds a note such as over budget, 105 percent approved to bill in full. The note shows that the overage was reviewed and approved.

## 5\. Handle capped over-budget accounts

For cap decisions, the file calculates the not-approved amount and identifies the channel with the biggest overage. The trainer reduces the highest relevant channel line so the customer total invoice equals the cap, then adds a note explaining the cap and reduction.

## 6\. Start management fee review

Management fees are handled in a separate Traffic Management Fees file. A Salesforce report is exported and pasted into the raw area; formulas on the right calculate final management fees based on fee percentage, special terms and account data.

## 7\. Understand management fees and over-budget

The over-budget review is about ad spend budget. Management fee is calculated on approved actual spend. If the spend is allowed to be 105 percent of budget, the management fee is calculated on that approved spend amount, not automatically capped at 100 percent.

## 8\. Review contract change check

The contract change check may flag situations where an account has an old activation date but a newer contract, renewal or terms start date. Contract signed before activation is normal. The concern is whether a newer contract changed fee terms.

## 9\. Review GM and Cadillac legacy dealers

Some GM and Cadillac dealers are OEM-enrolled but keep legacy Traffic fee terms because they signed up before the OEM enrollment program. The legacy tab pulls legacy fee and cap logic into final fee calculations.

## 10\. Manually check moving management fees and special terms

The trainer filters to live non-OEM accounts and reviews special agreements, six-month and twelve-month agreements. Moving fees change over time, such as 10 percent in month one, 15 percent in month two and 20 percent afterward. Special Terms is the source for billing, not TNC notes.

## 11\. Investigate blank management fees

Blank fees need review. They may be correct for OEM enrollment, flat fee arrangements or inactive accounts, or they may mean Salesforce setup is missing. The trainer checks the intake form, activation case, DocuSign, account page and Traffic co-op enrollment.

## 12\. Update Salesforce or account data if needed

If an account should be OEM but Salesforce is blank, Salesforce and the billing file account data need to be corrected. This can change pivots, roll-up and adjusted tabs, so the later it is found, the more rework it causes.

## 13\. Copy management fees into billing and refresh calculators

After management fee review, results are pasted as values into the billing file. The management fee pivot is refreshed and pennies are excluded. Refreshing matters because over-budget adjustments can change the spend base used for fee calculation.

## 14\. Build adjusted Other OEM, Non-OEM and FCA tabs

Adjusted tabs combine spend, management fees, Google fees and notes into a near-final billing format. Other OEM excludes FCA. FCA has a separate process because the management fee is calculated on ad spend plus Google fee.

## 15\. Run management fee and Google fee checks

Checks returning false are investigated. Some false checks are acceptable if they are explained by legacy fees, caps or valid adjustments. Otherwise, a false check means the calculation or formula reference may be wrong.

## 16\. Create batch tabs

Each OEM or non-OEM group is copied into a batch tab, pasted as values, sorted by AVIS, Salesforce ID and campaign type, and checked against the adjusted tab. Batches help DSS Billing assign and process work.

# Session 3 walkthrough - Final batching, reconciliation and handoff

## 1\. Continue from the batch creation step

Session 3 starts where Session 2 left off: the trainer is working from the adjusted/batch stage. For Other OEM, each OEM is filtered, copied from currency through billing adjustment notes, pasted as values into its own batch tab, sorted, and then copied into a separate file.

## 2\. Save and email each batch file to DSS Billing

After the batch tab is ready, the trainer creates a copy of that tab in a new workbook, saves it using the normal naming convention, and emails it to DSS Billing. DSS Billing takes the file and actions the invoice entries.

## 3\. Understand why there are so many batch files

Traffic billing has a large volume of entries. Separate batch files make it possible for DSS Billing to split the work across multiple people instead of having one person work from one massive file.

## 4\. Separate OEM, FCA and non-OEM batches

The trainer clarifies that non-OEM is not reached by filtering the Other OEM tab. The workbook already separates Other OEM, FCA and Non-OEM. Non-OEM has its own adjusted/batch area and is then split by specific group settings.

## 5\. Handle Automobile on Direct

Automobile on Direct has a special management fee rule based on total monthly group spend. The file may default to 10 percent, but the checker columns and conditional formatting indicate the correct tier. In the example, group spend of about 92,000 falls into a 12 percent tier, so the trainer confirms the fee calculated at 12 percent and not 10 percent.

## 6\. Handle VCC head office billing

VCC wants management fees billed under head office AVIS accounts. The trainer keeps placeholder rows for the head office accounts, pastes the current VCC data underneath, manually moves each store management fee amount into the matching head office placeholder row, and deletes the original store-level management fee line so the fee is not billed twice.

## 7\. Use VCC checks to catch mistakes

The VCC tab has checkers that should return true. If a fee is moved under the wrong head office/store, such as putting Oakville under Toronto, the check should return false and the mistake must be fixed.

## 8\. Combine certain manual batches

Not every tab becomes its own separate file. Cam Clark and Superior Auto Group go together into one manual billing batch file. The three JLR tabs also go together into one JLR file and one email. Prior month folders show the naming conventions.

## 9\. Run reconciliation before sending what can wait

OEM billing may be due first, so the trainer may send OEM batches before final reconciliation. When possible, reconciliation is done before the rest of non-OEM batches go out. The reconciliation file links back to raw data, over-budget approved and not-approved amounts, pennies and adjustments.

## 10\. Dump batch data into reconciliation

All batch data is pasted into the reconciliation file. FCA is formatted differently because Google fee is built into the file, so headers must be lined up and Google fee placed at the end. Other batches are simpler full copy-and-paste.

## 11\. Refresh reconciliation pivots and confirm True

After all batch data is dumped, pivots are refreshed. The file compares final batch totals to raw data. The expected difference should equal the amounts intentionally excluded or adjusted: over-budget not approved, pennies and credit adjustments. If the check returns true, the reconciliation is good. If false, something was missed or adjusted incorrectly.

## 12\. Enter credit adjustments when applicable

Batch tabs have a placeholder line for credit adjustments. For a dollar credit, the trainer enters a negative amount, such as -500, uses Credit Adjustment as the spend/campaign type, and adds notes such as retention offer as per a person or Salesforce case number.

## 13\. Handle management fee retention offers

Some retention offers reduce management fees instead of applying a fixed dollar credit. If the offer is 15 percent off the management fee, the reduction is calculated as negative management fee times 15 percent. If the offer says bill at 10 percent management fee for three months, billing calculates the management fee at 10 percent on actual spend and overrides the calculated amount.

## 14\. Track ongoing billing adjustments

The trainer uses an ongoing billing adjustments tracker because some offers last multiple months or run until a balance is used up. These exceptions are always manual and must be reviewed each month.

## 15\. Confirm OEM approval and revenue share

OEM retention offers need OEM approval. If an OEM fee changes, confirm whether the stated percentage is customer-facing or the amount TRFFK should bill to the OEM partner. With an 80/20 revenue share, a 20 percent customer-facing fee means TRFFK bills 80 percent of that fee, or 16 percent, and the partner keeps/marks up the remaining 4 percent.

## 16\. Final handoff and follow-up questions

Once all batch files are sent to DSS Billing, the monthly billing handoff is complete. DSS Billing or DSS Admin may still ask questions. If they think an account is OEM but Salesforce does not show OEM enrollment, billing confirms with Justin, Sales or enrollment cases, updates Salesforce if needed, recalculates the management fee, and replies with the corrected amount. Usually a new file is needed only if many accounts are affected.