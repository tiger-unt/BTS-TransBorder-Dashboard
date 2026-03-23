# Chrome Extension Validation Prompt

Paste the prompt below into Claude Chrome Extension while on the BTS TransBorder data story page:
**https://data.bts.gov/stories/s/myhq-rm6q**

---

## Prompt

I need to validate data from my TransBorder freight database against the official BTS dashboard on this page. Please help me cross-check the following values. For each check, navigate the BTS dashboard filters to the specified combination and read the displayed value, then compare it to my database value.

### Check 1: US-Mexico Total Trade 2024
- **Filter**: Country = Mexico, Year = 2024, All modes, All commodities
- **My value**: Total trade (exports + imports) = $839.9 billion
- **Exports**: $334.0B, **Imports**: $505.9B
- Does the BTS dashboard show similar figures?

### Check 2: US-Canada Total Trade 2024
- **Filter**: Country = Canada, Year = 2024, All modes
- **My value**: Look for the total trade figure
- Does the BTS dashboard show this?

### Check 3: Laredo Port 2024
- **Filter**: Port = Laredo, Year = 2024, Country = Mexico
- **My value**: Total exports = $128.3 billion
- Does the BTS dashboard show a similar Laredo export figure?

### Check 4: Transportation Mode Breakdown (US-Mexico 2024)
- **Filter**: Country = Mexico, Year = 2024
- **Look for**: Trade by mode (Truck, Rail, Pipeline, Air, Vessel)
- **My values from DOT1**:
  - Truck should be the largest mode
  - Rail should be the second largest
- Does the ranking match?

### Check 5: Top Commodities (US-Mexico 2024)
- **Filter**: Country = Mexico, Year = 2024
- **Look for**: Top commodities by trade value
- **My expectation**: HS 87 (Vehicles) and HS 84 (Machinery) should be near the top
- Does the BTS dashboard confirm this?

### Check 6: Weight Caveat
- **Look for**: Any notes or footnotes about weight data availability
- **My understanding**: "Shipment weight for exports is only available for Air and Vessel modes"
- Does the BTS dashboard show this note?

### Check 7: El Paso / Ysleta Split
- **Look for**: Any notes about El Paso and Ysleta port separation
- **My understanding**: "CBP separated Ysleta from El Paso beginning March 2020"
- Does the BTS dashboard mention this?

### Check 8: Historical Total (2019, pre-COVID baseline)
- **Filter**: Year = 2019, Country = Mexico, All modes
- **My value**: Check total US-Mexico trade for 2019
- Does the BTS dashboard show a similar figure?

### Response Format
For each check, please tell me:
1. What value does the BTS dashboard show?
2. Does it match my value? (exact match, close match within 1%, or significant discrepancy)
3. Any additional notes or caveats shown on the dashboard that I should know about

If the dashboard doesn't have a specific filter or view for a check, just note that.
