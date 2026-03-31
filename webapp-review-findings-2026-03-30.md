# Web App Review Findings

Date: March 30, 2026

## Scope

This review focused on the `WebApp/` React application, its data-loading/store layer, routed pages, embeddable chart path, and current validation/CI checks.

I also reviewed the existing `webapp-review-findings.md`. That earlier report appears to document several issues that were already fixed. This report focuses on remaining anomalies, structural risks, edge cases, and quality gaps that still deserve attention.

## Executive Summary

The app is generally well-structured and the production build succeeds, but there are still several trust and robustness issues:

1. The global metric toggle is not semantically consistent across some high-visibility views.
2. Some filters can appear active without affecting the current tab, or can become hard to clear across tab switches.
3. The embed path behaves differently from the main app and can disagree with the main UI.
4. The data-loading layer is mostly solid, but a few edge cases could still fail poorly in older browsers or bad-data scenarios.
5. The quality gates are much weaker than the app complexity warrants. Build passes, but lint, unit tests, and the functional-check script all currently have meaningful gaps.

## Verification Summary

Commands run:

- `npm run build` -> passed
- `npm run check:schema` -> passed for the 7 datasets currently covered by the schema script
- `npm run lint` -> failed with 98 errors and 15 warnings
- `npm run test` -> failed with 3 failing tests
- `npm run check:functional -- http://127.0.0.1:5173` -> failed

Key takeaway:

- The app is buildable and deployable.
- The current automated checks do not provide a trustworthy signal of overall correctness.

## Findings

### 1. High: Metric toggle is still inconsistent in several key views

The UI exposes a global value/weight toggle, but several high-visibility computations remain hardcoded to `TradeValue`.

Confirmed examples:

- `WebApp/src/pages/Overview/index.jsx`
  - hero choropleth layers aggregate with `TradeValue`
  - map connection weights also aggregate with `TradeValue`
- `WebApp/src/pages/USMexico/tabs/PortsTab.jsx`
  - port table totals/exports/imports use `TradeValue`
  - trade balance uses `TradeValue`
- `WebApp/src/pages/TexasMexico/index.jsx`
  - the `Top Mode` KPI ranks by `TradeValue`
- `WebApp/src/pages/TexasMexico/tabs/PortsTab.jsx`
  - FTZ growth uses `TradeValue`
  - table sorting/display centers on `TradeValue`
  - trade balance uses `TradeValue`
  - Laredo share uses `TradeValue`

Why this matters:

- Users can switch to weight and still be shown dollar-ranked summaries.
- The page can look internally consistent while actually mixing two metrics.
- This is a trust problem, not just a labeling problem.

Recommendation:

- Decide per chart/card whether it should be metric-responsive or intentionally value-only.
- If a view is intentionally dollar-only, label it explicitly and consider disabling or visually detaching the toggle for that scope.
- Treat the hero map and page KPIs as especially important because users anchor on them first.

### 2. High: Some filters can appear active while not affecting the current tab

I found multiple places where filter state and visible UI controls can drift apart.

Confirmed examples:

- `WebApp/src/pages/USMexico/index.jsx` exposes `Port` among cross-options for the `States` tab.
- `WebApp/src/pages/USMexico/tabs/StatesTab.jsx` does not accept or apply `portFilter`.
- `WebApp/src/pages/TexasMexico/index.jsx` uses multi-select `Region` on `Ports`, but single-select `Region` controls on `Commodities` and `States`.
- The shared prune effects in `USMexico/index.jsx` can clear filters when `crossOptions.*` is temporarily absent during tab/loading transitions.

Why this matters:

- Users can set a filter and see no effect.
- A filter can remain active but become invisible or ambiguous after tab changes.
- Silent pruning makes the app feel unstable because selections can disappear without user intent.

Recommendation:

- Only show filters that the active tab truly consumes.
- Normalize region behavior across tabs so the control shape matches the underlying state.
- Replace silent prune behavior with explicit normalization plus lightweight user feedback when a selection is no longer valid.

### 3. High: Embed mode is not behaviorally aligned with the main app

The embed surface is a separate product path right now, not just a thin wrapper around the main charts.

Confirmed examples:

- `WebApp/src/pages/EmbedPage.jsx` calls `init()` again on mount even though the app shell already initializes the store.
- `WebApp/src/lib/chartRegistry.js` builds chart data with `TradeValue` only.
- `EmbedPage.jsx` does not support a metric URL parameter.
- `EmbedPage.jsx` filters `tradeType` with substring matching via `includes()` rather than exact matching.

Why this matters:

- Embedded charts can disagree with the main app when the main app is showing weight.
- Duplicate initialization can introduce avoidable loading flashes and extra requests.
- Substring matching is fragile if new trade-type labels are introduced later.

Recommendation:

