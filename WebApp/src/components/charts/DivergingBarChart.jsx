/**
 * DivergingBarChart — Bilateral horizontal bar chart (left/right from center).
 *
 * Renders a horizontal bar chart where each row has two bars extending in
 * opposite directions from a central axis. Useful for showing import/export
 * or departure/arrival imbalances per category.
 *
 * PROPS
 * @param {Array<Object>} data
 *   Array of objects, each with `labelKey`, `leftKey`, and `rightKey` values.
 *   Example: [{ label: 'DFW', imports: 12000, exports: 8500 }, ...]
 *
 * @param {string} [labelKey='label'] — row label field
 * @param {string} [leftKey='left']   — value extending left
 * @param {string} [rightKey='right'] — value extending right
 * @param {string} [leftLabel='Left']  — legend label for left bars
 * @param {string} [rightLabel='Right'] — legend label for right bars
 * @param {string} [leftColor]  — fill for left bars (default CHART_COLORS[3])
 * @param {string} [rightColor] — fill for right bars (default CHART_COLORS[0])
 * @param {Function} [formatValue] — formatter for value labels
 * @param {number} [maxBars=15]
 * @param {boolean} [animate=true]
 * @param {Array<Object>} [overlayData=[]] — overlay dataset (same shape as data)
 * @param {string} [overlayLabel='Texas'] — legend/tooltip label for overlay
 * @param {string} [overlayColor='#BF5700'] — accent color for overlay dividers
 */
