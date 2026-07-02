'use client'

import { useEffect, useMemo, useState } from 'react'
import { StatsScreenDisplay, type StatChip } from '@/components/StatsScreenDisplay'
import { ApiEnvelope } from '@/lib/freshness'

type LlmAdvisorMetricsPayload = {
  generatedAt: string
  pnl: { cumulative: number | null; change7d: number | null }
  trades: { successRate: number | null; recentCount7d: number }
  execution: {
    signalCount: number
    validationRejectedCount: number
    executionSucceededCount: number
  }
}

const FALLBACK_STATS: StatChip[] = [
  { label: 'Paper PnL', value: '$0', accent: '#34d399' },
  { label: 'Win rate', value: 'N/A', accent: '#34d399' },
  { label: 'Trades / 7d', value: '0', accent: '#a78bfa' },
  { label: 'LLM approval', value: 'N/A', accent: '#22d3ee' },
  { label: 'Options DTE', value: '7–14', accent: '#fbbf24' },
  { label: 'Setups', value: 'MR • TC', accent: '#f472b6' },
]

const FALLBACK_AS_OF = '2026-06-26'

const formatCurrency = (value: number | null) => {
  if (value == null) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

const formatPercent = (value: number | null) => {
  if (value == null) return 'N/A'
  return `${(value * 100).toFixed(1)}%`
}

type LlmAdvisorStatsScreenProps = {
  enabled?: boolean
}

export function LlmAdvisorStatsScreen({ enabled = true }: LlmAdvisorStatsScreenProps) {
  const [stats, setStats] = useState<StatChip[]>(FALLBACK_STATS)
  const [asOf, setAsOf] = useState(FALLBACK_AS_OF)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    const load = async () => {
      try {
        const response = await fetch('/api/llm-advisor/metrics', { cache: 'no-store' })
        const raw = (await response.json()) as ApiEnvelope<LlmAdvisorMetricsPayload>
        const payload = raw?.data
        if (cancelled || !payload) return

        const signals = payload.execution?.signalCount ?? 0
        const rejected = payload.execution?.validationRejectedCount ?? 0
        const approved = payload.execution?.executionSucceededCount ?? 0
        const approvalDenom = signals - rejected
        const approvalRate =
          approvalDenom > 0 ? formatPercent(approved / approvalDenom) : FALLBACK_STATS[3].value

        setStats([
          {
            label: 'Paper PnL',
            value: formatCurrency(payload.pnl.cumulative ?? payload.pnl.change7d),
            accent: '#34d399',
          },
          {
            label: 'Win rate',
            value: formatPercent(payload.trades.successRate),
            accent: '#34d399',
          },
          {
            label: 'Trades / 7d',
            value: String(payload.trades.recentCount7d ?? 0),
            accent: '#a78bfa',
          },
          { label: 'LLM approval', value: approvalRate, accent: '#22d3ee' },
          FALLBACK_STATS[4],
          FALLBACK_STATS[5],
        ])

        if (payload.generatedAt) {
          const date = new Date(payload.generatedAt)
          if (!Number.isNaN(date.getTime())) {
            setAsOf(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
          }
        }
      } catch {
        // Keep fallback values
      }
    }

    void load()
    const interval = window.setInterval(load, 60_000)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [enabled])

  const displayStats = useMemo(() => stats, [stats])

  return (
    <StatsScreenDisplay
      stats={displayStats}
      accentColor="#34d399"
      asOf={asOf}
      projectLabel="LLM Advisor"
    />
  )
}
