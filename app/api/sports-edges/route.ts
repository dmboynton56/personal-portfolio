import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  sportsEdgeMockData,
  SportsEdgePayload,
  NflGameEdge,
  NbaGameEdge,
  MlbGameEdge
} from '@/lib/sportsEdgeData'
import { ApiEnvelope, ApiSource, STALE_THRESHOLDS, toApiMeta } from '@/lib/freshness'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null

const DEFAULT_LOOKBACK_DAYS = Number(
  process.env.SPORTS_EDGE_LOOKBACK_DAYS ?? 1
)
const DEFAULT_HORIZON_DAYS = Number(
  process.env.SPORTS_EDGE_LOOKAHEAD_DAYS ?? 9
)

type SupabaseGameRow = {
  id: string
  league: string
  season: number
  week?: number | null
  game_time_utc: string
  home_team: string
  away_team: string
  book_spread?: number | null
  home_score?: number | null
  away_score?: number | null
  home_probable_pitcher?: string | null
  away_probable_pitcher?: string | null
}

type SupabasePredictionRow = {
  game_id: string
  model_name: string | null
  my_spread: number | null
  my_home_win_prob: number | null
  model_version: string | null
  asof_ts: string | null
}

type WeekWindow = {
  start: Date
  end: Date
}

type LoadedEdges = {
  games: NflGameEdge[]
  season: number
  week: number
  label: string
  window: WeekWindow
}

type LoadOptions = {
  week?: number
  date?: string
}

type LoadedNbaEdges = {
  games: NbaGameEdge[]
  season: number
  date: string
  label: string
  window: WeekWindow
}

type LoadedMlbEdges = {
  games: MlbGameEdge[]
  season: number
  date: string
  label: string
  window: WeekWindow
}

const parseIsoDate = (value?: string | null) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const chunkArray = <T,>(items: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

const loadPredictedGameIds = async (gameIds: string[]) => {
  if (!supabase || !gameIds.length) return new Set<string>()

  const predictedGameIds = new Set<string>()
  for (const chunk of chunkArray(gameIds, 200)) {
    const { data: predictions, error } = await supabase
      .from('model_predictions')
      .select('game_id')
      .in('game_id', chunk)
      .limit(1000)

    if (error) {
      console.warn('Supabase error when gathering predicted game ids.', error)
      continue
    }

    predictions?.forEach((prediction) => {
      if (prediction.game_id) {
        predictedGameIds.add(prediction.game_id)
      }
    })
  }

  return predictedGameIds
}

const getWeekWindow = (): WeekWindow => {
  const envStart = parseIsoDate(process.env.SPORTS_EDGE_WEEK_START)
  const envEnd = parseIsoDate(process.env.SPORTS_EDGE_WEEK_END)

  if (envStart && envEnd && envStart < envEnd) {
    return { start: envStart, end: envEnd }
  }

  const now = new Date()
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
  start.setUTCDate(start.getUTCDate() - DEFAULT_LOOKBACK_DAYS)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + DEFAULT_HORIZON_DAYS)
  end.setUTCHours(23, 59, 59, 999)

  return { start, end }
}

const todayUtcDate = () => new Date().toISOString().split('T')[0]

const resolveLeagueDate = (
  explicitDate: string | undefined,
  availableDates: string[]
) => {
  if (explicitDate) return explicitDate
  if (availableDates.length > 0) return availableDates[0]
  return todayUtcDate()
}

const getDateWindow = (): WeekWindow => {
  const envStart = parseIsoDate(process.env.SPORTS_EDGE_DATE_START)
  const envEnd = parseIsoDate(process.env.SPORTS_EDGE_DATE_END)

  if (envStart && envEnd && envStart < envEnd) {
    return { start: envStart, end: envEnd }
  }

  const now = new Date()
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
  start.setUTCDate(start.getUTCDate() - DEFAULT_LOOKBACK_DAYS)
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
  end.setUTCDate(end.getUTCDate() + DEFAULT_HORIZON_DAYS)
  end.setUTCHours(23, 59, 59, 999)

  return { start, end }
}

