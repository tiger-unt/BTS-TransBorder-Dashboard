/**
 * ChoroplethPortMap.jsx
 *
 * Multi-layer interactive choropleth + port bubble map.
 * Supports multiple GeoJSON layers (e.g. US states + Mexican states) with
 * independent color scales, plus grouped port markers on a high-z pane.
 *
 * Click a state   -> choropleth re-colors to show trade through that state's
 *                    connected ports; dims unconnected regions; side panel.
 * Click a port    -> choropleth re-colors to show trade values through that
 *                    specific port; dims unconnected regions; side panel.
 * Click empty map -> resets selection.
 *
 * Props:
 *   layers        - [{ url, data: [{name,value}], nameProperty, colorRange, title }]
 *   ports         - [{ name, lat, lng, value, portCode, group }]
 *   connections   - { stateToPort: Map<name, Map<portCode, value>>,
 *                     portToState: Map<portCode, Map<name, value>> }
 *   formatValue, metricLabel, center, zoom, height
 *   groupColors   - { groupName: { fill, stroke } }
 *   legendGroups  - [{ label, color }]
 *   emptyColor
 */
import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, TileLayer, GeoJSON, CircleMarker, useMap, useMapEvents } from 'react-leaflet'
import * as d3 from 'd3'
import 'leaflet/dist/leaflet.css'

import {
  ScrollWheelGuard,
  MapResizeHandler,
  ResetZoomButton,
  TooltipSync,
  formatCurrencyDefault,
} from './mapHelpers'

/* ── GeoJSON cache ─────────────────────────────────────────────────────── */
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
      .then((data) => { geoCache[url] = data; if (!cancelled) { setGeojson(data); setLoading(false) } })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [url])

  return { geojson, loading }
}

/* ── Load multiple GeoJSON files ─────────────────────────────────────── */
function useMultiGeoJSON(urls) {
  const results = urls.map(useGeoJSON)
  const loading = results.some((r) => r.loading)
  return { results, loading }
}

/* ── Port radius ─────────────────────────────────────────────────────── */
function radiusScale(value, maxValue) {
  if (!maxValue || !value) return 4
  return Math.max(4, Math.min(20, 4 + 16 * Math.sqrt(value / maxValue)))
}

/* ── Custom pane for ports above choropleth ───────────────────────────── */
function PortPane() {
  const map = useMap()
  useEffect(() => {
    if (!map.getPane('portMarkers')) {
      const pane = map.createPane('portMarkers')
      pane.style.zIndex = '650'
    }
  }, [map])
  return null
}

/* ── Click-away: reset selection ─────────────────────────────────────── */
function MapClickReset({ setSelection }) {
  useMapEvents({
    click: (e) => {
      if (e.originalEvent?._stopped) return
      setSelection(null)
    },
  })
  return null
}

const DEFAULT_PORT_COLOR = { fill: '#0056a9', stroke: '#003d75' }

