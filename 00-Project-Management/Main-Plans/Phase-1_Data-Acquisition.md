# Phase 1: Data Acquisition & Documentation

## Context

The BTS North American TransBorder Freight Data spans April 1993 to 2025 with a major schema change in January 2007. This phase covers downloading, organizing, unpacking, and documenting the raw data, plus building the code table configs needed for Phase 2 normalization.

**Source**: https://www.bts.gov/topics/transborder-raw-data

## Directory Structure

```
.gitignore                 <- Exclude raw data, .db, cleaned/, etc.

01-Raw-Data/
  download/
    legacy/                (Apr 1993 - Dec 2006, one ZIP per year)
    modern/                (Jan 2007 - 2025, monthly ZIPs per year)
  unpacked/
    legacy/                (extracted DBF/TAB/CSV files by year)
    modern/                (extracted CSV/DBF/XLSX files by year)
  Scripts/
    01c_organize_manual_downloads.py
    unpack_raw_data.py
  data_dictionary/
    codes-north-american-transborder-freight-raw-data.pdf
    Historical and current data format comparison.xlsx
    legacy-to-modern-mapping.md
    legacy-reference/      (original BTS legacy docs: .xls, .doc)
    README.md

02-Data-Staging/
  Scripts/
    requirements.txt
  config/
    schema_mappings.json
    port_aliases.json
    mode_codes.json
    commodity_codes.json
    country_codes.json
    trade_type_codes.json
    state_codes.json
    canadian_province_codes.json
    mexican_state_codes.json
    schedule_d_port_codes.json
    transborder_url_manifest.json
```

## 1.1 Data Download — Manual Acquisition

### No Public API Available

There is no public API for TransBorder freight data. The BTS website (`bts.gov/topics/transborder-raw-data`) is the only source for raw data downloads. The BTS raw data page also blocks automated access (403 via CDN), so download scripts were not viable — all data was acquired via **manual download**.

**BTS Data Contact**: Sean Jahanmir (sean.jahanmir@dot.gov, 202-760-1007).

### Major Schema Change: January 2007

Before January 2007, TransBorder data was published as up to **24 separate tables** (split by trade direction, country, and geographic dimension — with A/B variants for export methodology). In January 2007, BTS consolidated these into **3 unified tables** with new/renamed fields:

| Change | Pre-2007 | Post-2007 |
|---|---|---|
| Table structure | Up to 24 separate tables | 3 tables: Surface, Air/Vessel, Pipeline |
| Commodity field | `TSUSA` (imports) / `SCH_B` (exports) | `COMMODITY` (unified) |
| State field | `DESTATE` / `ORSTATE` | `USASTATE` (unified) |
| Province field | `PROV` | `CANPROV` |
| Date fields | `STATMOYR` (4-digit MMYY or 6-digit YYYYMM) | `STATMO` + `STATYR` (separate) |
| Trade direction | Implicit (separate import/export files) | `TRDTYPE` field (1=Export, 2=Import) |
| Air/vessel data | Added January 2004 | Included |

### Pre-Consolidation Data (Apr 1993 – Dec 2006)

**Method**: Manual download from BTS website.
**Location**: `01-Raw-Data/download/legacy/` — one ZIP per year, 14 years total.
**Unpacked to**: `01-Raw-Data/unpacked/legacy/` — DBF, TAB, and CSV files organized by year.

This is a **one-time download** — pre-consolidation data does not change. Files use varied formats (DBF for early years, transitioning to CSV). See `01-Raw-Data/data_dictionary/legacy-to-modern-mapping.md` for complete table structure and column mappings.

### Post-Consolidation Data (Jan 2007 – 2025)

**Method**: Manual download from BTS website.
**Location**: `01-Raw-Data/download/modern/` — monthly ZIPs organized by year, 19 years total.
**Unpacked to**: `01-Raw-Data/unpacked/modern/` — CSV files organized by year.

Each monthly ZIP contains:
- Monthly files: `dot{1,2,3}_MMYY.csv`
- Year-to-date cumulative files: `dot{1,2,3}_ytd_MMYY.csv`
- December ZIPs also contain annual summary files: `dot{1,2,3}_YYYY.csv`

### Organizing & Unpacking Scripts

| Script | Location | Purpose |
|---|---|---|
| `01c_organize_manual_downloads.py` | `01-Raw-Data/Scripts/` | Organizes manually downloaded files into the year-folder structure |
| `unpack_raw_data.py` | `01-Raw-Data/Scripts/` | Extracts all ZIPs to `01-Raw-Data/unpacked/` preserving year structure |

