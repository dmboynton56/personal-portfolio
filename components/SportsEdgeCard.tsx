'use client'

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import type {
  MlbGameEdge,
  NbaGameEdge,
  NflGameEdge,
  SportsEdgePayload,
  WorldCupMatchEdge,
  WorldCupTeamProbability
} from '@/lib/sportsEdgeData'
import type { ApiEnvelope } from '@/lib/freshness'
import { calculateEdge } from '@/lib/sportsEdgeData'
import { NflTeamLogo } from './NflTeamLogo'
import { NbaTeamLogo } from './NbaTeamLogo'
import { MlbTeamLogo } from './MlbTeamLogo'
import { getTeamShortName } from '@/lib/nflTeams'
import { getNbaTeamShortName } from '@/lib/nbaTeams'
import { getMlbTeamShortName } from '@/lib/mlbTeams'

type SportsEdgeTab = 'NFL' | 'NBA' | 'MLB' | 'WORLD_CUP'

const sportsEdgeTabs: { key: SportsEdgeTab; label: string; srNote?: string }[] = [
  { key: 'NFL', label: 'NFL • Weekly' },
  { key: 'NBA', label: 'NBA • Daily' },
  { key: 'MLB', label: 'MLB • Daily' },
  { key: 'WORLD_CUP', label: 'World Cup' }
]

type SportsEdgeCardProps = {
  /** When false, skips API fetch (e.g. homepage section off-screen). Defaults true for standalone pages. */
  enabled?: boolean
}

type FetchParams = {
  week?: number
  nbaDate?: string
  mlbDate?: string
}

