import { NextRequest, NextResponse } from 'next/server'
import { isMissingTableError, supabase } from '@/lib/supabase'
import { ApiEnvelope, STALE_THRESHOLDS, toApiMeta } from '@/lib/freshness'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

type AtsBucket = {
    league: League
    season: number
    week: number
    label: string
    wins: number
    losses: number
    pushes: number
    gradedGames: number
    atsPct: number | null
    roiPct: number | null
    updatedAt: string | null
}

type AtsPayload = {
    league: League
    season: number
    summary: Omit<AtsBucket, 'week' | 'label'>
    weekly: AtsBucket[]
}

const VALID_LEAGUES = new Set<League>(['NBA', 'NFL'])
const WIN_PROFIT_AT_MINUS_110 = 100 / 110

const inferCurrentSeason = (league: League) => {
    const now = new Date()
    const year = now.getUTCFullYear()
    const month = now.getUTCMonth() + 1

    if (league === 'NBA' || league === 'NFL') {
        return month < 8 ? year - 1 : year
    }

    return year
}

const parseLeague = (value: string | null): League => {
    const normalized = value?.toUpperCase()
    return VALID_LEAGUES.has(normalized as League) ? (normalized as League) : 'NBA'
}

const parseSeason = (value: string | null, league: League) => {
    const parsed = Number(value)
    return Number.isInteger(parsed) ? parsed : inferCurrentSeason(league)
}

const toNumber = (value: number | string | null | undefined) => {
    if (value == null) return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

const emptyPayload = (league: League, season: number): AtsPayload => ({
    league,
    season,
    summary: {
        league,
        season,
        wins: 0,
        losses: 0,
        pushes: 0,
        gradedGames: 0,
        atsPct: null,
        roiPct: null,
        updatedAt: null
    },
    weekly: []
})

const buildBucket = (
    league: League,
    season: number,
    week: number,
    rows: Array<{
        hit: boolean | null
        predictionUpdatedAt: string | null
        gameTimeUtc: string
    }>
): AtsBucket => {
    const wins = rows.filter((row) => row.hit === true).length
    const losses = rows.filter((row) => row.hit === false).length
    const pushes = rows.filter((row) => row.hit === null).length
    const riskedGames = wins + losses
    const gradedGames = riskedGames + pushes
    const netUnits = wins * WIN_PROFIT_AT_MINUS_110 - losses
    const updatedAt =
        rows
            .map((row) => row.predictionUpdatedAt ?? row.gameTimeUtc)
            .filter(Boolean)
            .sort()
            .at(-1) ?? null

    return {
        league,
        season,
        week,
        label: `Week ${week}`,
        wins,
        losses,
        pushes,
        gradedGames,
        atsPct: riskedGames > 0 ? wins / riskedGames : null,
        roiPct: riskedGames > 0 ? netUnits / riskedGames : null,
        updatedAt
    }
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

const weekForGame = (game: GameRow, fallbackIndex: number) => {
    if (typeof game.week === 'number' && Number.isFinite(game.week)) {
        return game.week
    }

    return fallbackIndex
}

const buildPayload = (
    league: League,
    season: number,
    games: GameRow[],
    predictions: PredictionRow[]
): AtsPayload => {
    const latestPredictionByGame = new Map<string, PredictionRow>()

    for (const prediction of predictions) {
        if (!latestPredictionByGame.has(prediction.game_id)) {
            latestPredictionByGame.set(prediction.game_id, prediction)
        }
    }

    const gradedRows = games
        .map((game, index) => {
            const prediction = latestPredictionByGame.get(game.id)
            if (!prediction) return null

            return {
                week: weekForGame(game, index + 1),
                hit: calculateHit(game, prediction),
                predictionUpdatedAt: prediction.asof_ts,
                gameTimeUtc: game.game_time_utc
            }
        })
        .filter((row): row is NonNullable<typeof row> => Boolean(row))

    const rowsByWeek = new Map<number, typeof gradedRows>()
    for (const row of gradedRows) {
        rowsByWeek.set(row.week, [...(rowsByWeek.get(row.week) ?? []), row])
    }

    const weekly = Array.from(rowsByWeek.entries())
        .sort(([a], [b]) => a - b)
        .map(([week, rows]) => buildBucket(league, season, week, rows))

    const summary = buildBucket(league, season, 0, gradedRows)

    return {
        league,
        season,
        summary: {
            league,
            season,
            wins: summary.wins,
            losses: summary.losses,
            pushes: summary.pushes,
            gradedGames: summary.gradedGames,
            atsPct: summary.atsPct,
            roiPct: summary.roiPct,
            updatedAt:
                weekly
                    .map((bucket) => bucket.updatedAt)
                    .filter(Boolean)
                    .sort()
                    .at(-1) ?? null
        },
        weekly
    }
}

export async function GET(request: NextRequest) {
    const url = new URL(request.url)
    const league = parseLeague(url.searchParams.get('league'))
    const season = parseSeason(url.searchParams.get('season'), league)

    if (!supabase) {
        const payload = emptyPayload(league, season)
        const response: ApiEnvelope<AtsPayload> = {
            data: payload,
            meta: toApiMeta(null, 'empty', STALE_THRESHOLDS.sportsEdge, {
                message: 'Supabase is not configured for Sports Edge ATS metrics.'
            })
        }

        return NextResponse.json(response)
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

        if (gamesError) {
            throw gamesError
        }

        if (!games?.length) {
            const payload = emptyPayload(league, season)
            const response: ApiEnvelope<AtsPayload> = {
                data: payload,
                meta: toApiMeta(null, 'empty', STALE_THRESHOLDS.sportsEdge, {
                    message: `No graded ${league} games found for ${season}.`
                })
            }

            return NextResponse.json(response)
        }

        const gameIds = games.map((game) => game.id)
        const { data: predictions, error: predictionError } = await supabase
            .from('model_predictions')
            .select('game_id, my_spread, asof_ts')
            .in('game_id', gameIds)
            .order('asof_ts', { ascending: false })
            .limit(10000)

        if (predictionError) {
            throw predictionError
        }

        const payload = buildPayload(
            league,
            season,
            games as GameRow[],
            (predictions ?? []) as PredictionRow[]
        )
        const response: ApiEnvelope<AtsPayload> = {
            data: payload,
            meta: toApiMeta(
                payload.summary.updatedAt,
                payload.summary.gradedGames > 0 ? 'supabase' : 'empty',
                STALE_THRESHOLDS.sportsEdge,
                payload.summary.gradedGames > 0
                    ? undefined
                    : { message: `No ${league} games have both scores and predictions yet.` }
            )
        }

        return NextResponse.json(response)
    } catch (error) {
        const errorId = `sports-edge-ats-${Date.now().toString(36)}`
        console.error(`[${errorId}] Failed to load Sports Edge ATS metrics`, error)

        const payload = emptyPayload(league, season)
        const response: ApiEnvelope<AtsPayload> = {
            data: payload,
            meta: toApiMeta(null, 'degraded', STALE_THRESHOLDS.sportsEdge, {
                degraded: true,
                errorId,
                message: isMissingTableError(error)
                    ? 'Sports Edge serving tables are not available yet.'
                    : 'Sports Edge ATS metrics could not be loaded.'
            })
        }

        return NextResponse.json(response, { status: 503 })
    }
}