const determineSeason = (rows: SupabaseGameRow[]) => {
  const fromRow = rows.find((row) => Number.isFinite(row.season))?.season
  const envSeason = Number(process.env.SPORTS_EDGE_SEASON)
  return Number.isFinite(fromRow)
    ? fromRow
    : Number.isFinite(envSeason)
      ? envSeason
      : sportsEdgeMockData.nfl.season
}

const determineWeek = (rows: SupabaseGameRow[]) => {
  const fromRow = rows.find((row) => Number.isFinite(row.week))?.week
  const envWeek = Number(process.env.SPORTS_EDGE_WEEK)
  return Number.isFinite(fromRow ?? undefined)
    ? (fromRow as number)
    : Number.isFinite(envWeek)
      ? envWeek
      : sportsEdgeMockData.nfl.week
}

const formatWeekLabel = (week: number, window: WeekWindow) => {
  if (process.env.SPORTS_EDGE_WEEK_LABEL) {
    return process.env.SPORTS_EDGE_WEEK_LABEL
  }

  if (Number.isFinite(week)) {
    return `Week ${week}`
  }

  const format = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  })
  return `Week of ${format.format(window.start)}`
}

const formatDateLabel = (value: string) => {
  const dateObj = new Date(value)
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

const resolveGameDateLabel = (
  games: SupabaseGameRow[],
  dateFilter?: string
) => {
  if (dateFilter) {
    return {
      date: dateFilter,
      label: formatDateLabel(dateFilter)
    }
  }

  const firstGameDate = parseIsoDate(games[0]?.game_time_utc)
  if (firstGameDate) {
    const date = firstGameDate.toISOString().split('T')[0]
    return {
      date,
      label: formatDateLabel(date)
    }
  }

  const date = new Date().toISOString().split('T')[0]
  return { date, label: 'Today' }
}

const windowFromGames = (games: SupabaseGameRow[], fallback: WeekWindow) => {
  const timestamps = games
    .map((game) => parseIsoDate(game.game_time_utc))
    .filter((date): date is Date => Boolean(date))

  if (!timestamps.length) {
    return fallback
  }

  const sorted = timestamps.sort((a, b) => a.getTime() - b.getTime())
  return {
    start: sorted[0],
    end: sorted[sorted.length - 1]
  }
}

const mapGameToNflEdge = (
  game: SupabaseGameRow,
  prediction: SupabasePredictionRow
): NflGameEdge => {
  const modelSpread = prediction.my_spread ?? (game.book_spread != null ? game.book_spread : 0)
  const actualHomeScore = game.home_score ?? null
  const actualAwayScore = game.away_score ?? null
  
  // Calculate spreadHit: true if the actual margin covers the predicted spread
  // my_spread is the predicted margin from home team's perspective (negative = home favored, positive = home underdog)
  // Home covers if actualMargin is better than -my_spread (i.e., actualMargin > -my_spread)
  // For negative spreads (home favored): home covers if actualMargin >= |spread| (home wins by at least that much)
  // For positive spreads (home underdog): home covers if actualMargin > -spread (home loses by less than spread OR wins)
  let spreadHit: boolean | null = null
  if (actualHomeScore != null && actualAwayScore != null && prediction.my_spread != null) {
    const actualMargin = actualHomeScore - actualAwayScore
    // Home covers if actualMargin > -my_spread
    // This works for both negative and positive spreads
    spreadHit = actualMargin > -modelSpread
  }
  
  return {
    gameId: game.id,
    homeTeam: game.home_team,
    awayTeam: game.away_team,
    kickoffUtc: game.game_time_utc,
    bookSpread: game.book_spread ?? null,
    modelSpread,
    homeWinProb: prediction.my_home_win_prob ?? 0.5,
    modelVersion: prediction.model_version ?? 'sports-edge-weekly',
    predictionUpdated: prediction.asof_ts ?? game.game_time_utc,
    note: 'Sports Edge weekly snapshot from Supabase.',
    actualHomeScore,
    actualAwayScore,
    spreadHit
  }
}

const loadNflEdges = async (
  options: LoadOptions = {}
): Promise<LoadedEdges | null> => {
  if (!supabase) return null

  const preferredModelName = process.env.SPORTS_EDGE_MODEL_NAME?.trim()
  const weekFilter = Number.isFinite(options.week) ? (options.week as number) : undefined
  const defaultWindow = getWeekWindow()

  let gamesQuery = supabase
    .from('games')
    .select(
      'id, league, season, week, game_time_utc, home_team, away_team, book_spread, home_score, away_score, home_probable_pitcher, away_probable_pitcher'
    )
    .eq('league', 'NFL')

  if (typeof weekFilter === 'number') {
    gamesQuery = gamesQuery.eq('week', weekFilter)
  } else {
    gamesQuery = gamesQuery
      .gte('game_time_utc', defaultWindow.start.toISOString())
      .lt('game_time_utc', defaultWindow.end.toISOString())
  }

  const { data: games, error: gamesError } = await gamesQuery.order(
    'game_time_utc',
    { ascending: true }
  )

  if (gamesError) {
    console.warn(
      'Supabase error when loading games for weekly window.',
      gamesError
    )
    return null
  }

  if (!games?.length) {
    return null
  }

  const gameIds = games.map((game) => game.id)
  if (!gameIds.length) {
    return null
  }

  let predictionsQuery = supabase
    .from('model_predictions')
    .select('game_id, model_name, my_spread, my_home_win_prob, model_version, asof_ts')
    .in('game_id', gameIds)

  if (preferredModelName) {
    predictionsQuery = predictionsQuery.eq(
      'model_name',
      preferredModelName
    )
  }

  predictionsQuery = predictionsQuery.order('asof_ts', {
    ascending: false
  })

  const { data: predictions, error: predictionError } = await predictionsQuery

  if (predictionError) {
    console.warn(
      'Supabase error when loading model_predictions.',
      predictionError
    )
    return null
  }

  if (!predictions?.length) {
    return null
  }

  // Track the latest prediction per (game_id, model_name) plus the freshest overall per game.
  const latestPredictionsByModel = new Map<string, SupabasePredictionRow>()
  const latestPredictionsByGame = new Map<string, SupabasePredictionRow>()
  for (const prediction of predictions) {
    const key = `${prediction.game_id}:${prediction.model_name ?? 'unknown'}`
    if (!latestPredictionsByModel.has(key)) {
      latestPredictionsByModel.set(key, prediction)
    }

    if (!latestPredictionsByGame.has(prediction.game_id)) {
      latestPredictionsByGame.set(prediction.game_id, prediction)
    }
  }

  const pickPrediction = (gameId: string) => {
    if (preferredModelName) {
      const preferred = latestPredictionsByModel.get(
        `${gameId}:${preferredModelName}`
      )
      if (preferred) return preferred
    }

    return latestPredictionsByGame.get(gameId) ?? null
  }

  const mappedGames = games
    .map((game) => {
      const prediction = pickPrediction(game.id)
      return prediction ? mapGameToNflEdge(game, prediction) : null
    })
    .filter((value): value is NflGameEdge => Boolean(value))

  if (!mappedGames.length) {
    return null
  }

  const season = determineSeason(games)
  const week = typeof weekFilter === 'number' ? weekFilter : determineWeek(games)
  const window =
    typeof weekFilter === 'number'
      ? windowFromGames(games, defaultWindow)
      : defaultWindow
  const label = formatWeekLabel(week, window)

  return {
    games: mappedGames,
    season: season ?? 2025,
    week,
    label,
    window
  }
}

const loadAvailableWeeks = async (season?: number) => {
  if (!supabase) return []

  // Query weeks from games that have predictions, not just games in the default window
  // This ensures we get all available weeks even if current window is empty
  let query = supabase
    .from('games')
    .select('week, id')
    .eq('league', 'NFL')
    .not('week', 'is', null)

  if (typeof season === 'number' && Number.isFinite(season)) {
    query = query.eq('season', season)
  }

  const { data: games, error: gamesError } = await query.order('week', {
    ascending: true
  })

  if (gamesError) {
    console.warn('Supabase error when gathering available NFL weeks.', gamesError)
    return []
  }

  if (!games?.length) {
    return []
  }

  const gamesWithPredictions = await loadPredictedGameIds(
    games.map((game) => game.id)
  )

  if (!gamesWithPredictions.size) {
    return []
  }

  // Get unique weeks from games that have predictions
  const uniqueWeeks = Array.from(
    new Set(
      games
        .filter((g) => gamesWithPredictions.has(g.id))
        .map((row) => row.week)
        .filter((week): week is number => Number.isFinite(week))
    )
  )

  return uniqueWeeks
}

const mapGameToNbaEdge = (
  game: SupabaseGameRow,
  prediction: SupabasePredictionRow
): NbaGameEdge => {
  const modelSpread = prediction.my_spread ?? (game.book_spread != null ? game.book_spread : 0)
  const actualHomeScore = game.home_score ?? null
  const actualAwayScore = game.away_score ?? null
  
  // Calculate spreadHit: same logic as NFL
  let spreadHit: boolean | null = null
  if (actualHomeScore != null && actualAwayScore != null && prediction.my_spread != null) {
    const actualMargin = actualHomeScore - actualAwayScore
    spreadHit = actualMargin > -modelSpread
  }
  
  return {
    gameId: game.id,
    homeTeam: game.home_team,
    awayTeam: game.away_team,
    tipoffUtc: game.game_time_utc,
    bookSpread: game.book_spread ?? null,
    modelSpread,
    homeWinProb: prediction.my_home_win_prob ?? 0.5,
    modelVersion: prediction.model_version ?? 'sports-edge-daily',
    predictionUpdated: prediction.asof_ts ?? game.game_time_utc,
    note: 'Sports Edge daily snapshot from Supabase.',
    actualHomeScore,
    actualAwayScore,
    spreadHit
  }
}

const mapGameToMlbEdge = (
  game: SupabaseGameRow,
  prediction: SupabasePredictionRow
): MlbGameEdge => {
  const actualHomeScore = game.home_score ?? null
  const actualAwayScore = game.away_score ?? null
  const homeWinProb = prediction.my_home_win_prob ?? 0.5
  let winnerHit: boolean | null = null

  if (actualHomeScore != null && actualAwayScore != null) {
    winnerHit = (homeWinProb >= 0.5) === (actualHomeScore > actualAwayScore)
  }

  return {
    gameId: game.id,
    homeTeam: game.home_team,
    awayTeam: game.away_team,
    firstPitchUtc: game.game_time_utc,
    homeWinProb,
    modelVersion: prediction.model_version ?? 'mlb-winner-v3',
    predictionUpdated: prediction.asof_ts ?? game.game_time_utc,
    note: 'MLB v3 home-win probability from Supabase.',
    homeProbablePitcher: game.home_probable_pitcher ?? null,
    awayProbablePitcher: game.away_probable_pitcher ?? null,
    actualHomeScore,
    actualAwayScore,
    winnerHit
  }
}

const buildDateGamesQuery = (
  league: 'NBA' | 'MLB',
  dateFilter: string | undefined,
  defaultWindow: WeekWindow
) => {
  let gamesQuery = supabase!
    .from('games')
    .select(
      'id, league, season, week, game_time_utc, home_team, away_team, book_spread, home_score, away_score, home_probable_pitcher, away_probable_pitcher'
    )
    .eq('league', league)

  if (dateFilter) {
    const filterDate = new Date(dateFilter)
    const startOfDay = new Date(Date.UTC(
      filterDate.getUTCFullYear(),
      filterDate.getUTCMonth(),
      filterDate.getUTCDate(),
      0, 0, 0, 0
    ))
    const endOfDay = new Date(startOfDay)
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1)

    gamesQuery = gamesQuery
      .gte('game_time_utc', startOfDay.toISOString())
      .lt('game_time_utc', endOfDay.toISOString())
  } else {
    gamesQuery = gamesQuery
      .gte('game_time_utc', defaultWindow.start.toISOString())
      .lt('game_time_utc', defaultWindow.end.toISOString())
  }

  return gamesQuery.order('game_time_utc', { ascending: true })
}

