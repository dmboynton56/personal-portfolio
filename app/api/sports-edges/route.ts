import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  sportsEdgeMockData,
  SportsEdgePayload,
  NflGameEdge,
  NbaGameEdge
} from '@/lib/sportsEdgeData'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null

const cronSecret = process.env.SPORTS_EDGE_CRON_SECRET

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

const parseIsoDate = (value?: string | null) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
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
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start)
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
    bookSpread: game.book_spread ?? 0,
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
      'id, league, season, week, game_time_utc, home_team, away_team, book_spread, home_score, away_score'
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

  // Get game IDs that have predictions
  const gameIds = games.map((g) => g.id)
  const { data: predictions } = await supabase
    .from('model_predictions')
    .select('game_id')
    .in('game_id', gameIds)
    .limit(10000) // Reasonable limit

  if (!predictions?.length) {
    return []
  }

  // Get unique weeks from games that have predictions
  const gamesWithPredictions = new Set(predictions.map((p) => p.game_id))
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
    bookSpread: game.book_spread ?? 0,
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

const loadNbaEdges = async (
  options: LoadOptions = {}
): Promise<LoadedNbaEdges | null> => {
  if (!supabase) return null

  const preferredModelName = process.env.SPORTS_EDGE_MODEL_NAME?.trim()
  const dateFilter = options.date
  const defaultWindow = getDateWindow()

  let gamesQuery = supabase
    .from('games')
    .select(
      'id, league, season, week, game_time_utc, home_team, away_team, book_spread, home_score, away_score'
    )
    .eq('league', 'NBA')

  if (dateFilter) {
    // Filter by date: get all games on this date (UTC)
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

  const { data: games, error: gamesError } = await gamesQuery.order(
    'game_time_utc',
    { ascending: true }
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
  
  // Determine the date label
  let date: string
  let label: string
  if (dateFilter) {
    date = dateFilter
    const dateObj = new Date(dateFilter)
    label = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } else {
    // Use the first game's date
    const firstGameDate = parseIsoDate(games[0]?.game_time_utc)
    if (firstGameDate) {
      date = firstGameDate.toISOString().split('T')[0]
      label = firstGameDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } else {
      date = new Date().toISOString().split('T')[0]
      label = 'Today'
    }
  }

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

const loadAvailableDates = async (season?: number) => {
  if (!supabase) return []

  // Query dates from NBA games that have predictions
  let query = supabase
    .from('games')
    .select('game_time_utc, id')
    .eq('league', 'NBA')

  if (typeof season === 'number' && Number.isFinite(season)) {
    query = query.eq('season', season)
  }

  const { data: games, error: gamesError } = await query.order('game_time_utc', {
    ascending: false
  })

  if (gamesError) {
    console.warn('Supabase error when gathering available NBA dates.', gamesError)
    return []
  }

  if (!games?.length) {
    return []
  }

  // Get game IDs that have predictions
  const gameIds = games.map((g) => g.id)
  const { data: predictions } = await supabase
    .from('model_predictions')
    .select('game_id')
    .in('game_id', gameIds)
    .limit(10000)

  if (!predictions?.length) {
    return []
  }

  // Get unique dates (YYYY-MM-DD) from games that have predictions
  const gamesWithPredictions = new Set(predictions.map((p) => p.game_id))
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
  const requestedWeek = weekParam ? Number(weekParam) : undefined
  const normalizedWeek =
    typeof requestedWeek === 'number' && Number.isFinite(requestedWeek)
      ? requestedWeek
      : undefined
  const normalizedDate = dateParam || undefined

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
    }
  }

  if (supabase) {
    try {
      // Always load available weeks/dates independently, regardless of whether loadEdges returns data
      // This fixes the bug where dropdown only shows options from the current window
      const [availableWeeks, availableDates] = await Promise.all([
        loadAvailableWeeks(),
        loadAvailableDates()
      ])
      
      // Load NFL edges
      const nflEdges = await loadNflEdges({ week: normalizedWeek })
      if (nflEdges) {
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
      const nbaEdges = await loadNbaEdges({ date: normalizedDate })
      if (nbaEdges) {
        payload = {
          ...payload,
          nba: {
            season: nbaEdges.season,
            date: nbaEdges.date,
            label: nbaEdges.label,
            updatedAt: new Date().toISOString(),
            games: nbaEdges.games,
            availableDates:
              availableDates.length > 0
                ? availableDates
                : payload.nba.availableDates
          }
        }
      } else {
        // Even if no edges returned, update availableDates if we found any
        if (availableDates.length > 0) {
          payload = {
            ...payload,
            nba: {
              ...payload.nba,
              availableDates
            }
          }
        }
        console.warn(
          'No NBA edges returned from Supabase window. Serving mock payload.'
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

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=43200'
    }
  })
}

export async function POST(req: NextRequest) {
  try {
    if (!cronSecret) {
      console.error('SPORTS_EDGE_CRON_SECRET is not configured')
      return NextResponse.json(
        { error: 'Cron secret is not configured' },
        { status: 500 }
      )
    }

    const providedSecret = req.headers.get('x-cron-secret')
    if (providedSecret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now the cron POST simply warms the Supabase view and returns counts.
    if (!supabase) {
      return NextResponse.json({
        ok: true,
        note: 'Supabase not configured; cron ping acknowledged.',
        timestamp: new Date().toISOString()
      })
    }

    const nflEdges = await loadNflEdges()
    return NextResponse.json({
      ok: true,
      rowCount: nflEdges?.games.length ?? 0,
      window: nflEdges
        ? {
            start: nflEdges.window.start.toISOString(),
            end: nflEdges.window.end.toISOString()
          }
        : null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cron API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
