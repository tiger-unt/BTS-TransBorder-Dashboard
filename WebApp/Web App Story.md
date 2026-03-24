# Web App Story: BTS TransBorder Freight Dashboard

> *What this document is:* A narrative description of the web app as it exists today — what it shows, what story it tells, and what it's missing. Written so that someone who cannot see the screen could fully understand the dashboard's purpose, structure, and findings. Followed by a gap analysis of untold stories hiding in the database, and concrete recommendations to improve the storytelling.

---

## Part 1: What the Web App Tells You Today

### The Big Picture (Overview Page)

The dashboard opens with a panoramic view of **U.S. TransBorder freight data from 1993 to 2025** — thirty-two years of goods crossing America's land borders with Mexico and Canada. The page greets you with a hero banner and four large stat cards showing the latest year's total trade, exports, imports, and trade balance for the entire U.S. border.

Below the stats, an **interactive map of the United States** shows every border port of entry as a circle. Bigger circles mean more trade. Texas ports glow amber — they are highlighted because they are the focus of this project. Other Mexico-border ports (California, Arizona, New Mexico) appear in blue. Canada-border ports appear in green. Even at a glance, the amber circles along Texas are enormous compared to everything else, silently arguing that Texas *is* the U.S.–Mexico trade story.

A **line chart** traces annual exports and imports from 1993 to 2025. You can see the story of NAFTA's early acceleration in the late 1990s, the 2009 Great Recession dip, steady growth through the 2010s, the sharp COVID notch in 2020, and then a steep climb to record highs. A **donut chart** shows the mode split (truck, rail, pipeline) for the latest year, and a **stacked bar** shows the Canada-vs-Mexico trade share over time — Mexico's share has been steadily growing.

At the bottom, two navigation cards invite you deeper: **"U.S.–Mexico Trade"** for the national view, and **"Texas–Mexico Trade"** for the regional deep dive.

*The story being told:* "U.S. border trade has grown enormously over three decades, and Texas is the dominant gateway."

---

### U.S.–Mexico Trade (National View)

This page focuses on all trade between the U.S. and Mexico across all border states (Texas, California, Arizona, New Mexico). It has four tabs.

#### Tab 1: Ports — *Where Trade Happens*

Five stat cards sit atop the page: Total Trade, Exports, Imports, Texas Share, and Active Ports. The Texas Share stat is telling — it consistently shows around **65–66%**, meaning nearly two-thirds of all U.S.–Mexico trade flows through Texas.

A **map** shows U.S.–Mexico border ports sized by trade volume. Laredo's circle dominates the Texas border. A **line chart** shows annual export and import trends with a COVID-19 annotation marking the 2020 disruption. Two charts sit side by side: a **donut** showing truck's ~80% mode dominance and a **stacked bar** showing mode composition year over year (truck, rail, pipeline — remarkably stable). A **horizontal bar chart** ranks the top 20 ports — Laredo sits alone at the top, followed by El Paso (Ysleta), then Detroit and Buffalo on the Canada border. Below that, a **multi-line chart** tracks the top 5 ports' trade over time, and a **sortable table** provides exact figures.

*The story being told:* "U.S.–Mexico trade is geographically concentrated in a handful of ports, with Laredo handling more trade than any other port on either border."

#### Tab 2: Commodities — *What Crosses the Border*

A **treemap** fills the screen with colored rectangles representing commodity groups. The biggest rectangle — by far — is **Machinery & Electrical Equipment**, reflecting the deep cross-border manufacturing integration (electronics, appliances, industrial machinery). **Transportation Equipment** (vehicles and parts) is the second-largest block. You can click any group to drill down into individual HS codes within it.

A **bar chart** ranks the top 10 commodities, and a **line chart** tracks the top 5 commodity groups over time, showing how machinery and vehicles have pulled away from everything else. A **detail table** lets you explore exact figures by year, HS code, and trade type.

*The story being told:* "U.S.–Mexico trade is dominated by manufactured goods — this is a manufacturing partnership, not just a raw-materials exchange."

#### Tab 3: States — *Who's Trading*

