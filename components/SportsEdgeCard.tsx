'use client'

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import type { SportsEdgePayload, NflGameEdge, NbaGameEdge, MlbGameEdge } from '@/lib/sportsEdgeData'
import type { ApiEnvelope } from '@/lib/freshness'
import { calculateEdge } from '@/lib/sportsEdgeData'
import { NflTeamLogo } from './NflTeamLogo'
import { NbaTeamLogo } from './NbaTeamLogo'
import { MlbTeamLogo } from './MlbTeamLogo'
import { getTeamShortName } from '@/lib/nflTeams'
import { getNbaTeamShortName } from '@/lib/nbaTeams'
import { getMlbTeamShortName } from '@/lib/mlbTeams'

const sportsEdgeTabs: { key: 'NFL' | 'NBA' | 'MLB'; label: string; srNote?: string }[] = [
  { key: 'NFL', label: 'NFL • Weekly' },
  { key: 'NBA', label: 'NBA • Daily' },
  { key: 'MLB', label: 'MLB • Daily' }
]

type SportsEdgeCardProps = {
  /** When false, skips API fetch (e.g. homepage section off-screen). Defaults true for standalone pages. */
  enabled?: boolean
}

export default function SportsEdgeCard({ enabled = true }: SportsEdgeCardProps) {
  const [data, setData] = useState<SportsEdgePayload | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'NFL' | 'NBA' | 'MLB'>('NFL')
  const [comingSoonVisible, setComingSoonVisible] = useState(false)
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([])
  const [selectedWeek, setSelectedWeek] = useState<number | undefined>(undefined)
  const [weekFilter, setWeekFilter] = useState<number | undefined>(undefined)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)
  const [dateFilter, setDateFilter] = useState<string | undefined>(undefined)
  const [availableMlbDates, setAvailableMlbDates] = useState<string[]>([])
  const [selectedMlbDate, setSelectedMlbDate] = useState<string | undefined>(undefined)
  const requestIdRef = useRef(0)

  const fetchData = useCallback(
    async (week?: number, date?: string) => {
      const requestId = ++requestIdRef.current
      try {
        setIsLoading(true)
        const params = new URLSearchParams()
        if (typeof week === 'number' && Number.isFinite(week)) {
          params.set('week', week.toString())
        }
        if (date) {
          params.set('date', date)
        }
        const queryString = params.toString()
        const url = `/api/sports-edges${queryString ? `?${queryString}` : ''}`
        const response = await fetch(url)
        const payloadJson: unknown = await response.json()
        if (!response.ok) {
          const errorMessage =
            typeof payloadJson === 'object' &&
            payloadJson !== null &&
            'error' in payloadJson &&
            typeof (payloadJson as { error?: string }).error === 'string'
              ? (payloadJson as { error?: string }).error
              : 'Failed to fetch data'
          throw new Error(errorMessage)
        }
        if (requestId !== requestIdRef.current) return
        const payload =
          payloadJson && typeof payloadJson === 'object' && 'data' in payloadJson
            ? (payloadJson as ApiEnvelope<SportsEdgePayload>).data
            : (payloadJson as SportsEdgePayload)
        setData(payload)
        setErr(null)
        setAvailableWeeks(payload.nfl.availableWeeks ?? [])
        setSelectedWeek(payload.nfl.week)
        setAvailableDates(payload.nba.availableDates ?? [])
        setSelectedDate(payload.nba.date)
        setAvailableMlbDates(payload.mlb.availableDates ?? [])
        setSelectedMlbDate(payload.mlb.date)
      } catch (e) {
        if (requestId !== requestIdRef.current) return
        setErr(String(e))
        setData(null)
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false)
        }
      }
    },
    []
  )

  useEffect(() => {
    if (!enabled) return

    const load = () => {
      if (activeTab === 'NFL') {
        fetchData(
          typeof weekFilter === 'number' && Number.isFinite(weekFilter)
            ? weekFilter
          : undefined,
          undefined
        )
      } else if (activeTab === 'NBA') {
        fetchData(undefined, dateFilter)
      } else {
        fetchData(undefined, dateFilter)
      }
    }

    load()

    // No interval polling needed since data updates once daily
  }, [enabled, fetchData, weekFilter, dateFilter, activeTab])
  
  useEffect(() => {
    // Only show coming soon overlay if NBA tab is active AND there are no games
    if (activeTab === 'NBA') {
      const hasGames = data?.nba.games && data.nba.games.length > 0
      setComingSoonVisible(!hasGames)
    } else {
      setComingSoonVisible(false)
    }
  }, [activeTab, data])

  const sortedGames: NflGameEdge[] = useMemo(() => {
    if (!data?.nfl.games) return []
    return [...data.nfl.games].sort((a, b) => {
      const edgeA = calculateEdge(a)
      const edgeB = calculateEdge(b)
      const diff = Math.abs(edgeB ?? 0) - Math.abs(edgeA ?? 0)
      return diff === 0
        ? Date.parse(a.kickoffUtc) - Date.parse(b.kickoffUtc)
        : diff
    })
  }, [data])

  const handleWeekChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextWeek = Number(event.target.value)
    if (!Number.isFinite(nextWeek) || weekFilter === nextWeek) return
    setSelectedWeek(nextWeek)
    setWeekFilter(nextWeek)
  }

  const handleDateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextDate = event.target.value
    if (!nextDate || dateFilter === nextDate) return
    setSelectedDate(nextDate)
    setDateFilter(nextDate)
  }

  const handleMlbDateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextDate = event.target.value
    if (!nextDate || dateFilter === nextDate) return
    setSelectedMlbDate(nextDate)
    setDateFilter(nextDate)
  }

  const labelSuffix = useMemo(() => {
    if (!data?.nfl.label) return ''
    const week = selectedWeek ?? data.nfl.week
    if (!Number.isFinite(week)) {
      return data.nfl.label
    }
    const pattern = new RegExp(`^Week\\s+${week}\\s*`, 'i')
    const trimmed = data.nfl.label.replace(pattern, '').trim()
    return trimmed
  }, [data?.nfl.label, data?.nfl.week, selectedWeek])

  const weekOptions = useMemo(() => {
    if (availableWeeks.length) {
      return [...availableWeeks].sort((a, b) => b - a)
    }
    return selectedWeek ? [selectedWeek] : []
  }, [availableWeeks, selectedWeek])

  const dateOptions = useMemo(() => {
    if (availableDates.length) {
      return [...availableDates].sort((a, b) => b.localeCompare(a))
    }
    return selectedDate ? [selectedDate] : []
  }, [availableDates, selectedDate])

  const mlbDateOptions = useMemo(() => {
    if (availableMlbDates.length) {
      return [...availableMlbDates].sort((a, b) => b.localeCompare(a))
    }
    return selectedMlbDate ? [selectedMlbDate] : []
  }, [availableMlbDates, selectedMlbDate])

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    })
  }

  const formatTipoff = (iso: string) => {
    const date = new Date(iso)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const sortedNbaGames: NbaGameEdge[] = useMemo(() => {
    if (!data?.nba.games) return []
    return [...data.nba.games].sort((a, b) => {
      const edgeA = calculateEdge(a)
      const edgeB = calculateEdge(b)
      const diff = Math.abs(edgeB ?? 0) - Math.abs(edgeA ?? 0)
      return diff === 0
        ? Date.parse(a.tipoffUtc) - Date.parse(b.tipoffUtc)
        : diff
    })
  }, [data])

  const sortedMlbGames: MlbGameEdge[] = useMemo(() => {
    if (!data?.mlb.games) return []
    return [...data.mlb.games].sort((a, b) => {
      const diff = Math.abs((b.homeWinProb ?? 0.5) - 0.5) - Math.abs((a.homeWinProb ?? 0.5) - 0.5)
      return diff === 0
        ? Date.parse(a.firstPitchUtc) - Date.parse(b.firstPitchUtc)
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

  const edgeBadge = (edge: number | null) => {
    if (edge == null) return { label: 'No line', className: 'text-muted-foreground' }
    const absEdge = Math.abs(edge)
    if (absEdge >= 4) return { label: 'Fire', className: 'text-emerald-400' }
    if (absEdge >= 2.5) return { label: 'Signal', className: 'text-lime-300' }
    if (absEdge >= 1.2) return { label: 'Lean', className: 'text-sky-300' }
    return { label: 'Watch', className: 'text-muted-foreground' }
  }

  const formatSpread = (value: number | null) =>
    value == null ? 'N/A' : value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1)

  if (!enabled) {
    return (
      <div className="rounded-2xl border border-border p-4 bg-muted/5">
        <div className="mb-2 text-sm font-medium text-muted-foreground">Sports Edge</div>
        <p className="text-center py-10 text-sm text-muted-foreground px-4">
          Scroll this project into view to load NFL/NBA model edges.
        </p>
      </div>
    )
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
        {sportsEdgeTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            aria-pressed={activeTab === tab.key}
            aria-label={tab.srNote ? `${tab.label} — ${tab.srNote}` : tab.label}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-xl border px-3 py-2 text-left transition ${
              activeTab === tab.key
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            <span className="text-sm font-semibold leading-tight">{tab.label}</span>
            {tab.srNote && <span className="sr-only">{tab.srNote}</span>}
          </button>
        ))}
      </div>
      <p className="mb-4 text-center text-xs text-muted-foreground" aria-live="polite">
        {activeTab === 'NFL'
          ? 'Showing live NFL model edges.'
          : activeTab === 'NBA'
            ? 'Showing live NBA model edges.'
            : 'Showing MLB model home-win probabilities.'}
      </p>

      {activeTab === 'NFL' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/10 p-3 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                NFL {data.nfl.season}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="nfl-week-select" className="sr-only">
                  Select NFL week
                </label>
                <select
                  id="nfl-week-select"
                  value={selectedWeek ?? ''}
                  onChange={handleWeekChange}
                  className="rounded-lg border border-border bg-background/80 px-3 py-1 text-sm font-semibold text-foreground shadow-sm focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground disabled:opacity-60"
                  disabled={!weekOptions.length}
                >
                  {selectedWeek == null && (
                    <option value="" disabled>
                      Select week
                    </option>
                  )}
                  {weekOptions.map((week) => (
                    <option key={week} value={week}>
                      Week {week}
                    </option>
                  ))}
                </select>
                {labelSuffix && (
                  <span className="text-base font-semibold text-muted-foreground">
                    {labelSuffix}
                  </span>
                )}
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
                const favoredTeam = edge == null ? null : edge >= 0 ? game.homeTeam : game.awayTeam
                return (
                  <div
                    key={game.gameId}
                    className="flex flex-col rounded-xl border bg-card/60 p-3 hover:border-accent/60"
                  >
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <div className="flex flex-1 items-center gap-2">
                        <NflTeamLogo team={game.awayTeam} size={28} className="shrink-0" />
                        <div className="flex flex-col leading-tight">
                          <span className="font-semibold text-foreground">
                            {getTeamShortName(game.awayTeam)}
                          </span>
                          <span className="text-[11px] uppercase text-muted-foreground tracking-wide">
                            {game.awayTeam}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">@</span>
                        <div className="flex flex-col items-end leading-tight">
                          <span className="font-semibold text-foreground">
                            {getTeamShortName(game.homeTeam)}
                          </span>
                          <span className="text-[11px] uppercase text-muted-foreground tracking-wide">
                            {game.homeTeam}
                          </span>
                        </div>
                        <NflTeamLogo team={game.homeTeam} size={28} className="shrink-0" />
                      </div>
                      <span className={`min-w-[60px] text-right text-[10px] font-semibold uppercase ${badge.className}`}>
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
                          {formatSpread(game.bookSpread)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Model spread</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">
                            {game.modelSpread > 0 ? `+${game.modelSpread.toFixed(1)}` : game.modelSpread.toFixed(1)}
                          </span>
                          {game.spreadHit != null && (
                            <span
                              className={`text-xs font-bold ${
                                game.spreadHit
                                  ? 'text-emerald-500'
                                  : 'text-red-500'
                              }`}
                              title={game.spreadHit ? 'Spread prediction hit' : 'Spread prediction missed'}
                            >
                              {game.spreadHit ? '✓' : '✗'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Home win</span>
                        <span className="font-semibold text-foreground">
                          {formatPercent(game.homeWinProb)}
                        </span>
                      </div>
                      {game.actualHomeScore != null && game.actualAwayScore != null && (
                        <div className="flex justify-between pt-1 border-t border-border/50">
                          <span className="text-muted-foreground">Final</span>
                          <span className="font-semibold text-foreground">
                            {game.awayTeam} {game.actualAwayScore} - {game.homeTeam} {game.actualHomeScore}
                          </span>
                        </div>
                      )}
                    </div>
                    {edge == null ? (
                      <div className="mt-3 rounded-lg bg-foreground/5 p-2 text-sm font-semibold text-muted-foreground">
                        Edge unavailable until a sportsbook line is synced.
                      </div>
                    ) : (
                      <div className="mt-3 rounded-lg bg-foreground/5 p-2 text-sm font-semibold text-foreground">
                        Edge {edge > 0 ? '+' : ''}
                        {edge.toFixed(1)} pts toward {favoredTeam}
                      </div>
                    )}
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
      ) : activeTab === 'NBA' ? (
        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/10 p-3 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                NBA {data.nba.season}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="nba-date-select" className="sr-only">
                  Select NBA date
                </label>
                <select
                  id="nba-date-select"
                  value={selectedDate ?? ''}
                  onChange={handleDateChange}
                  className="rounded-lg border border-border bg-background/80 px-3 py-1 text-sm font-semibold text-foreground shadow-sm focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground disabled:opacity-60"
                  disabled={!dateOptions.length}
                >
                  {selectedDate == null && (
                    <option value="" disabled>
                      Select date
                    </option>
                  )}
                  {dateOptions.map((date) => (
                    <option key={date} value={date}>
                      {formatDateLabel(date)}
                    </option>
                  ))}
                </select>
                {data.nba.label && (
                  <span className="text-base font-semibold text-muted-foreground">
                    {data.nba.label}
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Updated {formatUpdatedAt(data.nba.updatedAt)}
            </div>
          </div>

          {sortedNbaGames.length === 0 ? (
            <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
              {comingSoonVisible
                ? 'Daily board not loaded yet. Check back after games are played.'
                : 'No games available for selected date.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {sortedNbaGames.map((game) => {
                const edge = calculateEdge(game)
                const badge = edgeBadge(edge)
                const favoredTeam = edge == null ? null : edge >= 0 ? game.homeTeam : game.awayTeam
                return (
                  <div
                    key={game.gameId}
                    className="flex flex-col rounded-xl border bg-card/60 p-3 hover:border-accent/60"
                  >
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <div className="flex flex-1 items-center gap-2">
                        <NbaTeamLogo team={game.awayTeam} size={28} className="shrink-0" />
                        <div className="flex flex-col leading-tight">
                          <span className="font-semibold text-foreground">
                            {getNbaTeamShortName(game.awayTeam)}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">@</span>
                        <div className="flex flex-col items-end leading-tight">
                          <span className="font-semibold text-foreground">
                            {getNbaTeamShortName(game.homeTeam)}
                          </span>
                        </div>
                        <NbaTeamLogo team={game.homeTeam} size={28} className="shrink-0" />
                      </div>
                      <span className={`min-w-[60px] text-right text-[10px] font-semibold uppercase ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {formatTipoff(game.tipoffUtc)}
                    </div>
                    <div className="mt-3 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Book spread</span>
                        <span className="font-semibold text-foreground">
                          {formatSpread(game.bookSpread)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Model spread</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">
                            {game.modelSpread > 0 ? `+${game.modelSpread.toFixed(1)}` : game.modelSpread.toFixed(1)}
                          </span>
                          {game.spreadHit != null && (
                            <span
                              className={`text-xs font-bold ${
                                game.spreadHit
                                  ? 'text-emerald-500'
                                  : 'text-red-500'
                              }`}
                              title={game.spreadHit ? 'Spread prediction hit' : 'Spread prediction missed'}
                            >
                              {game.spreadHit ? '✓' : '✗'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Home win</span>
                        <span className="font-semibold text-foreground">
                          {formatPercent(game.homeWinProb)}
                        </span>
                      </div>
                      {game.actualHomeScore != null && game.actualAwayScore != null && (
                        <div className="flex justify-between pt-1 border-t border-border/50">
                          <span className="text-muted-foreground">Final</span>
                          <span className="font-semibold text-foreground">
                            {game.awayTeam} {game.actualAwayScore} - {game.homeTeam} {game.actualHomeScore}
                          </span>
                        </div>
                      )}
                    </div>
                    {edge == null ? (
                      <div className="mt-3 rounded-lg bg-foreground/5 p-2 text-sm font-semibold text-muted-foreground">
                        Edge unavailable until a sportsbook line is synced.
                      </div>
                    ) : (
                      <div className="mt-3 rounded-lg bg-foreground/5 p-2 text-sm font-semibold text-foreground">
                        Edge {edge > 0 ? '+' : ''}
                        {edge.toFixed(1)} pts toward {favoredTeam}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">{game.note}</p>
                    <div className="mt-auto pt-3 text-[10px] uppercase text-muted-foreground">
                      Update {formatUpdatedAt(game.predictionUpdated)} • {game.modelVersion}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {comingSoonVisible && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-background/75 text-center backdrop-blur-sm transition-opacity duration-300 opacity-100">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent">Sneak Peek</div>
              <div className="text-2xl font-semibold text-foreground">NBA model</div>
              <div className="text-sm text-muted-foreground">
                Coming soon — nightly predictions unlock later this month.
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/10 p-3 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                MLB {data.mlb.season}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="mlb-date-select" className="sr-only">
                  Select MLB date
                </label>
                <select
                  id="mlb-date-select"
                  value={selectedMlbDate ?? ''}
                  onChange={handleMlbDateChange}
                  className="rounded-lg border border-border bg-background/80 px-3 py-1 text-sm font-semibold text-foreground shadow-sm focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground disabled:opacity-60"
                  disabled={!mlbDateOptions.length}
                >
                  {selectedMlbDate == null && (
                    <option value="" disabled>
                      Select date
                    </option>
                  )}
                  {mlbDateOptions.map((date) => (
                    <option key={date} value={date}>
                      {formatDateLabel(date)}
                    </option>
                  ))}
                </select>
                {data.mlb.label && (
                  <span className="text-base font-semibold text-muted-foreground">
                    {data.mlb.label}
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Updated {formatUpdatedAt(data.mlb.updatedAt)}
            </div>
          </div>

          <p className="rounded-lg bg-foreground/5 p-2 text-xs text-muted-foreground">
            MLB values are model probabilities, not betting advice. Moneyline odds, ROI, and spread edges are intentionally not shown.
          </p>

          {sortedMlbGames.length === 0 ? (
            <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
              MLB board not loaded yet. Check back after the daily refresh completes.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {sortedMlbGames.map((game) => {
                const predictedHome = game.homeWinProb >= 0.5
                const predictedTeam = predictedHome ? game.homeTeam : game.awayTeam
                const predictedProb = predictedHome ? game.homeWinProb : 1 - game.homeWinProb
                return (
                  <div
                    key={game.gameId}
                    className="flex flex-col rounded-xl border bg-card/60 p-3 hover:border-accent/60"
                  >
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <div className="flex flex-1 items-center gap-2">
                        <MlbTeamLogo team={game.awayTeam} size={28} className="shrink-0" />
                        <div className="flex flex-col leading-tight">
                          <span className="font-semibold text-foreground">
                            {getMlbTeamShortName(game.awayTeam)}
                          </span>
                          {game.awayProbablePitcher && (
                            <span className="text-[11px] text-muted-foreground">
                              {game.awayProbablePitcher}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground">@</span>
                        <div className="flex flex-col items-end leading-tight">
                          <span className="font-semibold text-foreground">
                            {getMlbTeamShortName(game.homeTeam)}
                          </span>
                          {game.homeProbablePitcher && (
                            <span className="text-[11px] text-muted-foreground">
                              {game.homeProbablePitcher}
                            </span>
                          )}
                        </div>
                        <MlbTeamLogo team={game.homeTeam} size={28} className="shrink-0" />
                      </div>
                      {game.winnerHit != null && (
                        <span
                          className={`min-w-[60px] text-right text-[10px] font-semibold uppercase ${
                            game.winnerHit ? 'text-emerald-500' : 'text-red-500'
                          }`}
                          title={game.winnerHit ? 'Winner prediction hit' : 'Winner prediction missed'}
                        >
                          {game.winnerHit ? 'Hit' : 'Miss'}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {formatTipoff(game.firstPitchUtc)}
                    </div>
                    <div className="mt-3 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Home win</span>
                        <span className="font-semibold text-foreground">
                          {formatPercent(game.homeWinProb)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Model side</span>
                        <span className="font-semibold text-foreground">
                          {getMlbTeamShortName(predictedTeam)} {formatPercent(predictedProb)}
                        </span>
                      </div>
                      {game.actualHomeScore != null && game.actualAwayScore != null && (
                        <div className="flex justify-between pt-1 border-t border-border/50">
                          <span className="text-muted-foreground">Final</span>
                          <span className="font-semibold text-foreground">
                            {game.awayTeam} {game.actualAwayScore} - {game.homeTeam} {game.actualHomeScore}
                          </span>
                        </div>
                      )}
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
      )}
    </div>
  )
}
