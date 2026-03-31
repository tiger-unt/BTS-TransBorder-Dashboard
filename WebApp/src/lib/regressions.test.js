/**
 * Regression tests for fixed bugs.
 * These tests prevent previously fixed issues from quietly returning.
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('Regression: USMexico page passes commodityDetail only to CommoditiesTab', () => {
  const pagePath = path.resolve(__dirname, '../pages/USMexico/index.jsx')
  const source = fs.readFileSync(pagePath, 'utf-8')

  it('does not use commodityDetail === null as a top-level loading gate', () => {
    // commodityDetail may be checked inside memos, but the page should not
    // block the entire render waiting for commodityDetail to load.
    // A top-level gate would look like: if (commodityDetail === null) return ...
    const lines = source.split('\n')
    const topLevelGate = lines.some(
      (line) => /^\s*if\s*\(\s*commodityDetail\s*===\s*null\s*\)/.test(line),
    )
    expect(topLevelGate).toBe(false)
  })
})

describe('Regression: PortMap handles missing or zero values safely', () => {
  const mapPath = path.resolve(__dirname, '../components/maps/PortMap.jsx')
  const source = fs.readFileSync(mapPath, 'utf-8')

  it('filters out ports with null lat/lng', () => {
    // Ports without coordinates should be filtered before rendering markers
    expect(source).toMatch(/lat\s*!=\s*null/)
    expect(source).toMatch(/lng\s*!=\s*null/)
  })

  it('guards radiusScale against zero or null maxValue', () => {
    // radiusScale must not divide by zero when maxValue is 0 or null
    expect(source).toMatch(/!maxValue/)
  })

  it('ensures maxValue is at least 1 to prevent division by zero', () => {
    // Math.max(1, ...) guarantees maxValue >= 1
    expect(source).toMatch(/Math\.max\(\s*1/)
  })
})
