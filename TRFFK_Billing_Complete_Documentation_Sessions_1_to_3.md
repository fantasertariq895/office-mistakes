# **TRFFK Billing Complete Documentation**

**Sessions 1 to 3 - Big Picture, File Guide, Walkthrough and Glossary**

Based on TRFFK Billing Training Session 1 (20250509), Session 2 (20250515), and Session 3 (20250521) transcripts

**How to use this master document:** This single file contains the whole documentation across all three training sessions. It is organized into four parts: Big Picture, File and Tab Guide, Walkthrough by Sections, and Core Concepts Glossary.

# Part 1 - Big Picture

**Purpose of this guide:** Start here before rewatching the videos. This explains the storyline across all three TRFFK Billing sessions and why each major step exists.

# 1\. The overall TRFFK Billing story

The three sessions show the month-end Traffic/TRFFK billing workflow from raw advertising spend through final batch files being sent to DSS Billing.

**Plain-English flow:** Raw platform spend -> Accrual report -> Pacing report comparison -> Billing file -> Penny and low-spend checks -> Over-budget strategist review -> Roll-up -> Management fee and Google fee calculations -> Adjusted tabs -> Batch files -> Reconciliation -> DSS Billing handoff.

The work is not only copy and paste. The real purpose is to prove that every billable amount is complete, properly classified, approved where needed, and traceable if someone asks questions later.

# 2\. Session-by-session storyline

## Session 1 - Build the spend base and identify exceptions

Session 1 begins the monthly billing process. The trainer copies last month's files, updates the month, imports raw spend from advertising platforms, reconciles that spend against the monthly pacing report, loads the clean spend into the billing file, and identifies penny, low-spend, cancelled and over-budget exceptions.

- Raw data comes mostly from Justin and the advertising platforms.
- Google is split into Search, Demand Gen, Performance Max and Video because one source file feeds multiple billing tabs.
- The monthly pacing report is used as a comparison report and budget source.
- The billing file uses Salesforce ID to pull account data such as AVIS, parent account, account status and OEM enrollment.
- The session pauses after the over-budget file is prepared and sent to strategists for decisions.

## Session 2 - Apply decisions and prepare near-final billing

Session 2 starts after strategists have returned their over-budget decisions. The trainer pulls those comments back into the billing file, applies bill-in-full or cap decisions, updates the roll-up, reviews management fees, handles special terms and legacy fees, calculates Google fees, and starts creating billing batches.

- Strategist comments are converted into a standard decision: Bill in full, Cap at 105 percent, or Cap at 100 percent.
- Capped accounts are reduced so the total invoice lands at the approved limit.
- Management fees are reviewed in a separate Traffic Management Fees file using Salesforce intake form data.
- Blank fees, moving fees, legacy fees and contract/renewal issues are checked before finalizing fees.
- Adjusted tabs become the near-final billing tabs before splitting into batches.

## Session 3 - Finalize batches, reconcile, and hand off to DSS Billing

Session 3 picks up near the final step. The trainer shows how final batch tabs are copied into separate files, why some non-OEM groups have manual rules, how the reconciliation file proves that batch totals tie back to raw data, and how retention offers, credit adjustments and OEM revenue share need to be handled.

- Each OEM is generally sent as its own batch file so DSS Billing can distribute the work.
- Non-OEM batches are split by specific groups or billing rules, not just by one simple OEM filter.
- Automobile on Direct has a tiered management fee based on monthly group spend.
- VCC bills management fees under head office AVIS accounts, so placeholder rows must be used and store-level fee lines deleted to avoid double billing.
- The reconciliation file compares raw data to all batch data and verifies that the only differences are explained by pennies, over-budget not-approved amounts and credit adjustments.
- Once all batch files are sent to DSS Billing, the billing owner may still need to answer follow-up invoice questions.

# 3\. The main business question

The process is really asking this question: what should be invoiced for each customer, and can we explain every included, excluded, capped or adjusted amount?

**Completeness** - Are all platforms, accounts and spend included?

