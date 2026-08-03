**Traffic Billing SOP - Master Working Checklist**

**1\. Receive and Confirm Raw Data Files**

☐ Confirm that Justin has sent all required monthly raw data files.

☐ Confirm receipt of the following applicable files:

- Google
- Bing
- TikTok
- Facebook Canada
- Facebook US
- Social Canada
- Social US
- Pacing Report
- Any additional platform files required for the billing month

☐ Do not begin processing until all required files have been received.

**2\. Validate Traffic Data in Every Raw Data File**

Complete this check for every applicable raw data file.

☐ Open the raw data file.

☐ Locate the **Traffic Name** column.

☐ Apply a filter to the Traffic Name column.

☐ Search for the keyword **TRFFK**.

☐ Apply the condition:

**Text Does Not Contain → TRFFK**

☐ Review whether any records appear.

- If no records appear, confirm that the file contains only TRFFK Traffic data.
- If records appear, investigate the non-TRFFK records before continuing.

☐ Clear the previous filter.

☐ Search for **TRFFK** again.

☐ Filter the file so that only TRFFK records are displayed.

☐ Confirm that only Traffic billing data is visible before copying the data.

**3\. Copy Raw Data into the Monthly Accrual Report**

☐ Open the **Monthly Accrual Report**.

☐ Process one raw data platform at a time.

☐ Within each platform, process one campaign type at a time.

For each campaign type:

☐ Filter the raw file to show only the required campaign type.

☐ Copy all applicable campaign records.

☐ Open the matching campaign tab in the Monthly Accrual Report.

☐ Paste the data into the correct tab.

☐ Confirm that all rows have been copied successfully.

Complete this process for applicable campaign types such as:

☐ Search

☐ Performance Max

☐ Video

☐ Geofencing

☐ Reddit

☐ Shopping

☐ Other applicable campaign types

**Performance Max Classification**

☐ Always include **Shopping campaign data under Performance Max**.

**4\. Review Delta Differences in the Monthly Accrual Report**

After all raw data has been entered:

☐ Review the **Delta** column in every applicable tab.

☐ Identify all large or unusual differences.

☐ Investigate every significant Delta before moving forward.

☐ Confirm whether the difference is caused by:

- A missing account
- An incorrect source file
- A US account
- An account-name mismatch
- Incorrect spacing
- A missing campaign
- An incorrect formula reference

☐ Do not continue until every major difference has been explained or corrected.

**5\. Validate Search Campaign Differences**

☐ Open the **Search** tab in the Monthly Accrual Report.

☐ Review the Search Pivot Table.

☐ Check the Account Name field for accounts containing **US**.

For every US account:

☐ Click the affected Pivot Table cell.

☐ Review the formula in the Formula Bar.

☐ Confirm whether the formula is extracting information from the correct source:

- TRFFK Canada file
- TRFFK US file

☐ Correct the formula or add the required US reference where necessary.

☐ Recalculate or refresh the data.

☐ Confirm that the Delta has been corrected.

**6\. Validate Social Campaign Differences**

☐ Open the Social campaign tab.

☐ Locate the **Bills Toyota** account.

☐ Check the exact account-name formatting.

☐ Look for extra, missing, or incorrect spaces in the account name.

☐ Correct the spacing where required.

☐ Recheck the Delta after correcting the account name.

**7\. Validate Performance Max Differences**

☐ Open the **Performance Max** tab.

☐ Review the Performance Max Pivot Table.

☐ Check for US accounts.

☐ Review formulas for US accounts.

☐ Confirm that every formula references the correct TRFFK Canada or TRFFK US source.

☐ Correct any incorrect source references.

☐ Refresh the calculations.

☐ Confirm that the Delta differences have been corrected.

☐ Confirm again that Shopping campaign data has been included under Performance Max.

**8\. Classify Nissan and Infiniti Campaigns**

After filling the raw data and reviewing the initial differences:

☐ Open the Pivot Tables in the Monthly Accrual Report.

☐ Open the **OEM Program** section.

☐ Go to **Column G**.

☐ Filter for **Nissan and Infiniti** accounts.

Nissan and Infiniti should only use the campaign classifications:

- New
- Used

Apply the following classification rules:

☐ If the campaign says **Parts and Service**, classify it as **Used**.

☐ If the campaign says **Conquest**, classify it as **New**.

☐ If the campaign contains a vehicle model name, classify it as **New**.

☐ If the campaign says **Static**, classify it as **New**.

