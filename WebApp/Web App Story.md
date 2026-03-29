# Web App Story: BTS TransBorder Freight Dashboard

> What this document is: a current-state narrative of the live web app, checked against `WebApp/src/`, the extraction pipeline in `02-Data-Staging/Scripts/05_build_outputs.py`, and the full SQLite database in `02-Data-Staging/transborder.db`.
>
> Last updated: March 29, 2026 (final — all pipeline stories implemented)

---

## Part 1: What the Web App Tells Today

### Overview Page

The app opens with a large hero section built around a North American border-trade map. The hero subtitle sets the frame: "U.S. border trade has grown 5x since NAFTA began -- and Texas handles two-thirds of the Mexico side." The United States, Mexico, and Canada are shaded by trade intensity, while ports of entry appear as sized circles. Texas-Mexico ports glow amber, other Mexico-border ports appear blue, and Canada-border ports green.

Below the map are controls for Trading Partner, Trade Type, Mode, and Metric, followed by headline cards for total trade, exports, imports, and trade balance. A contextual comparison callout puts the numbers in human terms: "Texas-Mexico trade alone exceeded $600 billion in 2025 -- larger than the GDP of Sweden, Poland, or Thailand."

The trend chart includes three historical annotations: NAFTA Begins (1994), 2008 Financial Crisis, and COVID-19. A donut shows mode share, and a stacked bar shows Mexico versus Canada share over time.

The message: North American border trade is large, long-running, and concentrated, and Texas matters most on the Mexico side.

### U.S.-Mexico Page

This page turns the big-picture story into a national U.S.-Mexico story. The hero subtitle states: "The U.S. and Mexico trade over $840 billion annually -- more than most countries' entire GDP." A right-side filter panel includes Metric, Year, Trade Type, and Mode, with additional tab-specific filters.

Four tabs: Ports, Commodities, States, and Trade Flows.

#### Ports tab

Tells a concentration story. Shows where trade crosses, how dominant Laredo is, how stable truck's lead remains, and how the bilateral deficit has widened. Visual sequence: map, trends, rankings, tables. Three insight callouts cover Texas's 66% share, truck's 80% dominance, and the widening deficit.

#### Commodities tab

Tells a manufacturing-integration story. Treemap and top-commodity charts show what moves, the diverging bar shows which groups skew south (inputs) versus north (finished goods), and trend lines track groups over time. Insight callouts explain the cross-border assembly line pattern and energy export dominance.

#### States tab

Broadens the story beyond the border. Choropleths show U.S. and Mexican states by trade intensity. Growth-rate charts use lollipop style (stem + dot) to visually distinguish them from ranking bars. A **state commodity specialization** stacked bar chart shows what each U.S. state trades with Mexico -- revealing Texas as broad-based, Michigan as auto-focused, California as electronics-plus-agriculture. Port filter is available so users can ask "which states trade through Laredo?"

#### Trade Flows tab

Tells the corridor story through an interactive flow map, Sankey diagram, and heatmap matrix. Two insight callouts now explain corridor significance: the Texas-to-Nuevo Leon relationship and the non-interchangeability of port corridors.

### Texas-Mexico Page

The app's strongest storytelling page. Hero subtitle: "Texas handles two-thirds of all U.S.-Mexico trade -- over $600 billion in 2025 -- making it the single most important trade gateway on the continent."

Four tabs: Ports, Commodities, States, and Trade Flows.

#### Ports tab

The gateway story in its strongest form. Shows cluster concentration (Laredo, El Paso, Pharr), truck dominance, trade balance trend, Laredo's growing share (52% to 60%), COVID V-shaped recovery, freight charges trend, and FTZ growth callout. Monthly patterns show seasonality.

#### Commodities tab

The densest and richest tab, now organized into labeled sections to reduce scroll fatigue:

- **What Moves** -- Treemap of commodity groups with drill-down, top-N commodity ranking, energy export callout
- **Supply Chain Direction** -- Diverging bar (maquiladora pattern), callouts on Transportation Equipment import ratio and chemical/plastic export flows
- **How Rankings Change** -- Animated bar chart race (2007-present), top commodity group trend lines
- **Which Ports Specialize** -- Stacked bar showing top commodity groups per port (Laredo = manufacturing, Pharr = agriculture, Presidio = cattle)
- **Trade Structure** -- Trade balance by commodity group (which groups drive the deficit), mode of transport by commodity group (truck vs rail vs pipeline per group), callouts on deficit concentration and hidden mode shifts
- **How Value Differs from Weight** -- Scatter plot (imports only, where weight is reliable) showing the "two economies" at the border, from Precious Metals at ~$1M/lb to Mineral Products at ~$0.14/lb
- **Seasonal Patterns** -- Stacked bar of average monthly trade by commodity group, showing winter produce peaks and year-round manufacturing stability

#### States tab

Mexican-partner geography story through a Texas lens. Interactive flow map, Sankey, rankings, growth rates (lollipop style), trend lines. A **Mexican state commodity specialization** stacked bar shows what each Mexican state trades through Texas -- Nuevo Leon and Chihuahua are machinery-and-auto, Queretaro and San Luis Potosi are auto-concentrated newcomers. Region convenience filter lets users quickly narrow to El Paso, Laredo, or Pharr port clusters.

#### Trade Flows tab

Corridor story for Texas. Flow map, top trading pairs, Sankey, heatmap matrix. Now includes two narrative callouts (Laredo's wide connectivity vs El Paso's auto-sector depth) and a **fastest-growing corridors** lollipop chart showing which state-to-state trade pairs are surging. U.S. State filter lets users isolate corridors like Michigan-through-Laredo.

### About Page

Methodology page with sticky navigation: Data Source, Data Coverage, Year Range Strategy, BTS Terminology, Known Limitations, Port History, Downloads.

