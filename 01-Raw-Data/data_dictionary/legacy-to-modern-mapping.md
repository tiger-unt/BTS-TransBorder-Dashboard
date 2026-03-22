# Legacy-to-Modern Data Mapping

This document compares the legacy (1993–2006) and modern (2007–2025) TransBorder freight data formats, documents every column mapping, and identifies what information is gained or lost during normalization.

**Official BTS reference:** See `Historical and current data format comparison.xlsx` (in this same folder) for the BTS-published mapping of which old tables consolidated into the 3 new DOT tables. This markdown expands on that with column-level detail, caveats, and data loss analysis.

## 1. Table Structure Comparison

### Modern (2007–2025): 3 Tables

In January 2007, BTS consolidated all legacy tables into 3 unified tables. The "DOT" prefix stands for **Department of Transportation**. Each table represents a different cross-tabulation of trade dimensions:

| Table | Full Name | What It Answers | Key Dimensions | Columns (14/14/12) |
|-------|-----------|-----------------|----------------|---------------------|
| **DOT1** | Surface Table 1: State × Port | "How much trade flows through each port, broken down by state?" | USASTATE + DEPE (port code) | TRDTYPE, USASTATE, DEPE, DISAGMOT, MEXSTATE, CANPROV, COUNTRY, VALUE, SHIPWT, FREIGHT_CHARGES, DF, CONTCODE, MONTH, YEAR |
| **DOT2** | Surface Table 2: State × Commodity | "What commodities does each state trade?" | USASTATE + COMMODITY2 (HS 2-digit) | TRDTYPE, USASTATE, COMMODITY2, DISAGMOT, MEXSTATE, CANPROV, COUNTRY, VALUE, SHIPWT, FREIGHT_CHARGES, DF, CONTCODE, MONTH, YEAR |
| **DOT3** | Surface Table 3: Port × Commodity | "What commodities flow through each port?" | DEPE + COMMODITY2 | TRDTYPE, DEPE, COMMODITY2, DISAGMOT, COUNTRY, VALUE, SHIPWT, FREIGHT_CHARGES, DF, CONTCODE, MONTH, YEAR |

Each table contains **all countries** (Canada + Mexico), **all trade directions** (export + import), and **all transport modes** (surface + air/vessel + pipeline) in a single file. The `TRDTYPE` column distinguishes export (1) vs import (2), and `COUNTRY` distinguishes Canada (1220) vs Mexico (2010).

**Key difference between tables:** DOT1 has port but no commodity. DOT2 has commodity but no port. DOT3 has both port and commodity but no state. You cannot get all three dimensions (state + port + commodity) from any single table.

### Legacy (1993–2006): Up to 24 Tables

Before January 2007, the data was split into many separate tables. Instead of using columns to distinguish country, trade direction, and transport mode, these were encoded into **separate files**.

The legacy table numbering system uses **D-prefix numbers** that correspond to specific cross-tabulations. The table numbers represent the following concepts:

**Surface trade tables (D03–D06):**

| Table | Description | Dimensions | Modern Equivalent |
|-------|-------------|------------|-------------------|
| **D03** | Commodity × Mexican State (surface) | Mode, Commodity, MexState | DOT2 (Mexico subset, surface modes) |
| **D04** | Commodity × Canadian Province (surface) | Mode, Commodity, Province | DOT2 (Canada subset, surface modes) |
| **D05** | State × Port — Mexico (surface) | Mode, State, Port, MexState | DOT1 (Mexico subset, surface modes) |
| **D06** | State × Port — Canada (surface) | Mode, State, Port, Province | DOT1 (Canada subset, surface modes) |

**Air/vessel trade tables (D09–D12):**

| Table | Description | Dimensions | Modern Equivalent |
|-------|-------------|------------|-------------------|
| **D09** | Commodity × State (air/vessel, no province) | Mode, Commodity, State, ContCode | DOT2 (air/vessel modes, no province detail) |
| **D10** | Commodity × State × Province (air/vessel) | Mode, Commodity, State, Province, ContCode | DOT2 (air/vessel modes, with province) |
| **D11** | State × Port (air/vessel, no province) | Mode, State, Port, ContCode | DOT1 (air/vessel modes, no province) |
| **D12** | State × Port × Province (air/vessel) | Mode, State, Port, Province, ContCode | DOT1 (air/vessel modes, with province) |

