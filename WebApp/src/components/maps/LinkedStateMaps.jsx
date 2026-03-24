/**
 * LinkedStateMaps.jsx
 *
 * Side-by-side US States + Mexican States choropleth maps with linked interactivity.
 * Click a US state  → MX map re-colors to show only trade with that US state.
 * Click a MX state  → US map re-colors to show only trade with that MX state.
 * Click the selected state again (or "Clear") to reset to the aggregate view.
 *
 * Props:
 *   odFlows      — Pre-filtered OD rows [{ State, MexState, TradeValue, ... }]
 *   formatValue  — Currency formatter
 *   height       — CSS min-height for map area (default '420px')
 */
import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents } from 'react-leaflet'
import * as d3 from 'd3'
import 'leaflet/dist/leaflet.css'

import {
  ScrollWheelGuard,
  MapResizeHandler,
  ResetZoomButton,
  TooltipSync,
  formatCurrencyDefault,
} from './mapHelpers'

const BASE = import.meta.env.BASE_URL

/* ── GeoJSON cache + hook ──────────────────────────────────────────── */
const geoCache = {}

function useGeoJSON(url) {
  const [geojson, setGeojson] = useState(geoCache[url] || null)
  const [loading, setLoading] = useState(!geoCache[url])

  useEffect(() => {
    if (!url) { setLoading(false); return }
    if (geoCache[url]) { setGeojson(geoCache[url]); setLoading(false); return }
    let cancelled = false
    setLoading(true)
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        geoCache[url] = data
        if (!cancelled) { setGeojson(data); setLoading(false) }
      })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [url])

  return { geojson, loading }
}

/* ── Click-away reset ──────────────────────────────────────────────── */
function MapClickReset({ onReset }) {
  useMapEvents({
    click: (e) => { if (!e.originalEvent?._stopped) onReset() },
  })
  return null
}