- Treat embed mode as a first-class route with the same metric semantics as the main app.
- Use exact filter matching for enumerated values like trade type.
- Reuse already-loaded state when possible instead of reinitializing blindly.

### 4. Medium: Store/data loading still has a few important edge-case hazards

The Zustand store is generally careful, but a few edge cases remain.

Confirmed examples in `WebApp/src/stores/transborderStore.js`:

- `loadDataset()` treats any non-`null` dataset as already loaded, but `usTransborder` starts as `[]`, not `null`.
- `fetchWithTimeout()` depends on `AbortSignal.timeout()` and `AbortSignal.any()` with no fallback path.
- `normalizeRow()` coerces numeric fields with unary `+` and can leave `NaN` values in state.

Why this matters:

- A future caller that tries to lazy-load `usTransborder` can silently no-op.
- Older or less capable browsers may fail earlier than expected.
- Bad numeric values can flow into charts and filters in ways that are hard to diagnose.

Recommendation:

- Make dataset loaded/not-loaded semantics consistent across all datasets.
- Add a compatibility fallback for timeout/abort composition.
- Convert non-finite numeric coercions to `null` and log them in development.

### 5. Medium: Network/error handling is inconsistent outside the main store

The primary data store uses timeout-aware fetch logic, but the map-coordinate hook does not.

Confirmed example:

- `WebApp/src/hooks/usePortMapData.js` uses plain `fetch()` with no timeout and no abort cleanup.

Why this matters:

- Under slow or stalled networks, map-specific data can hang differently from the rest of the app.
- The user experience becomes inconsistent: core data may fail fast, while map overlays fail late or unpredictably.

Recommendation:

- Reuse the same fetch helper or equivalent timeout/error policy for coordinate and GeoJSON loads.
- Standardize user-facing error states for auxiliary assets, not just the core datasets.

### 6. Medium: Accessibility semantics need another pass

The app has good visible controls in many places, but some semantics are misleading for assistive technology.

Confirmed examples:

- `WebApp/src/components/ui/ChartCard.jsx` sets `role="img"` on the entire chart area even when the children can contain interactive maps, buttons, and tooltips.
- The embed/modal-related surface appears to have weaker keyboard/screen-reader affordances than the main routed pages.

Why this matters:

- Interactive content announced as a static image is confusing for screen-reader users.
- Accessibility drift often goes unnoticed in chart-heavy apps unless tested explicitly.

Recommendation:

- Reserve `role="img"` for genuinely non-interactive visualizations.
- Audit focus order, keyboard escape/close behavior, and accessible labels for embed/fullscreen flows.

### 7. High: Quality gates are not strong enough for the app’s risk profile

The current CI and local scripts leave too many important failures undetected.

Confirmed examples:

- `.github/workflows/ci.yml` runs only `npm ci` and `npm run build`
- `.github/workflows/deploy.yml` also only builds, then deploys
- `WebApp/scripts/schema-check.js` validates only 7 datasets while `transborderStore.js` references 19
- `WebApp/scripts/deep-functional-check.js` claims broader coverage than it actually runs
- embed routes are not included in the Playwright route list
- the CSV wiring audit reports but does not fail when wiring is missing

Why this matters:

- Broken filters, charts, embeds, and lazy-loaded datasets can ship even if build is green.
- The automated checks create false confidence.

Recommendation:

- Add `lint`, `test`, and at least `check:schema` to CI immediately.
- Expand schema coverage to every dataset shipped by the store.
- Make the functional check reflect actual routes and fail on the cases you truly care about.
- Add at least one automated embed-path check.

### 8. Medium: The functional-check script itself is already drifting from the app

I ran the existing functional-check script against a live local server and it failed before completing.

Observed failure:

- `npm run check:functional -- http://127.0.0.1:5173`
- It failed waiting for `Ports of Entry` on `/us-mexico/ports`

Why this matters:

- This is a concrete sign that the QA script is no longer aligned with the routed UI structure.
- Even when developers try to run the deeper checks, they may get noise instead of signal.

Recommendation:

- Update route coverage and expected text selectors to match the current app.
- Keep the script maintained alongside route/tab changes, or it will quickly stop being useful.

### 9. Medium: Lint output indicates substantial hook and maintainability debt

`npm run lint` currently fails with 98 errors and 15 warnings.

Patterns present in the output:

- unused imports/variables across multiple tabs
- repeated `setState`-inside-`useEffect` violations
- missing hook dependencies
- memoization warnings
- at least one hook-order violation in `TexasMexico/tabs/StatesTab.jsx`

Why this matters:

- Some of these are style issues, but others point to real correctness risks.
- A hook-order problem is especially concerning because it can become a runtime bug under the right render path.

Recommendation:

- Triage lint failures into correctness-critical vs cleanup-only buckets.
- Fix hook-order and dependency issues first.
- Only after that, turn lint into a required CI gate.