**Correct ownership** - Does the spend belong to Traffic/TRFFK billing, or is it a subtotal, DBSM account, non-Traffic account or zero-dollar row?

**Classification** - Is the spend under the right product, campaign type, OEM/non-OEM group and currency?

**Eligibility** - Should the account be billed based on traffic status, cancellation date, penny spend or pause status?

**Approval** - If the account is over budget or has a retention offer, do we have the required approval?

**Fee accuracy** - Do management fees, Google fees, legacy fees, tiered fees and FCA-specific logic calculate correctly?

**Audit trail** - Do the notes explain what happened and who approved it?

**Reconciliation** - Do final batches tie back to raw data after all approved exclusions and adjustments?

# 4\. Why the process feels complicated

The workflow is formula-driven, but the complexity comes from exceptions. Each exception is small on its own, but together they create many controls.

- Platform reports can have timing differences because spend can trickle in after month-end.
- Google products are grouped differently in different reports, such as Demand Gen being part of Search in the pacing report but split for billing.
- Some files may store numbers as text, such as the TikTok cost column showing sums as zero.
- Salesforce setup may be incomplete, especially for OEM enrollment or management fee fields.
- Campaign type formulas can misread keywords in customer names, so manual overrides are sometimes needed.
- Strategist decisions affect whether over-budget spend is billed or capped.
- Legacy and retention arrangements can override standard fee logic.
- Batch files must be easy for DSS Billing to process, so the final output is split into multiple files.

# 5\. Roles in the process

**Billing owner** - Runs the file, imports data, reviews checks, documents exceptions, prepares batches and answers billing questions.

**Justin** - Provides platform raw data and helps confirm discrepancies, migrations, account ownership and Salesforce setup questions.

**Strategists** - Provide over-budget billing decisions: bill in full, cap at 105 percent or cap at 100 percent.

**Mahi / Marie-Christine** - Receive summaries and approve or confirm certain non-OEM retention or adjustment items.

**Lori Schiller / OEM contact** - Helps confirm OEM approval and revenue share treatment for OEM retention or custom fee changes.

**DSS Billing** - Receives final batch files and enters/processes billing. They may come back with invoice or classification questions.

**Salesforce** - Source of truth for account status, OEM enrollment, activation, cancellation, intake form, fee and special terms data.

# 6\. What to focus on while rewatching

## While watching Session 1

- Watch how the trainer filters out non-Traffic accounts and totals before pasting raw data.
- Watch how each raw platform file lands in a specific accrual tab.
- Watch the pacing report comparison and how deltas are explained.
- Watch why Demand Gen/Search can make a variance look bigger than it really is.
- Watch how the billing file pulls Salesforce account details using Salesforce ID.
- Watch campaign type overrides, penny report, low-spend review and the over-budget file creation.

## While watching Session 2

- Watch how free-text strategist comments become clean manual decisions in the billing file.
- Watch how capping reduces a channel amount but affects the customer invoice as a whole.
- Watch the management fee review and the importance of special terms over TNC notes.
- Watch the contract change check clarification: contract before activation is normal; the concern is an old activation date with a newer contract or renewal/terms date.
- Watch legacy fees, false checks, adjusted tabs, Google fees and FCA-specific handling.

## While watching Session 3

- Watch how the trainer creates final batch files from batch tabs and sends them to DSS Billing.
- Watch the special non-OEM cases: Automobile on Direct and VCC.
- Watch why VCC placeholder rows are kept and why original store-level management fee rows must be deleted.
- Watch the reconciliation logic: raw data minus approved exclusions should equal final batch totals.
- Watch how credit adjustments and retention offers are entered as negative lines with notes.
- Watch the OEM revenue share example, especially customer-facing fee versus the amount billed to the OEM partner.

# 7\. One-sentence summary

Session 1 builds the billing data, Session 2 applies decisions and calculates fees, and Session 3 proves the final batches tie out before sending them to DSS Billing.

# Part 2 - File and Tab Guide

**How to use this guide:** Use this as a reference when the videos jump between workbooks, tabs and reports. Each entry explains what the file or tab is, why it exists, and what to watch for.