export default function SportsEdgeCard({ enabled = true }: SportsEdgeCardProps) {
  const [data, setData] = useState<SportsEdgePayload | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<SportsEdgeTab>('NFL')
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([])
  const [selectedWeek, setSelectedWeek] = useState<number | undefined>(undefined)
  const [weekFilter, setWeekFilter] = useState<number | undefined>(undefined)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)
  const [nbaDateFilter, setNbaDateFilter] = useState<string | undefined>(undefined)
  const [availableMlbDates, setAvailableMlbDates] = useState<string[]>([])
  const [selectedMlbDate, setSelectedMlbDate] = useState<string | undefined>(undefined)
  const [mlbDateFilter, setMlbDateFilter] = useState<string | undefined>(undefined)
  const requestIdRef = useRef(0)

  const fetchData = useCallback(
    async ({ week, nbaDate, mlbDate }: FetchParams = {}) => {
      const requestId = ++requestIdRef.current
      try {
        setIsLoading(true)
        const params = new URLSearchParams()
        if (typeof week === 'number' && Number.isFinite(week)) {
          params.set('week', week.toString())
        }
        if (nbaDate) {
          params.set('nbaDate', nbaDate)
        }
        if (mlbDate) {
          params.set('mlbDate', mlbDate)
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
        setNbaDateFilter((current) => current ?? payload.nba.date)
        setAvailableMlbDates(payload.mlb.availableDates ?? [])
        setSelectedMlbDate(payload.mlb.date)
        setMlbDateFilter((current) => current ?? payload.mlb.date)
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

    fetchData({
      week:
        activeTab === 'NFL' &&
        typeof weekFilter === 'number' &&
        Number.isFinite(weekFilter)
          ? weekFilter
          : undefined,
      nbaDate: activeTab === 'NBA' ? nbaDateFilter : undefined,
      mlbDate: activeTab === 'MLB' ? mlbDateFilter : undefined
    })

    // No interval polling needed since data updates once daily
  }, [enabled, fetchData, weekFilter, nbaDateFilter, mlbDateFilter, activeTab])

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
    if (!nextDate || nbaDateFilter === nextDate) return
    setSelectedDate(nextDate)
    setNbaDateFilter(nextDate)
  }

  const handleMlbDateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextDate = event.target.value
    if (!nextDate || mlbDateFilter === nextDate) return
    setSelectedMlbDate(nextDate)
    setMlbDateFilter(nextDate)
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

  const sortedWorldCupMatches: WorldCupMatchEdge[] = useMemo(() => {
    if (!data?.worldCup.matches) return []
    return [...data.worldCup.matches].sort((a, b) => {
      const aTime = a.kickoffUtc ? Date.parse(a.kickoffUtc) : Number.MAX_SAFE_INTEGER
      const bTime = b.kickoffUtc ? Date.parse(b.kickoffUtc) : Number.MAX_SAFE_INTEGER
      if (aTime !== bTime) return aTime - bTime
      return a.matchId.localeCompare(b.matchId)
    })
  }, [data])

  const topWorldCupTeams: WorldCupTeamProbability[] = useMemo(() => {
    if (!data?.worldCup.teamProbabilities) return []
    return [...data.worldCup.teamProbabilities]
      .sort((a, b) => b.championProb - a.championProb)
      .slice(0, 8)
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

  const formatStage = (value: string) =>
    value
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')

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
            : activeTab === 'MLB'
              ? 'Showing MLB model home-win probabilities.'
              : 'Showing World Cup match and tournament probabilities.'}
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
        <div className="space-y-4">
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
              No games available for selected date.
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
        </div>
      ) : activeTab === 'MLB' ? (
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
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/10 p-3 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                FIFA World Cup {data.worldCup.season}
              </div>
              <div className="text-base font-semibold text-foreground">
                {data.worldCup.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {data.worldCup.simulations.toLocaleString()} simulations • {data.worldCup.bracketSource.replaceAll('_', ' ')}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Updated {formatUpdatedAt(data.worldCup.updatedAt)}
            </div>
          </div>

          <p className="rounded-lg bg-foreground/5 p-2 text-xs text-muted-foreground">
            World Cup values are 1X2 match probabilities and tournament advancement odds. They are model forecasts, not betting advice.
          </p>

          {topWorldCupTeams.length > 0 && (
            <div className="rounded-xl border bg-card/60 p-3">
              <div className="mb-3 text-sm font-semibold text-foreground">Champion Odds</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {topWorldCupTeams.map((team, index) => (
                  <div key={team.team} className="flex items-center justify-between rounded-lg bg-foreground/5 px-3 py-2 text-xs">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="w-5 shrink-0 text-muted-foreground">{index + 1}</span>
                      <span className="truncate font-semibold text-foreground">{team.team}</span>
                      {team.groupName && (
                        <span className="shrink-0 text-[10px] uppercase text-muted-foreground">
                          Group {team.groupName}
                        </span>
                      )}
                    </div>
                    <div className="text-right font-semibold text-foreground">
                      {formatPercent(team.championProb)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sortedWorldCupMatches.length === 0 ? (
            <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
              World Cup board not loaded yet. Sync predictions after the tournament data refresh.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {sortedWorldCupMatches.slice(0, 12).map((match) => {
                const mostLikely = [
                  { label: match.homeTeam, probability: match.homeWinProb },
                  { label: 'Draw', probability: match.drawProb },
                  { label: match.awayTeam, probability: match.awayWinProb }
                ].sort((a, b) => b.probability - a.probability)[0]

                return (
                  <div
                    key={match.matchId}
                    className="flex flex-col rounded-xl border bg-card/60 p-3 hover:border-accent/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {match.groupName ? `Group ${match.groupName}` : formatStage(match.stage)}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1 text-sm font-semibold text-foreground">
                          <span>{match.homeTeam}</span>
                          <span className="text-muted-foreground">vs</span>
                          <span>{match.awayTeam}</span>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-foreground/10 px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
                        {match.status ?? 'scheduled'}
                      </span>
                    </div>
                    {match.kickoffUtc && (
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {formatTipoff(match.kickoffUtc)}
                      </div>
                    )}
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-foreground/5 p-2">
                        <div className="truncate text-muted-foreground">{match.homeTeam}</div>
                        <div className="font-semibold text-foreground">{formatPercent(match.homeWinProb)}</div>
                      </div>
                      <div className="rounded-lg bg-foreground/5 p-2">
                        <div className="text-muted-foreground">Draw</div>
                        <div className="font-semibold text-foreground">{formatPercent(match.drawProb)}</div>
                      </div>
                      <div className="rounded-lg bg-foreground/5 p-2">
                        <div className="truncate text-muted-foreground">{match.awayTeam}</div>
                        <div className="font-semibold text-foreground">{formatPercent(match.awayWinProb)}</div>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg bg-foreground/5 p-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Most likely</span>
                        <span className="font-semibold text-foreground">
                          {mostLikely.label} {formatPercent(mostLikely.probability)}
                        </span>
                      </div>
                      {match.projectedHomeGoals != null && match.projectedAwayGoals != null && (
                        <div className="mt-1 flex justify-between">
                          <span className="text-muted-foreground">Projected goals</span>
                          <span className="font-semibold text-foreground">
                            {match.projectedHomeGoals.toFixed(1)} - {match.projectedAwayGoals.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    {match.actualHomeScore != null && match.actualAwayScore != null && (
                      <div className="mt-2 text-xs font-semibold text-foreground">
                        Final: {match.homeTeam} {match.actualHomeScore} - {match.awayTeam} {match.actualAwayScore}
                      </div>
                    )}
                    <div className="mt-auto pt-3 text-[10px] uppercase text-muted-foreground">
                      Update {formatUpdatedAt(match.predictionUpdated)} • {match.modelVersion}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {Object.keys(data.worldCup.groupRankProbabilities).length > 0 && (
            <div className="rounded-xl border bg-card/60 p-3">
              <div className="mb-3 text-sm font-semibold text-foreground">Group Winner Probabilities</div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {Object.entries(data.worldCup.groupRankProbabilities).map(([group, rows]) => (
                  <div key={group} className="rounded-lg bg-foreground/5 p-3">
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Group {group}
                    </div>
                    <div className="space-y-1">
                      {rows.slice(0, 4).map((row) => (
                        <div key={row.team} className="flex justify-between gap-3 text-xs">
                          <span className="truncate text-foreground">{row.team}</span>
                          <span className="shrink-0 font-semibold text-foreground">
                            {formatPercent(row.rank1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
