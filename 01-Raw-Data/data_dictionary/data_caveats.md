# Data Caveats & Limitations

Authoritative reference for all known limitations, structural breaks, and field-level gaps in the normalized TransBorder database (1993–2025). Use this document when building dashboard footnotes, writing the About Data page, or interpreting analytical results.

**Audience**: Dashboard developers (Phase 3), researchers using processed data, project documentation.

**Source of truth**: All claims verified against actual DBF/CSV file contents and BTS README files (2026-03-22/23). See `legacy-to-modern-mapping.md` (in this same folder) for column-level mapping detail.

---

## 1. Structural Breaks in the Time Series

The database spans 33 years (1993–2025), but it is **not a homogeneous panel**. Three structural boundaries affect what data is available:

| Boundary | Date | What Changed |
|---|---|---|
| **TransBorder launch** | April 1993 | Dataset begins. Surface modes only (truck, rail, pipeline, mail, other, FTZ). |
| **Air/vessel added** | November 2003 | AV tables (AV1–AV12) introduced air and vessel freight. Before this, air/vessel trade is **not in TransBorder at all**. |
| **Major consolidation** | January 2007 | Legacy tables (up to 24 files) consolidated into 3 unified DOT tables. All modes, countries, and trade directions in single files. |

### Dashboard implication
A "total trade by mode" time series will show air and vessel modes appearing to start from zero in November 2003. This is a **data boundary, not a real trend**. Charts must either annotate this or constrain the year range.

### Dashboard year-range strategy (decided 2026-03-23)

Given these structural breaks and the field-level gaps documented below, the dashboard uses a **split approach**:

- **Overview page** (`usTransborder`): Shows **all years (1993–2025)** at the Year/Country/Mode/TradeType aggregation level. Legacy data is reliable for trade value totals at this grain. The 33-year LineChart tells the full story.
- **All detail pages** (ports, commodities, states, monthly): Show **2007+ only**, starting at the January 2007 consolidation boundary. This avoids exposing legacy-era NULL fields (weight/freight for exports), the Nov 2003 air/vessel discontinuity, the 1993 commodity code ambiguity, and the missing surface DOT3 data in drill-down charts.
- **Trade by Mode page** uses `usTransborder` (all years) but adds a footnote about the Nov 2003 air/vessel boundary.

This is enforced in `02-Data-Staging/Scripts/05_build_outputs.py`: the `MODERN_START_YEAR = 2007` constant applies a `WHERE "Year" >= 2007` filter to all detail datasets. Only `us_transborder` queries all years.

---

## 2. Table-Specific Time Coverage

| Table | Surface Modes | Air/Vessel Modes | Combined |
|---|---|---|---|
| **DOT1** (State x Port) | 1993–2025 | Nov 2003–2025 | Full only from Nov 2003 |
| **DOT2** (State x Commodity) | 1993–2025 | Nov 2003–2025 | Full only from Nov 2003 |
| **DOT3** (Port x Commodity) | **2007–2025 only** | Nov 2003–2025 | Full only from 2007 |

### Why DOT3 has no surface data before 2007
Legacy D-tables never cross-tabulated port and commodity in a single table. You could query by port (D05/D06/D11/D12) or by commodity (D03/D04/D09/D10), but **never both dimensions together at the record level**. Air/vessel Port x Commodity data exists from Nov 2003 via AV tables (AV4/6/10/12).

### Dashboard implication
Any chart showing "what commodities flow through [port]" (DOT3-sourced) can only go back to 2007 for surface modes, or Nov 2003 for air/vessel. The year slider or a "data not available" marker must enforce this.

---

## 3. Field Availability Gaps (Export vs. Import Asymmetry)

Legacy export tables (D03–D06) carried fewer fields than import tables (D09–D12). This creates **systematic NULLs** in the normalized database for pre-2007 exports:

| Field | Exports (1993–2006) | Imports (1993–2006) | 2007+ (all) |
|---|---|---|---|
| **SHIPWT** (weight) | NULL (surface); available (AV exports, Nov 2003+) | Available | Available |
| **CONTCODE** (containerization) | NULL | Available | Available |
| **FREIGHT_CHARGES** | NULL (Mexico exports); partial (Canada exports via D04/D06 `FREIGHT`) | Available (all imports via `CHARGES`) | Available |

Additionally, BTS confirms that **surface export weight is zero/unavailable for all years (1993–2025)** — weight for exports is only recorded for air and vessel modes. This is not a legacy-only issue; it applies to the entire dataset.

### Dashboard implication
- Weight-based analysis (tonnage trends, value-per-ton) is **import-only for surface modes** across the full dataset.
- Freight cost analysis is heavily skewed toward imports before 2007.
- Any chart displaying export weight for surface modes should show "N/A" or a footnote: *"Export weight available for Air & Vessel modes only."*

---

## 4. October 2020: Derived, Not Observed

The raw file for October 2020 is missing from BTS (confirmed by BTS contact Sean Jahanmir). October values were **derived via subtraction**:

```
Oct 2020 = Annual Aggregates − (Jan–Sep YTD) − Nov − Dec
```

Verification: zero negative values across all 3 tables (DOT1: 26,790 rows, DOT2: 74,243, DOT3: 17,259). The method is sound, but these ~118K rows are calculated, not from a raw source file.

### Dashboard implication
October 2020 data is analytically valid but should be flagged in metadata. If Census ever provides the raw file, it should replace the derived values and the pipeline re-run.

---

## 5. Geographic Caveats

### 5.1 Port History: Ysleta / El Paso Split

Customs and Border Protection separated the Ysleta Port of Entry from the El Paso Port of Entry beginning with **March 2020** data. Historical data before March 2020 includes Ysleta activity under El Paso.