import React, { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { useChartResize, getResponsiveFontSize } from '@/lib/useChartResize'
import { CHART_COLORS, formatCompact } from '@/lib/chartColors'

const TICK_HALF = 5

function DivergingBarChartInner({
  data = [],
  labelKey = 'label',
  leftKey = 'left',
  rightKey = 'right',
  leftLabel = 'Left',
  rightLabel = 'Right',
  leftColor = CHART_COLORS[3],
  rightColor = CHART_COLORS[0],
  formatValue = formatCompact,
  maxBars = 15,
  animate = true,
  overlayData = [],
  overlayLabel = 'Texas',
  overlayColor = '#BF5700',
}) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const { width, height: containerHeight, isFullscreen } = useChartResize(containerRef)

  useEffect(() => {
    if (!data.length || !width) return

    const FS = getResponsiveFontSize(width, isFullscreen)
    const charW = FS * 0.55
    const displayData = data.slice(0, maxBars)

    // Measure label width
    const maxLabelLen = d3.max(displayData, (d) => (d[labelKey] || '').length) || 0
    const labelW = Math.min(width * 0.3, Math.max(100, maxLabelLen * charW + 16))

    const margin = { top: 8, right: 56, bottom: 48, left: labelW }
    const defaultH = Math.max(240, displayData.length * 36 + margin.top + margin.bottom)
    const height = isFullscreen
      ? Math.max(defaultH, containerHeight > 100 ? containerHeight : defaultH)
      : defaultH
    const innerW = Math.max(1, width - margin.left - margin.right)
    const innerH = Math.max(1, height - margin.top - margin.bottom)

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', width).attr('height', height)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // Scales
    const maxVal = d3.max(displayData, (d) => Math.max(d[leftKey] || 0, d[rightKey] || 0)) || 1
    const halfW = innerW / 2

    const xLeft = d3.scaleLinear().domain([0, maxVal]).nice().range([halfW, 0])
    const xRight = d3.scaleLinear().domain([0, maxVal]).nice().range([halfW, innerW])

    const y = d3.scaleBand()
      .domain(displayData.map((d) => d[labelKey]))
      .range([0, innerH])
      .padding(0.3)

    // Center axis line
    g.append('line')
      .attr('x1', halfW).attr('x2', halfW)
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#9ca3af').attr('stroke-width', 1)

    // Bottom axis line
    g.append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', innerH).attr('y2', innerH)
      .attr('stroke', '#9ca3af').attr('stroke-width', 1)

    // Build overlay lookup: label → { imports: val, exports: val }
    const hasOverlay = overlayData.length > 0
    const overlayMap = hasOverlay
      ? new Map(overlayData.map((d) => [d[labelKey], d]))
      : null

    // Hatch pattern for overlay
    const hatchId = `hatch-diverging-${Math.random().toString(36).slice(2, 9)}`
    if (hasOverlay) {
      const defs = svg.append('defs')
      const pat = defs.append('pattern')
        .attr('id', hatchId)
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 6)
        .attr('height', 6)
      pat.append('line')
        .attr('x1', 0).attr('y1', 6).attr('x2', 6).attr('y2', 0)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.5)
    }

    const mainOpacity = hasOverlay ? 0.35 : 1

    // Left bars (imports)
    g.selectAll('.bar-left').data(displayData).enter()
      .append('rect')
      .attr('class', 'bar-left')
      .attr('y', (d) => y(d[labelKey]))
      .attr('height', y.bandwidth())
      .attr('x', halfW)
      .attr('width', 0)
      .attr('rx', 3)
      .attr('fill', leftColor)
      .attr('opacity', mainOpacity)
      .transition()
      .duration(animate ? 600 : 0)
      .delay((d, i) => animate ? i * 30 : 0)
      .attr('x', (d) => xLeft(d[leftKey] || 0))
      .attr('width', (d) => halfW - xLeft(d[leftKey] || 0))

    // Right bars (exports)
    g.selectAll('.bar-right').data(displayData).enter()
      .append('rect')
      .attr('class', 'bar-right')
      .attr('y', (d) => y(d[labelKey]))
      .attr('height', y.bandwidth())
      .attr('x', halfW)
      .attr('width', 0)
      .attr('rx', 3)
      .attr('fill', rightColor)
      .attr('opacity', mainOpacity)
      .transition()
      .duration(animate ? 600 : 0)
      .delay((d, i) => animate ? i * 30 : 0)
      .attr('width', (d) => xRight(d[rightKey] || 0) - halfW)

    // ── Overlay: Texas share within each bar (hatch fill) ──────────────
    if (hasOverlay) {
      // Helper: compute overlay ratio for a given side
      const overlayRatio = (d, key) => {
        const oRow = overlayMap.get(d[labelKey])
        const oVal = oRow ? (oRow[key] || 0) : 0
        const usVal = d[key] || 0
        return usVal > 0 ? Math.min(oVal / usVal, 1) : 0
      }

      // Left overlay (imports — grows leftward from center)
      g.selectAll('.overlay-left').data(displayData).enter()
        .append('rect')
        .attr('class', 'overlay-left')
        .attr('y', (d) => y(d[labelKey]))
        .attr('height', y.bandwidth())
        .attr('rx', 3)
        .attr('fill', leftColor)
        .attr('x', halfW)
        .attr('width', 0)
        .transition()
        .duration(animate ? 600 : 0)
        .delay((d, i) => animate ? i * 30 : 0)
        .attr('x', (d) => {
          const barW = halfW - xLeft(d[leftKey] || 0)
          return halfW - barW * overlayRatio(d, leftKey)
        })
        .attr('width', (d) => {
          const barW = halfW - xLeft(d[leftKey] || 0)
          return barW * overlayRatio(d, leftKey)
        })

      // Hatch overlay on left bars
      g.selectAll('.hatch-left').data(displayData).enter()
        .append('rect')
        .attr('class', 'hatch-left')
        .attr('y', (d) => y(d[labelKey]))
        .attr('height', y.bandwidth())
        .attr('rx', 3)
        .attr('fill', `url(#${hatchId})`)
        .attr('pointer-events', 'none')
        .attr('x', halfW)
        .attr('width', 0)
        .transition()
        .duration(animate ? 600 : 0)
        .delay((d, i) => animate ? i * 30 : 0)
        .attr('x', (d) => {
          const barW = halfW - xLeft(d[leftKey] || 0)
          return halfW - barW * overlayRatio(d, leftKey)
        })
        .attr('width', (d) => {
          const barW = halfW - xLeft(d[leftKey] || 0)
          return barW * overlayRatio(d, leftKey)
        })

      // Burnt-orange divider on left overlay
      g.selectAll('.divider-left').data(displayData).enter()
        .append('line')
        .attr('class', 'divider-left')
        .attr('y1', (d) => y(d[labelKey]))
        .attr('y2', (d) => y(d[labelKey]) + y.bandwidth())
        .attr('stroke', overlayColor)
        .attr('stroke-width', 2)
        .attr('opacity', 0)
        .transition()
        .duration(animate ? 600 : 0)
        .delay((d, i) => animate ? i * 30 : 0)
        .attr('opacity', (d) => {
          const r = overlayRatio(d, leftKey)
          return (r > 0 && r < 1) ? 1 : 0
        })
        .attr('x1', (d) => {
          const barW = halfW - xLeft(d[leftKey] || 0)
          return halfW - barW * overlayRatio(d, leftKey)
        })
        .attr('x2', (d) => {
          const barW = halfW - xLeft(d[leftKey] || 0)
          return halfW - barW * overlayRatio(d, leftKey)
        })

      // Right overlay (exports — grows rightward from center)
      g.selectAll('.overlay-right').data(displayData).enter()
        .append('rect')
        .attr('class', 'overlay-right')
        .attr('y', (d) => y(d[labelKey]))
        .attr('height', y.bandwidth())
        .attr('rx', 3)
        .attr('fill', rightColor)
        .attr('x', halfW)
        .attr('width', 0)
        .transition()
        .duration(animate ? 600 : 0)
        .delay((d, i) => animate ? i * 30 : 0)
        .attr('width', (d) => {
          const barW = xRight(d[rightKey] || 0) - halfW
          return barW * overlayRatio(d, rightKey)
        })

      // Hatch overlay on right bars
      g.selectAll('.hatch-right').data(displayData).enter()
        .append('rect')
        .attr('class', 'hatch-right')
        .attr('y', (d) => y(d[labelKey]))
        .attr('height', y.bandwidth())
        .attr('rx', 3)
        .attr('fill', `url(#${hatchId})`)
        .attr('pointer-events', 'none')
        .attr('x', halfW)
        .attr('width', 0)
        .transition()
        .duration(animate ? 600 : 0)
        .delay((d, i) => animate ? i * 30 : 0)
        .attr('width', (d) => {
          const barW = xRight(d[rightKey] || 0) - halfW
          return barW * overlayRatio(d, rightKey)
        })

      // Burnt-orange divider on right overlay
      g.selectAll('.divider-right').data(displayData).enter()
        .append('line')
        .attr('class', 'divider-right')
        .attr('y1', (d) => y(d[labelKey]))
        .attr('y2', (d) => y(d[labelKey]) + y.bandwidth())
        .attr('stroke', overlayColor)
        .attr('stroke-width', 2)
        .attr('opacity', 0)
        .transition()
        .duration(animate ? 600 : 0)
        .delay((d, i) => animate ? i * 30 : 0)
        .attr('opacity', (d) => {
          const r = overlayRatio(d, rightKey)
          return (r > 0 && r < 1) ? 1 : 0
        })
        .attr('x1', (d) => {
          const barW = xRight(d[rightKey] || 0) - halfW
          return halfW + barW * overlayRatio(d, rightKey)
        })
        .attr('x2', (d) => {
          const barW = xRight(d[rightKey] || 0) - halfW
          return halfW + barW * overlayRatio(d, rightKey)
        })
    }

    // Value labels — left side
    const leftLabelProps = (d) => {
      const val = d[leftKey] || 0
      const barEnd = xLeft(val)
      const labelText = val > 0 ? formatValue(val) : ''
      const estimatedLabelW = labelText.length * FS * 0.495
      const fitsOutside = barEnd > estimatedLabelW + 8
      return { x: fitsOutside ? barEnd - 4 : barEnd + 4, anchor: fitsOutside ? 'end' : 'start', fill: fitsOutside ? 'var(--color-text-secondary)' : '#ffffff' }
    }
    g.selectAll('.val-left').data(displayData).enter()
      .append('text')
      .attr('y', (d) => y(d[labelKey]) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('font-size', `${FS * 0.9}px`)
      .attr('fill', (d) => leftLabelProps(d).fill)
      .attr('text-anchor', (d) => leftLabelProps(d).anchor)
      .attr('x', (d) => leftLabelProps(d).x)
      .text((d) => (d[leftKey] || 0) > 0 ? formatValue(d[leftKey]) : '')
      .attr('opacity', 0)
      .transition().delay(animate ? 400 : 0).duration(300).attr('opacity', 1)

    // Value labels — right side
    const rightLabelProps = (d) => {
      const val = d[rightKey] || 0
      const barEnd = xRight(val)
      const labelText = val > 0 ? formatValue(val) : ''
      const estimatedLabelW = labelText.length * FS * 0.495
      const fitsOutside = barEnd + estimatedLabelW + 8 < innerW
      return { x: fitsOutside ? barEnd + 4 : barEnd - 4, anchor: fitsOutside ? 'start' : 'end', fill: fitsOutside ? 'var(--color-text-secondary)' : '#ffffff' }
    }
    g.selectAll('.val-right').data(displayData).enter()
      .append('text')
      .attr('y', (d) => y(d[labelKey]) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('font-size', `${FS * 0.9}px`)
      .attr('fill', (d) => rightLabelProps(d).fill)
      .attr('text-anchor', (d) => rightLabelProps(d).anchor)
      .attr('x', (d) => rightLabelProps(d).x)
      .text((d) => (d[rightKey] || 0) > 0 ? formatValue(d[rightKey]) : '')
      .attr('opacity', 0)
      .transition().delay(animate ? 400 : 0).duration(300).attr('opacity', 1)

    // ── HTML Tooltip for overlay mode ──────────────────────────────────
    const tipId = `diverging-tip-${Math.random().toString(36).slice(2, 9)}`
    let tipDiv = null
    if (hasOverlay) {
      tipDiv = document.createElement('div')
      tipDiv.id = tipId
      tipDiv.setAttribute('role', 'tooltip')
      Object.assign(tipDiv.style, {
        position: 'fixed', pointerEvents: 'none', display: 'none',
        background: 'white', border: '1px solid #e2e5e9', borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.10)', padding: '12px 14px',
        fontSize: '14px', lineHeight: '1.6', zIndex: '9999', whiteSpace: 'nowrap',
        fontFamily: 'inherit', color: '#333f48', maxWidth: '420px',
      })
      document.body.appendChild(tipDiv)

      // Invisible hover rects per row
      g.append('g').selectAll('.hover-row').data(displayData).enter()
        .append('rect')
        .attr('class', 'hover-row')
        .attr('x', 0)
        .attr('width', innerW)
        .attr('y', (d) => y(d[labelKey]))
        .attr('height', y.bandwidth())
        .attr('fill', 'transparent')
        .on('mouseenter', function (_event, d) {
          tipDiv.style.display = 'block'
          const label = d[labelKey]
          g.selectAll('.bar-left, .bar-right').attr('opacity', (bd) => bd[labelKey] === label ? mainOpacity : mainOpacity * 0.3)
          g.selectAll('.overlay-left, .overlay-right').attr('opacity', (bd) => bd[labelKey] === label ? 1 : 0.3)
          g.selectAll('.hatch-left, .hatch-right').attr('opacity', (bd) => bd[labelKey] === label ? 1 : 0.3)
        })
        .on('mousemove', function (event, d) {
          const oRow = overlayMap.get(d[labelKey])
          tipDiv.textContent = ''

          const header = document.createElement('div')
          Object.assign(header.style, { fontWeight: '700', fontSize: '15px', marginBottom: '6px' })
          header.textContent = d[labelKey]
          tipDiv.appendChild(header)

          const body = document.createElement('div')
          Object.assign(body.style, { borderTop: '1px solid #e5e7eb', paddingTop: '6px' })

          // Column headers
          const colHeader = document.createElement('div')
          Object.assign(colHeader.style, { display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '4px', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' })
          const colDir = document.createElement('span')
          colDir.textContent = ''
          const colRight = document.createElement('span')
          Object.assign(colRight.style, { display: 'flex', gap: '12px' })
          ;['U.S. Total', overlayLabel, 'Share'].forEach((txt, i) => {
            const sp = document.createElement('span')
            sp.textContent = txt
            Object.assign(sp.style, { width: i < 2 ? '80px' : '44px', textAlign: 'right' })
            colRight.appendChild(sp)
          })
          colHeader.appendChild(colDir)
          colHeader.appendChild(colRight)
          body.appendChild(colHeader)

          // Rows for imports and exports
          const sides = [
            { label: leftLabel, color: leftColor, usVal: d[leftKey] || 0, txVal: oRow ? (oRow[leftKey] || 0) : 0 },
            { label: rightLabel, color: rightColor, usVal: d[rightKey] || 0, txVal: oRow ? (oRow[rightKey] || 0) : 0 },
          ]
          sides.forEach((s) => {
            const row = document.createElement('div')
            Object.assign(row.style, { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' })
            const left = document.createElement('span')
            Object.assign(left.style, { display: 'flex', alignItems: 'center', gap: '6px' })
            const dot = document.createElement('span')
            Object.assign(dot.style, { width: '10px', height: '10px', borderRadius: '50%', background: s.color, flexShrink: '0' })
            const lbl = document.createElement('span')
            lbl.style.color = '#6b7280'
            lbl.textContent = s.label
            left.appendChild(dot)
            left.appendChild(lbl)
            row.appendChild(left)
            const right = document.createElement('span')
            Object.assign(right.style, { display: 'flex', gap: '12px', alignItems: 'baseline' })
            const usSpan = document.createElement('span')
            Object.assign(usSpan.style, { fontWeight: '600', width: '80px', textAlign: 'right', opacity: '0.5' })
            usSpan.textContent = formatValue(s.usVal)
            const txSpan = document.createElement('span')
            Object.assign(txSpan.style, { fontWeight: '700', width: '80px', textAlign: 'right' })
            txSpan.textContent = formatValue(s.txVal)
            const pctSpan = document.createElement('span')
            const pct = s.usVal > 0 ? ((s.txVal / s.usVal) * 100).toFixed(0) : '0'
            Object.assign(pctSpan.style, { fontSize: '12px', width: '44px', textAlign: 'right', color: overlayColor, fontWeight: '600' })
            pctSpan.textContent = `${pct}%`
            right.appendChild(usSpan)
            right.appendChild(txSpan)
            right.appendChild(pctSpan)
            row.appendChild(right)
            body.appendChild(row)
          })
          tipDiv.appendChild(body)

          // Footer: total
          const totalUS = sides.reduce((s, r) => s + r.usVal, 0)
          const totalTX = sides.reduce((s, r) => s + r.txVal, 0)
          const footer = document.createElement('div')
          Object.assign(footer.style, { borderTop: '1px solid #e5e7eb', marginTop: '6px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: '700' })
          const totalLabelEl = document.createElement('span')
          totalLabelEl.textContent = 'Total'
          const fRight = document.createElement('span')
          Object.assign(fRight.style, { display: 'flex', gap: '12px' })
          const fUS = document.createElement('span')
          Object.assign(fUS.style, { width: '80px', textAlign: 'right', opacity: '0.5' })
          fUS.textContent = formatValue(totalUS)
          const fTX = document.createElement('span')
          Object.assign(fTX.style, { width: '80px', textAlign: 'right' })
          fTX.textContent = formatValue(totalTX)
          const fPct = document.createElement('span')
          Object.assign(fPct.style, { width: '44px', textAlign: 'right', color: overlayColor, fontWeight: '700', fontSize: '12px' })
          fPct.textContent = `${totalUS > 0 ? ((totalTX / totalUS) * 100).toFixed(0) : '0'}%`
          fRight.appendChild(fUS)
          fRight.appendChild(fTX)
          fRight.appendChild(fPct)
          footer.appendChild(totalLabelEl)
          footer.appendChild(fRight)
          tipDiv.appendChild(footer)

          // Position
          const tipW = tipDiv.offsetWidth
          const tipH = tipDiv.offsetHeight
          const pad = 12
          let tx = event.clientX + 16
          if (tx + tipW + pad > window.innerWidth) tx = event.clientX - tipW - 16
          let ty = event.clientY - tipH - 10
          if (ty < pad) ty = event.clientY + 16
          tx = Math.max(pad, Math.min(tx, window.innerWidth - tipW - pad))
          ty = Math.max(pad, Math.min(ty, window.innerHeight - tipH - pad))
          tipDiv.style.left = `${tx}px`
          tipDiv.style.top = `${ty}px`
        })
        .on('mouseleave', function () {
          tipDiv.style.display = 'none'
          g.selectAll('.bar-left, .bar-right').attr('opacity', mainOpacity)
          g.selectAll('.overlay-left, .overlay-right').attr('opacity', 1)
          g.selectAll('.hatch-left, .hatch-right').attr('opacity', 1)
        })
    }

    // Y Axis labels (centered)
    const yAxisG = g.append('g')
      .attr('transform', `translate(${halfW},0)`)
      .call(d3.axisLeft(y).tickSize(0))
    yAxisG.select('.domain').remove()
    yAxisG.selectAll('.tick text').remove()

    // Draw labels at left margin instead
    const labelG = g.append('g')
    displayData.forEach((d) => {
      const text = d[labelKey] || ''
      const maxChars = Math.floor((labelW - 12) / charW)
      const truncated = text.length > maxChars ? text.slice(0, maxChars - 1) + '\u2026' : text
      labelG.append('text')
        .attr('x', -8)
        .attr('y', y(d[labelKey]) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('font-size', `${FS}px`)
        .attr('fill', 'var(--color-text-secondary)')
        .text(truncated)
    })

    // Legend at bottom
    const legendY = innerH + 28
    const legendItems = [
      { label: leftLabel, color: leftColor, isHatch: false },
      { label: rightLabel, color: rightColor, isHatch: false },
    ]
    if (hasOverlay) {
      legendItems.push({ label: `${overlayLabel} Share (hatched)`, color: overlayColor, isHatch: true })
    }
    const legendG = svg.append('g')
    let xOff = margin.left + (innerW - legendItems.reduce((s, l) => s + l.label.length * charW + 36, 0)) / 2
    legendItems.forEach((item) => {
      const ig = legendG.append('g').attr('transform', `translate(${xOff}, ${margin.top + legendY})`)
      if (item.isHatch) {
        ig.append('rect')
          .attr('width', 14).attr('height', 14)
          .attr('rx', 3).attr('fill', item.color).attr('opacity', 0.5)
          .attr('y', -7)
        ig.append('rect')
          .attr('width', 14).attr('height', 14)
          .attr('rx', 3).attr('fill', `url(#${hatchId})`)
          .attr('y', -7)
      } else {
        ig.append('rect')
          .attr('width', 14).attr('height', 14)
          .attr('rx', 3).attr('fill', item.color)
          .attr('y', -7)
      }
      ig.append('text')
        .attr('x', 20).attr('y', 5)
        .attr('font-size', `${FS}px`)
        .attr('fill', 'var(--color-text-primary)')
        .text(item.label)
      xOff += item.label.length * charW + 36
    })

    return () => { document.getElementById(tipId)?.remove() }
  }, [data, width, containerHeight, isFullscreen, labelKey, leftKey, rightKey, leftColor, rightColor, leftLabel, rightLabel, formatValue, maxBars, animate, overlayData, overlayLabel, overlayColor])

  const displayCount = Math.min(data.length, maxBars)
  const minH = Math.max(240, displayCount * 36 + 56)

  return (
    <div ref={containerRef} className="w-full" style={{ minHeight: minH }}>
      <svg ref={svgRef} className="w-full" role="img" aria-label={`Diverging bar chart comparing ${leftLabel} and ${rightLabel}`} />
    </div>
  )
}

export default React.memo(DivergingBarChartInner)