/* ── Top-N detail panel (shows when a state is selected) ───────────── */
function DetailPanel({ selection, partnerData, formatValue, side }) {
  if (!selection) return null

  const label = side === 'us' ? 'Mexican state' : 'U.S. state'
  const top = partnerData.slice(0, 10)
  const total = partnerData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="absolute top-2 right-2 z-[1000] bg-white/95 border border-border-light rounded-lg shadow-lg px-3 py-2 max-w-[210px] max-h-[260px] overflow-y-auto text-sm">
      <div className="font-semibold text-text-primary mb-0.5">{selection}</div>
      <div className="text-xs text-text-secondary mb-1.5">
        {formatValue(total)} total &middot; {partnerData.length} {label}s
      </div>
      {top.map((d) => (
        <div key={d.name} className="flex justify-between gap-2 py-0.5">
          <span className="truncate">{d.name}</span>
          <span className="text-text-secondary whitespace-nowrap">{formatValue(d.value)}</span>
        </div>
      ))}
      {partnerData.length > 10 && (
        <div className="text-xs text-text-secondary italic mt-1">
          +{partnerData.length - 10} more
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   Single map panel (one side of the pair)
   ══════════════════════════════════════════════════════════════════════ */
function MapPanel({
  geojsonUrl, stateData, colorRange, title, subtitle,
  selectedState, isSourceMap, onSelectState, onReset,
  formatValue, emptyColor = '#f0f0f0',
  center, zoom, partnerData,
}) {
  const { geojson, loading } = useGeoJSON(geojsonUrl)
  const geoJsonRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const [mapActive, setMapActive] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const hintTimer = useRef(null)

  const valueMap = useMemo(() => {
    const m = new Map()
    for (const d of stateData) if (d.name && d.value != null) m.set(d.name, d.value)
    return m
  }, [stateData])

  const colorScale = useMemo(() => {
    const values = stateData.map((d) => d.value).filter((v) => v != null && v > 0)
    if (!values.length) return () => emptyColor
    return d3.scaleSequential()
      .domain(d3.extent(values))
      .interpolator(d3.interpolateRgb(colorRange[0], colorRange[1]))
  }, [stateData, colorRange, emptyColor])

  const legendExtent = useMemo(() => {
    const values = stateData.map((d) => d.value).filter((v) => v != null && v > 0)
    if (!values.length) return null
    return d3.extent(values)
  }, [stateData])

  /* ── Feature styling ─────────────────────────────────────────────── */
  const style = useCallback((feature) => {
    const name = feature.properties?.name
    const value = valueMap.get(name)

    // Source map: dim everything except the selected state
    if (isSourceMap && selectedState) {
      if (name === selectedState) {
        return {
          fillColor: value != null && value > 0 ? colorScale(value) : emptyColor,
          weight: 3, opacity: 1, color: '#333', fillOpacity: 0.9,
        }
      }
      return { fillColor: emptyColor, weight: 0.8, opacity: 0.4, color: '#aaa', fillOpacity: 0.2 }
    }

    // Default / reactive side
    return {
      fillColor: value != null && value > 0 ? colorScale(value) : emptyColor,
      weight: 1, opacity: 0.7, color: '#888', fillOpacity: 0.65,
    }
  }, [valueMap, colorScale, emptyColor, isSourceMap, selectedState])

  /* ── Feature event handlers ──────────────────────────────────────── */
  const onEachFeature = useCallback((feature, layer) => {
    const name = feature.properties?.name
    layer.on({
      mouseover: (e) => {
        const value = valueMap.get(name)
        // Only bold-highlight if not dimmed
        if (!(isSourceMap && selectedState && name !== selectedState)) {
          e.target.setStyle({ weight: 2.5, color: '#333', fillOpacity: 0.85 })
          e.target.bringToFront()
        }
        const map = mapInstanceRef.current
        if (!map) return
        const pt = map.latLngToContainerPoint(e.latlng)
        const rect = map.getContainer().getBoundingClientRect()
        setTooltip({
          content: (
            <>
              <strong>{name}</strong><br />
              {value != null ? formatValue(value) : 'No data'}
              {!selectedState && (
                <><br /><span style={{ fontSize: 11, color: '#666' }}>Click to filter other map</span></>
              )}
            </>
          ),
          x: rect.left + pt.x,
          y: rect.top + pt.y - 12,
          latLng: [e.latlng.lat, e.latlng.lng],
          offsetY: -12,
        })
      },
      mouseout: (e) => {
        geoJsonRef.current?.resetStyle(e.target)
        setTooltip(null)
      },
      mousemove: (e) => {
        const map = mapInstanceRef.current
        if (!map) return
        const pt = map.latLngToContainerPoint(e.latlng)
        const rect = map.getContainer().getBoundingClientRect()
        setTooltip((prev) =>
          prev ? { ...prev, x: rect.left + pt.x, y: rect.top + pt.y - 12, latLng: [e.latlng.lat, e.latlng.lng] } : null,
        )
      },
      click: (e) => {
        e.originalEvent._stopped = true
        if (isSourceMap && selectedState === name) {
          onReset()
        } else {
          onSelectState(name)
        }
      },
    })
  }, [valueMap, formatValue, selectedState, isSourceMap, onSelectState, onReset])

  /* ── Force GeoJSON re-render when data/selection changes ─────────── */
  const geoKey = useMemo(() => {
    const sel = selectedState || 'none'
    const src = isSourceMap ? 'src' : 'tgt'
    const sum = stateData.reduce((s, d) => s + (d.value || 0), 0)
    return `${geojsonUrl}-${stateData.length}-${sum.toFixed(0)}-${sel}-${src}`
  }, [geojsonUrl, stateData, selectedState, isSourceMap])

  /* ── Scroll-to-zoom hint ─────────────────────────────────────────── */
  const handleWheel = useCallback(() => {
    if (!mapActive) {
      setShowHint(true)
      clearTimeout(hintTimer.current)
      hintTimer.current = setTimeout(() => setShowHint(false), 1500)
    }
  }, [mapActive])

  useEffect(() => () => clearTimeout(hintTimer.current), [])

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border border-border-light bg-white shadow-sm">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border-light">
        <div className="font-semibold text-text-primary text-base">{title}</div>
        <div className="text-sm text-text-secondary">{subtitle}</div>
      </div>

      {/* Map area */}
      <div className="relative flex-1" style={{ minHeight: '380px' }} onWheel={handleWheel}>
        {showHint && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.25)', pointerEvents: 'none',
          }}>
            <span style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '8px 16px', borderRadius: 6, fontSize: 14 }}>
              Click the map to enable zooming
            </span>
          </div>
        )}

        {/* Detail panel (partner breakdown) — only on the source side */}
        {isSourceMap && selectedState && partnerData?.length > 0 && (
          <DetailPanel
            selection={selectedState}
            partnerData={partnerData}
            formatValue={formatValue}
            side={title.includes('U.S.') ? 'us' : 'mx'}
          />
        )}

        <MapContainer
          center={center}
          zoom={zoom}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          scrollWheelZoom={false}
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ScrollWheelGuard onActiveChange={setMapActive} />
          <ResetZoomButton center={center} zoom={zoom} />
          <MapResizeHandler />
          <TooltipSync mapRef={mapInstanceRef} tooltip={tooltip} setTooltip={setTooltip} />
          <MapClickReset onReset={onReset} />

          {geojson && !loading && (
            <GeoJSON
              key={geoKey}
              ref={geoJsonRef}
              data={geojson}
              style={style}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>
      </div>

      {/* Legend bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 text-xs text-text-secondary border-t border-border-light flex-shrink-0">
        <span className="font-medium text-text-primary">{title}</span>
        {legendExtent && (
          <>
            <span>{formatValue(legendExtent[0])}</span>
            <span
              style={{
                display: 'inline-block', width: 60, height: 8, borderRadius: 3,
                background: `linear-gradient(to right, ${colorRange[0]}, ${colorRange[1]})`,
                border: '1px solid #ccc',
              }}
            />
            <span>{formatValue(legendExtent[1])}</span>
          </>
        )}
        <span className="flex items-center gap-1 ml-1">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ background: '#f0f0f0', border: '1px solid #ccc' }}
          />
          No data
        </span>
      </div>

      {/* Portal tooltip */}
      {tooltip &&
        createPortal(
          <div
            style={{
              position: 'fixed', left: tooltip.x, top: tooltip.y,
              transform: 'translate(-50%, -100%)', zIndex: 10000, pointerEvents: 'none',
              background: 'white', border: '1px solid #d1d5db', borderRadius: 6,
              padding: '6px 10px', fontSize: 13, lineHeight: 1.4,
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)', whiteSpace: 'nowrap',
              fontFamily: 'var(--font-sans), system-ui, sans-serif',
            }}
          >
            {tooltip.content}
          </div>,
          document.body,
        )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   Main — Linked State Maps
   ══════════════════════════════════════════════════════════════════════ */
export default function LinkedStateMaps({
  odFlows = [],
  formatValue = formatCurrencyDefault,
  height = '420px',
}) {
  // selection: { side: 'us'|'mx', name: string } | null
  const [selection, setSelection] = useState(null)

  /* ── Aggregate totals (no selection) ─────────────────────────────── */
  const { usAgg, mxAgg } = useMemo(() => {
    const us = new Map()
    const mx = new Map()
    for (const d of odFlows) {
      if (d.State && d.State !== 'Unknown')
        us.set(d.State, (us.get(d.State) || 0) + (d.TradeValue || 0))
      if (d.MexState && d.MexState !== 'Unknown')
        mx.set(d.MexState, (mx.get(d.MexState) || 0) + (d.TradeValue || 0))
    }
    return {
      usAgg: Array.from(us, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      mxAgg: Array.from(mx, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    }
  }, [odFlows])

  /* ── Filtered data when a state is selected ──────────────────────── */
  const { usData, mxData, partnerData } = useMemo(() => {
    if (!selection) return { usData: usAgg, mxData: mxAgg, partnerData: [] }

    if (selection.side === 'us') {
      // US state clicked → re-aggregate MX values for only that US state
      const mx = new Map()
      for (const d of odFlows) {
        if (d.State === selection.name && d.MexState && d.MexState !== 'Unknown') {
          mx.set(d.MexState, (mx.get(d.MexState) || 0) + (d.TradeValue || 0))
        }
      }
      const mxArr = Array.from(mx, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
      return { usData: usAgg, mxData: mxArr, partnerData: mxArr }
    } else {
      // MX state clicked → re-aggregate US values for only that MX state
      const us = new Map()
      for (const d of odFlows) {
        if (d.MexState === selection.name && d.State && d.State !== 'Unknown') {
          us.set(d.State, (us.get(d.State) || 0) + (d.TradeValue || 0))
        }
      }
      const usArr = Array.from(us, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
      return { usData: usArr, mxData: mxAgg, partnerData: usArr }
    }
  }, [odFlows, selection, usAgg, mxAgg])

  /* ── Handlers ────────────────────────────────────────────────────── */
  const handleSelectUS = useCallback((name) => {
    setSelection((prev) =>
      prev?.side === 'us' && prev.name === name ? null : { side: 'us', name },
    )
  }, [])

  const handleSelectMX = useCallback((name) => {
    setSelection((prev) =>
      prev?.side === 'mx' && prev.name === name ? null : { side: 'mx', name },
    )
  }, [])

  const handleReset = useCallback(() => setSelection(null), [])

  return (
    <div>
      {/* Selection banner */}
      {selection && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <span className="text-text-primary">
            Filtering by{' '}
            <strong>{selection.name}</strong>
            {selection.side === 'us' ? ' (U.S.)' : ' (Mexico)'}
            {' '}&mdash; the other map shows only trade with this state
          </span>
          <button
            onClick={handleReset}
            className="ml-auto px-2.5 py-1 text-xs font-medium bg-white border border-blue-300 rounded hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Two-column map grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: height }}>
        <MapPanel
          geojsonUrl={`${BASE}data/us_states.geojson`}
          stateData={usData}
          colorRange={['#deebf7', '#08519c']}
          title="U.S. States"
          subtitle={
            selection?.side === 'mx'
              ? `Trade value with ${selection.name}`
              : 'Trade value with Mexico by U.S. state'
          }
          selectedState={selection?.side === 'us' ? selection.name : null}
          isSourceMap={selection?.side === 'us'}
          onSelectState={handleSelectUS}
          onReset={handleReset}
          formatValue={formatValue}
          center={[39.8, -98.5]}
          zoom={4}
          partnerData={selection?.side === 'us' ? partnerData : null}
        />

        <MapPanel
          geojsonUrl={`${BASE}data/mexican_states.geojson`}
          stateData={mxData}
          colorRange={['#fee0d2', '#de2d26']}
          title="Mexican States"
          subtitle={
            selection?.side === 'us'
              ? `Trade value with ${selection.name}`
              : 'Trade value with the U.S. by Mexican state'
          }
          selectedState={selection?.side === 'mx' ? selection.name : null}
          isSourceMap={selection?.side === 'mx'}
          onSelectState={handleSelectMX}
          onReset={handleReset}
          formatValue={formatValue}
          center={[23.6, -102.5]}
          zoom={5}
          partnerData={selection?.side === 'mx' ? partnerData : null}
        />
      </div>
    </div>
  )
}