/* ── Selection info panel ────────────────────────────────────────────── */
function SelectionPanel({ selection, connections, ports, formatValue }) {
  if (!selection) return null

  let title, subtitle, items
  if (selection.type === 'state') {
    const connectedPorts = connections.stateToPort.get(selection.name) || new Map()
    title = selection.name
    subtitle = 'Ports'
    items = ports
      .filter((p) => connectedPorts.has(p.portCode))
      .map((p) => ({ name: p.name, value: connectedPorts.get(p.portCode) || 0 }))
      .sort((a, b) => b.value - a.value)
  } else {
    const connectedStates = connections.portToState.get(selection.id) || new Map()
    title = selection.name
    subtitle = 'States'
    items = Array.from(connectedStates, ([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }

  return (
    <div className="absolute top-3 right-3 z-[1000] bg-white/95 border border-border-light rounded-lg shadow-lg px-3 py-2 max-w-[220px] max-h-[280px] overflow-y-auto text-sm">
      <div className="font-semibold text-text-primary mb-1 flex items-center justify-between">
        <span>{title}</span>
        <span className="text-xs text-text-secondary ml-2">{subtitle}</span>
      </div>
      {items.length === 0 && (
        <div className="text-text-secondary text-xs italic">No connections found</div>
      )}
      {items.map((item) => (
        <div key={item.name} className="flex justify-between gap-2 py-0.5">
          <span className="truncate">{item.name}</span>
          <span className="text-text-secondary whitespace-nowrap">{formatValue(item.value)}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Single GeoJSON layer with interactive styling ───────────────────── */
function ChoroplethLayer({
  url, data, nameProperty = 'name', colorRange, emptyColor,
  selection, highlightedStates, connections, portToStateValues,
  formatValue, metricLabel, setSelection, setTooltip, mapInstanceRef,
}) {
  const { geojson, loading } = useGeoJSON(url)
  const geoJsonRef = useRef(null)

  /* ── Effective values: dynamic when a port is selected ─────────── */
  const effectiveValues = useMemo(() => {
    if (selection?.type === 'port' && portToStateValues) {
      // Show per-port trade values for this layer's states
      return data
        .filter((d) => portToStateValues.has(d.name))
        .map((d) => ({ name: d.name, value: portToStateValues.get(d.name) || 0 }))
    }
    return data
  }, [data, selection, portToStateValues])

  const valueMap = useMemo(() => {
    const m = new Map()
    for (const d of effectiveValues) if (d.name && d.value != null) m.set(d.name, d.value)
    return m
  }, [effectiveValues])

  const colorScale = useMemo(() => {
    const values = effectiveValues.map((d) => d.value).filter((v) => v != null && v > 0)
    if (!values.length) return () => emptyColor
    return d3.scaleSequential()
      .domain(d3.extent(values))
      .interpolator(d3.interpolateRgb(colorRange[0], colorRange[1]))
  }, [effectiveValues, colorRange, emptyColor])

  const style = useCallback((feature) => {
    const name = feature.properties?.[nameProperty]
    const value = valueMap.get(name)

    if (highlightedStates) {
      const isHighlighted = highlightedStates.has(name)
      if (!isHighlighted) {
        return { fillColor: emptyColor, weight: 0.8, opacity: 0.4, color: '#aaa', fillOpacity: 0.25 }
      }
      return {
        fillColor: value != null && value > 0 ? colorScale(value) : emptyColor,
        weight: 2.5, opacity: 1, color: '#333', fillOpacity: 0.85,
      }
    }
    return {
      fillColor: value != null && value > 0 ? colorScale(value) : emptyColor,
      weight: 1, opacity: 0.7, color: '#888', fillOpacity: 0.6,
    }
  }, [nameProperty, valueMap, colorScale, emptyColor, highlightedStates])

  const onEachFeature = useCallback((feature, layer) => {
    const name = feature.properties?.[nameProperty]
    layer.on({
      mouseover: (e) => {
        const value = valueMap.get(name)
        if (!highlightedStates || highlightedStates.has(name)) {
          e.target.setStyle({ weight: 2.5, color: '#333', fillOpacity: 0.85 })
          e.target.bringToFront()
        }
        const map = mapInstanceRef.current
        if (!map) return
        const pt = map.latLngToContainerPoint(e.latlng)
        const rect = map.getContainer().getBoundingClientRect()
        const connCount = connections.stateToPort.get(name)?.size || 0
        setTooltip({
          content: (
            <>
              <strong>{name || 'Unknown'}</strong><br />
              {value != null ? `${formatValue(value)} ${metricLabel}` : 'No data'}
              {connCount > 0 && !selection && (
                <><br /><span style={{ fontSize: 11, color: '#666' }}>{connCount} port{connCount > 1 ? 's' : ''} — click to explore</span></>
              )}
            </>
          ),
          x: rect.left + pt.x, y: rect.top + pt.y - 12,
          latLng: [e.latlng.lat, e.latlng.lng], offsetY: -12,
        })
      },
      mouseout: (e) => { geoJsonRef.current?.resetStyle(e.target); setTooltip(null) },
      mousemove: (e) => {
        const map = mapInstanceRef.current
        if (!map) return
        const pt = map.latLngToContainerPoint(e.latlng)
        const rect = map.getContainer().getBoundingClientRect()
        setTooltip((prev) => prev ? { ...prev, x: rect.left + pt.x, y: rect.top + pt.y - 12, latLng: [e.latlng.lat, e.latlng.lng] } : null)
      },
      click: (e) => {
        e.originalEvent._stopped = true
        if (selection?.type === 'state' && selection.name === name) {
          setSelection(null)
        } else {
          setSelection({ type: 'state', name, id: name })
        }
      },
    })
  }, [nameProperty, valueMap, connections, formatValue, metricLabel, highlightedStates, selection, mapInstanceRef, setSelection, setTooltip])

  const geoKey = useMemo(() => {
    const sel = selection ? `${selection.type}-${selection.id}` : 'none'
    return `${url}-${data.length}-${data.reduce((s, d) => s + (d.value || 0), 0)}-${sel}`
  }, [url, data, selection])

  if (loading || !geojson) return null

  return (
    <GeoJSON
      key={geoKey}
      ref={geoJsonRef}
      data={geojson}
      style={style}
      onEachFeature={onEachFeature}
    />
  )
}

/* ── Main component ─────────────────────────────────────────────────── */
export default function ChoroplethPortMap({
  layers = [],
  ports = [],
  connections = { stateToPort: new Map(), portToState: new Map() },
  formatValue = formatCurrencyDefault,
  metricLabel = 'Trade Value',
  emptyColor = '#f0f0f0',
  center = [42.0, -97.0],
  zoom = 4,
  height = '520px',
  groupColors = null,
  legendGroups = null,
}) {
  const mapInstanceRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const [mapActive, setMapActive] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const hintTimer = useRef(null)
  const [selection, setSelection] = useState(null)

  const portMax = useMemo(() => Math.max(1, ...ports.map((p) => p.value || 0)), [ports])

  /* ── Derived highlights ────────────────────────────────────────────── */
  const { highlightedStates, highlightedPorts } = useMemo(() => {
    if (!selection) return { highlightedStates: null, highlightedPorts: null }
    if (selection.type === 'state') {
      const connPorts = connections.stateToPort.get(selection.name) || new Map()
      return {
        highlightedStates: new Set([selection.name]),
        highlightedPorts: new Set(connPorts.keys()),
      }
    } else {
      const connStates = connections.portToState.get(selection.id) || new Map()
      return {
        highlightedStates: new Set(connStates.keys()),
        highlightedPorts: new Set([selection.id]),
      }
    }
  }, [selection, connections])

  /* ── Port-to-state values for dynamic choropleth when a port is clicked */
  const portToStateValues = useMemo(() => {
    if (selection?.type !== 'port') return null
    return connections.portToState.get(selection.id) || new Map()
  }, [selection, connections])

  /* ── Effective port values when a state is selected ────────────────── */
  const stateToPortValues = useMemo(() => {
    if (selection?.type !== 'state') return null
    return connections.stateToPort.get(selection.name) || new Map()
  }, [selection, connections])

  /* ── Scroll hint ───────────────────────────────────────────────────── */
  const handleWheel = useCallback(() => {
    if (!mapActive) {
      setShowHint(true)
      clearTimeout(hintTimer.current)
      hintTimer.current = setTimeout(() => setShowHint(false), 1500)
    }
  }, [mapActive])

  useEffect(() => () => clearTimeout(hintTimer.current), [])

  /* ── Legend stops per layer ────────────────────────────────────────── */
  const layerLegends = useMemo(() => {
    return layers.map((layer) => {
      const values = layer.data.map((d) => d.value).filter((v) => v != null && v > 0)
      if (!values.length) return null
      const [min, max] = d3.extent(values)
      return { min, max, colorRange: layer.colorRange, title: layer.title }
    }).filter(Boolean)
  }, [layers])

  return (
    <>
      <div
        style={{ minHeight: height, width: '100%' }}
        className="port-map-container h-full flex flex-col rounded-lg overflow-hidden border border-border-light isolate"
        role="region"
        aria-label={`Interactive map showing ${metricLabel} by state and border ports`}
      >
        <div className="flex-1 relative" style={{ minHeight: 0 }} onWheel={handleWheel}>
          {showHint && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)', pointerEvents: 'none', transition: 'opacity 0.3s' }}>
              <span style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '8px 16px', borderRadius: 6, fontSize: 16 }}>
                Click the map to enable zooming
              </span>
            </div>
          )}

          <SelectionPanel
            selection={selection}
            connections={connections}
            ports={ports}
            formatValue={formatValue}
          />

          {selection && (
            <button
              onClick={() => setSelection(null)}
              className="absolute top-3 left-3 z-[1000] bg-white/95 border border-border-light rounded-lg shadow-lg px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Clear selection
            </button>
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
            <PortPane />
            <MapClickReset setSelection={setSelection} />

            {/* Choropleth layers */}
            {layers.map((layer, i) => (
              <ChoroplethLayer
                key={layer.url || i}
                url={layer.url}
                data={layer.data}
                nameProperty={layer.nameProperty || 'name'}
                colorRange={layer.colorRange}
                emptyColor={emptyColor}
                selection={selection}
                highlightedStates={highlightedStates}
                connections={connections}
                portToStateValues={portToStateValues}
                formatValue={formatValue}
                metricLabel={metricLabel}
                setSelection={setSelection}
                setTooltip={setTooltip}
                mapInstanceRef={mapInstanceRef}
              />
            ))}

            {/* Port markers (above choropleth) */}
            {ports
              .filter((p) => p.lat != null && p.lng != null)
              .map((p) => {
                const isDimmed = highlightedPorts && !highlightedPorts.has(p.portCode)
                const isSelected = selection?.type === 'port' && selection.id === p.portCode
                const displayValue = stateToPortValues ? (stateToPortValues.get(p.portCode) || 0) : p.value
                // Dynamic sizing: when a state is selected, size ports by per-pair value
                const dynamicMax = stateToPortValues
                  ? Math.max(1, ...Array.from(stateToPortValues.values()))
                  : portMax
                const r = radiusScale(displayValue, dynamicMax)
                const gc = groupColors && p.group ? groupColors[p.group] : null
                const defaultFill = gc?.fill || DEFAULT_PORT_COLOR.fill
                const defaultStroke = gc?.stroke || DEFAULT_PORT_COLOR.stroke
                const selKey = selection ? `${selection.type}-${selection.id}` : 'none'

                return (
                  <CircleMarker
                    key={`port-${p.portCode}-${selKey}`}
                    center={[p.lat, p.lng]}
                    radius={isDimmed ? r * 0.7 : r}
                    bubblingMouseEvents={false}
                    pane="portMarkers"
                    pathOptions={{
                      fillColor: isDimmed ? '#ccc' : isSelected ? '#ff6600' : defaultFill,
                      color: isSelected ? '#cc5200' : isDimmed ? '#aaa' : defaultStroke,
                      weight: isSelected ? 3 : 1.5,
                      opacity: isDimmed ? 0.4 : 0.9,
                      fillOpacity: isDimmed ? 0.3 : 0.85,
                    }}
                    eventHandlers={{
                      mouseover: () => {
                        const map = mapInstanceRef.current
                        if (!map) return
                        const pt = map.latLngToContainerPoint([p.lat, p.lng])
                        const rect = map.getContainer().getBoundingClientRect()
                        const connCount = connections.portToState.get(p.portCode)?.size || 0
                        setTooltip({
                          content: (
                            <>
                              <strong>{p.name}</strong> ({p.portCode})<br />
                              {formatValue(displayValue)} {metricLabel}
                              {connCount > 0 && !selection && (
                                <><br /><span style={{ fontSize: 11, color: '#666' }}>{connCount} state{connCount > 1 ? 's' : ''} — click to explore</span></>
                              )}
                            </>
                          ),
                          x: rect.left + pt.x, y: rect.top + pt.y - r - 8,
                          latLng: [p.lat, p.lng], offsetY: -r - 8,
                        })
                      },
                      mouseout: () => setTooltip(null),
                      click: (e) => {
                        e.originalEvent._stopped = true
                        if (selection?.type === 'port' && selection.id === p.portCode) {
                          setSelection(null)
                        } else {
                          setSelection({ type: 'port', name: p.name, id: p.portCode })
                        }
                      },
                    }}
                  />
                )
              })}
          </MapContainer>
        </div>

        {/* Legend bar */}
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 bg-white/90 text-base text-text-secondary border-t border-border-light flex-shrink-0"
          style={{ height: 'auto' }}
        >
          {/* Per-layer choropleth legends */}
          {layerLegends.map((leg, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="font-medium text-text-primary text-xs">{leg.title}</span>
              <span className="text-xs">{formatValue(leg.min)}</span>
              <span
                style={{
                  display: 'inline-block', width: 70, height: 10, borderRadius: 3,
                  background: `linear-gradient(to right, ${leg.colorRange[0]}, ${leg.colorRange[1]})`,
                  border: '1px solid #ccc',
                }}
              />
              <span className="text-xs">{formatValue(leg.max)}</span>
            </span>
          ))}

          {/* Port legend */}
          <span className="border-l border-border-light pl-3 flex items-center gap-3">
            {legendGroups
              ? legendGroups.map((g) => (
                  <span key={g.label} className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ background: g.color }} />
                    <span className="text-xs">{g.label}</span>
                  </span>
                ))
              : (
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background: DEFAULT_PORT_COLOR.fill }} />
                  <span className="text-xs">Border Port</span>
                </span>
              )
            }
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="24" height="16" aria-hidden="true" className="flex-shrink-0">
              <circle cx="7" cy="11" r="3" fill="#999" opacity="0.5" />
              <circle cx="17" cy="8" r="6" fill="#999" opacity="0.5" />
            </svg>
            <span className="text-xs">Size = {metricLabel}</span>
          </span>

          <span className="ml-auto text-xs text-text-secondary italic">
            Click a state or port to explore connections
          </span>
        </div>
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
    </>
  )
}
