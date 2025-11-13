import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  sportsEdgeMockData,
  SportsEdgePayload,
  NflGameEdge
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
}

type SupabasePredictionRow = {
  game_id: string
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

const mapGameToNflEdge = (
  game: SupabaseGameRow,
  prediction: SupabasePredictionRow
): NflGameEdge => ({
  gameId: game.id,
  homeTeam: game.home_team,
  awayTeam: game.away_team,
  kickoffUtc: game.game_time_utc,
  bookSpread: game.book_spread ?? 0,
  modelSpread:
    prediction.my_spread ??
    (game.book_spread != null ? game.book_spread : 0),
  homeWinProb: prediction.my_home_win_prob ?? 0.5,
  modelVersion: prediction.model_version ?? 'sports-edge-weekly',
  predictionUpdated: prediction.asof_ts ?? game.game_time_utc,
  note: 'Sports Edge weekly snapshot from Supabase.'
})

const loadNflEdges = async (): Promise<LoadedEdges | null> => {
  if (!supabase) return null

  const window = getWeekWindow()
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select(
      'id, league, season, week, game_time_utc, home_team, away_team, book_spread'
    )
    .eq('league', 'NFL')
    .gte('game_time_utc', window.start.toISOString())
    .lt('game_time_utc', window.end.toISOString())
    .order('game_time_utc', { ascending: true })

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
    .select('game_id, my_spread, my_home_win_prob, model_version, asof_ts')
    .in('game_id', gameIds)

  if (process.env.SPORTS_EDGE_MODEL_NAME) {
    predictionsQuery = predictionsQuery.eq(
      'model_name',
      process.env.SPORTS_EDGE_MODEL_NAME
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

  const latestPredictions = new Map<string, SupabasePredictionRow>()
  for (const prediction of predictions) {
    if (!latestPredictions.has(prediction.game_id)) {
      latestPredictions.set(prediction.game_id, prediction)
    }
  }

  const mappedGames = games
    .map((game) => {
      const prediction = latestPredictions.get(game.id)
      return prediction ? mapGameToNflEdge(game, prediction) : null
    })
    .filter((value): value is NflGameEdge => Boolean(value))

  if (!mappedGames.length) {
    return null
  }

  const season = determineSeason(games)
  const week = determineWeek(games)
  const label = formatWeekLabel(week, window)

  return {
    games: mappedGames,
    season,
    week,
    label,
    window
  }
}

export async function GET() {
  let payload: SportsEdgePayload = sportsEdgeMockData

  if (supabase) {
    try {
      const nflEdges = await loadNflEdges()
      if (nflEdges) {
        payload = {
          ...payload,
          nfl: {
            season: nflEdges.season,
            week: nflEdges.week,
            label: nflEdges.label,
            updatedAt: new Date().toISOString(),
            games: nflEdges.games
          }
        }
      } else {
        console.warn(
          'No NFL edges returned from Supabase window. Serving mock payload.'
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
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
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