# 1\. Main file flow

- Platform raw files and monthly pacing report feed the accrual report.
- The accrual report feeds the billing file raw data tab.
- Salesforce account reports feed the Account Data and Dup ID Data tabs.
- The billing file identifies pennies, low spend and over-budget accounts.
- A separate over-budget file goes to strategists, then comments are brought back into billing.
- The Traffic Management Fees file calculates or verifies management fee rules.
- Adjusted tabs combine spend, management fees, Google fees, notes and adjustments.
- Batch tabs create the final files sent to DSS Billing.
- The reconciliation file proves that final batch totals tie back to raw source data after approved exclusions and adjustments.

# 2\. Session 1 files and tabs

## Accrual report

**What it is** - The staging workbook where raw monthly spend is pasted by platform or product.

**Why it matters** - It summarizes raw platform spend and compares it to the pacing report before anything goes into the billing file.

**Watch-outs** - Update the month in the highlighted cells. Refresh pivots. Make sure raw tab totals and pivot totals agree.

## Raw platform files from Justin

**What it is** - Monthly spend exports from platforms such as Google, Bing, Facebook/Social, TikTok and Display.

**Why it matters** - They are usually the most current source of actual spend.

**Watch-outs** - Remove subtotals, non-Traffic rows, old DBSM/migration accounts when not billable, and zero-dollar rows where appropriate.

## Google raw file

**What it is** - One Google export that feeds several accrual tabs.

**Why it matters** - Google data must be split by campaign type for billing.

**Watch-outs** - Filter by campaign type: Search, Demand Gen, Performance Max and Video. Search/Display naming can be confusing because the separate Display tab is not the same as Google display rows.

## Bing file

**What it is** - A separate Bing export pasted into the Bing tab.

**Why it matters** - Bing does not need the same campaign-type split as Google.

**Watch-outs** - Filter to Traffic accounts and remove totals.

## Display file

**What it is** - A separate display export, such as DBM/DV360-type display data.

**Why it matters** - It feeds the Display accrual tab.

**Watch-outs** - Do not mix this with Google campaign display rows. Use Traffic-only filters.

## Social CAD and Social USD files

**What it is** - Two social exports, one Canadian and one US.

**Why it matters** - Both feed the Social accrual tab.

**Watch-outs** - The US layout may have different columns, so line up headers before pasting.

## TikTok file

**What it is** - TikTok source data pasted into the TikTok tab.

**Why it matters** - It adds TikTok spend into monthly billing.

**Watch-outs** - The cost values may be stored as text. If sums show zero, convert the cost column to numbers before continuing.

## Monthly pacing report

**What it is** - The month-end pacing report used for comparison and budgets.

**Why it matters** - It is the comparison report and source of budget data for over-budget checks.

**Watch-outs** - Clear filters, unhide rows, add your own totals where needed, and remember that product grouping may differ from billing.

## Geofencing / Simplify data

**What it is** - Geofencing data pulled from the monthly pacing report.

**Why it matters** - It feeds the geofencing accrual tab.

**Watch-outs** - Pull Salesforce ID from the account name. Use Canadian cost for CAD accounts and retail markup/retail cost for US accounts.

## Billing file - Raw Data tab

**What it is** - The input area in the main billing workbook where summarized accrual data is pasted.

**Why it matters** - This is where formulas begin connecting spend to customer details and billing logic.

**Watch-outs** - Clear only gray input columns. Do not delete formula columns.

## Account Data tab

**What it is** - Monthly Salesforce account data pasted into the billing file.

**Why it matters** - It pulls parent account, PBGID, AVIS, traffic status, OEM program and other billing details by Salesforce ID.

**Watch-outs** - If Salesforce is corrected later, update this tab and refresh downstream pivots.

## Dup ID Data tab

**What it is** - A separate Salesforce report for duplicate ID issues.

**Why it matters** - It helps catch duplicate ID or lookup concerns.

**Watch-outs** - Make sure formulas are filled down to the end of the refreshed data.

## Penny report