---

## Part 2: Stories Now Implemented

All of the following are live in the app:

- Trade deficit trend (both US-MX and TX-MX Ports tabs)
- Maquiladora / cross-border manufacturing pattern (both Commodities tabs)
- Laredo concentration risk (TX-MX Ports tab)
- COVID resilience / V-shaped recovery (TX-MX Ports tab, monthly zoom)
- Mexican industrial corridor shift / Bajio growth (both States tabs)
- Narrative voice on every tab (intro paragraphs + insight callouts)
- Animated commodity rankings / bar chart race (TX-MX Commodities)
- Port specialization by commodity (TX-MX Commodities)
- Freight charges trend (TX-MX Ports)
- FTZ growth callout (TX-MX Ports)
- Trade balance by commodity group (TX-MX Commodities)
- Mode of transport by commodity group (TX-MX Commodities)
- Weight versus value scatter plot (TX-MX Commodities, imports only)
- Seasonal commodity patterns (TX-MX Commodities)
- Texas vs other states by commodity (US-MX States)
- Commodity by Mexican state (TX-MX States)
- Fastest-growing trade corridors (TX-MX Trade Flows)
- Contextual dollar comparisons (Overview)
- Section headers on TX-MX Commodities tab
- Narrative callouts on both Trade Flows tabs
- Historical annotations standardized via shared annotations.js (NAFTA on Overview, 2008+COVID on detail pages)
- Growth-rate charts use lollipop style (visually distinct from ranking bars)
- Containerization analysis: donut charts showing containerized vs non-containerized freight and domestic vs re-export origin (US-MX Ports tab)
- Containerized trade growth trend line (US-MX Ports tab)
- Port-level produce seasonality: stacked bar showing vegetable imports by port by month (TX-MX Commodities tab)

---

## Part 3: Data Pipeline Status

The pipeline (`05_build_outputs.py`) produces 18 datasets:

| # | Dataset | Source | Rows | Purpose |
|---|---------|--------|------|---------|
| 1 | us_transborder | DOT2 | ~900 | Overview stats and trends (1993-2025) |
| 2 | us_mexico_ports | DOT1 | ~17K | US-MX port rankings, map, trends |
| 3 | us_canada_ports | DOT1 | ~223K | Canada ports on Overview map |
| 4 | texas_mexico_ports | DOT1 | ~1.4K | TX port analysis with coordinates |
| 5 | texas_mexico_commodities | DOT3 | ~42K | TX commodity breakdown by port |
| 6 | us_state_trade | DOT1 | ~5K | State-level trade |
| 7 | commodity_detail | DOT2 | ~34K | Commodity by country/mode |
| 8 | monthly_trends | DOT1 | ~6.5K | Monthly time series |
| 9 | mexican_state_trade | DOT1 | ~2.1K | Mexican state trade (US-MX) |
| 10 | texas_mexican_state_trade | DOT1 | ~1.8K | Mexican states via TX ports |
| 11 | od_state_flows | DOT1 | ~174K | US-MX origin-destination flows |
| 12 | od_canada_prov_flows | DOT1 | ~43K | Canada province flows |
| 13 | texas_od_state_flows | DOT1 | ~117K | TX-specific OD flows |
| 14 | monthly_commodity_trends | DOT2 | ~47K | Monthly commodity patterns (Mexico) |
| 15 | state_commodity_trade | DOT2 | ~112K | State-level commodity trade (Mexico) |
| 16 | commodity_mexstate_trade | DOT2 | ~23K | Commodity by Mexican state |
| 17 | containerization_trade | DOT1 | ~645 | Containerization and domestic/foreign status |
| 18 | texas_monthly_port_commodity | DOT3 | ~132K | Monthly port-by-commodity for TX ports |

All datasets use 2007+ except us_transborder (full 1993-2025).

---

## Part 4: Filter Architecture

### Overview Page
- Trading Partner (All / Mexico / Canada)
- Trade Type (Export / Import)
- Mode (single-select dropdown)
- Metric Toggle (Value $ / Weight lb)
- Per-chart: Country dropdown, Year Range sliders

### US-Mexico Page (sidebar)
- Metric Toggle, Year (multi), Trade Type (single), Mode (multi)
- Ports tab: + State, Port
- Commodities tab: + Commodity Group, Commodity
- States tab: + State, Port, Mexican State
- Trade Flows tab: + Port, State, Mexican State

### Texas-Mexico Page (sidebar)
- Metric Toggle, Year (multi), Trade Type (single), Mode (multi)
- Ports tab: + Region (multi), Port
- Commodities tab: + Commodity Group, Commodity, Region (convenience), Port
- States tab: + Region (convenience), Port, Mexican State
- Trade Flows tab: + U.S. State, Port, Mexican State

Region convenience filter auto-selects all ports in the chosen region (El Paso, Laredo, or Pharr).

---

## Part 5: What Could Still Be Added

### The only remaining pipeline story
- Pre-2007 detailed history (pipeline currently excludes pre-2007 from detail datasets by design -- this is a scope decision, not a gap)

---

## Part 6: The Bottom Line

The dashboard tells 25+ distinct stories across 4 pages and 12 tabs. Every tab has narrative framing, insight callouts, and historical context. The Texas-Mexico Commodities tab alone tells 7 layered stories organized by section headers. Growth-rate charts are visually distinct from ranking charts. Annotations are standardized. Filters include region convenience shortcuts and corridor-level analysis.

The core story -- Texas as the gateway, manufacturing integration as the engine, Laredo as the linchpin -- is clearly told through multiple complementary angles. The only remaining pipeline story is pre-2007 detailed history, which is excluded by design. All other identified stories from the dreamer review have been implemented.
