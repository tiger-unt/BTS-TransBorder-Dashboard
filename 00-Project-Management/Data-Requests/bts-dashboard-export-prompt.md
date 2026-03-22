# BTS Dashboard Data Export — Claude Browser Prompt

Use this prompt in Claude's Chrome extension while on the BTS TransBorder dashboard.
Navigate to: https://data.bts.gov/stories/s/myhq-rm6q

---

## Prompt

I need to download missing monthly TransBorder freight data from this BTS Tableau dashboard. The data I need is organized by 3 separate dataset types (DOT1, DOT2, DOT3) and across 3 year/month gaps. Please help me navigate the dashboard and export the data.

### What I need

**Gap 1 — 2020 Oct, Nov, Dec (all 3 tables):**
- DOT1 (State x Port): columns TRDTYPE, USASTATE, DEPE, DISAGMOT, MEXSTATE, CANPROV, COUNTRY, VALUE, SHIPWT, FREIGHT_CHARGES, DF, CONTCODE, MONTH, YEAR
- DOT2 (State x Commodity): columns TRDTYPE, USASTATE, COMMODITY2, DISAGMOT, MEXSTATE, CANPROV, COUNTRY, VALUE, SHIPWT, FREIGHT_CHARGES, DF, CONTCODE, MONTH, YEAR
- DOT3 (Port x Commodity): columns TRDTYPE, DEPE, COMMODITY2, DISAGMOT, COUNTRY, VALUE, SHIPWT, FREIGHT_CHARGES, DF, CONTCODE, MONTH, YEAR

**Gap 2 — 2023 Sep, Oct, Nov, Dec (all 3 tables):**
- Same column structure as above for DOT1, DOT2, DOT3

**Gap 3 — 2009 Sep, Oct, Nov, Dec (DOT2 only):**
- DOT2 columns as listed above

### Instructions

1. Look at the dashboard page. Identify if there is a way to filter by year, month, and dataset type (Table 1/2/3 or DOT1/DOT2/DOT3).

2. For each gap listed above:
   a. Set the year and month filters
   b. Look for a "Download" or "Export" button (Tableau dashboards typically have a download icon in the bottom toolbar)
   c. Export as CSV
   d. If the dashboard only shows aggregated/summary data and not the raw record-level data, let me know — that means this approach won't work and we need to contact BTS directly.

3. Important things to check:
   - Does the exported data have MONTH as a column? (We need monthly granularity, not just annual totals)
   - Does it include all the columns listed above? (Especially DEPE for port codes, COMMODITY2 for commodity codes)
   - Are the values at the record level (individual trade records) or pre-aggregated summaries?

4. Save each export with a clear filename like:
   - `dot1_oct2020_dashboard.csv`
   - `dot2_sep2023_dashboard.csv`
   - etc.

5. If the dashboard doesn't support filtering by DOT table type (1/2/3), try to determine from the available columns which table type the data corresponds to:
   - If it has both USASTATE and DEPE but no COMMODITY2 → DOT1
   - If it has both USASTATE and COMMODITY2 but no DEPE → DOT2
   - If it has both DEPE and COMMODITY2 but no USASTATE → DOT3

### If this approach fails

If the dashboard only provides high-level visualizations without record-level export capability, please tell me and I will email BTS directly to request the raw data files.