const loadNbaEdges = async (
  options: LoadOptions = {}
): Promise<LoadedNbaEdges | null> => {
  if (!supabase) return null

  const preferredModelName = process.env.SPORTS_EDGE_MODEL_NAME?.trim()
  const dateFilter = options.date
  const defaultWindow = getDateWindow()

  const { data: games, error: gamesError } = await buildDateGamesQuery(
    'NBA',
    dateFilter,
    defaultWindow
  )

  if (gamesError) {
    console.warn(
      'Supabase error when loading NBA games for date window.',
      gamesError
    )
    return null
  }

  if (!games?.length) {
    return null
  }

  const gameIds = games.map((game) => game.id)
  if (!gameIds.length) {
    return null
  }

  let predictionsQuery = supabase
    .from('model_predictions')
    .select('game_id, model_name, my_spread, my_home_win_prob, model_version, asof_ts')
    .in('game_id', gameIds)

  if (preferredModelName) {
    predictionsQuery = predictionsQuery.eq(
      'model_name',
      preferredModelName
    )
  }

  predictionsQuery = predictionsQuery.order('asof_ts', {
    ascending: false
  })

  const { data: predictions, error: predictionError } = await predictionsQuery

  if (predictionError) {
    console.warn(
      'Supabase error when loading NBA model_predictions.',
      predictionError
    )
    return null
  }

  if (!predictions?.length) {
    return null
  }

  // Track the latest prediction per (game_id, model_name) plus the freshest overall per game.
  const latestPredictionsByModel = new Map<string, SupabasePredictionRow>()
  const latestPredictionsByGame = new Map<string, SupabasePredictionRow>()
  for (const prediction of predictions) {
    const key = `${prediction.game_id}:${prediction.model_name ?? 'unknown'}`
    if (!latestPredictionsByModel.has(key)) {
      latestPredictionsByModel.set(key, prediction)
    }

    if (!latestPredictionsByGame.has(prediction.game_id)) {
      latestPredictionsByGame.set(prediction.game_id, prediction)
    }
  }

  const pickPrediction = (gameId: string) => {
    if (preferredModelName) {
      const preferred = latestPredictionsByModel.get(
        `${gameId}:${preferredModelName}`
      )
      if (preferred) return preferred
    }

    return latestPredictionsByGame.get(gameId) ?? null
  }

  const mappedGames = games
    .map((game) => {
      const prediction = pickPrediction(game.id)
      return prediction ? mapGameToNbaEdge(game, prediction) : null
    })
    .filter((value): value is NbaGameEdge => Boolean(value))

  if (!mappedGames.length) {
    return null
  }

  const season = determineSeason(games)
  
  const { date, label } = resolveGameDateLabel(games, dateFilter)

  const window = dateFilter
    ? windowFromGames(games, defaultWindow)
    : defaultWindow

  return {
    games: mappedGames,
    season: season ?? 2024,
    date,
    label,
    window
  }
}