Two **choropleth maps** appear side by side. The left map colors U.S. states by their trade with Mexico — Texas is the darkest (most trade), followed by Michigan, California, and Illinois. The right map colors Mexican states — Estado de México, Chihuahua, and Nuevo León are the darkest. Below the maps, **bar charts** rank the top 15 U.S. and Mexican states, and **line charts** track the top 5 over time.

*The story being told:* "Trade with Mexico isn't just a border phenomenon — it reaches deep into both countries, with manufacturing states dominating on both sides."

#### Tab 4: Trade Flows — *How Trade Routes Through the Border*

A **Sankey diagram** shows the flow: U.S. states on the left feed into border ports in the middle, which connect to Mexican states on the right. The ribbons' thickness represents trade volume. A **heatmap matrix** shows the full origin-destination table of U.S. state × Mexican state trade pairs.

*The story being told:* "Trade flows through specific corridors — Texas-to-Nuevo León via Laredo, Michigan parts flowing to Chihuahua assembly plants, California produce to Mexico City."

---

### Texas–Mexico Trade (Regional Deep Dive)

This is the heart of the dashboard. It focuses exclusively on the 14 Texas border ports and their trade with Mexico. Five stat cards: Total TX-MX Trade, Exports, Imports, Active Ports, Top Mode.

#### Tab 1: Ports — *Texas's Border Gateways*

A **map** zooms into the Texas-Mexico border showing port bubbles in three color-coded regions: **El Paso** (west), **Laredo** (central), and **Pharr/Rio Grande Valley** (east). Laredo's bubble dwarfs the rest.

A **line chart** shows Texas-Mexico trade trends. Two charts show the mode split. A **bar chart** ranks all Texas ports. Where monthly data is available, a **monthly trend line** and **seasonal pattern chart** appear, showing that trade is fairly consistent year-round with a slight dip in January/February and a peak in October.

A **detail table** includes port, region, mode, trade type, value, and weight for granular analysis.

*The story being told:* "Texas's trade with Mexico is concentrated in Laredo, runs on trucks, and has grown from $211B (2007) to over $600B (2025)."

#### Tab 2: Commodities — *What Flows Through Texas*

Same structure as the U.S.–Mexico commodities tab but filtered to Texas ports only. The **treemap** reveals the same machinery-and-vehicles dominance but with a Texas twist: **Mineral Products** (petroleum, natural gas) appears more prominently because of pipeline exports. **Vegetable Products** and **Foodstuffs** are also more visible — reflecting the Pharr/Progreso/Roma agricultural corridor.

*The story being told:* "Texas ports handle the nation's manufacturing trade AND are uniquely important for energy exports and fresh produce imports."

#### Tab 3: States — *Mexico's Trading Partners Through Texas*

An **interactive flow map** combines a Mexican states choropleth with port bubbles overlaid. Click a Mexican state and its connected ports highlight; click a port and its connected states light up. This reveals geographic trade corridors: Chihuahua trades through El Paso/Ysleta, Nuevo León through Laredo, Tamaulipas through Pharr/Brownsville.

A **bar chart** ranks the top 15 Mexican states, and a **line chart** tracks trends for the top 5.

*The story being told:* "Each Texas port serves specific Mexican states, creating distinct trade corridors along the border."

#### Tab 4: Trade Flows — *Origin-Destination Connections*

A **Sankey diagram** and **heatmap** show how trade flows from origin states through Texas ports to Mexican destination states (or vice versa for imports).

*The story being told:* "Texas ports are not interchangeable — they serve specific origin-destination corridors."

---

### About Page — *Methodology and Context*

A well-structured documentation page with sticky sidebar navigation explaining the data source (BTS), coverage (1993–2025, 39.5M records), the schema change at January 2007, HS code terminology, known data limitations, and port history. This page serves as the credibility anchor for the entire dashboard.

---

## Part 2: What the Database Knows That the Web App Doesn't Show

The TransBorder database (10.3 GB SQLite, 39.5M records) contains far more analytical potential than the current 12 pre-aggregated datasets expose. Here are the **untold stories** hiding in the data.

### 2.1 The Widening Trade Deficit Story

**What the data shows:** Texas's trade deficit with Mexico has grown from **-$29.5 billion in 2007 to -$125.2 billion in 2024** — a 4.2× widening. Imports have grown +182% while exports grew only +135%. This accelerated sharply after 2017.

