import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getTeamCodeFromAlias } from '@/lib/nflTeams'

type League = 'NFL' | 'NBA'

type WindowRange = {
  start: Date
  end: Date
}

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

type SpreadCandidate = {
  bookmaker: string
  bookSpread: number
  price?: number
  lastUpdate: string | null
}

type UpdateCandidate = {
  id: string
  book_spread: number
  bookmaker: string
}

type SnapshotRow = {
  game_id: string
  book: string
  market: 'spread'
  line: number
  price?: number
  snapshot_ts: string
}

type GameRow = {
  id: string
  home_team: string
  away_team: string
}

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null

const cronSecret = process.env.SPORTS_EDGE_CRON_SECRET
const oddsApiKey = process.env.THE_ODDS_API_KEY
const oddsBaseUrlOverride = process.env.THE_ODDS_API_BASE_URL
const oddsRegions = process.env.THE_ODDS_API_REGIONS ?? 'us'
const oddsMarkets = process.env.THE_ODDS_API_MARKETS ?? 'spreads'
const oddsBookmakers = process.env.THE_ODDS_API_BOOKMAKERS ?? 'draftkings,betmgm,fanduel,caesars'
const fallbackBookmakersEnv =
  process.env.THE_ODDS_API_FALLBACK_BOOKMAKERS ?? 'espnbet,betonlineag,hardrockbet'
const maxOddsRetries = Number(process.env.THE_ODDS_API_RETRIES ?? 3)
const retryDelayMs = Number(process.env.THE_ODDS_API_RETRY_DELAY_MS ?? 700)

const DEFAULT_LOOKBACK_DAYS = Number(
  process.env.SPORTS_EDGE_LOOKBACK_DAYS ?? 1
)
const DEFAULT_HORIZON_DAYS = Number(
  process.env.SPORTS_EDGE_LOOKAHEAD_DAYS ?? 9
)

const ODDS_SPORT_KEYS: Record<League, string> = {
  NFL: 'americanfootball_nfl',
  NBA: 'basketball_nba'
}

const preferredBookmakers = oddsBookmakers
  .split(',')
  .map((bk) => bk.trim().toLowerCase())
  .filter(Boolean)

const fallbackBookmakers = fallbackBookmakersEnv
  .split(',')
  .map((bk) => bk.trim().toLowerCase())
  .filter(Boolean)

const NBA_ALIAS_TO_CODE: Record<string, string> = {
  atl: 'ATL',
  'atlanta hawks': 'ATL',
  bos: 'BOS',
  celtics: 'BOS',
  'boston celtics': 'BOS',
  bkn: 'BKN',
  nets: 'BKN',
  'brooklyn nets': 'BKN',
  cha: 'CHA',
  hornets: 'CHA',
  'charlotte hornets': 'CHA',
  chi: 'CHI',
  bulls: 'CHI',
  'chicago bulls': 'CHI',
  cle: 'CLE',
  cavaliers: 'CLE',
  cavs: 'CLE',
  'cleveland cavaliers': 'CLE',
  dal: 'DAL',
  mavericks: 'DAL',
  mavs: 'DAL',
  'dallas mavericks': 'DAL',
  den: 'DEN',
  nuggets: 'DEN',
  'denver nuggets': 'DEN',
  det: 'DET',
  pistons: 'DET',
  'detroit pistons': 'DET',
  gsw: 'GSW',
  warriors: 'GSW',
  'golden state warriors': 'GSW',
  hou: 'HOU',
  rockets: 'HOU',
  'houston rockets': 'HOU',
  ind: 'IND',
  pacers: 'IND',
  'indiana pacers': 'IND',
  lac: 'LAC',
  clippers: 'LAC',
  'la clippers': 'LAC',
  'los angeles clippers': 'LAC',
  lal: 'LAL',
  lakers: 'LAL',
  'la lakers': 'LAL',
  'los angeles lakers': 'LAL',
  mem: 'MEM',
  grizzlies: 'MEM',
  'memphis grizzlies': 'MEM',
  mia: 'MIA',
  heat: 'MIA',
  'miami heat': 'MIA',
  mil: 'MIL',
  bucks: 'MIL',
  'milwaukee bucks': 'MIL',
  min: 'MIN',
  timberwolves: 'MIN',
  wolves: 'MIN',
  'minnesota timberwolves': 'MIN',
  nop: 'NOP',
  pelicans: 'NOP',
  'new orleans pelicans': 'NOP',
  nyk: 'NYK',
  knicks: 'NYK',
  'new york knicks': 'NYK',
  okc: 'OKC',
  thunder: 'OKC',
  'oklahoma city thunder': 'OKC',
  orl: 'ORL',
  magic: 'ORL',
  'orlando magic': 'ORL',
  phi: 'PHI',
  sixers: 'PHI',
  '76ers': 'PHI',
  'philadelphia 76ers': 'PHI',
  phx: 'PHX',
  suns: 'PHX',
  'phoenix suns': 'PHX',
  por: 'POR',
  blazers: 'POR',
  'trail blazers': 'POR',
  'portland trail blazers': 'POR',
  sac: 'SAC',
  kings: 'SAC',
  'sacramento kings': 'SAC',
  sas: 'SAS',
  spurs: 'SAS',
  'san antonio spurs': 'SAS',
  tor: 'TOR',
  raptors: 'TOR',
  'toronto raptors': 'TOR',
  uta: 'UTA',
  jazz: 'UTA',
  'utah jazz': 'UTA',
  was: 'WAS',
  wizards: 'WAS',
  'washington wizards': 'WAS'
}