**Dashboard implication**: Time-series comparisons for El Paso and Ysleta must note the split. Pre-March 2020 El Paso values include Ysleta; post-split values do not.

### 5.2 D5B/D6B Exclusion (NTAR Regions)

D5B and D6B tables (1994–2002) used NTAR (89 multicounty exporter regions) instead of state codes. These are **excluded from the normalized database** because NTAR is incompatible with DOT1's state x port structure. D5A/D6A cover the same export flows with proper state geography.

**Impact**: "State of Exporter" geography for port-level exports (1994–2002) is not in the database. Only "State of Origin" (D5A/D6A) is preserved. Minor loss — the two measures differ only in where BTS attributes the export (consolidation point vs. exporter address).

### 5.3 BTS Geographic Terminology

| Term | BTS Definition |
|---|---|
| **Port State** | The U.S. state where the Port of Entry is located |
| **Port Coast** | The U.S. coast where the Port of Entry is located |
| **Port Border** | The border (Canadian or Mexican) where the Port of Entry is located |

Use these terms consistently in the dashboard and define them on the About Data page.

### 5.4 Baja California Code Error

`MEXSTATE = 'BN'` (Baja California Norte) was used erroneously from April 1994 to May 1998 in the raw data. The correct code is `'BC'`. The normalizer corrects this during processing.

---

## 6. Commodity Code Caveats

### 6.1 HS 2-Digit Codes Throughout

TransBorder uses **HS (Harmonized Schedule) 2-digit codes** for the entire 1993–2025 period. This is NOT SCTG (Standard Classification of Transported Goods), which is a different system used by the Commodity Flow Survey.

### 6.2 1993 Commodity Codes May Be Aggregated

1993 data uses `SCH_B_GRP` and `TSUSA_GRP` column names instead of `SCH_B`/`TSUSA`. These may represent **grouped/aggregated commodity codes** rather than individual HS 2-digit codes. If the grouping differs from 1994+ codes, commodity trend analysis starting from 1993 may have a first-year discontinuity.

**Status**: Not yet verified against actual 1993 data values. Low priority — affects only 9 months of data.

### 6.3 Export vs. Import Commodity Nomenclature

- Export tables use `SCH_B` (Schedule B — export classification)
- Import tables use `TSUSA` (Tariff Schedule USA — import classification)
- Both are HS 2-digit codes in practice; the normalizer maps both to `COMMODITY2`

---

## 7. Other Field-Level Notes

| Field | Note |
|---|---|
| **DF** (Domestic/Foreign) | Only meaningful for exports: 1 = domestic origin, 2 = re-export/foreign origin. NULL for imports in modern data. |
| **CONTCODE** (Containerization) | 0 = not containerized, 1 = containerized, X = not applicable/unknown. Pipeline always 0 or X. NULL for surface exports pre-2007. |
| **COUNT** (Transaction count) | Present in raw data 1993–1996 only, dropped by BTS in 1997. **Not preserved** in the normalized database. Minor loss — not needed for value/weight analysis. |

---

## 8. Completeness Summary

| Dimension | Coverage | Gap |
|---|---|---|
| **Years** | 1993–2025 (33 years, all 12 months each) | None — Oct 2020 derived |
| **Countries** | Canada + Mexico | Complete |
| **Trade direction** | Export + Import | Complete (derived from table number for legacy) |
| **Transport modes** | Surface: 1993–2025; Air/Vessel: Nov 2003–2025 | Air/vessel not in TransBorder before Nov 2003 |
| **DOT1** (State x Port) | 1993–2025 | Weight/freight NULL for surface exports |
| **DOT2** (State x Commodity) | 1993–2025 | Weight/freight NULL for surface exports |
| **DOT3** (Port x Commodity) | Surface: 2007–2025; AV: Nov 2003–2025 | No surface Port x Commodity before 2007 |

---

## 9. Required Dashboard Footnotes

These footnotes are **not optional** — they match what BTS shows on their own dashboard and are critical for correct interpretation.

| Where | Footnote |
|---|---|
| Any chart showing **export weight** (surface modes) | "Shipment weight for exports is available for Air & Vessel modes only. Surface export weight is not recorded." |
| Any chart showing **freight charges** | "Freight charge data is near-complete for imports but only partially available (~50%) for exports." |
| Any chart showing **mode breakdown** pre-Nov 2003 | "Air and vessel freight data was added to TransBorder in November 2003. Totals before this date reflect surface modes only." |
| Any chart using **DOT3** (port x commodity) | "Port x Commodity data is available from January 2007 (surface) and November 2003 (air/vessel). Earlier years did not cross-tabulate port and commodity." |
| **El Paso** or **Ysleta** time series | "Ysleta was separated from El Paso beginning March 2020. Pre-2020 El Paso values include Ysleta activity." |
| **October 2020** data points | "October 2020 values were derived from annual aggregates minus other months. The original monthly file is unavailable from BTS." |
| Any chart showing **weight trends over time** | "Pre-2007 weight data reflects imports only (export weight unavailable for surface modes in legacy data)." |

---

## 10. Pipeline Re-Run Status

**As of 2026-03-23**: The 12 critical fixes documented in the gap tracker have been coded into `03_normalize.py` but the full pipeline has **not yet been re-run**. The current database and output files still reflect the pre-fix normalization.

**What the current DB contains that it shouldn't**:
- ~1.4M malformed D5B/D6B rows with blank state fields

**What the current DB is missing**:
- S-suffix files (12 files from 1993–early 1994)
- AV table data (Nov 2003–Dec 2006 air/vessel)
- R-file corrections for Jan–Mar, Jul 1995
- May 1994 Mexico imports (DO9 typo file)

**Required**: Run `03_normalize.py` → `04_create_db.py` → `05_build_outputs.py` → `06_validate.py` to produce a corrected database.