**Why it matters:** This is one of the single most important economic facts about the Texas-Mexico relationship, and it's barely visible in the current dashboard. The stat cards show exports and imports separately, but the *deficit itself* — and its trajectory — is never explicitly charted or called out. A user would have to mentally subtract to see it.

**Recommendation:** Add a dedicated **trade balance trend line** (or area chart showing the growing gap between exports and imports). Add an insight callout: *"Texas's trade deficit with Mexico has quadrupled since 2007, reaching $125B in 2024 — driven by imports of finished vehicles, electronics, and consumer goods."*

### 2.2 The Maquiladora / Cross-Border Manufacturing Story

**What the data shows:** The clearest maquiladora signal in the data is in Transportation Equipment — Texas exports **$67B in vehicle parts/components** and imports **$259B in finished vehicles**, a 3.9:1 import ratio. The same pattern appears in Machinery & Electrical ($102B components out, $176B assembled products back) and Optical/Medical/Precision instruments (33% exports, 67% imports).

Meanwhile, **Plastics/Rubber** (67% exports) and **Chemicals** (73% exports) flow predominantly *south* — these are manufacturing inputs heading to Mexican factories.

**Why it matters:** This is the defining feature of U.S.-Mexico trade: it's not country-to-country commerce, it's an integrated manufacturing supply chain. Parts go south, finished goods come north. The current dashboard shows commodities but doesn't connect the dots to tell this supply-chain story.

**Recommendation:** Add a **"Manufacturing Integration" section** — perhaps a butterfly/diverging bar chart showing commodity groups that are export-heavy (inputs flowing south) on one side and import-heavy (finished goods flowing north) on the other. Add narrative text: *"Texas-Mexico trade isn't simple buying and selling — it's a cross-border assembly line. Texas sends raw materials and components south; Mexico sends finished products north."*

### 2.3 The Energy Export Story

**What the data shows:** Pipeline trade is 100% **Mineral Products** (petroleum and natural gas), and it's almost entirely one-directional: **$41.2B in exports vs $295M in imports** (2020–2024). Texas is Mexico's energy lifeline. When you add truck and rail shipments of mineral products, the total Texas→Mexico energy export is approximately **$59B cumulative**, making it the single largest export commodity group.

**Why it matters:** The energy relationship is strategically significant and often misunderstood. Texas doesn't just trade manufactured goods with Mexico — it fuels Mexico's economy. This story is partially visible in the commodity treemap but never explicitly highlighted.

**Recommendation:** Add a callout or annotation: *"Texas exports more energy products to Mexico ($12B/year) than most U.S. states export in total goods. Nearly all pipeline trade is Texas sending petroleum and natural gas south."* Consider a small pipeline-specific visualization showing the one-directional flow.

### 2.4 The Port Specialization Story

**What the data shows:** Texas ports have distinct economic personalities:
- **Laredo:** The manufacturing corridor — $321B in machinery/electrical, $240B in transportation equipment
- **Ysleta (El Paso):** Electronics and medical devices — $140B in machinery, $24B in optical/precision instruments
- **Eagle Pass:** The auto port — $54B in transportation equipment (highest concentration of any port)
- **Hidalgo/Pharr:** Mixed manufacturing + agriculture — $57B machinery, $19B vegetables
- **Progreso & Roma:** Pure agriculture — vegetables and foodstuffs
- **Presidio:** Cattle crossing — $338M in live animals (its primary commodity)
- **Brownsville:** Heavy industry — machinery, minerals, base metals

**Why it matters:** The current dashboard shows port rankings by total value but not *what each port carries*. A user can't see that Progreso is an avocado port and Eagle Pass is a car port. This specialization has policy implications — infrastructure investments, inspection capacity, and trade disruption risks differ by port.

**Recommendation:** Add a **port profile view** — when you click a port on the map (or in the ranking), show its commodity breakdown as a small donut or bar chart. Alternatively, add a **port × commodity heatmap** showing which ports handle which goods. Add narrative: *"Texas's 14 border ports aren't interchangeable. Each serves a distinct role in the cross-border economy, from Laredo's manufacturing corridor to Presidio's cattle crossing."*