**Why the surface/air split?** Surface tables (D03–D06) do not have `CONTCODE` (containerization), `SHIPWT` (weight), or `FREIGHT_CHARGES`. Air/vessel tables (D09–D12) carry these additional fields. The 2007 consolidation unified both into single tables that include all fields (with blanks where not applicable).

Legacy tables are further split along **three axes encoded in the filename**, not in columns:

**Table number** (what dimensions are crossed):

| Table | Description | Modern Equivalent |
|-------|-------------|-------------------|
| D03 / D3A,B | Commodity × Mexican State | **DOT2** (partial — has MEXSTATE but uses MEXREGION in 1993) |
| D04 / D4A,B | Commodity × Canadian Province | **DOT2** (partial — has PROV but uses USREGION/DISTGROUP in 1993) |
| D05 / D5A,B | State × Port (Mexico) | **DOT1** (partial — Mexico only) |
| D06 / D6A,B | State × Port (Canada) | **DOT1** (partial — Canada only) |
| D09 | Commodity × State (air/vessel, no province) | **DOT2** (partial) |
| D10 | Commodity × State × Province (air/vessel) | **DOT2** (partial) |
| D11 | State × Port (air/vessel, no province) | **DOT1** (partial) |
| D12 | State × Port × Province (air/vessel) | **DOT1** (partial) |

**Suffix letter** (country + trade direction):

| Suffix | Country | Direction | Modern Equivalent |
|--------|---------|-----------|-------------------|
| A | Mexico | Export | TRDTYPE=1, COUNTRY=2010 |
| B | Mexico | Import | TRDTYPE=2, COUNTRY=2010 |
| D | Canada | Export | TRDTYPE=1, COUNTRY=1220 |
| J | Canada | Import | TRDTYPE=2, COUNTRY=1220 |
| M | Mexico | Export (air/vessel) | TRDTYPE=1, COUNTRY=2010 |
| N | Mexico | Import (air/vessel) | TRDTYPE=2, COUNTRY=2010 |
| O | Canada | Export (air/vessel) | TRDTYPE=1, COUNTRY=1220 |
| S | Canada | Import (air/vessel) | TRDTYPE=2, COUNTRY=1220 |
| F | FTZ | (Foreign Trade Zone) | TRDTYPE varies |

### DOT3 Has No Legacy Equivalent

**DOT3 (Port × Commodity) did not exist before January 2007.** Legacy data never cross-tabulated port and commodity in a single table. This means:

- Port × Commodity analysis can only go back to 2007
- For 1993–2006, you can get port-level data (from D05/D06/D11/D12) OR commodity-level data (from D03/D04/D09/D10), but **never both dimensions together at the record level**
- If DOT3-equivalent analysis is needed for pre-2007 years, it would require combining port and commodity tables and aggregating, which would lose granularity

## 2. Column-by-Column Mapping

### Columns that map directly (with renaming)