☐ If the campaign says **Ongoing**, classify it as **New**.

☐ If the campaign says **Test Drive**, classify it as **New**.

☐ If the campaign contains **Rogue**, classify it as **New**.

☐ If the campaign contains **Kicks**, classify it as **New**.

☐ Review all Nissan and Infiniti records and confirm that every campaign is classified as either New or Used.

**9\. Classify GM and Cadillac Campaigns**

☐ In the same OEM Program section, remain in **Column G**.

☐ Clear the Nissan and Infiniti filter.

☐ Filter for **GM and Cadillac** accounts.

GM and Cadillac should use the classifications:

- New
- Used
- CPO

Apply the following classification rules:

☐ If the campaign says **Acquisition**, classify it as **Used**.

☐ If the campaign contains **2026** or the applicable current/new model year, classify it as **New**.

☐ If the campaign says **Parts and Service**, classify it as **Used**.

☐ If the campaign says **Static**, classify it as **New**.

☐ If the campaign already says **New**, classify it as **New**.

☐ If the campaign says **Service New**, classify it as **Used**, because it is a servicing campaign.

☐ If the campaign says **Promo Event 2026**, classify it as **New**.

☐ Review the remaining GM and Cadillac campaigns and classify them as New, Used, or CPO as required.

**10\. Complete OEM Program Validation**

After completing the Nissan, Infiniti, GM, and Cadillac classifications:

☐ Review all checks in the **OEM Program** tab.

☐ Filter the validation columns to identify any red flags or red checks.

☐ Investigate every red validation result.

☐ Confirm that the **Activity Month** is correct.

☐ Confirm that the **End Date** is correct.

☐ Review the date or month value in **Cell AC1**.

☐ Confirm that Cell AC1 reflects the correct billing or activity month.

☐ Resolve all significant OEM Program errors before proceeding.

**11\. Update the Account Data Sheet from Salesforce**

☐ Open the second sheet named **Account Data**.

☐ Use the Salesforce report link available in the sheet.

☐ Open the Salesforce report.

☐ Export the report in both formats:

- CSV
- XLS

**Copying the Salesforce Data**

☐ Copy all applicable non-date data from the **CSV export**.

☐ Do not copy the date values from the CSV export.

☐ Copy the date values from the **XLS export**.

☐ Paste the data into the matching columns in the Account Data sheet.

☐ Confirm that all columns align correctly.

☐ Confirm that the date columns were populated using the XLS file.

**12\. Review Red Rows after Updating Account Data**

☐ After pasting the Salesforce Account Data, review the raw-data validations.

☐ Confirm that most red rows have disappeared.

☐ Investigate any remaining red rows.

☐ Determine whether the remaining red rows are caused only by penny-level differences.

☐ Ignore only the rows that are confirmed to be caused by pennies.

☐ Do not ignore material red differences.

**13\. Update the Duped ID Data Sheet**

☐ Open the third sheet named **Duped ID Data**.

☐ Open the separate Salesforce report used for duplicated ID data.

☐ Export or download the Salesforce report.

☐ Before copying, compare the Salesforce report columns with the Duped ID Data sheet.

☐ Confirm that the **Field** column in the report matches the corresponding column in the destination sheet.

☐ Locate the **Case Notes** column in the Salesforce report.

☐ Confirm that the Case Notes column is not present in the destination sheet.

☐ Remove or exclude the Case Notes column before copying the data.

☐ Confirm that the remaining Salesforce columns align with the destination sheet.

☐ Copy and paste all applicable data into the Duped ID Data sheet.

☐ Refresh the workbook after updating the data.

☐ Review the reports for any remaining errors.

**14\. Handle Penny-Level Salesforce ID Records**

☐ Filter the applicable penny-related report or validation area.

☐ Identify the rows caused by penny-level differences.

☐ Copy the Salesforce Account IDs for the confirmed penny records into a temporary separate file or area.

☐ Clear the penny filter.

☐ Paste the copied Salesforce Account IDs into the designated green-bar exclusion area in the same penny report.

☐ Confirm that these approved penny records are no longer being picked up as exceptions.

**15\. Update the Pacing Report in Step 3.1**

☐ Open the **Step 3.1 Pacing** tab in the main Traffic Billing workbook.

☐ Update the applicable date or month in the Step 3.1 date cell.

☐ Confirm that the month is correct before loading new Pacing data.

☐ Delete the previous month's data from the Step 3.1 Pacing tab.

☐ Open the Pacing Report received from Justin.

☐ Locate the **TRFFK Status** column.