const normalizeAlias = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const parseIsoDate = (value?: string | null) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

const getWindowForLeague = (league: League): WindowRange => {
  const startVar =
    league === 'NFL' ? process.env.SPORTS_EDGE_WEEK_START : process.env.SPORTS_EDGE_DATE_START
  const endVar =
    league === 'NFL' ? process.env.SPORTS_EDGE_WEEK_END : process.env.SPORTS_EDGE_DATE_END

  const envStart = parseIsoDate(startVar)
  const envEnd = parseIsoDate(endVar)
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

const buildOddsApiUrl = (league: League) => {
  if (
    oddsBaseUrlOverride &&
    oddsBaseUrlOverride.includes('/v4/sports/') &&
    oddsBaseUrlOverride.includes('/odds')
  ) {
    return oddsBaseUrlOverride
  }

  const base = oddsBaseUrlOverride?.replace(/\/$/, '') ?? 'https://api.the-odds-api.com'
  return `${base}/v4/sports/${ODDS_SPORT_KEYS[league]}/odds/`
}

const bookmakerPriority = (bookmaker: string) => {
  const index = preferredBookmakers.indexOf(bookmaker.toLowerCase())
  return index >= 0 ? index : Number.MAX_SAFE_INTEGER
}

const resolveTeamCode = (league: League, teamName: string): string | null => {
  if (!teamName) return null
  if (league === 'NFL') {
    return getTeamCodeFromAlias(teamName)
  }

  const normalized = normalizeAlias(teamName)
  return NBA_ALIAS_TO_CODE[normalized] ?? NBA_ALIAS_TO_CODE[normalized.replace(/\s+/g, '')] ?? null
}

const extractSpreadCandidates = (
  league: League,
  bookmakers: OddsBookmaker[] | undefined,
  homeCode: string,
  awayCode: string
): SpreadCandidate[] => {
  if (!bookmakers?.length) return []

  const candidates: SpreadCandidate[] = []
  for (const bookmaker of bookmakers) {
    const market = bookmaker.markets?.find((m) => m.key === 'spreads')
    if (!market?.outcomes?.length) continue

    const homeOutcome = market.outcomes.find(
      (outcome) => resolveTeamCode(league, outcome.name) === homeCode
    )
    const awayOutcome = market.outcomes.find(
      (outcome) => resolveTeamCode(league, outcome.name) === awayCode
    )

    if (typeof homeOutcome?.point === 'number') {
      candidates.push({
        bookmaker: bookmaker.key,
        bookSpread: homeOutcome.point,
        price: homeOutcome.price,
        lastUpdate: market.last_update ?? bookmaker.last_update ?? null
      })
      continue
    }

    if (typeof awayOutcome?.point === 'number') {
      candidates.push({
        bookmaker: bookmaker.key,
        bookSpread: -awayOutcome.point,
        price: awayOutcome.price,
        lastUpdate: market.last_update ?? bookmaker.last_update ?? null
      })
    }
  }

  return candidates
}

const pickBestCandidate = (
  current: UpdateCandidate | undefined,
  next: SpreadCandidate,
  gameId: string
): UpdateCandidate => {
  const nextCandidate: UpdateCandidate = {
    id: gameId,
    book_spread: next.bookSpread,
    bookmaker: next.bookmaker
  }

  if (!current) return nextCandidate

  const currentPriority = bookmakerPriority(current.bookmaker)
  const nextPriority = bookmakerPriority(next.bookmaker)
  if (nextPriority < currentPriority) return nextCandidate

  return current
}

const fetchOddsData = async (
  league: League,
  bookmakers?: string[]
): Promise<OddsEvent[]> => {
  if (!oddsApiKey) {
    throw new Error('THE_ODDS_API_KEY is not configured')
  }

  const url = new URL(buildOddsApiUrl(league))
  url.searchParams.set('apiKey', oddsApiKey)
  url.searchParams.set('regions', oddsRegions)
  url.searchParams.set('markets', oddsMarkets)
  url.searchParams.set('oddsFormat', 'american')
  url.searchParams.set('dateFormat', 'iso')
  if (bookmakers?.length) {
    url.searchParams.set('bookmakers', bookmakers.join(','))
  }

  let lastError: string | null = null
  for (let attempt = 1; attempt <= Math.max(maxOddsRetries, 1); attempt += 1) {
    const response = await fetch(url.toString(), {
      cache: 'no-store'
    })

    if (response.ok) {
      return (await response.json()) as OddsEvent[]
    }

    const body = await response.text()
    lastError = `Odds API error (${response.status}): ${body}`
    const canRetry = response.status === 429 || response.status >= 500
    if (!canRetry || attempt === Math.max(maxOddsRetries, 1)) {
      throw new Error(lastError)
    }

    const delay = retryDelayMs * attempt
    await sleep(delay)
  }

  throw new Error(lastError ?? 'Unknown odds API error')
}

const buildGameKey = (away: string, home: string) =>
  `${away.toUpperCase()}_${home.toUpperCase()}`

const mergeOddsPass = (
  league: League,
  events: OddsEvent[],
  gameIndex: Map<string, GameRow>,
  updatesByGame: Map<string, UpdateCandidate>,
  snapshotsByKey: Map<string, SnapshotRow>,
  candidateGameIds?: Set<string>
) => {
  const matchedIds = new Set<string>()

  for (const event of events) {
    const homeCode = resolveTeamCode(league, event.home_team)
    const awayCode = resolveTeamCode(league, event.away_team)
    if (!homeCode || !awayCode) continue

    const game = gameIndex.get(buildGameKey(awayCode, homeCode))
    if (!game) continue
    if (candidateGameIds && !candidateGameIds.has(game.id)) continue

    const candidates = extractSpreadCandidates(league, event.bookmakers, homeCode, awayCode)
    if (!candidates.length) continue

    matchedIds.add(game.id)

    const current = updatesByGame.get(game.id)
    let best = current
    for (const candidate of candidates) {
      best = pickBestCandidate(best, candidate, game.id)

      const snapshotKey = `${game.id}:${candidate.bookmaker}:${candidate.bookSpread}`
      snapshotsByKey.set(snapshotKey, {
        game_id: game.id,
        book: candidate.bookmaker,
        market: 'spread',
        line: candidate.bookSpread,
        price: candidate.price,
        snapshot_ts: candidate.lastUpdate ?? new Date().toISOString()
      })
    }
    if (best) {
      updatesByGame.set(game.id, best)
    }
  }

  return matchedIds
}

const syncBookSpreadsForLeague = async (league: League) => {
  if (!supabase) {
    throw new Error('Supabase client is not configured')
  }

  const window = getWindowForLeague(league)
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('id, home_team, away_team, game_time_utc')
    .eq('league', league)
    .gte('game_time_utc', window.start.toISOString())
    .lt('game_time_utc', window.end.toISOString())

  if (gamesError) {
    throw gamesError
  }

  if (!games?.length) {
    return {
      league,
      updated: 0,
      matched: 0,
      totalGames: 0,
      snapshotsInserted: 0,
      window
    }
  }

  const gameIndex = new Map<string, GameRow>()
  for (const game of games) {
    if (!game.home_team || !game.away_team) continue
    gameIndex.set(buildGameKey(game.away_team, game.home_team), game)
  }

  const updatesByGame = new Map<string, UpdateCandidate>()
  const snapshotsByKey = new Map<string, SnapshotRow>()

  const preferredEvents = await fetchOddsData(
    league,
    preferredBookmakers.length ? preferredBookmakers : undefined
  )
  mergeOddsPass(league, preferredEvents, gameIndex, updatesByGame, snapshotsByKey)

  const unmatchedAfterPreferred = new Set(
    games
      .map((game) => game.id)
      .filter((id) => !updatesByGame.has(id))
  )

  if (unmatchedAfterPreferred.size > 0) {
    const fallbackEvents = await fetchOddsData(
      league,
      fallbackBookmakers.length ? fallbackBookmakers : undefined
    )
    mergeOddsPass(
      league,
      fallbackEvents,
      gameIndex,
      updatesByGame,
      snapshotsByKey,
      unmatchedAfterPreferred
    )
  }

  const unmatchedAfterFallback = new Set(
    games
      .map((game) => game.id)
      .filter((id) => !updatesByGame.has(id))
  )

  if (unmatchedAfterFallback.size > 0) {
    const allBookEvents = await fetchOddsData(league)
    mergeOddsPass(
      league,
      allBookEvents,
      gameIndex,
      updatesByGame,
      snapshotsByKey,
      unmatchedAfterFallback
    )
  }

  const updates = Array.from(updatesByGame.values()).map((entry) => ({
    id: entry.id,
    book_spread: entry.book_spread
  }))

  if (updates.length > 0) {
    const { error: updateError } = await supabase
      .from('games')
      .upsert(updates, { onConflict: 'id' })

    if (updateError) {
      throw updateError
    }
  }

  const snapshots = Array.from(snapshotsByKey.values())
  let snapshotsInserted = 0
  if (snapshots.length > 0) {
    const { error: snapshotError, data } = await supabase
      .from('odds_snapshots')
      .insert(snapshots)
      .select('id')

    if (snapshotError) {
      throw snapshotError
    }
    snapshotsInserted = data?.length ?? snapshots.length
  }

  return {
    league,
    updated: updates.length,
    matched: updates.length,
    totalGames: games.length,
    snapshotsInserted,
    window
  }
}

const parseLeagues = (value?: string | null): League[] => {
  if (!value) return ['NFL']
  const normalized = value.trim().toUpperCase()
  if (normalized === 'ALL') return ['NFL', 'NBA']
  if (normalized === 'NBA') return ['NBA']
  return ['NFL']
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

    let body: Record<string, unknown> = {}
    try {
      body = (await req.json()) as Record<string, unknown>
    } catch {
      body = {}
    }

    const leagueParam =
      req.nextUrl.searchParams.get('league') ??
      (typeof body.league === 'string' ? body.league : null)
    const leagues = parseLeagues(leagueParam)

    const results = []
    for (const league of leagues) {
      results.push(await syncBookSpreadsForLeague(league))
    }

    const totalUpdated = results.reduce((acc, r) => acc + r.updated, 0)
    const totalMatched = results.reduce((acc, r) => acc + r.matched, 0)
    const totalGames = results.reduce((acc, r) => acc + r.totalGames, 0)

    return NextResponse.json({
      ok: true,
      leagues,
      updatedRows: totalUpdated,
      matchedGames: totalMatched,
      totalGames,
      coveragePct:
        totalGames > 0 ? Number(((totalMatched / totalGames) * 100).toFixed(1)) : 0,
      results: results.map((result) => ({
        league: result.league,
        updatedRows: result.updated,
        matchedGames: result.matched,
        totalGames: result.totalGames,
        snapshotsInserted: result.snapshotsInserted,
        window: {
          start: result.window.start.toISOString(),
          end: result.window.end.toISOString()
        }
      })),
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