**What it is** - A report that identifies accounts with tiny monthly spend.

**Why it matters** - Pennies are not billed.

**Watch-outs** - Copy the penny Salesforce IDs into the exclusion area so they are excluded later.

## Over-budget strategist file

**What it is** - A controlled copy of over-budget accounts sent to strategists.

**Why it matters** - Strategists tell billing whether to bill in full or cap the invoice.

**Watch-outs** - Do not send the full billing file. Ask for a decision and reason for audit trail.

# 3\. Session 2 files and tabs

## Notes from Strategist area

**What it is** - A lookup area that brings strategist comments back into the billing file by Salesforce ID.

**Why it matters** - It connects the separate over-budget file back to the main billing workflow.

**Watch-outs** - Convert comments into standardized decisions, not just free text.

## Manual decision column

**What it is** - Manual selection of Bill in Full, Cap at 105 percent or Cap at 100 percent.

**Why it matters** - Formulas use it to calculate approved-to-invoice and not-approved-to-invoice amounts.

**Watch-outs** - Select the decision that matches the strategist comment.

## Traffic roll-up

**What it is** - The summarized billing area after pivots are copied in.

**Why it matters** - It is where over-budget notes and reductions are applied.

**Watch-outs** - Penny and over-budget flags appear here. Add notes for approved over-budget billing and reduce capped accounts.

## Traffic Management Fees file

**What it is** - Separate workbook for management fee review and calculation.

**Why it matters** - Management fees are reviewed before they are pasted back into billing.

**Watch-outs** - Update data run date and month ending date. Review moving fees, blanks, special terms and legacy logic.

## Salesforce management fee report

**What it is** - A Salesforce export feeding the management fee file.

**Why it matters** - It provides management fee percentage, agreement type, special terms and related setup fields.

**Watch-outs** - Salesforce must be correct. Missing OEM enrollment or blank fee fields may create downstream issues.

## Salesforce intake form

**What it is** - The account setup record in Salesforce.

**Why it matters** - It contains the management fee and special terms that billing relies on.

**Watch-outs** - Use Management Fee and Special Terms for billing decisions. Do not rely only on TNC notes.

## Contract change check

**What it is** - A flag comparing contract, activation, renewal/terms and month-ending dates.

**Why it matters** - It can warn that billing terms may have changed.

**Watch-outs** - Contract date before activation date is normal. The concern is an old activation date with a newer contract, renewal or terms date.

## GM and Cadillac Legacy Dealers tab

**What it is** - A special legacy-fee tab.

**Why it matters** - Some OEM-enrolled dealers keep old Traffic legacy fee terms.

**Watch-outs** - Legacy fee or cap may make checks return false. Add comments explaining the exception.

## Moving management fee tracker

**What it is** - A tracking area for fee rates that change over time.

**Why it matters** - It prevents the wrong rate from being applied when a fee steps up or down by month/year.

**Watch-outs** - Once an account reaches final rate, note it so it does not need repeated monthly review unless a new contract is signed.

## Data dump / clean tab

**What it is** - Temporary cleanup area before pasting to adjusted tabs.

**Why it matters** - It lets you remove extra columns and keep the billing format clean.

**Watch-outs** - Keep only the columns needed by the adjusted tab format.

## Adjusted Other OEM tab

**What it is** - Near-final billing tab for OEMs excluding FCA.

**Why it matters** - It combines ad spend, management fees, Google fees, notes and adjustments.

**Watch-outs** - Refresh management fee and Google fee checks after pasting.

## Adjusted Non-OEM tab

**What it is** - Near-final billing tab for non-OEM accounts.

**Why it matters** - It prepares non-OEM billing in final format before batches.

**Watch-outs** - The process is similar to Other OEM, but batching rules differ.

## Adjusted FCA Billing tab

**What it is** - Near-final billing tab for FCA accounts.

**Why it matters** - FCA has separate calculation logic.

**Watch-outs** - The transcript sometimes renders FCA as SCA. Use the FCA-specific calculator because FCA management fee includes ad spend plus Google fee.

## Google fee calculator

