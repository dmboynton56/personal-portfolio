import { isMissingTableError, supabase } from '@/lib/supabase'
import type {
  GetModelMetricsInput,
  GetModelMetricsOutput,
  MetricWindow
} from '@/lib/chatbot/types'

type League = 'NBA' | 'NFL'

type GameRow = {
  id: string
  league: League
  season: number
  week: number | null
  game_time_utc: string
  home_score: number | null
  away_score: number | null
}

type PredictionRow = {
  game_id: string
  my_spread: number | null
  asof_ts: string | null
}

type NormalizedRun = {
  runDate: string
  totalTrades: number
  closedTrades: number
  winningTrades: number
  losingTrades: number
  totalPnl: number | null
  averageWin: number | null
  averageLoss: number | null
  finalEquity: number | null
  returnPct: number | null
  dailyReturnPct: number | null
  winRate: number | null
  sourceFile: string | null
}

type NormalizedTrade = {
  tradeUid: string
  runDate: string
  symbol: string
  side: string | null
  entryTime: string | null
  exitTime: string | null
  exitReason: string | null
  pnl: number | null
}

type NormalizedHeartbeat = {
  sourceDate: string
  heartbeatTs: string
  loopCount: number | null
  symbolsTracked: number | null
  backtest: boolean
  sourceFile: string | null
}

const WIN_PROFIT_AT_MINUS_110 = 100 / 110

const asString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length ? trimmed : null
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return null
}

const asNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim().length) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const asInteger = (value: unknown): number | null => {
  const parsed = asNumber(value)
  if (parsed == null) return null
  const rounded = Math.round(parsed)
  return Number.isFinite(rounded) ? rounded : null
}

const parseRunDate = (value: string): string | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const parsed = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(parsed.getTime()) ? null : value
}

