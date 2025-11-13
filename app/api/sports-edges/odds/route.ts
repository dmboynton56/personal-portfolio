import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getTeamCodeFromAlias } from '@/lib/nflTeams'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null

const cronSecret = process.env.SPORTS_EDGE_CRON_SECRET
const oddsApiKey = process.env.THE_ODDS_API_KEY
const oddsBaseUrl =
  process.env.THE_ODDS_API_BASE_URL ??
  'https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/'
const oddsRegions = process.env.THE_ODDS_API_REGIONS ?? 'us'
const oddsMarkets = process.env.THE_ODDS_API_MARKETS ?? 'spreads'
const oddsBookmakers = process.env.THE_ODDS_API_BOOKMAKERS ?? 'draftkings,betmgm'

const DEFAULT_LOOKBACK_DAYS = Number(
  process.env.SPORTS_EDGE_LOOKBACK_DAYS ?? 1
)
const DEFAULT_HORIZON_DAYS = Number(
  process.env.SPORTS_EDGE_LOOKAHEAD_DAYS ?? 9
)

type OddsOutcome = {
  name: string
  price?: number
  point?: number | null
}

type OddsMarket = {
  key: string
  last_update?: string
  outcomes: OddsOutcome[]
}

type OddsBookmaker = {
  key: string
  title?: string
  last_update?: string
  markets: OddsMarket[]
}

type OddsEvent = {
  id: string
  commence_time: string
  home_team: string
  away_team: string
  bookmakers: OddsBookmaker[]
}

const parseIsoDate = (value?: string | null) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const getWeekWindow = () => {
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

const preferredBookmakers = oddsBookmakers
  .split(',')
  .map((bk) => bk.trim().toLowerCase())
  .filter(Boolean)

const chooseBookmaker = (bookmakers: OddsBookmaker[]) => {
  if (!bookmakers?.length) return null
  for (const key of preferredBookmakers) {
    const match = bookmakers.find((bk) => bk.key?.toLowerCase() === key)
    if (match) return match
  }
  return bookmakers[0]
}

const findSpreadForGame = (
  bookmakers: OddsBookmaker[],
  homeCode: string,
  awayCode: string
) => {
  const bookmaker = chooseBookmaker(bookmakers)
  if (!bookmaker) return null

  const market = bookmaker.markets?.find((m) => m.key === 'spreads')
  if (!market) return null

  const homeOutcome = market.outcomes?.find(
    (outcome) => getTeamCodeFromAlias(outcome.name) === homeCode
  )
  const awayOutcome = market.outcomes?.find(
    (outcome) => getTeamCodeFromAlias(outcome.name) === awayCode
  )

  if (typeof homeOutcome?.point === 'number') {
    return {
      bookSpread: homeOutcome.point,
      bookmaker: bookmaker.key,
      lastUpdate: market.last_update
    }
  }

  if (typeof awayOutcome?.point === 'number') {
    return {
      bookSpread: -(awayOutcome.point ?? 0),
      bookmaker: bookmaker.key,
      lastUpdate: market.last_update
    }
  }

  return null
}

const fetchOddsData = async () => {
  if (!oddsApiKey) {
    throw new Error('THE_ODDS_API_KEY is not configured')
  }

  const url = new URL(oddsBaseUrl)
  url.searchParams.set('apiKey', oddsApiKey)
  url.searchParams.set('regions', oddsRegions)
  url.searchParams.set('markets', oddsMarkets)
  url.searchParams.set('oddsFormat', 'american')
  url.searchParams.set('dateFormat', 'iso')
  if (preferredBookmakers.length) {
    url.searchParams.set('bookmakers', preferredBookmakers.join(','))
  }

  const response = await fetch(url.toString(), {
    cache: 'no-store'
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Odds API error (${response.status}): ${errorBody}`)
  }

  return (await response.json()) as OddsEvent[]
}

const buildGameKey = (away: string, home: string) =>
  `${away.toUpperCase()}_${home.toUpperCase()}`

const syncBookSpreads = async () => {
  if (!supabase) {
    throw new Error('Supabase client is not configured')
  }

  const window = getWeekWindow()
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('id, home_team, away_team, game_time_utc')
    .eq('league', 'NFL')
    .gte('game_time_utc', window.start.toISOString())
    .lt('game_time_utc', window.end.toISOString())

  if (gamesError) {
    throw gamesError
  }

  if (!games?.length) {
    return { updated: 0, matched: 0, window }
  }

  const gameIndex = new Map<string, { id: string; home_team: string; away_team: string }>()
  for (const game of games) {
    if (!game.home_team || !game.away_team) continue
    gameIndex.set(buildGameKey(game.away_team, game.home_team), game)
  }

  const oddsEvents = await fetchOddsData()
  const updates: { id: string; book_spread: number }[] = []
  let matched = 0

  for (const event of oddsEvents) {
    const homeCode = getTeamCodeFromAlias(event.home_team)
    const awayCode = getTeamCodeFromAlias(event.away_team)
    if (!homeCode || !awayCode) {
      continue
    }

    const key = buildGameKey(awayCode, homeCode)
    const game = gameIndex.get(key)
    if (!game) {
      continue
    }

    const spread = findSpreadForGame(event.bookmakers, homeCode, awayCode)
    if (!spread) {
      continue
    }

    matched += 1
    updates.push({ id: game.id, book_spread: spread.bookSpread })
  }

  if (!updates.length) {
    return { updated: 0, matched, window }
  }

  const { error: updateError } = await supabase
    .from('games')
    .upsert(updates, { onConflict: 'id' })

  if (updateError) {
    throw updateError
  }

  return { updated: updates.length, matched, window }
}

export async function POST(req: NextRequest) {
  try {
    if (!cronSecret) {
      return NextResponse.json(
        { error: 'SPORTS_EDGE_CRON_SECRET is not configured' },
        { status: 500 }
      )
    }

    if (!oddsApiKey) {
      return NextResponse.json(
        { error: 'THE_ODDS_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const providedSecret = req.headers.get('x-cron-secret')
    if (providedSecret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await syncBookSpreads()

    return NextResponse.json({
      ok: true,
      updatedRows: result.updated,
      matchedGames: result.matched,
      window: {
        start: result.window.start.toISOString(),
        end: result.window.end.toISOString()
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Odds sync error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to sync book spreads'
      },
      { status: 500 }
    )
  }
}