const loadMlbEdges = async (
  options: LoadOptions = {}
): Promise<LoadedMlbEdges | null> => {
  if (!supabase) return null

  const preferredModelName = process.env.SPORTS_EDGE_MODEL_NAME?.trim()
  const dateFilter = options.date
  const defaultWindow = getDateWindow()

  const { data: games, error: gamesError } = await buildDateGamesQuery(
    'MLB',
    dateFilter,
    defaultWindow
  )

  if (gamesError) {
    console.warn(
      'Supabase error when loading MLB games for date window.',
      gamesError
    )
    return null
  }

  if (!games?.length) {
    return null
  }

  const gameIds = games.map((game) => game.id)
  if (!gameIds.length) {
    return null
  }

  let predictionsQuery = supabase
    .from('model_predictions')
    .select('game_id, model_name, my_spread, my_home_win_prob, model_version, asof_ts')
    .in('game_id', gameIds)

  if (preferredModelName) {
    predictionsQuery = predictionsQuery.eq(
      'model_name',
      preferredModelName
    )
  }

  predictionsQuery = predictionsQuery.order('asof_ts', {
    ascending: false
  })

  const { data: predictions, error: predictionError } = await predictionsQuery

  if (predictionError) {
    console.warn(
      'Supabase error when loading MLB model_predictions.',
      predictionError
    )
    return null
  }

  if (!predictions?.length) {
    return null
  }

  const latestPredictionsByModel = new Map<string, SupabasePredictionRow>()
  const latestPredictionsByGame = new Map<string, SupabasePredictionRow>()
  for (const prediction of predictions) {
    const key = `${prediction.game_id}:${prediction.model_name ?? 'unknown'}`
    if (!latestPredictionsByModel.has(key)) {
      latestPredictionsByModel.set(key, prediction)
    }

    if (!latestPredictionsByGame.has(prediction.game_id)) {
      latestPredictionsByGame.set(prediction.game_id, prediction)
    }
  }

  const pickPrediction = (gameId: string) => {
    if (preferredModelName) {
      const preferred = latestPredictionsByModel.get(
        `${gameId}:${preferredModelName}`
      )
      if (preferred) return preferred
    }

    return latestPredictionsByGame.get(gameId) ?? null
  }

  const mappedGames = games
    .map((game) => {
      const prediction = pickPrediction(game.id)
      return prediction ? mapGameToMlbEdge(game, prediction) : null
    })
    .filter((value): value is MlbGameEdge => Boolean(value))

  if (!mappedGames.length) {
    return null
  }

  const season = determineSeason(games)
  const { date, label } = resolveGameDateLabel(games, dateFilter)
  const window = dateFilter
    ? windowFromGames(games, defaultWindow)
    : defaultWindow

  return {
    games: mappedGames,
    season: season ?? 2026,
    date,
    label,
    window
  }
}

