'use client'

import { useEffect, useState } from 'react'

type EdgeRow = {
  game_id: string
  league: string
  season: number
  game_time_utc: string
  home_team: string
  away_team: string
  book_spread: number | null
  my_spread: number | null
  edge_pts: number | null
  my_home_win_prob: number | null
  model_version: string | null
  prediction_ts: string | null
  odds_ts: string | null
}

export default function SportsEdgeCard() {
  const [rows, setRows] = useState<EdgeRow[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/sports-edges')
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch data')
        }
        const data = await response.json()
        setRows(data)
        setErr(null)
      } catch (e) {
        setErr(String(e))
        setRows([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        timeZone: 'America/Denver'
      })
    } catch {
      return '—'
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/Denver'
      })
    } catch {
      return '—'
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border p-4">
        <div className="mb-2 text-sm opacity-70">Today's Edges (model vs books)</div>
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

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border p-4">
        <div className="mb-2 text-sm opacity-70">Today's Edges (model vs books)</div>
        <div className="text-center py-8 text-muted-foreground">
          No games scheduled for today
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-2 text-sm opacity-70">Today's Edges (model vs books)</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rows.map((r) => (
          <div key={r.game_id} className="rounded-xl border p-3 hover:border-accent/50 transition-colors">
            <div className="text-xs opacity-60 mb-1">
              {r.league} • {formatDateTime(r.game_time_utc)}
            </div>
            <div className="text-sm font-medium mt-1 mb-2">
              {r.away_team} @ {r.home_team}
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="opacity-70">Book Spread:</span>
                <span className="font-medium">{r.book_spread?.toFixed(1) ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Our Spread:</span>
                <span className="font-medium">{r.my_spread?.toFixed(1) ?? '—'}</span>
              </div>
              <div className={`flex justify-between mt-2 pt-2 border-t border-border/30 ${
                Math.abs(r.edge_pts ?? 0) >= 1.0 ? 'text-emerald-600 font-semibold' : 'opacity-70'
              }`}>
                <span>Edge:</span>
                <span>{r.edge_pts != null ? `${r.edge_pts > 0 ? '+' : ''}${r.edge_pts.toFixed(1)} pts` : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Home Win:</span>
                <span className="font-medium">
                  {r.my_home_win_prob != null ? `${(100 * r.my_home_win_prob).toFixed(1)}%` : '—'}
                </span>
              </div>
            </div>
            <div className="text-[10px] opacity-60 mt-2 pt-2 border-t border-border/30">
              Updated: {formatTime(r.prediction_ts)} • v{r.model_version ?? '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