| Legacy Column | Modern Column | Notes |
|---------------|---------------|-------|
| `USSTATE` (1993) | `USASTATE` | Simple rename |
| `ORSTATE` (1994+ exports) | `USASTATE` | "Origin state" = US state for exports |
| `DESTATE` (1994+ D09-D12) | `USASTATE` | "Destination state" for imports |
| `EXSTATE` (1994+ B-tables) | `USASTATE` | "Export state" variant name |
| `SCH_B` (1994+) | `COMMODITY2` | HS 2-digit commodity code |
| `SCH_B_GRP` (1993) | `COMMODITY2` | Commodity group (1993 only — may be aggregated differently) |
| `TSUSA` (1994+ D09-D12) | `COMMODITY2` | Same codes, different column name |
| `TSUSA_GRP` (1993 D09-D10) | `COMMODITY2` | Commodity group (1993 only) |
| `PROV` | `CANPROV` | Canadian province code |
| `CHARGES` (D09-D12) | `FREIGHT_CHARGES` | Freight charges |
| `FREIGHT` (D04/D06) | `FREIGHT_CHARGES` | Same concept, different column name |
| `DISAGMOT` | `DISAGMOT` | Transportation mode — identical |
| `DF` | `DF` | Domestic/foreign indicator — identical |
| `CONTCODE` | `CONTCODE` | Containerized code — identical |
| `DEPE` | `DEPE` | Port of entry code — identical |
| `MEXSTATE` | `MEXSTATE` | Mexican state — identical |
| `COUNTRY` | `COUNTRY` | Country code — identical |
| `VALUE` | `VALUE` | Trade value in USD — identical |
| `SHIPWT` | `SHIPWT` | Shipping weight — identical |

### Columns derived from filename (not present as columns in legacy)

| Modern Column | How to derive from legacy |
|---------------|--------------------------|
| `TRDTYPE` | From filename suffix: A/D/M/O = 1 (export), B/J/N/S = 2 (import) |
| `COUNTRY` | From filename suffix: A/B/M/N = 2010 (Mexico), D/J/O/S = 1220 (Canada). Also present as a column in most tables. |
| `MONTH` | Parse from `STATMOYR`: first 2 digits if MMYY (1993–1997), last 2 digits if YYYYMM (1998–2006) |
| `YEAR` | Parse from `STATMOYR`: last 2 digits → 19xx/20xx if MMYY (1993–1997), first 4 digits if YYYYMM (1998–2006) |

### Columns in legacy that DO NOT exist in modern (information lost)

| Legacy Column | Found In | Description | Impact |
|---------------|----------|-------------|--------|
| `COUNT` | All tables, 1993–1996 only | Number of individual trade transactions aggregated into the row | **Minor loss.** Dropped by BTS themselves in 1997. Only relevant for statistical analysis of transaction counts vs. values. |
| `USREGION` | D04, D09, D10 (1993 only) | US Census region grouping | **No loss.** Can be derived from `USASTATE` using a lookup table. |
| `MEXREGION` | D03 (1993 only) | Mexican region grouping | **No loss.** Can be derived from `MEXSTATE` using a lookup table. |
| `DISTGROUP` | D04, D10 (1993 only) | Customs district grouping | **No loss.** Can be derived from `DEPE` port codes. |
| `NTAR` | D5B, D6B (1994–2002 import tables) | Import tariff/customs area code | **Minor loss.** Only in B-variant (import) tables. Not available in modern data. Not commonly used in analysis. |

### Columns in modern that DO NOT exist in legacy

| Modern Column | Implication for Legacy |
|---------------|----------------------|
| `CANPROV` (in DOT1) | Legacy D05 (Mexico ports) has no province column. Modern DOT1 has `CANPROV` but it's blank for Mexico records. **No loss** — legacy D06/D12 have `PROV` for Canada records. |
| `MEXSTATE` (in DOT2) | Legacy D04 (Canada commodity) has no MEXSTATE. Modern DOT2 has it but it's blank for Canada records. **No loss.** |
| `CONTCODE` (in D03-D06) | Legacy surface tables don't have containerized codes. Modern DOT1/DOT2 do. **Gap** — surface trade containerization data only available from 2007+. |
| `SHIPWT` (in D03-D06) | Legacy surface tables don't have shipping weight. Modern DOT1/DOT2 do. **Gap** — surface trade weight data only available from 2007+ for DOT1-equivalent, and partially available in legacy D10/D12 for air/vessel. |
| `FREIGHT_CHARGES` (in D03/D05) | Legacy Mexico surface tables have no freight charges. **Gap** — freight cost for surface Mexico trade only available from 2007+. |

## 3. STATMOYR Date Field Parsing

The `STATMOYR` field changed format mid-stream:

