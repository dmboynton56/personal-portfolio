'use client'

import { useEffect, useMemo, useState } from 'react'
import { StatsScreenDisplay, type StatChip } from '@/components/StatsScreenDisplay'
import { ApiEnvelope } from '@/lib/freshness'

type AtsSummary = {
  atsPct: number | null
  roiPct: number | null
  gradedGames: number
}

type AtsPayload = {
  summary: AtsSummary
}

const FALLBACK_STATS: StatChip[] = [
  { label: 'Leagues', value: '6', accent: '#22d3ee' },
  { label: 'NBA ATS', value: '54.1%', accent: '#34d399' },
  { label: 'Flat ROI', value: '+3.2%', accent: '#34d399' },
  { label: 'Model heads', value: '12+', accent: '#a78bfa' },
  { label: 'Daily preds', value: '200+', accent: '#fbbf24' },
  { label: 'Pipeline', value: '13:00 UTC', accent: '#22d3ee' },
]

const FALLBACK_AS_OF = '2026-06-26'

type SportsEdgeStatsScreenProps = {
  enabled?: boolean
}

export function SportsEdgeStatsScreen({ enabled = true }: SportsEdgeStatsScreenProps) {
  const [stats, setStats] = useState<StatChip[]>(FALLBACK_STATS)
  const [asOf, setAsOf] = useState(FALLBACK_AS_OF)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    const load = async () => {
      try {
        const response = await fetch('/api/sports-edges/ats-weekly?league=NBA', {
          cache: 'no-store',
        })
        const payload = (await response.json()) as ApiEnvelope<AtsPayload>
        const summary = payload?.data?.summary
        if (cancelled || !summary?.gradedGames) return

        const ats =
          summary.atsPct != null ? `${(summary.atsPct * 100).toFixed(1)}%` : FALLBACK_STATS[1].value
        const roi =
          summary.roiPct != null
            ? `${summary.roiPct >= 0 ? '+' : ''}${(summary.roiPct * 100).toFixed(1)}%`
            : FALLBACK_STATS[2].value

        setStats([
          FALLBACK_STATS[0],
          { label: 'NBA ATS', value: ats, accent: '#34d399' },
          { label: 'Flat ROI', value: roi, accent: '#34d399' },
          FALLBACK_STATS[3],
          FALLBACK_STATS[4],
          FALLBACK_STATS[5],
        ])

        const generated = payload.meta?.updatedAt
        if (generated) {
          const date = new Date(generated)
          if (!Number.isNaN(date.getTime())) {
            setAsOf(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
          }
        }
      } catch {
        // Keep fallback values
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [enabled])

  const displayStats = useMemo(() => stats, [stats])

  return (
    <StatsScreenDisplay
      stats={displayStats}
      accentColor="#22d3ee"
      backgroundImage="/images/projects/sports-edge/sports-edge-ops-dashboard.png"
      asOf={asOf}
      projectLabel="Sports Edge"
    />
  )
}