const parseTimestamp = (value: unknown): string | null => {
  const text = asString(value)
  if (!text) return null
  const normalized = text.includes('T') ? text : text.replace(' ', 'T')
  const withZone = /Z$|[+-]\d{2}:\d{2}$/.test(normalized)
    ? normalized
    : `${normalized}Z`
  const parsed = new Date(withZone)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

const getRunDateMs = (runDate: string): number | null => {
  const parsed = new Date(`${runDate}T00:00:00Z`)
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime()
}

const formatPct = (value: number | null) =>
  value == null ? 'N/A' : `${(value * 100).toFixed(1)}%`

const formatCurrency = (value: number | null) =>
  value == null
    ? 'N/A'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(value)

const inferCurrentSeason = (league: League) => {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth() + 1
  return month < 8 ? year - 1 : year
}

const toNumber = (value: number | string | null | undefined) => {
  if (value == null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const calculateHit = (game: GameRow, prediction: PredictionRow) => {
  const homeScore = toNumber(game.home_score)
  const awayScore = toNumber(game.away_score)
  const modelSpread = toNumber(prediction.my_spread)

  if (homeScore == null || awayScore == null || modelSpread == null) {
    return null
  }

  const actualMargin = homeScore - awayScore
  const coverMargin = actualMargin + modelSpread

  if (Math.abs(coverMargin) < 0.001) return null
  return coverMargin > 0
}

const getSportsEdgeAts = async (
  input: GetModelMetricsInput
): Promise<GetModelMetricsOutput> => {
  const generatedAt = new Date().toISOString()
  const league = input.league ?? 'NBA'
  const season = input.season ?? inferCurrentSeason(league)
  const emptyCitation = {
    type: 'supabase' as const,
    title: 'Sports Edge ATS Metrics',
    source: 'Supabase games + model_predictions',
    generatedAt
  }

  if (!supabase) {
    return {
      metric: input.metric,
      value: 'No data available',
      generatedAt,
      source: 'Supabase',
      citations: [emptyCitation],
      message: 'Supabase is not configured for Sports Edge metrics.'
    }
  }

  try {
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('id, league, season, week, game_time_utc, home_score, away_score')
      .eq('league', league)
      .eq('season', season)
      .not('home_score', 'is', null)
      .not('away_score', 'is', null)
      .order('game_time_utc', { ascending: true })
      .limit(5000)

    if (gamesError) throw gamesError

    if (!games?.length) {
      return {
        metric: input.metric,
        value: 'No data available',
        generatedAt,
        source: 'Supabase',
        citations: [emptyCitation],
        message: `No graded ${league} games found for ${season}.`
      }
    }

    const gameRows = games as GameRow[]
    const gameIds = gameRows.map((game) => game.id)
    const { data: predictions, error: predictionError } = await supabase
      .from('model_predictions')
      .select('game_id, my_spread, asof_ts')
      .in('game_id', gameIds)
      .order('asof_ts', { ascending: false })
      .limit(10000)

    if (predictionError) throw predictionError

    const latestPredictionByGame = new Map<string, PredictionRow>()
    for (const prediction of (predictions ?? []) as PredictionRow[]) {
      if (!latestPredictionByGame.has(prediction.game_id)) {
        latestPredictionByGame.set(prediction.game_id, prediction)
      }
    }

    const graded = gameRows
      .map((game) => {
        const prediction = latestPredictionByGame.get(game.id)
        if (!prediction) return null
        return {
          hit: calculateHit(game, prediction),
          predictionUpdatedAt: prediction.asof_ts,
          gameTimeUtc: game.game_time_utc
        }
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row))

    const wins = graded.filter((row) => row.hit === true).length
    const losses = graded.filter((row) => row.hit === false).length
    const pushes = graded.filter((row) => row.hit === null).length
    const riskedGames = wins + losses
    const gradedGames = riskedGames + pushes
    const atsPct = riskedGames ? wins / riskedGames : null
    const roiPct = riskedGames
      ? (wins * WIN_PROFIT_AT_MINUS_110 - losses) / riskedGames
      : null
    const updatedAt =
      graded
        .map((row) => row.predictionUpdatedAt ?? row.gameTimeUtc)
        .filter(Boolean)
        .sort()
        .at(-1) ?? null

    if (!gradedGames) {
      return {
        metric: input.metric,
        value: 'No data available',
        generatedAt,
        source: 'Supabase',
        citations: [emptyCitation],
        message: `No ${league} games have both scores and predictions for ${season}.`
      }
    }

    return {
      metric: input.metric,
      value:
        input.metric === 'roi'
          ? formatPct(roiPct)
          : `${wins}-${losses}-${pushes} ATS (${formatPct(atsPct)})`,
      generatedAt,
      source: 'Supabase',
      breakdown: {
        league,
        season,
        wins,
        losses,
        pushes,
        gradedGames,
        atsPct,
        roiPct,
        updatedAt
      },
      citations: [
        {
          ...emptyCitation,
          snippet: `${league} ${season}: ${wins} wins, ${losses} losses, ${pushes} pushes across ${gradedGames} graded games.`
        }
      ]
    }
  } catch (error) {
    console.error('Sports Edge metric error:', error)
    return {
      metric: input.metric,
      value: 'No data available',
      generatedAt,
      source: 'Supabase',
      citations: [emptyCitation],
      message: isMissingTableError(error)
        ? 'Sports Edge serving tables are not available yet.'
        : 'Sports Edge metrics could not be loaded.'
    }
  }
}

const fetchLlmAdvisorTelemetry = async () => {
  if (!supabase) {
    return {
      runs: [] as NormalizedRun[],
      trades: [] as NormalizedTrade[],
      heartbeats: [] as NormalizedHeartbeat[],
      message: 'Supabase is not configured for LLM Advisor telemetry.'
    }
  }

  const [runsResult, tradesResult, heartbeatResult] = await Promise.all([
    supabase
      .from('llm_advisor_backtest_runs')
      .select(
        'run_date,total_trades,closed_trades,winning_trades,losing_trades,total_pnl,average_win,average_loss,final_equity,return_pct,daily_return_pct,win_rate,source_file'
      )
      .order('run_date', { ascending: false })
      .limit(120),
    supabase
      .from('llm_advisor_backtest_trades')
      .select('trade_uid,run_date,symbol,side,entry_time,exit_time,exit_reason,pnl')
      .order('exit_time', { ascending: false })
      .limit(2500),
    supabase
      .from('llm_advisor_runtime_heartbeats')
      .select('source_date,heartbeat_ts,loop_count,symbols_tracked,backtest,source_file')
      .order('heartbeat_ts', { ascending: false })
      .limit(50)
  ])

  const firstError = runsResult.error || tradesResult.error || heartbeatResult.error
  if (firstError) {
    return {
      runs: [] as NormalizedRun[],
      trades: [] as NormalizedTrade[],
      heartbeats: [] as NormalizedHeartbeat[],
      message: isMissingTableError(firstError)
        ? 'LLM Advisor telemetry tables are not available yet.'
        : 'LLM Advisor telemetry could not be loaded.'
    }
  }

  const runs: NormalizedRun[] = (runsResult.data ?? [])
    .map((row) => ({
      runDate: asString(row.run_date) ?? '',
      totalTrades: asInteger(row.total_trades) ?? 0,
      closedTrades: asInteger(row.closed_trades) ?? 0,
      winningTrades: asInteger(row.winning_trades) ?? 0,
      losingTrades: asInteger(row.losing_trades) ?? 0,
      totalPnl: asNumber(row.total_pnl),
      averageWin: asNumber(row.average_win),
      averageLoss: asNumber(row.average_loss),
      finalEquity: asNumber(row.final_equity),
      returnPct: asNumber(row.return_pct),
      dailyReturnPct: asNumber(row.daily_return_pct),
      winRate: asNumber(row.win_rate),
      sourceFile: asString(row.source_file)
    }))
    .filter((row) => Boolean(parseRunDate(row.runDate)))

  const trades: NormalizedTrade[] = (tradesResult.data ?? [])
    .map((row, index) => {
      const runDate = asString(row.run_date) ?? ''
      return {
        tradeUid: asString(row.trade_uid) ?? `${runDate}:db-idx-${index}`,
        runDate,
        symbol: asString(row.symbol) ?? 'UNKNOWN',
        side: asString(row.side),
        entryTime: parseTimestamp(row.entry_time),
        exitTime: parseTimestamp(row.exit_time),
        exitReason: asString(row.exit_reason),
        pnl: asNumber(row.pnl)
      }
    })
    .filter((trade) => Boolean(parseRunDate(trade.runDate)))

  const heartbeats: NormalizedHeartbeat[] = (heartbeatResult.data ?? [])
    .map((row) => {
      const sourceDate = asString(row.source_date) ?? ''
      const heartbeatTs = parseTimestamp(row.heartbeat_ts)
      if (!parseRunDate(sourceDate) || !heartbeatTs) return null
      return {
        sourceDate,
        heartbeatTs,
        loopCount: asInteger(row.loop_count),
        symbolsTracked: asInteger(row.symbols_tracked),
        backtest: Boolean(row.backtest),
        sourceFile: asString(row.source_file)
      }
    })
    .filter((row): row is NormalizedHeartbeat => Boolean(row))

  return { runs, trades, heartbeats, message: undefined }
}

const windowDays = (window: MetricWindow) => {
  if (window === '7d') return 7
  if (window === '30d') return 30
  return null
}

const getTradeTimeMs = (trade: NormalizedTrade): number | null => {
  const timestamp = trade.exitTime ?? trade.entryTime
  if (!timestamp) return null
  const parsed = new Date(timestamp)
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime()
}

const getLlmAdvisorMetrics = async (
  input: GetModelMetricsInput
): Promise<GetModelMetricsOutput> => {
  const generatedAt = new Date().toISOString()
  const telemetry = await fetchLlmAdvisorTelemetry()
  const citation = {
    type: 'supabase' as const,
    title: 'LLM Advisor Telemetry',
    source:
      'Supabase llm_advisor_backtest_runs, llm_advisor_backtest_trades, llm_advisor_runtime_heartbeats',
    generatedAt
  }

  if (telemetry.message) {
    return {
      metric: input.metric,
      value: 'No data available',
      generatedAt,
      source: 'Supabase',
      citations: [citation],
      message: telemetry.message
    }
  }

  const runs = [...telemetry.runs].sort((a, b) => b.runDate.localeCompare(a.runDate))
  const trades = [...telemetry.trades]
  const heartbeats = [...telemetry.heartbeats].sort((a, b) =>
    b.heartbeatTs.localeCompare(a.heartbeatTs)
  )
  const anchorDate = runs[0]?.runDate ?? null
  const anchorMs = anchorDate ? getRunDateMs(anchorDate) : null
  const days = windowDays(input.window)
  const cutoffMs =
    days != null && anchorMs != null ? anchorMs - (days - 1) * 86_400_000 : null

  const runsInWindow =
    cutoffMs == null
      ? runs
      : runs.filter((run) => {
          const runMs = getRunDateMs(run.runDate)
          return runMs != null && runMs >= cutoffMs
        })

  const tradesInWindow =
    cutoffMs == null
      ? trades
      : trades.filter((trade) => {
          const tradeMs = getTradeTimeMs(trade)
          return tradeMs != null && tradeMs >= cutoffMs
        })

  if (input.metric === 'heartbeats') {
    const latestHeartbeat = heartbeats[0] ?? null
    if (!latestHeartbeat) {
      return {
        metric: input.metric,
        value: 'No heartbeat data available',
        generatedAt,
        source: 'Supabase',
        citations: [citation],
        message: 'No runtime heartbeat rows were found.'
      }
    }

    const ageSeconds = Math.max(
      0,
      Math.round((Date.now() - new Date(latestHeartbeat.heartbeatTs).getTime()) / 1000)
    )
    const state =
      ageSeconds <= 180 ? 'ACTIVE' : ageSeconds <= 1800 ? 'DELAYED' : 'STALE'

    return {
      metric: input.metric,
      value: state,
      generatedAt,
      source: 'Supabase',
      breakdown: {
        lastHeartbeatTs: latestHeartbeat.heartbeatTs,
        ageSeconds,
        loopCount: latestHeartbeat.loopCount,
        symbolsTracked: latestHeartbeat.symbolsTracked,
        backtest: latestHeartbeat.backtest,
        sourceFile: latestHeartbeat.sourceFile
      },
      citations: [
        {
          ...citation,
          snippet: `Latest heartbeat ${latestHeartbeat.heartbeatTs}; state ${state}; loop count ${latestHeartbeat.loopCount ?? 'unknown'}.`
        }
      ]
    }
  }

  if (input.metric === 'trade_count') {
    return {
      metric: input.metric,
      value: tradesInWindow.length,
      generatedAt,
      source: 'Supabase',
      breakdown: {
        window: input.window,
        anchorDate,
        runCount: runsInWindow.length,
        tradeCount: tradesInWindow.length
      },
      citations: [
        {
          ...citation,
          snippet: `${tradesInWindow.length} trades found for ${input.window} window anchored at ${anchorDate ?? 'unknown'}.`
        }
      ]
    }
  }

  const pnl = runsInWindow.length
    ? runsInWindow.reduce((sum, run) => sum + (run.totalPnl ?? 0), 0)
    : null
  const closedTrades = tradesInWindow.filter((trade) => trade.pnl != null)
  const winners = closedTrades.filter((trade) => (trade.pnl ?? 0) > 0)
  const losers = closedTrades.filter((trade) => (trade.pnl ?? 0) < 0)
  const winRate = closedTrades.length ? winners.length / closedTrades.length : null

  return {
    metric: input.metric,
    value: formatCurrency(pnl),
    generatedAt,
    source: 'Supabase',
    breakdown: {
      window: input.window,
      anchorDate,
      runCount: runsInWindow.length,
      tradeCount: tradesInWindow.length,
      closedTrades: closedTrades.length,
      winners: winners.length,
      losers: losers.length,
      winRate
    },
    citations: [
      {
        ...citation,
        snippet: `${input.window} P/L ${formatCurrency(pnl)}; ${closedTrades.length} closed trades; win rate ${formatPct(winRate)}.`
      }
    ],
    message: runsInWindow.length ? undefined : 'No LLM Advisor run rows were found for the requested window.'
  }
}

export const getModelMetrics = async (
  input: GetModelMetricsInput
): Promise<GetModelMetricsOutput> => {
  if (input.project === 'sports-edge') {
    if (input.metric === 'ats_record' || input.metric === 'roi') {
      return getSportsEdgeAts(input)
    }

    return {
      metric: input.metric,
      value: 'No canned metric available',
      generatedAt: new Date().toISOString(),
      source: 'Supabase',
      citations: [],
      message: `${input.metric} is not available as a canned Sports Edge metric yet.`
    }
  }

  return getLlmAdvisorMetrics(input)
}