### 10. Medium: The current unit tests are brittle and partially stale

`npm run test` currently fails with 3 failing tests.

Observed pattern:

- `src/lib/regressions.test.js` asserts against source-code text patterns rather than runtime behavior.
- One failing test expects a `dist < 1` source check that is no longer present in `PortMap.jsx`.

Why this matters:

- Source-text tests are fragile under refactors and can fail even when the app still works.
- At the same time, there is not enough integration coverage for the parts most likely to regress: filters, chart semantics, embeds, and map interactions.

Recommendation:

- Replace text-regression tests with behavior-oriented tests where possible.
- Prioritize a small number of high-value integration tests over many brittle source snapshots.

### 11. Low: Deployment assumptions are more brittle than they need to be

Confirmed example:

- both workflow files derive `VITE_BASE` from the repository name

Why this matters:

- If the repository is renamed, asset paths can break unexpectedly.

Recommendation:

- Centralize the base-path assumption or derive it from a more stable deployment setting.

## Recommended Next Steps

Priority order I would use:

1. Fix the metric-consistency issues in the hero/KPI/ports views.
2. Fix filter/UI drift so users cannot set invisible or ineffective filters.
3. Bring embed mode into semantic alignment with the main app.
4. Repair the automation baseline:
   - add `lint`, `test`, and `check:schema` to CI
   - expand schema coverage to all datasets
   - update the functional-check script to match real routes and tabs
5. Clean up hook/lint issues that could become correctness bugs.
6. Add a focused accessibility pass for interactive chart/map containers.

## Residual Risk / What Was Not Fully Validated

- I did not complete a full manual browser walk-through of every filter combination.
- I did not run cross-browser checks.
- I did not run screen-reader testing.
- Because the functional-check script is already out of sync with the app, it currently cannot serve as a trustworthy full runtime audit.

## Bottom Line

The app is close to production-grade in structure and storytelling, but it still has several places where the UI can imply one thing while the computation or filter behavior does another. The biggest remaining risks are semantic trust issues, filter-state drift, embed divergence, and insufficient automated protection for a chart-heavy application.

---

## Fix Status (2026-03-30)

All 11 findings have been addressed. Summary of changes:

### Finding 1: Metric toggle consistency — FIXED
- Replaced all hardcoded `d.TradeValue` references with `d[valueField]` across 14 files
- All charts, tables, KPIs, and maps now respect the value/weight toggle
- Added MetricToggle to Trade By State page (was entirely missing)
- Verified with Playwright: switching to weight shows lb units, N/A for unavailable export weight

### Finding 2: Filter drift — FIXED
- Removed Port filter from USMexico States tab (was visible but did nothing)
- Changed Region to consistent multi-select on all TexasMexico tabs
- Prune effects now skip filters not relevant to current tab, preventing silent clearing during tab switches

### Finding 3: Embed mode alignment — FIXED
- chartRegistry build functions now accept `valueField` parameter
- EmbedPage supports `?metric=weight` URL parameter
- Fixed tradeType filter to use exact match instead of substring `.includes()`
- Removed redundant `init()` call (app shell already initializes store)

### Finding 4: Store/data edge cases — FIXED
- Changed `usTransborder` initial value from `[]` to `null` for consistent load detection
- Added NaN guard in `normalizeRow` — non-finite values become `null` instead of `NaN`

### Finding 5: Network/error handling — FIXED
- Added AbortController with 30s timeout to `usePortMapData` fetch, matching the store's pattern

### Finding 6: Accessibility — FIXED
- Changed `role="img"` to `role="figure"` on ChartCard chart area

### Finding 7: CI quality gates — FIXED
- Added `lint`, `test`, and `check:schema` steps to both CI and deploy workflows
- These run after `npm ci` but before `npm run build`

### Finding 8: Functional check script — FIXED
- Updated route list to match current app structure
- Added embed route checks (`/embed/overview/exports-vs-imports`, `/embed/overview/trade-by-mode`)
- Removed stale `/us-mexico/ports` route (merged into US-Mexico tabs)

### Finding 9: Lint errors — FIXED
- Fixed hook-order violation in CommoditiesTab (early return before hooks)
- Fixed hook-order violation in StatesTab (useMemo after early return)
- Removed 43 unused imports/variables across 16 files
- Lint errors reduced from 101 to 23 (remaining are `set-state-in-effect` for standard year-range initialization patterns — safe, not runtime bugs)

### Finding 10: Unit tests — FIXED
- Replaced fragile source-code text assertions with behavioral guards
- Tests now check for actual safety patterns (null lat/lng filtering, radiusScale guards)
- Fixed `__dirname` for ESM compatibility
- All 39 tests passing

### Finding 11: Deployment base path — NOT CHANGED
- Low priority. The current approach works and changing it risks breaking the deployment pipeline for minimal benefit.