☐ Filter the TRFFK Status column for the required statuses:

- Partial
- Ongoing
- Paused
- Applicable flagged records

☐ Copy all filtered Pacing Report data.

☐ Paste the data into the **Step 3.1 Pacing** tab.

☐ Confirm that Paused records have also been included where required.

**16\. Add US Accounts to the Pacing Tab**

☐ In the Pacing Report, filter for US accounts.

☐ Copy all applicable US account records.

☐ Paste the US account records into the Step 3.1 Pacing tab.

☐ Update or label the account/source value as **TRFFK US** where required.

☐ Confirm that Canadian and US accounts can be identified separately.

**17\. Refresh the Step 3 Overbudget Pivot**

☐ Refresh the **Step 3 Pivot Overbudget** section.

☐ Review the formula in the right-side validation column.

☐ Confirm that the formula has filled down for all new records.

☐ Correct or extend the formula if it has not picked up every row.

☐ Review the Overbudget Pivot results.

**18\. Update the Step 3.2 Overbudget Table**

☐ Open the **Step 3.2 Overbudget Table**.

☐ Delete the old data from the applicable input area, including the old data in Columns G to I where applicable.

☐ Return to the Step 3 Overbudget Pivot.

☐ Filter the Pivot Table to show **Overbudget accounts only**.

☐ Copy the filtered Overbudget records.

☐ Paste the records into the Step 3.2 Overbudget Table.

☐ Confirm that only Overbudget accounts were copied.

**19\. Prepare and Send the Overbudget File**

☐ Open the separate Overbudget file.

☐ Copy the required data from the Step 3.2 Overbudget Table.

☐ Copy the required range, including the applicable data from approximately Columns E to AE.

☐ Paste the data into the Overbudget file.

☐ Update the sheet name to the current billing month.

☐ Review the final file for missing accounts or columns.

☐ Send the Overbudget file to all Strategists.

☐ Use the Strategist recipient list from the previous email.

☐ Refer to Bimal's previous email to confirm the complete recipient list.

**20\. Add Strategist Comments to the Overbudget Table**

After receiving feedback from the Strategists:

☐ Review every Strategist response.

☐ Open the Step 3.2 Overbudget Table.

☐ Add the Strategist comments or results into **Column AJ**.

☐ Match each comment to the correct account.

☐ Confirm that all Overbudget accounts have an updated comment or status.

**21\. Build the TRFFK Rollup**

**Non-OEM Data**

☐ Open the Step 3 Pivot TRFFK section.

☐ Filter the OEM Program value to **0**.

☐ Confirm that this filter selects Non-OEM program records.

☐ Copy all filtered Non-OEM data.

☐ Paste the data into the **Step 4 TRFFK Rollup** sheet.

**OEM Data**

☐ Open the Step 2.1 OEM Program Pivot.

☐ Filter the OEM Program field to include all applicable OEM records and exclude 0.

☐ Copy all filtered OEM data.

☐ Paste the OEM data into the Step 4 TRFFK Rollup sheet.

☐ Confirm that the TRFFK Rollup now contains both:

- OEM data
- Non-OEM data

**22\. Add Overbudget Comments to the TRFFK Rollup**

☐ Filter the TRFFK Rollup to identify accounts that are Overbudget.

☐ Use the Step 3.2 Overbudget Table to obtain the corresponding account IDs.

☐ Match the Overbudget accounts to the TRFFK Rollup.

☐ Add the applicable Overbudget comments into **Column P** of the TRFFK Rollup.

☐ Confirm that each Overbudget account has the correct comment.

**23\. Update the Management Fee Data**

☐ Open the **TRFFK Management Fee Intake File**.

☐ Open the **Special Terms** information, where applicable.

☐ Copy the required management-fee and special-term data.

☐ Paste the data into **Step 5.1 Management Fee Data**.

☐ Confirm that all required rows and columns have been copied.

☐ Refresh the Pivot Table in **Step 5A Management Fee Calculator**.

**24\. Filter OEM Data in the Management Fee Calculator**

☐ Open the Step 5A Management Fee Calculator.

☐ Filter for OEM data.

☐ Exclude OEM Program value **0**.

☐ Exclude **FCA**.

☐ Turn off or exclude penny-level records.

☐ Confirm that only applicable OEM management-fee records remain.

**25\. Resolve Management Fee Errors**

☐ Review the management-fee validation columns.

☐ Check for zero values or missing fee values in the applicable validation column, including Column X where applicable.