**What it is** - Calculator for Google-related fees.

**Why it matters** - Most OEM Google fees are calculated separately from management fees.

**Watch-outs** - If a check returns false, make sure formulas are referencing only ad spend and the Google fee. Pivot structure can change month to month.

## Batch tabs

**What it is** - Tabs that hold final billing data for each batch.

**Why it matters** - They become the separate files sent to DSS Billing.

**Watch-outs** - Sort and check each batch. Batch totals must match adjusted tabs.

# 4\. Session 3 files and tabs

## Other OEM batch tabs

**What it is** - Final tabs for individual OEM batches such as Mitsubishi.

**Why it matters** - Each OEM is generally sent as its own file to DSS Billing.

**Watch-outs** - Filter the adjusted Other OEM tab by OEM, copy from currency through billing adjustment notes, paste values into the batch tab, sort, and save the tab as a separate workbook.

## Non-OEM batch tabs

**What it is** - Final tabs for non-OEM batch groups.

**Why it matters** - Non-OEM billing is split by group or billing setting so DSS Billing can assign work.

**Watch-outs** - Do not assume non-OEM comes from filtering the OEM tab. It has its own non-OEM adjusted/batch area.

## Automobile on Direct tab

**What it is** - A special non-OEM batch with management fee based on total monthly group spend.

**Why it matters** - Its fee is tiered, not simply a flat default rate.

**Watch-outs** - Checker columns and conditional formatting show the correct tier. Example: group spend around 92,000 should use 12 percent instead of the default 10 percent.

## VCC tab

**What it is** - A special non-OEM batch where management fees are billed under head office AVIS accounts.

**Why it matters** - The file cannot automatically bill certain store fees under a different account, so placeholder rows are used.

**Watch-outs** - Keep head office placeholder rows. Move the store management fee amounts to the matching placeholder rows. Delete original store fee lines so the fee is not billed twice.

## Manual billing batch file

**What it is** - A file containing specific manual tabs such as Cam Clark and Superior Auto Group.

**Why it matters** - Some manual groups are combined into one file and one email.

**Watch-outs** - Use prior month naming conventions and include the correct tabs in the file.

## JLR batch file

**What it is** - A combined file containing the JLR tabs.

**Why it matters** - Multiple JLR tabs go together into one file/email.

**Watch-outs** - Confirm naming convention from prior month folder.

## Reconciliation file

**What it is** - A workbook that ties raw data to final batch outputs.

**Why it matters** - It proves that the difference between raw spend and billed batches is fully explained.

**Watch-outs** - Pull raw data, over-budget approved/not-approved, pennies and credit adjustments. Dump all batch data and refresh pivots. False means investigate.

## FCA reconciliation format area

**What it is** - Special handling inside reconciliation because FCA includes Google fee in the batch format.

**Why it matters** - FCA has an extra Google fee column compared with other batches.

**Watch-outs** - Line up headers carefully and place Google fee at the end.

## Credit adjustment placeholder line

**What it is** - A placeholder row at the top of batch tabs for manual negative adjustments.

**Why it matters** - It provides a safe place to enter credits such as retention offers.

**Watch-outs** - Do not delete the placeholder. Use negative amounts and clear notes such as case number or approved retention offer source.

## Ongoing billing adjustments tracker

**What it is** - A separate tracker for manual retention and credit arrangements.

**Why it matters** - Some offers last multiple months or run until a credit balance is used up.

**Watch-outs** - Review it every month because these exceptions are manual.

## Final batch email to DSS Billing

**What it is** - The email with the saved batch workbook attached.

**Why it matters** - DSS Billing uses it to action invoice entries.

**Watch-outs** - Use normal recipients, standardized subject/naming, and send separate batch files as required.

# Part 3 - Walkthrough by Sections

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

# Part 4 - Core Concepts Glossary

**How to use this glossary:** Use this when the videos mention a billing term quickly. The meaning is simplified for TRFFK Billing context.

# 1\. Source data and reconciliation concepts

**Accrual report** - The staging workbook where raw monthly spend is pasted and summarized before going into the billing file.