### 2.5 The Laredo Concentration Risk Story

**What the data shows:** Laredo's share of Texas-Mexico trade has grown from **52.3% in 2007 to 59.9% in 2024**. In dollar terms, **$331 billion** flows through a single port — more than the GDP of many countries. Three-fifths of Texas-Mexico trade (and two-fifths of ALL U.S.-Mexico trade) funnels through one city.

**Why it matters:** This is both an economic triumph and a vulnerability. A disruption at Laredo (weather, infrastructure failure, policy change, congestion) would have outsized impact on U.S.-Mexico trade. The current dashboard shows Laredo at the top of the bar chart, but doesn't frame the *concentration risk*.

**Recommendation:** Add a **concentration metric** — perhaps a running share chart showing Laredo's % over time with a callout: *"Laredo handles $331B/year — 60% of all Texas-Mexico trade. A single day of disruption at Laredo costs an estimated $900M in delayed freight."* (This calculation: $331B ÷ 365 days ≈ $907M/day.)

### 2.6 The COVID Resilience Story

**What the data shows:**
- **April 2020:** Trade plunged **49%** in a single month (from $32.1B in March to $16.9B)
- **May 2020:** Hit bottom at $16.1B
- **June 2020:** Already 85% recovered ($28.0B)
- **September 2020:** Fully back to pre-COVID levels
- **Full year 2020:** Only 10.3% below 2019
- **Full year 2021:** 9.3% ABOVE 2019 — a textbook V-shaped recovery

**Why it matters:** The current dashboard marks COVID with an annotation on charts, but doesn't tell the *speed of recovery* story. The two-month shock and rapid bounce-back is remarkable and tells an important story about supply chain resilience (or dependence).

**Recommendation:** Add a **monthly zoom-in chart** for the COVID period (Jan 2020 – Dec 2021) showing the V-shape. Add narrative: *"COVID-19 caused the sharpest single-month trade drop in the database's 32-year history — but recovery was equally dramatic. Within four months, Texas-Mexico trade had fully rebounded, underscoring how tightly integrated these economies are."*

### 2.7 The Mexican Industrial Corridor Shift

**What the data shows:** Traditional border states (Tamaulipas, Chihuahua, Nuevo León) still dominate, but interior states are growing much faster:
- **Querétaro:** 5.5× growth (from $1.3B to $7.4B) — new auto manufacturing hub
- **San Luis Potosí:** 4.5× growth (from $1.2B to $5.5B) — BMW, GM plants
- **Aguascalientes:** significant growth — Nissan manufacturing
- **Campeche:** 27× growth ($97M to $2.6B) — offshore energy

**Why it matters:** Mexico's industrial base is shifting south from the border, and Texas ports are still the gateway. This tells a story about nearshoring, the Bajío automotive corridor, and Mexico's economic development strategy. The current dashboard's Mexican state choropleth shows the *current* picture but not the *shift* over time.

**Recommendation:** Add a **growth rate view** for Mexican states — not just absolute trade values but % change over time. Highlight the emerging Bajío corridor (Querétaro, Guanajuato, San Luis Potosí, Aguascalientes) with narrative: *"Mexico's manufacturing base is expanding south from the traditional border zone into the Bajío corridor — and Texas ports remain the gateway for this growing interior trade."*

### 2.8 The Rail-vs-Truck Mode Competition

**What the data shows:** Truck's ~80% mode share has been remarkably stable, but within specific commodities, there's been significant mode shifting:
- **Rail lost ground in:** Transportation Equipment (56% → 38%), Vegetables (56% → 33%), Animal Fats/Oils (80% → 51%), Live Animals (12% → 0.3%)
- **Rail gained only in:** Mineral Products (24% → 41%) — bulk energy commodities

**Why it matters:** The overall mode split looks static, but underneath, rail is consolidating around bulk commodities while losing manufactured goods to truck. This has infrastructure implications — should Texas invest in rail or road capacity? The current dashboard shows overall mode composition but not commodity-level mode shifts.

**Recommendation:** Add a **mode-by-commodity analysis** — a stacked bar or small multiples showing how each major commodity group's truck/rail split has changed. Narrative: *"While truck dominates overall, the rail-vs-truck competition is playing out differently across commodity types. Rail is losing manufactured goods to truck but gaining bulk commodity share."*