☐ Investigate every zero or missing management fee.

☐ Review the Management Fee Intake File for:

- Missing fee information
- Incorrect account information
- Special-term issues
- Legacy fee arrangements

☐ Use the previous month's billing file as a reference where needed.

☐ Resolve every material management-fee issue before continuing.

**26\. Create the Step 5.2 Fee Dump Clean Data**

After completing the management-fee adjustments:

☐ Copy the applicable Pivot Table data from **Column A through Column X**.

☐ Open **Step 5.2 Fee Dump Clean**.

☐ Paste the copied Pivot Table data into the Step 5.2 sheet.

☐ Locate the column named **Total**.

☐ Locate the column named **Type of Spend**.

☐ Remove all unwanted columns beginning with Total and continuing up to, but not including, Type of Spend.

☐ Confirm that the Type of Spend column remains in the final data.

☐ Confirm that OEM Program value 0 was excluded.

☐ Confirm that FCA was excluded.

☐ Confirm that penny-level records were excluded.

**27\. Create the 6A Adjusted Other OEM Data**

☐ Return to the **Step 4 TRFFK Rollup**.

☐ Filter for OEM records.

☐ Exclude OEM Program value 0.

☐ Exclude FCA.

☐ Remove penny-level records.

☐ Copy the complete applicable data through the Total column.

☐ Open **Step 6A Adjusted Other OEM**.

☐ Paste the TRFFK Rollup OEM data into the Step 6A sheet.

☐ Copy the clean management-fee data from Step 5.2 Fee Dump Clean.

☐ Paste the Step 5.2 data below the previously pasted OEM data in Step 6A.

☐ Confirm that no FCA records are present in Step 6A Adjusted Other OEM.

**28\. Complete the 6A Validation Checks**

☐ Review every validation/check column in Step 6A Adjusted Other OEM.

☐ Filter the validation columns for **False** results.

☐ Pay particular attention to False results highlighted in red.

☐ Select and review all False checks.

☐ Investigate each red False result.

☐ Correct the source data, formula, management fee, or classification causing the False result.

☐ Refresh or recalculate the checks after making corrections.

☐ Confirm that all material validation checks return True before continuing.

**29\. Prepare Individual OEM Batch Data**

☐ Remain in Step 6A Adjusted Other OEM.

☐ Filter one OEM batch at a time.

Example:

☐ Filter the applicable batch indicator for Mitsubishi.

☐ Copy all Mitsubishi records.

☐ Paste them into the Mitsubishi individual batch tab or file.

☐ Repeat the same process for every applicable OEM batch.

☐ Process the new batches last.

**30\. Validate OEM Management Fees before Finalizing Batches**

Before finalizing each OEM batch:

☐ Review how much management fee was charged previously.

☐ Refer to the previous fee information sent by Ryan.

☐ Use Bimal's email as the source for the previous fee reference.

☐ Compare the current management fee with the previous month.

☐ Investigate any unexpected fee change.

**31\. Validate O'Regan Cadillac**

☐ Locate **O'Regan Cadillac** in the Management Fee Data tab.

☐ Confirm that the **GM/CAD** indicator is marked correctly.

☐ Confirm that the required indicator contains **X**, where applicable.

☐ Review the OEM Legacy Dealers tab in the Management Fee Intake File.

☐ Confirm the correct AutoSync fee rate.

☐ Check whether the Salesforce Account ID has changed.

☐ Compare the Account ID against the applicable activity or historical tab.

☐ Always verify the updated Account ID for O'Regan Cadillac.

If the fee or ID is not correct:

☐ Manually update the management fee in the final column of Step 5.1 Management Fee Data according to the AutoSync fee.

☐ Manually update the applicable account total in Step 6A.

☐ Confirm that the validation checks now pass.

**32\. Review Other-Month Fee Differences**

☐ Compare the current fee with the fee communicated in Bimal's or Ryan's email.

☐ Check whether the current-month fee is different from the approved/reference fee.

☐ Update the fee in Step 6A where required.

☐ Document any manual adjustment.

**33\. Create the 6D Adjusted Non-OEM Data**

☐ Return to the Step 4 TRFFK Rollup.

☐ Filter the OEM Program value to **0**.

☐ Confirm that only Non-OEM records are selected.

☐ Copy all filtered Non-OEM data.

☐ Open **Step 6D Adjusted Non-OEM**.

☐ Paste the Non-OEM TRFFK Rollup data into the Step 6D sheet.

☐ Open Step 5A Management Fee Calculator.