### Known Raw-File Gap: October 2020

Oct 2020 is the **only monthly raw-file gap** in the entire 1993–2025 dataset.

| Year | Tables Affected | Months Missing | Status |
|---|---|---|---|
| 2020 | DOT1, DOT2, DOT3 | Oct (month 10 only) | BTS confirmed they do not have the raw file. Nov/Dec 2020 recovered from BTS (Sean Jahanmir) on 2026-03-22. Phase 2 will analytically derive October from annual aggregates minus Sep YTD, Nov, and Dec. Optional fallback for the original raw file: contact Census at https://www.census.gov/foreign-trade/contact.html |

## 1.2 Data Dictionary & Code Table Configs

TransBorder data uses numeric and character codes for most fields. Code tables decode these into human-readable values for the dashboard.

### 1.2.1 Source Documents

Reference documents in `01-Raw-Data/data_dictionary/`:

| Document | Description |
|---|---|
| `codes-north-american-transborder-freight-raw-data.pdf` | BTS "All Codes" — complete code tables for all TransBorder fields |
| `Historical and current data format comparison.xlsx` | BTS-published mapping of legacy tables to modern DOT tables |
| `legacy-to-modern-mapping.md` | Column-level mapping, caveats, and data loss analysis (written during this project) |
| `legacy-reference/` | Original BTS legacy documentation (field definitions, major changes, all codes .xls) |

### 1.2.2 Coded Fields in TransBorder Data

TransBorder uses **HS (Harmonized Schedule) 2-digit commodity codes**, NOT SCTG. At the 2-digit level, HS, HTSUSA (imports), and Schedule B (exports) are functionally identical.

| Field Name | Code Type | Values | Source |
|---|---|---|---|
| `DISAGMOT` | Mode of transportation | 1-digit numeric (1-9) | BTS internal |
| `COMMODITY` | HS 2-digit commodity | 2-digit character (01-99) | HTSUSA / Schedule B |
| `TRDTYPE` | Trade direction | 1=Export, 2=Import | BTS (post-2007 only; derived from filename in legacy) |
| `COUNTRY` | Country | 4-digit numeric (1220=Canada, 2010=Mexico) | BTS/Census |
| `DEPE` | District/Port of Entry | 4-digit numeric (Schedule D) | Census/CBP |
| `USASTATE` | U.S. state | 2-letter USPS code | Standard |
| `CANPROV` | Canadian province | 2-letter with X prefix (XA=Alberta, etc.) | BTS custom |
| `MEXSTATE` | Mexican state | 2-letter BTS code (exports only) | BTS custom |
| `CONTCODE` | Container code | 1=Containerized, blank=Not | BTS |
| `DF` | Domestic/Foreign | 1=Domestic, 2=Foreign | BTS |

**Numeric (non-coded) fields:**

| Field | Description | Unit |
|---|---|---|
| `VALUE` | Trade value | US dollars |
| `SHIPWT` | Shipping weight | Kilograms |
| `CHARGES` | Shipping charges (imports only) | US dollars |
| `FREIGHT` | Freight costs (exports only) | US dollars |
| `STATMO` | Statistical month | 01-12 |
| `STATYR` | Statistical year | 4-digit |

### 1.2.3 Code Table JSON Files

All code table configs are in `02-Data-Staging/config/`. These were created manually from BTS documentation (the BTS website blocks automated PDF parsing).

| File | Content | Entries |
|---|---|---|
| `mode_codes.json` | `DISAGMOT` code → mode name | 9 codes |
| `commodity_codes.json` | HS 2-digit code → commodity description | ~98 codes |
| `country_codes.json` | 4-digit code → country name | 2 codes (Canada, Mexico) |
| `trade_type_codes.json` | `TRDTYPE` code → direction name | 2 codes (Export, Import) |
| `schedule_d_port_codes.json` | 4-digit DEPE → port name, district, state | ~300+ codes |
| `state_codes.json` | USPS code → state full name | 50+ entries |
| `canadian_province_codes.json` | BTS X-prefix code → province name | 14 entries |
| `mexican_state_codes.json` | BTS 2-letter code → state name | 33 entries |
| `port_aliases.json` | Spelling variations → canonical port name | Populated iteratively in Phase 2 |
| `schema_mappings.json` | Pre/post-consolidation column name mappings | Field + date mappings |
| `transborder_url_manifest.json` | BTS raw data page link inventory | URL catalog from reconnaissance |

