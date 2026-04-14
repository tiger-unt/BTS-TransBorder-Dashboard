# Dashboard Video Walkthrough Plan

## Goal

Create a 5-10 minute narrated video walkthrough of the BTS TransBorder Freight Dashboard that:
- Tells the data story the dashboard presents
- Shows how to navigate and use the dashboard
- Demonstrates filters, chart interactions, and export features
- Requires no manual recording or voiceover from the team

## Approach (3-Step Pipeline)

### Step 1: Automated Screen Recording (Claude generates)

Use **Playwright** (browser automation) to:
- Launch the dashboard in a real browser
- Navigate through every page, tab, and key interaction
- Move the mouse cursor visibly to each element before clicking
- Add short pauses so viewers can follow along
- Record the entire session as a video file (MP4/WebM)

**Scenes to record** (in order):

#### Scene 1 - Opening / Overview Page (~1-2 min)
1. Dashboard loads - pause on hero section and navigation bar
2. Hover over the Overview choropleth map - show port markers and state colors
3. Change the map year selector to show data updating
4. Pan across the 4 stat cards (Total Trade, Exports, Imports, Trade Balance)
5. Scroll to Annual Trade Trends line chart - hover to show tooltips
6. Show the historical annotations (NAFTA, 2008 crisis, COVID)
7. Scroll to Trade by Mode bar chart
8. Demonstrate chart actions: click fullscreen button, then close; click download dropdown (show CSV options); click PNG export

#### Scene 2 - US-Mexico Trade: Ports Tab (~1.5 min)
1. Click "US-Mexico" in the top navigation
2. Show the hero section and 5 stat cards
3. Point out the filter sidebar on the right
4. Show the Metric toggle (switch between Value and Weight)
5. Select a specific Year from the Year filter
6. Select a Trade Type (Imports)
7. Show active filter tags appearing at the top of the sidebar
8. Scroll through charts: Port Map, Trade Trends, Mode Share donut, Top Ports bar chart
9. Show the Port Rankings data table - click a column header to sort
10. Click "Reset all filters" to clear everything

#### Scene 3 - US-Mexico Trade: Commodities Tab (~1 min)
1. Click the "Commodities" tab
2. Show the Commodity Treemap - click to drill down into a group
3. Use breadcrumb to navigate back up
4. Scroll to the Diverging Bar Chart (imports vs exports by group)
5. Show the Commodity Group filter in the sidebar

#### Scene 4 - US-Mexico Trade: States Tab (~45 sec)
1. Click the "States" tab
2. Show US and Mexican state choropleth maps
3. Hover over a state to see tooltip values
4. Scroll to the Lollipop charts (growth rates)

#### Scene 5 - US-Mexico Trade: Trade Flows Tab (~45 sec)
1. Click the "Trade Flows" tab
2. Show the Sankey diagram (US State -> Port -> Mexican State)
3. Show the Heatmap matrix
4. Hover to highlight a specific corridor

#### Scene 6 - Texas-Mexico Trade Page (~1.5 min)
1. Click "Texas-Mexico" in the top navigation
2. Show how this page focuses on Texas specifically
3. Go to the Commodities tab
4. Show the Bar Chart Race animation - click Play, let it run a few seconds, then Pause
5. Show the Scatter Plot (value vs weight)
6. Demonstrate the Region convenience filter (select "Laredo" - show ports auto-populate)
7. Go to the States tab - show the Sankey diagram for Texas ports to Mexican states

#### Scene 7 - Cross-Cutting Features (~30 sec)
1. Show the sidebar collapse/expand toggle
2. Show multiple filters active at once - point out filter tags
3. Click "Clear all" to reset
4. Quick scroll through the About page (methodology, glossary, data sources)

### Step 2: Narration Script (Claude generates)

A timed narration script will be written to match each scene, covering:

- **Data story**: What the numbers mean, key trends (e.g., trade growing from $X to $Y, truck mode dominance, Laredo's 60% share, maquiladora patterns)
- **Navigation guidance**: "Click here to switch pages", "Use these tabs to explore different dimensions"
- **Feature explanation**: "Every chart can be viewed fullscreen, downloaded as CSV data, or exported as a PNG image"
- **Filter tutorial**: "Use the sidebar filters to narrow the data by year, trade type, mode, and more"

Target: ~100-120 words per minute of narration (natural speaking pace).

### Step 3: Final Assembly (Manual - ~15 min of effort)

Use **CapCut** (free desktop app, no watermark) to combine video + narration:

1. Import the Playwright screen recording video
2. Paste the narration script into CapCut's built-in **AI Text-to-Speech**
   - Select a professional voice (CapCut offers many free voices)
   - Generate the audio track
3. Align audio to video (trim/adjust timing as needed)
4. Optional enhancements:
   - Add title card at the beginning ("BTS TransBorder Freight Dashboard")
   - Add section title overlays at scene transitions
   - Add subtle background music (CapCut has free music library)
   - Enable auto-captions (CapCut generates these automatically)
5. Export as MP4

### Alternative to CapCut for Step 3

If CapCut doesn't work well:
- **Google NotebookLM**: Paste the script to generate natural-sounding audio, then combine in any video editor
- **Clipchamp** (built into Windows 11): Import video + audio, basic editing
- **Canva** (free tier): Video editor with text-to-speech

## Deliverables

| Deliverable | Generated by | Format |
|---|---|---|
| Playwright automation script | Claude | JavaScript file |
| Screen recording video | Playwright | MP4 or WebM |
| Narration script (timed) | Claude | Markdown with timestamps |
| Final video | CapCut (manual assembly) | MP4, 5-10 min |

## Prerequisites

- Node.js installed (already available)
- Playwright installed: `npm install playwright`
- Dashboard running locally: `npm run dev`
- CapCut desktop app installed (free download from capcut.com)

## Estimated Timeline

| Step | Time |
|---|---|
| Step 1: Write and run Playwright script | ~1 hour (Claude) |
| Step 2: Write narration script | ~30 min (Claude) |
| Step 3: Assemble in CapCut | ~15-30 min (you) |
| **Total** | **~2 hours** |