| Period | Format | Example | Parse Rule |
|--------|--------|---------|------------|
| 1993–1997 | `MMYY` (4-digit) | `0493` = April 1993 | Month = first 2 digits, Year = 19xx from last 2 |
| 1998–2006 | `YYYYMM` (6-digit) | `199804` = April 1998 | Year = first 4 digits, Month = last 2 |

**Caveat:** 4 files in May 1993 (`D04MAY93`, `D06MAY93`, `D10MAY93`, `D12MAY93`) contain `STATMOYR=0493` (April), not `0593`. These are likely re-released April data with May filenames.

## 4. Legacy Table Type Evolution

The number of table types changed over the years:

| Period | Table Types | Change |
|--------|-------------|--------|
| 1993 (Apr–Dec) | 15 types (D03-D12 with 7 suffixes each) | Original format |
| 1994 (transition) | Jan–Mar: old format; Apr–Dec: A/B split | A = export, B = import for surface tables |
| 1995–2002 | 12 types (D3A/B, D4A/B, D5A/B, D6A/B, D09-D12 × 8 suffixes) | Stable era |
| 2003–2006 | 8 types (B-variants dropped: D3A, D4A, D5A, D6A, D09-D12) | B-tables merged into A-tables |
| 2007+ | 3 types (DOT1, DOT2, DOT3) | Major consolidation |

When B-variants were dropped in 2003, the A-variant tables began containing both exports AND imports. This is confirmed by the COUNTRY field values in those files.

## 5. Additional Caveats

### Case sensitivity
- 2006 DBF files use **lowercase** column names (`disagmot`, `depe`). All other years use uppercase. Apply `.upper().strip()` during processing.

### Column name trailing spaces
- 2006 DBF files have **trailing spaces** in column names (e.g., `'disagmot  '`). Apply `.strip()` during processing.

### Baja California code error
- `MEXSTATE = 'BN'` (Baja California Norte) used erroneously from April 1994 to May 1998. Correct code is `'BC'`.

### 1993 commodity codes
- 1993 uses `SCH_B_GRP` and `TSUSA_GRP` — these may be **grouped/aggregated commodity codes** rather than individual HS 2-digit codes. Verify that the values match the same coding scheme used from 1994+.

### SCH_B vs TSUSA naming
- Surface tables (D03/D04) use `SCH_B` (Schedule B — export classification)
- Air/vessel tables (D09/D10) use `TSUSA` (Tariff Schedule USA — import classification)
- Both are HS 2-digit codes in practice, but the column names reflect export vs. import nomenclature
- Modern `COMMODITY2` unifies both

### 1995 revision files
- 26 revision files (X-prefix and R-prefix) exist for Jan–Mar 1995 and Jul 1995. These should be used **instead of** the original files for those months.

## 6. Summary: What We Lose Normalizing Legacy → Modern

| Lost Data | Severity | Workaround |
|-----------|----------|------------|
| **DOT3 (Port × Commodity) for 1993–2006** | **High** | Cannot reconstruct. Port and commodity were never in the same table pre-2007. |
| `COUNT` field (1993–1996) | Low | Dropped by BTS in 1997. Transaction count not needed for value/weight analysis. |
| `NTAR` tariff area (1994–2002 imports) | Low | Not used in standard analysis. |
| `CONTCODE` for surface trade (1993–2006) | Medium | Containerization data for surface modes only available from 2007+. |
| `SHIPWT` for surface trade (1993–2006) | Medium | Weight data for surface modes only available from 2007+ in DOT1/DOT2-equivalent tables. Legacy D10/D12 (air/vessel) do have weight. |
| `FREIGHT_CHARGES` for Mexico surface (1993–2006) | Medium | Freight costs for Mexico surface trade only from 2007+. Legacy D04/D06 (Canada) DO have freight. |

### What We Gain
| Gained Data | Notes |
|-------------|-------|
| `TRDTYPE` as explicit column | Derived from filename suffix — no information created, just restructured |
| `MONTH` / `YEAR` as separate columns | Parsed from `STATMOYR` — no information created, just restructured |
| Unified file structure | All countries/directions/modes in one file instead of 8+ separate files |