### 2.9 The Weight-vs-Value Story (Bulk vs. Precision)

**What the data shows:** The value-per-kilogram spread is dramatic:
- **Cheapest per kg:** Stone/Ceramic ($1,442/kg), Wood ($1,874/kg), Foodstuffs ($2,270/kg)
- **Most expensive per kg:** Precious Metals ($558,111/kg), Optical/Medical ($55,027/kg), Footwear ($37,609/kg)

**Why it matters:** This helps explain why truck dominates (high-value, time-sensitive goods) and why some ports handle enormous dollar values with relatively few physical trucks. It also matters for infrastructure planning — weight damages roads, not dollar values.

**Recommendation:** Add a **bubble chart** with value on one axis, weight on the other, and bubble size representing the number of commodity categories. This reveals the "two economies" crossing the border: heavy bulk goods and lightweight precision goods. Narrative: *"A single truck carrying semiconductor equipment from Ysleta can be worth more than an entire train of gravel from Brownsville."*

### 2.10 Year-over-Year Growth Acceleration

**What the data shows:** Texas-Mexico trade milestones:
- **1993–2007:** $0 → $211B (first $200B)
- **2007–2014:** $211B → $285B (14 years to add ~$75B)
- **2014–2019:** $285B → $392B (5 years to add ~$107B)
- **2019–2024:** $392B → $553B (5 years to add ~$161B, through a pandemic)
- **2025:** $601B (crossed $600B for the first time)

**Why it matters:** The acceleration is itself a story. Trade isn't just growing — it's growing *faster*. The current line charts show this visually, but no one calls it out explicitly.

**Recommendation:** Add milestone callouts on the trend chart or in an insight card: *"It took 14 years (1993–2007) for Texas-Mexico trade to reach $200B. It took just 5 years (2019–2024) to add the next $160B."*

---

## Part 3: Storytelling Improvements

### 3.1 Add Narrative Text to Each Tab

**Current state:** Charts have titles and subtitles but no explanatory paragraphs. Users must interpret visualizations on their own.

**Recommendation:** Add a **1–3 sentence narrative introduction** at the top of each tab that frames what the user is about to see and why it matters. Examples:

- **Ports tab intro:** *"Texas's 14 border ports of entry handled $553 billion in freight trade with Mexico in 2024 — roughly 66% of all U.S.–Mexico trade. Three ports (Laredo, El Paso/Ysleta, and Hidalgo/Pharr) account for over 85% of that total."*

- **Commodities tab intro:** *"What crosses the Texas-Mexico border tells the story of an integrated manufacturing economy. Machinery and vehicle parts flow south to Mexican assembly plants; finished vehicles, electronics, and consumer goods flow north. Meanwhile, Texas sends energy south and imports fresh produce."*

- **States tab intro:** *"Trade with Mexico reaches far beyond the border. On the U.S. side, Texas is the dominant origin/destination state, but Michigan, California, and Illinois are major players. On the Mexican side, manufacturing powerhouses like Chihuahua, Nuevo León, and the emerging Bajío corridor drive the flows."*

- **Trade Flows tab intro:** *"This tab reveals the specific corridors that define Texas-Mexico trade. Laredo connects Monterrey's industrial base to the U.S. heartland. El Paso/Ysleta links Juárez's maquiladoras to American markets. Each port-state pairing represents a supply chain built over decades."*

### 3.2 Add "Key Takeaway" Callouts to Each Major Chart

**Current state:** The Overview page has auto-generated insight callouts, but the detail pages (U.S.–Mexico, Texas–Mexico) have none.

**Recommendation:** Add 2–3 **insight callouts** per tab that highlight the most important findings. These should be data-driven and auto-generated from the dataset. Examples:

- *"Laredo handles more trade than the next 5 Texas ports combined."*
- *"Transportation Equipment imports through Texas have tripled since 2010."*
- *"Querétaro's trade through Texas ports has grown 5.5× in 15 years, reflecting Mexico's expanding auto manufacturing corridor."*
- *"Truck carries 83% of Texas-Mexico trade by value — but rail moves 41% of mineral products by weight."*

