'use client'

import { StatsScreenDisplay, type StatChip } from '@/components/StatsScreenDisplay'

const MATCHPOINT_STATS: StatChip[] = [
  { label: 'Live jobs', value: '5,867', accent: '#818cf8' },
  { label: 'Greenhouse boards', value: '70', accent: '#22d3ee' },
  { label: 'Fit dimensions', value: '8', accent: '#34d399' },
  { label: 'Embedding dim', value: '1536', accent: '#a78bfa' },
  { label: 'Vector search', value: '<10ms', accent: '#fbbf24' },
  { label: 'Ingest cadence', value: 'Daily', accent: '#22d3ee' },
]

export function MatchPointStatsScreen() {
  return (
    <StatsScreenDisplay
      stats={MATCHPOINT_STATS}
      accentColor="#818cf8"
      backgroundImage="/images/projects/matchpoint/matches-list.png"
      asOf="2026-07-02"
      projectLabel="MatchPoint"
    />
  )
}
