'use client'

import { useEffect, useMemo, useState } from 'react'
import type { SportsEdgePayload, NflGameEdge } from '@/lib/sportsEdgeData'
import { calculateEdge } from '@/lib/sportsEdgeData'

export default function SportsEdgeCard() {
  const [data, setData] = useState<SportsEdgePayload | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'NFL' | 'NBA'>('NFL')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/sports-edges')
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch data')
        }
        const payload: SportsEdgePayload = await response.json()
        setData(payload)
        setErr(null)
      } catch (e) {
        setErr(String(e))
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const sortedGames: NflGameEdge[] = useMemo(() => {
    if (!data?.nfl.games) return []
    return [...data.nfl.games].sort((a, b) => {
      const diff = Math.abs(calculateEdge(b)) - Math.abs(calculateEdge(a))
      return diff === 0
        ? Date.parse(a.kickoffUtc) - Date.parse(b.kickoffUtc)
        : diff
    })
  }, [data])

  const formatKickoff = (iso: string) => {
    const date = new Date(iso)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const formatUpdatedAt = (iso: string) => {
    const date = new Date(iso)
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

  const edgeBadge = (edge: number) => {
    const absEdge = Math.abs(edge)
    if (absEdge >= 4) return { label: 'Fire', className: 'text-emerald-400' }
    if (absEdge >= 2.5) return { label: 'Signal', className: 'text-lime-300' }
    if (absEdge >= 1.2) return { label: 'Lean', className: 'text-sky-300' }
    return { label: 'Watch', className: 'text-muted-foreground' }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border p-4">
        <div className="mb-2 text-sm opacity-70">Loading model edges…</div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  if (err) {
    return (
      <div className="rounded-xl border p-4 text-red-600 text-sm">
        Error: {err}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-2xl border p-4">
        <div className="mb-2 text-sm opacity-70">Sports Edge</div>
        <div className="text-center py-8 text-muted-foreground">
          No data available
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-3 flex items-center gap-2">
        {(['NFL', 'NBA'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
              activeTab === tab
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            {tab === 'NFL' ? 'NFL • Weekly' : 'NBA • Daily'}
          </button>
        ))}
      </div>

      {activeTab === 'NFL' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/10 p-3 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                NFL {data.nfl.season}
              </div>
              <div className="text-base font-semibold text-foreground">
                {data.nfl.label}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Updated {formatUpdatedAt(data.nfl.updatedAt)}
            </div>
          </div>

          {sortedGames.length === 0 ? (
            <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
              Weekly board not loaded yet. Check back after Monday night.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {sortedGames.map((game) => {
                const edge = calculateEdge(game)
                const badge = edgeBadge(edge)
                const favoredTeam = edge >= 0 ? game.homeTeam : game.awayTeam
                return (
                  <div
                    key={game.gameId}
                    className="flex flex-col rounded-xl border bg-card/60 p-3 hover:border-accent/60"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">
                        {game.awayTeam} @ {game.homeTeam}
                      </span>
                      <span className={`text-[10px] font-semibold uppercase ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {formatKickoff(game.kickoffUtc)}
                    </div>
                    <div className="mt-3 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Book spread</span>
                        <span className="font-semibold text-foreground">
                          {game.bookSpread > 0 ? `+${game.bookSpread.toFixed(1)}` : game.bookSpread.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Model spread</span>
                        <span className="font-semibold text-foreground">
                          {game.modelSpread > 0 ? `+${game.modelSpread.toFixed(1)}` : game.modelSpread.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Home win</span>
                        <span className="font-semibold text-foreground">
                          {formatPercent(game.homeWinProb)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg bg-foreground/5 p-2 text-sm font-semibold text-foreground">
                      Edge {edge > 0 ? '+' : ''}
                      {edge.toFixed(1)} pts toward {favoredTeam}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{game.note}</p>
                    <div className="mt-auto pt-3 text-[10px] uppercase text-muted-foreground">
                      Update {formatUpdatedAt(game.predictionUpdated)} • {game.modelVersion}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-dashed bg-muted/10 p-6 text-center">
          <div className="text-sm text-muted-foreground">
            Daily NBA edges will highlight pace, travel and injury-adjusted projections for every slate. Pick a date to see model outputs.
          </div>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-background/80 text-center">
            <div className="text-2xl font-semibold text-foreground">NBA model</div>
            <div className="text-sm text-muted-foreground">
              Coming soon — nightly predictions unlock later this month.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