const loadAvailableDates = async (league: 'NBA' | 'MLB', season?: number) => {
  if (!supabase) return []

  // Query dates from games that have predictions
  let query = supabase
    .from('games')
    .select('game_time_utc, id')
    .eq('league', league)

  if (typeof season === 'number' && Number.isFinite(season)) {
    query = query.eq('season', season)
  }

  const { data: games, error: gamesError } = await query.order('game_time_utc', {
    ascending: false
  })

  if (gamesError) {
    console.warn(`Supabase error when gathering available ${league} dates.`, gamesError)
    return []
  }

  if (!games?.length) {
    return []
  }

  const gamesWithPredictions = await loadPredictedGameIds(
    games.map((game) => game.id)
  )

  if (!gamesWithPredictions.size) {
    return []
  }

  // Get unique dates (YYYY-MM-DD) from games that have predictions
  const dateSet = new Set<string>()
  
  games
    .filter((g) => gamesWithPredictions.has(g.id))
    .forEach((game) => {
      const date = parseIsoDate(game.game_time_utc)
      if (date) {
        const dateStr = date.toISOString().split('T')[0]
        dateSet.add(dateStr)
      }
    })

  // Sort dates descending (most recent first)
  return Array.from(dateSet).sort((a, b) => b.localeCompare(a))
}