☐ Filter for OEM Program value 0.

☐ Exclude penny-level records.

☐ Copy the applicable Non-OEM management-fee data.

☐ Paste the management-fee data below the TRFFK data in Step 6D.

**34\. Prepare Individual Non-OEM Batch Data**

☐ Use the Step 6D Adjusted Non-OEM data to prepare the individual Non-OEM batch tabs.

☐ Copy one Non-OEM batch at a time.

☐ Paste each batch into its appropriate individual tab or file.

**Kia Non-OEM**

☐ Use the purple Pivot Table tab named **Kia (Non-OEM)** to identify and copy the Kia batch data.

☐ Copy the applicable Kia management-fee adjustment from the Adjusted Non-OEM data.

☐ Paste the Kia management-fee data into the appropriate Kia batch file or tab.

☐ Confirm that the Kia batch includes both the billing data and the applicable management-fee adjustment.

**35\. Prepare Final Individual Batch Files**

☐ Separate every individual OEM batch into its required individual sheet or workbook.

☐ Separate every individual Non-OEM batch into its required individual sheet or workbook.

☐ Save OEM batch files in the OEM folder.

☐ Save Non-OEM batch files separately in the appropriate Non-OEM location.

☐ Confirm that every expected batch file has been created.

**Kia Workbook Requirement**

☐ Always break external workbook links in the Kia file before sending it.

☐ Confirm that the Kia workbook no longer contains external links.

**36\. Final File Review**

Before sending the batch files:

☐ Confirm that all OEM batches are complete.

☐ Confirm that all Non-OEM batches are complete.

☐ Confirm that the management fees are correct.

☐ Confirm that there are no unresolved False checks.

☐ Confirm that FCA is not present in Step 6A Adjusted Other OEM.

☐ Confirm that penny-level exceptions were handled correctly.

☐ Confirm that all manual adjustments are reflected in the final files.

☐ Confirm that workbook links have been broken for Kia.

☐ Confirm that the file names and billing month are correct.

**37\. Send the Final Batch Files**

☐ Send the completed batch files to **Ryan**.

☐ CC **Gagan Roop**.

☐ CC **Duska Adzovic**.

☐ Review Bimal's previous email before sending.

☐ Confirm whether any additional recipients from Bimal's email must be included.

☐ Attach all required OEM and Non-OEM files.

☐ Verify the attachments before sending.

**Common Mistakes to Avoid**

- Do not start processing until all required raw data files have been received.
- Always verify that only Traffic data is included before importing.
- Never ignore large Delta values; investigate them immediately.
- Always check formulas for US accounts to ensure they reference the correct Traffic or Traffic US file.
- Watch for spacing inconsistencies in account names, especially **Bills Toyota**.
- Always classify Shopping campaign data under **Performance Max**.
- Complete all validation steps before moving to the next phase.
- Never proceed to the next stage while unresolved discrepancies remain.
- Do not classify Nissan or Infiniti campaigns outside the approved New and Used categories.
- Always review GM and Cadillac campaigns for the correct New, Used, or CPO classification.
- Do not forget to check the Activity Month, End Date, and Cell AC1 in the OEM Program tab.
- Do not copy Salesforce dates from the CSV export; use the XLS export for date values.
- Always remove or exclude the Case Notes column before copying the Duped ID Salesforce report.
- Do not ignore material red rows by assuming they are pennies.
- Always delete the previous month's data before importing the new Pacing Report.
- Do not forget to include the required Paused or flagged Pacing records.
- Always label US Pacing accounts correctly as TRFFK US.
- Do not send the Overbudget file before confirming that it contains Overbudget accounts only.
- Always add Strategist responses to Column AJ of the Step 3.2 Overbudget Table.
- Do not mix OEM and Non-OEM filters when creating the TRFFK Rollup.
- Always exclude 0, FCA, and penny-level records when preparing applicable OEM management-fee data.
- Do not remove the Type of Spend column when cleaning the Step 5.2 Fee Dump.
- Never allow FCA records to remain in Step 6A Adjusted Other OEM.
- Do not proceed while red False validation checks remain unresolved.
- Always compare current management fees against the previous approved fees.
- Always verify the O'Regan Cadillac Account ID and AutoSync fee.
- Do not forget to process new batches last.
- Always break external workbook links in the Kia file before sending.
- Always send the final files to Ryan and CC Gagan Roop and Duska Adzovic.
- Always use the Strategist recipient list from the previous email when sending the Overbudget file.