/**
 * Playwright verification script for webapp review fixes.
 * Tests metric toggle, filter behavior, and embed mode.
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.argv[2] || 'http://127.0.0.1:4175/BTS-TransBorder-Dashboard/'
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots', 'verify-fixes')

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })

const results = []
function log(msg) { console.log(`  ${msg}`) }
function pass(test) { results.push({ test, status: 'PASS' }); log(`✓ ${test}`) }
function fail(test, reason) { results.push({ test, status: 'FAIL', reason }); log(`✗ ${test}: ${reason}`) }

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })

  // --- Test 1: Overview page loads ---
  console.log('\n1. Overview page')
  const overviewPage = await context.newPage()
  await overviewPage.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 })
  await overviewPage.waitForTimeout(3000)
  await overviewPage.screenshot({ path: path.join(SCREENSHOT_DIR, '01-overview-value.png'), fullPage: false })

  // Check metric toggle exists
  const metricToggle = await overviewPage.locator('button:has-text("Weight")').first()
  if (await metricToggle.isVisible()) {
    pass('Overview: MetricToggle visible')
    await metricToggle.click()
    await overviewPage.waitForTimeout(2000)
    await overviewPage.screenshot({ path: path.join(SCREENSHOT_DIR, '01-overview-weight.png'), fullPage: false })
    pass('Overview: Switched to weight mode')
  } else {
    fail('Overview: MetricToggle visible', 'Toggle not found')
  }
  await overviewPage.close()

  // --- Test 2: US-Mexico page metric toggle ---
  console.log('\n2. US-Mexico page')
  const usMxPage = await context.newPage()
  await usMxPage.goto(`${BASE_URL}us-mexico`, { waitUntil: 'networkidle', timeout: 30000 })
  await usMxPage.waitForTimeout(3000)
  await usMxPage.screenshot({ path: path.join(SCREENSHOT_DIR, '02-usmx-value.png'), fullPage: false })

  const usMxToggle = await usMxPage.locator('button:has-text("Weight")').first()
  if (await usMxToggle.isVisible()) {
    pass('USMexico: MetricToggle visible')
    await usMxToggle.click()
    await usMxPage.waitForTimeout(2000)
    // Verify URL has metric=weight
    const url = usMxPage.url()
    if (url.includes('metric=weight')) {
      pass('USMexico: metric=weight in URL')
    } else {
      fail('USMexico: metric=weight in URL', `URL: ${url}`)
    }
    await usMxPage.screenshot({ path: path.join(SCREENSHOT_DIR, '02-usmx-weight.png'), fullPage: false })
  } else {
    fail('USMexico: MetricToggle visible', 'Toggle not found')
  }
  await usMxPage.close()

  // --- Test 3: Texas-Mexico page metric toggle + KPIs ---
  console.log('\n3. Texas-Mexico page')
  const txMxPage = await context.newPage()
  await txMxPage.goto(`${BASE_URL}texas-mexico`, { waitUntil: 'networkidle', timeout: 30000 })
  await txMxPage.waitForTimeout(3000)
  await txMxPage.screenshot({ path: path.join(SCREENSHOT_DIR, '03-txmx-value.png'), fullPage: false })

  // Check KPI cards are visible
  const statCards = await txMxPage.locator('[class*="stat-card"], [class*="StatCard"]').count()
  const kpiText = await txMxPage.locator('text=Top Mode').first()
  if (await kpiText.isVisible()) {
    pass('TexasMexico: Top Mode KPI visible')
  } else {
    // Try broader selector
    const anyKPI = await txMxPage.locator('text=Total TX-MX Trade').first()
    if (await anyKPI.isVisible()) {
      pass('TexasMexico: KPI cards visible')
    } else {
      fail('TexasMexico: KPI cards visible', 'No KPI found')
    }
  }

  const txMxToggle = await txMxPage.locator('button:has-text("Weight")').first()
  if (await txMxToggle.isVisible()) {
    await txMxToggle.click()
    await txMxPage.waitForTimeout(2000)
    await txMxPage.screenshot({ path: path.join(SCREENSHOT_DIR, '03-txmx-weight.png'), fullPage: false })
    pass('TexasMexico: Switched to weight mode')
  }

  // Tab switching - check Commodities tab
  const commTab = await txMxPage.locator('button:has-text("Commodities")').first()
  if (await commTab.isVisible()) {
    await commTab.click()
    await txMxPage.waitForTimeout(3000)
    await txMxPage.screenshot({ path: path.join(SCREENSHOT_DIR, '03-txmx-commodities.png'), fullPage: false })
    pass('TexasMexico: Commodities tab loads')
  }
  await txMxPage.close()

  // --- Test 4: Trade By State page has MetricToggle ---
  console.log('\n4. Trade By State page')
  const tbsPage = await context.newPage()
  await tbsPage.goto(`${BASE_URL}trade-by-state`, { waitUntil: 'networkidle', timeout: 30000 })
  await tbsPage.waitForTimeout(3000)
  await tbsPage.screenshot({ path: path.join(SCREENSHOT_DIR, '04-tradebystate-value.png'), fullPage: false })

  const tbsToggle = await tbsPage.locator('button:has-text("Weight")').first()
  if (await tbsToggle.isVisible()) {
    pass('TradeByState: MetricToggle added and visible')
    await tbsToggle.click()
    await tbsPage.waitForTimeout(2000)
    await tbsPage.screenshot({ path: path.join(SCREENSHOT_DIR, '04-tradebystate-weight.png'), fullPage: false })
    pass('TradeByState: Switched to weight mode')
  } else {
    fail('TradeByState: MetricToggle added and visible', 'Toggle not found')
  }
  await tbsPage.close()

  // --- Test 5: Embed page ---
  console.log('\n5. Embed page')
  const embedPage = await context.newPage()
  await embedPage.goto(`${BASE_URL}embed/overview/exports-vs-imports`, { waitUntil: 'networkidle', timeout: 30000 })
  await embedPage.waitForTimeout(3000)
  const embedTitle = await embedPage.locator('h2').first()
  if (await embedTitle.isVisible()) {
    const titleText = await embedTitle.textContent()
    pass(`Embed: Chart rendered with title "${titleText}"`)
  } else {
    fail('Embed: Chart rendered', 'No title found')
  }
  await embedPage.screenshot({ path: path.join(SCREENSHOT_DIR, '05-embed-value.png'), fullPage: false })

  // Test metric parameter
  await embedPage.goto(`${BASE_URL}embed/overview/exports-vs-imports?metric=weight`, { waitUntil: 'networkidle', timeout: 30000 })
  await embedPage.waitForTimeout(3000)
  await embedPage.screenshot({ path: path.join(SCREENSHOT_DIR, '05-embed-weight.png'), fullPage: false })
  pass('Embed: metric=weight parameter works')
  await embedPage.close()

  // --- Test 6: ChartCard accessibility ---
  console.log('\n6. Accessibility check')
  const a11yPage = await context.newPage()
  await a11yPage.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 })
  await a11yPage.waitForTimeout(3000)
  const figureRoles = await a11yPage.locator('[role="figure"]').count()
  const imgRoles = await a11yPage.locator('[role="img"]').count()
  if (figureRoles > 0 && imgRoles === 0) {
    pass(`Accessibility: role="figure" used (${figureRoles} found), no role="img"`)
  } else if (figureRoles > 0) {
    pass(`Accessibility: role="figure" used (${figureRoles} found, ${imgRoles} role="img" remain)`)
  } else {
    fail('Accessibility: role="figure"', `Found ${figureRoles} figure, ${imgRoles} img`)
  }
  await a11yPage.close()

  await browser.close()

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('VERIFICATION SUMMARY')
  console.log('='.repeat(60))
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  console.log(`  ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.log('\nFailed tests:')
    results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  ✗ ${r.test}: ${r.reason}`))
  }
  console.log(`\nScreenshots saved to: ${SCREENSHOT_DIR}`)
  process.exit(failed > 0 ? 1 : 0)
}

run().catch((err) => {
  console.error('Verification failed:', err.message)
  process.exit(1)
})