export async function GET(request: NextRequest) {
  const weekParam = request.nextUrl.searchParams.get('week')
  const dateParam = request.nextUrl.searchParams.get('date')
  const nbaDateParam =
    request.nextUrl.searchParams.get('nbaDate') ?? dateParam ?? undefined
  const mlbDateParam =
    request.nextUrl.searchParams.get('mlbDate') ?? dateParam ?? undefined
  const requestedWeek = weekParam ? Number(weekParam) : undefined
  const normalizedWeek =
    typeof requestedWeek === 'number' && Number.isFinite(requestedWeek)
      ? requestedWeek
      : undefined

  let responseSource: ApiSource = 'fallback-cache'
  let payload: SportsEdgePayload = {
    ...sportsEdgeMockData,
    nfl: {
      ...sportsEdgeMockData.nfl,
      availableWeeks:
        sportsEdgeMockData.nfl.availableWeeks ?? [sportsEdgeMockData.nfl.week]
    },
    nba: {
      ...sportsEdgeMockData.nba,
      availableDates: sportsEdgeMockData.nba.availableDates ?? []
    },
    mlb: {
      ...sportsEdgeMockData.mlb,
      availableDates: sportsEdgeMockData.mlb.availableDates ?? []
    }
  }

  if (supabase) {
    try {
      // Always load available weeks/dates independently, regardless of whether loadEdges returns data
      // This fixes the bug where dropdown only shows options from the current window
      const [availableWeeks, availableNbaDates, availableMlbDates] = await Promise.all([
        loadAvailableWeeks(),
        loadAvailableDates('NBA'),
        loadAvailableDates('MLB')
      ])

      const resolvedNbaDate = resolveLeagueDate(nbaDateParam ?? undefined, availableNbaDates)
      const resolvedMlbDate = resolveLeagueDate(mlbDateParam ?? undefined, availableMlbDates)
      
      // Load NFL edges
      const nflEdges = await loadNflEdges({ week: normalizedWeek })
      if (nflEdges) {
        responseSource = 'supabase'
        payload = {
          ...payload,
          nfl: {
            season: nflEdges.season,
            week: nflEdges.week,
            label: nflEdges.label,
            updatedAt: new Date().toISOString(),
            games: nflEdges.games,
            availableWeeks:
              availableWeeks.length > 0
                ? availableWeeks
                : payload.nfl.availableWeeks
          }
        }
      } else {
        // Even if no edges returned, update availableWeeks if we found any
        if (availableWeeks.length > 0) {
          payload = {
            ...payload,
            nfl: {
              ...payload.nfl,
              availableWeeks
            }
          }
        }
        console.warn(
          'No NFL edges returned from Supabase window. Serving mock payload.'
        )
      }

      // Load NBA edges
      const nbaEdges = await loadNbaEdges({ date: resolvedNbaDate })
      if (nbaEdges) {
        responseSource = 'supabase'
        payload = {
          ...payload,
          nba: {
            season: nbaEdges.season,
            date: nbaEdges.date,
            label: nbaEdges.label,
            updatedAt: new Date().toISOString(),
            games: nbaEdges.games,
            availableDates:
              availableNbaDates.length > 0
                ? availableNbaDates
                : payload.nba.availableDates
          }
        }
      } else if (availableNbaDates.length > 0 || nbaDateParam) {
        responseSource = 'supabase'
        payload = {
          ...payload,
          nba: {
            ...payload.nba,
            date: resolvedNbaDate,
            label: formatDateLabel(resolvedNbaDate),
            games: [],
            availableDates: availableNbaDates
          }
        }
        console.warn(
          'No NBA edges returned for selected date. Serving empty board with available dates.'
        )
      } else {
        console.warn(
          'No NBA edges returned from Supabase window. Serving mock payload.'
        )
      }

      // Load MLB edges
      const mlbEdges = await loadMlbEdges({ date: resolvedMlbDate })
      if (mlbEdges) {
        responseSource = 'supabase'
        payload = {
          ...payload,
          mlb: {
            season: mlbEdges.season,
            date: mlbEdges.date,
            label: mlbEdges.label,
            updatedAt: new Date().toISOString(),
            games: mlbEdges.games,
            availableDates:
              availableMlbDates.length > 0
                ? availableMlbDates
                : payload.mlb.availableDates
          }
        }
      } else if (availableMlbDates.length > 0 || mlbDateParam) {
        responseSource = 'supabase'
        payload = {
          ...payload,
          mlb: {
            ...payload.mlb,
            date: resolvedMlbDate,
            label: formatDateLabel(resolvedMlbDate),
            games: [],
            availableDates: availableMlbDates
          }
        }
        console.warn(
          'No MLB edges returned for selected date. Serving empty board with available dates.'
        )
      } else {
        console.warn(
          'No MLB edges returned from Supabase window. Serving mock payload.'
        )
      }
    } catch (error) {
      console.warn(
        'Unexpected error while fetching Supabase edges. Serving mock data.',
        error
      )
    }
  } else {
    console.warn(
      'Supabase credentials missing. Serving mock sports edge payload.'
    )
  }

  const updatedAtCandidates = [
    payload.nfl.updatedAt,
    payload.nba.updatedAt,
    payload.mlb.updatedAt
  ]
    .map((ts) => Date.parse(ts))
    .filter((ms) => Number.isFinite(ms)) as number[]
  const newestUpdatedAt = updatedAtCandidates.length
    ? new Date(Math.max(...updatedAtCandidates)).toISOString()
    : new Date().toISOString()

  const response: ApiEnvelope<SportsEdgePayload> = {
    data: payload,
    meta: toApiMeta(newestUpdatedAt, responseSource, STALE_THRESHOLDS.sportsEdge)
  }

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=43200'
    }
  })
}