### 3.3 Add a "Texas Share" Comparison Context

**Current state:** The U.S.–Mexico page shows a "Texas Share" stat card, but there's no comparison visualization showing Texas vs. other states.

**Recommendation:** Add a **simple stacked bar or pie** showing Texas vs. California vs. Arizona vs. New Mexico vs. Other in total U.S.–Mexico trade. This immediately contextualizes Texas's dominance. Narrative: *"Texas handles as much U.S.–Mexico trade as all other border states combined — and then some."*

### 3.4 Improve the Trade Balance Visibility

**Current state:** Exports and imports are shown as separate stat cards and separate lines on charts. The balance (surplus/deficit) requires mental arithmetic.

**Recommendation:** Add a **trade balance area chart** showing the gap between exports and imports filling with color (red for deficit). Add a stat card showing the balance with directional arrow. The widening deficit from -$30B to -$125B in 17 years is a crucial story.

### 3.5 Add Historical Context Annotations

**Current state:** Only COVID-19 is annotated on time-series charts.

**Recommendation:** Add annotations for other significant events:
- **1994:** NAFTA takes effect
- **2001:** Post-9/11 security tightening at border
- **2008–2009:** Great Recession
- **2018–2019:** USMCA renegotiation / tariff threats
- **2020:** COVID-19 border disruptions
- **2024:** Record trade year

These annotations transform a line chart from "numbers going up" into a story about how policy, economics, and global events shaped trade.

### 3.6 Add a "Story Mode" or Guided Tour

**Current state:** The dashboard is exploration-oriented — users choose their own path through tabs and filters.

**Recommendation:** Consider adding a **guided narrative mode** (perhaps as a toggle or separate entry point) that walks users through the key findings in a structured sequence:

1. "Texas is the gateway" → Texas share stat
2. "Three ports dominate" → Port map
3. "It's a manufacturing partnership" → Commodity treemap + maquiladora chart
4. "The deficit is widening" → Trade balance trend
5. "COVID was a blip" → Monthly recovery chart
6. "The corridor is shifting south" → Mexican state growth rates

This serves users who want to be *told* the story, not just handed the tools to find it.

### 3.7 Add Contextual Dollar Amounts in Relatable Terms

**Current state:** Values are shown in billions (e.g., "$553B") but with no context for scale.

**Recommendation:** Add occasional **contextual comparisons** in callouts or tooltips:
- *"Texas-Mexico trade ($553B) exceeds the GDP of Sweden."*
- *"Laredo's daily trade volume (~$900M) is larger than the annual GDP of several Caribbean nations."*
- *"One day of disruption at the Texas-Mexico border costs more than the annual budget of the City of Austin."*

These make abstract billions tangible.

---

## Part 4: Structural Recommendations

### 4.1 Current Structure Assessment

The current 3-page + About structure (Overview → U.S.–Mexico → Texas–Mexico) is logical and well-organized. The 4-tab structure within each detail page (Ports, Commodities, States, Trade Flows) provides comprehensive coverage. **The architecture is sound.**

### 4.2 Missing Views to Add Within Existing Structure

| Where to Add | What to Add | Why |
|---|---|---|
| **TX-MX Ports tab** | Trade balance trend chart | The deficit story is invisible |
| **TX-MX Ports tab** | Laredo concentration share over time | The risk story needs a chart |
| **TX-MX Commodities tab** | Import/Export directional chart (butterfly/diverging bar) | Maquiladora story needs visualization |
| **TX-MX Commodities tab** | Weight vs. Value bubble chart | Two-economies story |
| **TX-MX States tab** | Mexican state growth rate view | Bajío corridor shift |
| **TX-MX Ports tab** | Port specialization mini-profiles (commodity breakdown per port) | Each port's economic personality |
| **Both Commodities tabs** | Mode-by-commodity breakdown | Rail vs. truck competition |
| **Overview page** | Milestone annotation on trend chart | Growth acceleration story |
| **TX-MX Ports tab** | COVID monthly zoom panel | Resilience/recovery story |

### 4.3 Data Pipeline Additions Needed

To support the new views above, the `05_build_outputs.py` script would need to generate additional aggregated datasets:

