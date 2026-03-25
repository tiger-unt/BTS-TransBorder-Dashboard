/**
 * WeightCaveatBanner — Contextual banner shown when weight metric is selected
 * and the filtered data includes exports whose weight is not reported.
 *
 * Two modes:
 *   allNA   — ALL filtered rows lack weight → metric is entirely unavailable
 *   partial — some rows lack weight → displayed totals reflect only rows with data
 */
import { AlertTriangle } from 'lucide-react'

export default function WeightCaveatBanner({ allNA = false }) {
  if (allNA) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-amber-500" />
        <div>
          <p className="font-semibold">Weight data is not available</p>
          <p className="mt-0.5 text-amber-700">
            BTS does not report weight for most export modes. Switch to <strong>Trade Value ($)</strong> or
            select <strong>Imports</strong> to view weight data.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
      <AlertTriangle size={14} className="flex-shrink-0 mt-0.5 text-amber-400" />
      <span>Weight values reflect imports only — export weight is not reported for most modes.</span>
    </div>
  )
}
