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

type SupabaseEdgeRow = {
  game_id: string
  league: string
  season: number
  week?: number | null
  game_time_utc: string
  home_team: string
  away_team: string
  book_spread: number | null
  my_spread: number | null
  edge_pts: number | null
  my_home_win_prob: number | null
  model_version: string | null
  prediction_ts: string | null
}

const mapRowToNflGame = (row: SupabaseEdgeRow): NflGameEdge => ({
  gameId: row.game_id,
  homeTeam: row.home_team,
  awayTeam: row.away_team,
  kickoffUtc: row.game_time_utc,
  bookSpread: row.book_spread ?? 0,
  modelSpread:
    row.my_spread ??
    (row.book_spread != null ? row.book_spread : 0),
  homeWinProb: row.my_home_win_prob ?? 0.5,
  modelVersion: row.model_version ?? 'nfl-model',
  predictionUpdated: row.prediction_ts ?? row.game_time_utc,
  note: 'Auto snapshot from Supabase view.'
})

export async function GET() {
  let payload: SportsEdgePayload = sportsEdgeMockData

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('games_today_enriched')
        .select('*')
        .order('game_time_utc', { ascending: true })

      if (error) {
        console.warn(
          "Supabase error when loading games_today_enriched. Falling back to mock data.",
          error
        )
      } else if (data?.length) {
        const nflRows = data.filter((row) => row.league === 'NFL')
        if (nflRows.length > 0) {
          payload = {
            ...payload,
            nfl: {
              season: nflRows[0].season ?? payload.nfl.season,
              week: nflRows[0]?.week ?? payload.nfl.week,
              label:
                nflRows[0]?.week != null
                  ? `Week ${nflRows[0].week}`
                  : 'Live board',
              updatedAt: new Date().toISOString(),
              games: nflRows.map(mapRowToNflGame)
            }
          }
        }
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

    const { data, error } = await supabase
      .from('games_today_enriched')
      .select('*')
      .order('game_time_utc', { ascending: true })

    if (error) {
      console.error('Supabase cron error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      rowCount: data?.length ?? 0,
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