1. **Trade balance time series** — Annual exports, imports, and balance by scope (TX-MX, US-MX)
2. **Port × commodity matrix** — Top N commodities per port for port profiles
3. **Commodity direction ratios** — Export share vs. import share per commodity group
4. **Mexican state growth rates** — Year-over-year and period-over-period growth by MexState
5. **Mode × commodity trends** — Truck/rail share per commodity group over time
6. **Monthly COVID zoom** — Monthly data for 2019–2021 period specifically

Most of these can be derived from existing datasets on the frontend side through aggregation, but pre-computing them would keep the app fast.

### 4.4 Textual Content to Add

Each new or existing section should include:

| Location | Content Type | Example |
|---|---|---|
| Tab headers | 1–3 sentence framing paragraph | See Section 3.1 above |
| Key charts | Insight callout below chart | "Laredo handles 60% of TX-MX trade — more than the next 5 ports combined" |
| Overview page | Milestone annotations | "NAFTA (1994)", "Great Recession", "COVID", "Record Year" |
| Port map tooltips | Contextual detail | Port name + total trade + top commodity + YoY change |
| About page | "How to read this dashboard" section | Brief user guide with suggested exploration paths |

---

## Part 5: Priority Ranking of Recommendations

### Tier 1 — High Impact, Relatively Easy
1. **Add narrative intro paragraphs to each tab** — pure text, no new data needed
2. **Add trade balance trend chart** — simple calculation from existing data
3. **Add historical event annotations** (NAFTA, 9/11, Recession, USMCA, COVID) — text overlays on existing charts
4. **Add insight callouts to detail pages** — leverage the existing insightEngine.js
5. **Add Laredo concentration share line** — one calculation on existing port data

### Tier 2 — High Impact, Moderate Effort
6. **Add maquiladora / commodity direction chart** — new visualization, data derivable from existing datasets
7. **Add port specialization view** (commodity breakdown per port) — new viz, may need new dataset
8. **Add Mexican state growth rate view** — new viz, calculation from existing data
9. **Add COVID monthly zoom panel** — new viz, monthly_trends data already exists
10. **Add contextual dollar comparisons** — text research needed for accurate comparisons

### Tier 3 — Nice to Have, Higher Effort
11. **Add weight vs. value bubble chart** — new viz type, data available
12. **Add mode × commodity breakdown** — new viz, new aggregation needed
13. **Add guided tour / story mode** — significant UI work
14. **Add port × commodity heatmap** — new dataset, new viz

---

## Part 6: Summary — The Stories We're Telling vs. The Stories We Should Tell

### What We Tell Well
- Texas is the dominant U.S.-Mexico trade gateway (map + stats)
- Trade has grown enormously over 30 years (trend charts)
- Truck is the dominant mode (donut + stacked bar)
- Laredo is the largest port (bar chart + map)
- Manufacturing goods dominate trade (treemap + commodity charts)
- Mexican states connect to specific Texas ports (flow map + Sankey)

### What We Show But Don't Emphasize Enough
- The widening trade deficit (data is there, story isn't told)
- Laredo's growing concentration (visible in rankings, risk not framed)
- COVID's remarkably fast recovery (annotation exists, V-shape story not told)
- Port specialization differences (data exists in tables, not visualized)

### What We Don't Show At All
- The maquiladora supply chain pattern (parts south, finished goods north)
- Texas as Mexico's energy lifeline (pipeline trade direction)
- Mexico's industrial corridor shifting south (Bajío growth rates)
- Rail losing to truck in specific commodity battles
- The "two economies" (bulk-heavy vs. precision-light goods)
- Trade growth acceleration (milestones and pacing)
- Relatable scale context (comparisons to GDPs, city budgets)

### The Bottom Line

The current dashboard is **technically excellent** — it has the right data, good visualizations, and logical organization. What it lacks is **narrative voice**. The charts present facts but don't argue a thesis. Adding narrative text, insight callouts, a trade balance chart, the maquiladora story, and a few key annotations would transform this from a data exploration tool into a **data storytelling platform** — one that doesn't just show numbers but explains what they mean for Texas, for trade policy, and for the millions of jobs that depend on those trucks crossing at Laredo every day.