**Raw platform file** - A spend export from an ad platform, such as Google, Bing, Social, TikTok or Display.

**Monthly pacing report** - The month-end comparison and budget report used to check spend and identify over-budget accounts.

**Delta** - The difference between the accrual/platform total and the pacing report total.

**Trickle spend** - Small spend amounts that appear after the initial month-end report timing.

**Pivot table** - An Excel summary table used to group and total raw spend by account, product, campaign type or other fields.

**Refresh pivot** - Update a pivot table so it reflects the latest pasted data or adjustments.

**Zero check** - A check that should equal zero when two totals match.

**True/False check** - A control formula that confirms whether an expected amount matches the actual amount.

**Subtotal row** - A total line from a source file that should usually be removed so spend is not double counted.

**Text-formatted numbers** - Numbers that look like dollar amounts but Excel treats as text. They may cause sums to show zero, as in the TikTok cost example.

# 2\. Customer and Salesforce concepts

**Salesforce ID** - The key ID used to connect platform spend to Salesforce account data. It is often the right 18 characters in the account name.

**AVIS number** - A billing/account identifier used by DSS Billing. The file checks whether it is too short or too long.

**Parent account** - The higher-level Salesforce/customer relationship used for grouping and billing context.

**PBGID** - A customer/account field pulled from Salesforce account data for billing purposes.

**Traffic status** - Salesforce status such as live, cancelled or paused.

**Activation date** - The date Traffic service began or the account became active.

**Cancellation date** - The date the Traffic service was cancelled. It determines whether spend in the billing month is billable.

**Contract signed date** - The date the customer signed the contract.

**T&C renewal date / contract terms start date** - A newer terms or renewal date that may indicate billing terms changed.

**Contract change check** - A management fee file check that may flag an old activation date with a newer contract or terms date.

**Intake form** - The Salesforce setup record that contains management fee and special terms.

**Special Terms** - The structured billing terms used for management fee decisions.

**TNC notes** - Notes in Salesforce that may contain extra text but are not the primary billing source for fee calculations.

**DocuSign** - Signed agreement documentation used to verify custom terms when the intake form is unclear.

# 3\. Product and campaign concepts

**Search** - A Google/Bing search advertising product/category.

**Demand Gen** - A Google product split separately in billing even though it may be grouped with Search in the pacing report.

**Performance Max / P Max** - A Google campaign type separated into its own billing tab.

**Video / YouTube** - Video spend category. TikTok may need to be removed from a general video comparison because it has its own billing tab.

**Display** - Display advertising data, separate from Google search/video splits.

**Social** - Social advertising spend, including CAD and USD files.

**TikTok** - TikTok platform spend. Watch for cost values stored as text.

**Geofencing / Simplify** - Location-based advertising data pulled from the monthly pacing report.

**Campaign type** - Billing classification such as New, Used, Parts and Service, Acquisition, Finance, Other or Conquest.

**Campaign type override** - A manual correction when keyword formulas assign the wrong campaign type.

**Nissan/Infiniti campaign rule** - Special rule that certain campaign types such as Other, Finance or Acquisition must be reviewed and overwritten for Nissan/Infiniti.

**Co-op reporting** - Manufacturer/OEM-related reporting or reimbursement context where campaign type can matter.

# 4\. Exceptions, approvals and budget concepts

**Penny report** - A report of tiny monthly spend amounts that should not be billed.

**Pennies** - Very small spend amounts, such as cents, excluded from final billing.

**Low spend check** - A flag for unusually low spend, often under around 150, requiring review.

**Over-budget** - Spend above the allowed budget threshold. In these sessions, anything above 105 percent is flagged.

**105 percent threshold** - The allowed billing buffer over budget. 105.01 percent is still treated as over-budget for review.

**Strategist comments** - Strategist responses that tell billing how to handle over-budget accounts.

**Bill in full** - The strategist approved billing the full over-budget amount.

**Cap at 105 percent** - Billing is limited to 105 percent of budget; the amount above that is not billed.