**Mode codes:**
```json
{
  "1": "Vessel",
  "3": "Air",
  "4": "Mail (U.S. Postal Service)",
  "5": "Truck",
  "6": "Rail",
  "7": "Pipeline",
  "8": "Other/Unknown",
  "9": "Foreign Trade Zones (FTZs)"
}
```

## 1.3 Schema Documentation

Schema differences between legacy and modern eras are documented in `01-Raw-Data/data_dictionary/legacy-to-modern-mapping.md`. This covers:

- Table structure comparison (24 legacy tables → 3 modern DOT tables)
- Column-by-column mapping (legacy names → modern names)
- Columns derived from filename in legacy (TRDTYPE, COUNTRY, MONTH, YEAR)
- Information lost in normalization (DOT3 has no legacy equivalent, CONTCODE/SHIPWT gaps for export tables pre-2007)
- STATMOYR date parsing (MMYY for 1993–1997, YYYYMM for 1998–2006)
- Legacy table evolution (15 types in 1993 → 12 in 1995 → 8 in 2003 → 3 in 2007)
- Known errata (BN→BC Baja California code, 2006 lowercase columns, 1995 revision files)

The machine-readable mapping is in `02-Data-Staging/config/schema_mappings.json`.

## 1.4 BTS Data Release Schedule & Yearly Updates

### How BTS Publishes Data
- BTS releases TransBorder data **monthly** with a consistent **~2-month lag**
- Example: November 2025 data was released January 30, 2026
- BTS also publishes an **annual summary report** ~3 months after year-end

### Update Policy
- **Only incorporate a new year when all 12 months are available** — no partial years
- Current build target: 1993–2025, with Oct 2020 analytically recoverable during Phase 2 normalization
- 2026 data: Wait until ~March 2027 when December 2026 data is published

### Yearly Update Workflow

When adding a new year (run annually, ~March of the following year):

```
Step 1: Check BTS website for 12/12 months available for the target year
Step 2: Download new year's monthly ZIPs → 01-Raw-Data/download/modern/YYYY/
Step 3: Unpack ZIPs → 01-Raw-Data/unpacked/modern/YYYY/
Step 4: Run Phase 2 pipeline (normalize → DB → dashboard CSVs → validate)
Step 5: Rebuild & deploy dashboard
```

Check the BTS raw data page for the target year's files before downloading.

---

## Deliverables Checklist

### Data Downloads
- [x] `.gitignore` — Excludes raw data, `.db`, cleaned/, Python artifacts
- [x] `requirements.txt` — Python dependencies in `02-Data-Staging/Scripts/`
- [x] `01-Raw-Data/download/legacy/` — Pre-consolidation raw ZIPs (1993–2006, 14 years)
- [x] `01-Raw-Data/download/modern/` — Post-consolidation raw ZIPs (2007–2025, 19 years)
- [x] `01-Raw-Data/unpacked/legacy/` — Extracted legacy files by year
- [x] `01-Raw-Data/unpacked/modern/` — Extracted modern files by year
- [x] `01-Raw-Data/Scripts/01c_organize_manual_downloads.py` — Organizes manual downloads
- [x] `01-Raw-Data/Scripts/unpack_raw_data.py` — Extracts all ZIPs

### Data Dictionary & Code Tables
- [x] `01-Raw-Data/data_dictionary/` — BTS code PDFs, format comparison, legacy reference docs
- [x] `02-Data-Staging/config/mode_codes.json` — 9 entries
- [x] `02-Data-Staging/config/commodity_codes.json` — ~98 entries
- [x] `02-Data-Staging/config/country_codes.json` — 2 entries
- [x] `02-Data-Staging/config/trade_type_codes.json` — 2 entries
- [x] `02-Data-Staging/config/schedule_d_port_codes.json` — ~300+ entries
- [x] `02-Data-Staging/config/state_codes.json` — 50+ entries
- [x] `02-Data-Staging/config/canadian_province_codes.json` — 14 entries
- [x] `02-Data-Staging/config/mexican_state_codes.json` — 33 entries
- [x] `02-Data-Staging/config/port_aliases.json` — Empty starter (populated in Phase 2)
- [x] `02-Data-Staging/config/transborder_url_manifest.json` — BTS link inventory

### Schema Documentation
- [x] `01-Raw-Data/data_dictionary/legacy-to-modern-mapping.md` — Complete column mapping + caveats
- [x] `02-Data-Staging/config/schema_mappings.json` — Machine-readable column mapping

### Open Items (non-blocking)
- [ ] Optional: Contact Census for the original Oct 2020 raw file (dataset coverage is analytically recoverable during Phase 2)