**Cap at 100 percent** - Billing is limited to budget exactly; all spend above budget is not billed.

**Approved to invoice** - Amount allowed to be billed to the customer.

**Not approved to invoice** - Amount intentionally excluded from billing after cap or adjustment decisions.

**Billing adjustment note** - A note explaining why an amount was adjusted, capped, excluded or approved.

**Audit trail** - Documentation that shows the billing decision was reviewed and supported.

# 5\. Fee and OEM concepts

**Management fee** - Fee charged for managing advertising spend. It may be a percent of spend, a flat fee, tiered fee or special arrangement.

**Moving management fee** - A fee that changes over time, such as 10 percent in month one, 15 percent in month two and 20 percent after that.

**Tiered management fee** - A fee percentage based on spend range. Automobile on Direct is the Session 3 example.

**Blank management fee** - A missing fee field that must be investigated unless clearly explained by OEM enrollment, flat fee or other approved reason.

**Flat fee** - A fixed dollar fee instead of a percentage fee.

**Legacy fee** - An older fee arrangement that continues to be honored even if the account is now OEM enrolled.

**Legacy cap** - A maximum fee amount tied to a legacy fee arrangement.

**OEM** - Original Equipment Manufacturer program billing, such as manufacturer/OEM-enrolled accounts.

**Non-OEM** - Traffic billing not under an OEM program.

**FCA** - An OEM group with special billing logic. The transcript sometimes renders FCA as SCA.

**Other OEM** - OEM accounts excluding FCA.

**Google fee** - A separate Google-related fee for most OEMs. For FCA, it is included before calculating management fee.

**FCA management fee rule** - FCA management fee is calculated on ad spend plus Google fee.

**OEM enrollment** - Salesforce field showing whether an account belongs to an OEM program.

**GM and Cadillac legacy dealers** - OEM-enrolled dealers that keep old Traffic legacy fee terms.

# 6\. Final batching and Session 3 concepts

**Adjusted tab** - Near-final billing tab that combines spend, fees, adjustments and notes.

**Batch tab** - A final tab for a specific OEM, non-OEM group or billing group.

**Batch file** - A separate workbook created from a batch tab and sent to DSS Billing.

**DSS Billing** - The team that receives batch files and actions invoice entries.

**Sort by AVIS / Salesforce ID / campaign type** - Sorting step used to group customer lines neatly in batch tabs.

**Manual billing batch** - A batch file containing special manual group tabs such as Cam Clark and Superior Auto Group.

**JLR combined file** - A batch file where multiple JLR tabs are combined into one file/email.

**Automobile on Direct** - Special group whose management fee is based on monthly group spend tier.

**VCC** - Special group where management fees are billed under head office AVIS accounts using placeholder rows.

**Placeholder row** - A kept row used for manual billing placement, such as head office management fee lines or credit adjustments.

**Double billing risk** - Risk of billing the same management fee twice if original store-level fee lines are not deleted after moving the fee to the head office line.

**Reconciliation file** - The final control file that compares raw data to batch totals after exclusions and adjustments.

**Credit adjustment** - A negative billing line used to reduce an invoice, often due to a retention offer or approved credit.

**Retention offer** - A customer retention deal such as a dollar credit, reduced management fee or temporary fee discount.

**Ongoing billing adjustments tracker** - A tracker for manual exceptions that last multiple months or until a balance is exhausted.

**Running credit balance** - A total credit amount used over time until it reaches zero.

**Revenue share / Rev share** - The split of a customer-facing OEM fee between TRFFK and the OEM/partner. A common example is 80/20.

**Customer-facing fee** - The fee percentage the dealer/customer ultimately sees.

**Partner-facing / billed-to-partner fee** - The amount TRFFK bills the OEM partner after revenue share is applied.

**80/20 example** - If the customer-facing fee is 20 percent and TRFFK keeps 80 percent, TRFFK bills 16 percent and the remaining 4 percent is the partner share.

**Salesforce as source of truth** - When DSS Billing or others have different records, billing usually goes by Salesforce and corrects Salesforce if an enrollment or fee setup is missing.