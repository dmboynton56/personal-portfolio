import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { promises as fs, type Dirent } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { ApiEnvelope, STALE_THRESHOLDS, toApiMeta } from '@/lib/freshness'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null

const cronSecret = process.env.LLM_ADVISOR_CRON_SECRET

const SUPABASE_CACHE_TTL_MS = 60_000
const EMPTY_CACHE_TTL_MS = 15_000
const LOCAL_CACHE_TTL_MS = 120_000
const IS_PRODUCTION =
  process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'

type DashboardSource = 'supabase' | 'local-files' | 'empty' | 'degraded'

const EMPTY_TELEMETRY_MESSAGE =
  'No LLM Advisor telemetry is available yet. Data will appear after the next successful EOD aggregate.'

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
  orderId: string | null
  symbol: string
  side: string | null
  qty: number | null
  entryPrice: number | null
  stopLoss: number | null
  takeProfit: number | null
  entryTime: string | null
  exitTime: string | null
  exitPrice: number | null
  exitReason: string | null
  pnl: number | null
  status: string | null
  sourceFile: string | null
}

type NormalizedHeartbeat = {
  sourceDate: string
  heartbeatTs: string
  loopCount: number | null
  symbolsTracked: number | null
  backtest: boolean
  sourceFile: string | null
}

type Artifacts = {
  runs: NormalizedRun[]
  trades: NormalizedTrade[]
  heartbeats: NormalizedHeartbeat[]
  dataDir: string | null
}

type LlmAdvisorMetricsPayload = {
  source: DashboardSource
  generatedAt: string
  anchorDate: string | null
  heartbeat: {
    lastPriceUpdateTs: string | null
    ageSeconds: number | null
    loopCount: number | null
    symbolsTracked: number | null
    backtest: boolean | null
  }
  pnl: {
    change1d: number | null
    change7d: number | null
    change30d: number | null
    cumulative: number | null
  }
  trades: {
    recentCount7d: number
    successRate: number | null
    rrOverall: number | null
    averageWin: number | null
    averageLoss: number | null
    recent: Array<{
      tradeUid: string
      symbol: string
      side: string | null
      pnl: number | null
      exitReason: string | null
      timestamp: string | null
      outcome: 'win' | 'loss' | 'flat' | 'unknown'
    }>
  }
  coverage: {
    runCount: number
    tradeCount: number
    daysInSample: number
    dataDir: string | null
  }
}

type SupabaseFetchResult =
  | { status: 'ok'; artifacts: Artifacts }
  | { status: 'missing' }
  | { status: 'error'; errorId: string }

let localCache:
  | {
      expiresAt: number
      artifacts: Artifacts
    }
  | null = null

let responseCache:
  | {
      key: string
      expiresAt: number
      response: ApiEnvelope<LlmAdvisorMetricsPayload>
    }
  | null = null

const asString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length ? trimmed : null
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }
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

const isMissingTableError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false
  const maybeCode = (error as { code?: string }).code
  return maybeCode === '42P01' || maybeCode === 'PGRST205'
}

const resolveDailyNewsDir = () => {
  const configured = process.env.LLM_ADVISOR_DAILY_NEWS_DIR?.trim()
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.resolve(process.cwd(), configured)
  }
  return path.resolve(process.cwd(), '..', 'llm-advisor', 'data', 'daily_news')
}

const readFileTextIfExists = async (filePath: string) => {
  try {
    return await fs.readFile(filePath, 'utf8')
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: string }).code === 'ENOENT'
    ) {
      return null
    }
    throw error
  }
}

const toTradeOutcome = (
  pnl: number | null
): 'win' | 'loss' | 'flat' | 'unknown' => {
  if (pnl == null) return 'unknown'
  if (pnl > 0) return 'win'
  if (pnl < 0) return 'loss'
  return 'flat'
}

const parseBacktestFile = (
  fileText: string,
  runDate: string,
  filePath: string
): { run: NormalizedRun; trades: NormalizedTrade[] } | null => {
  let parsed: unknown = null
  try {
    parsed = JSON.parse(fileText)
  } catch {
    return null
  }

  if (!parsed || typeof parsed !== 'object') return null
  const payload = parsed as {
    total_trades?: unknown
    closed_trades?: unknown
    winning_trades?: unknown
    losing_trades?: unknown
    total_pnl?: unknown
    average_win?: unknown
    average_loss?: unknown
    final_equity?: unknown
    return_pct?: unknown
    daily_return_pct?: unknown
    win_rate?: unknown
    trades?: unknown
  }

  const run: NormalizedRun = {
    runDate,
    totalTrades: asInteger(payload.total_trades) ?? 0,
    closedTrades: asInteger(payload.closed_trades) ?? 0,
    winningTrades: asInteger(payload.winning_trades) ?? 0,
    losingTrades: asInteger(payload.losing_trades) ?? 0,
    totalPnl: asNumber(payload.total_pnl),
    averageWin: asNumber(payload.average_win),
    averageLoss: asNumber(payload.average_loss),
    finalEquity: asNumber(payload.final_equity),
    returnPct: asNumber(payload.return_pct),
    dailyReturnPct: asNumber(payload.daily_return_pct),
    winRate: asNumber(payload.win_rate),
    sourceFile: filePath
  }

  const tradesRaw = Array.isArray(payload.trades) ? payload.trades : []
  const trades = tradesRaw
    .map((item, index): NormalizedTrade | null => {
      if (!item || typeof item !== 'object') return null
      const trade = item as Record<string, unknown>
      const orderId = asString(trade.order_id)
      const symbol = asString(trade.symbol)
      if (!symbol) return null
      const tradeUid = `${runDate}:${orderId ?? `idx-${index + 1}`}`

      return {
        tradeUid,
        runDate,
        orderId,
        symbol,
        side: asString(trade.side),
        qty: asInteger(trade.qty),
        entryPrice: asNumber(trade.entry_price),
        stopLoss: asNumber(trade.stop_loss),
        takeProfit: asNumber(trade.take_profit),
        entryTime: parseTimestamp(trade.entry_time),
        exitTime: parseTimestamp(trade.exit_time),
        exitPrice: asNumber(trade.exit_price),
        exitReason: asString(trade.exit_reason),
        pnl: asNumber(trade.pnl),
        status: asString(trade.status),
        sourceFile: filePath
      }
    })
    .filter((trade): trade is NormalizedTrade => Boolean(trade))

  return { run, trades }
}

const parseLatestHeartbeat = (
  fileText: string,
  sourceDate: string,
  filePath: string
): NormalizedHeartbeat | null => {
  const lines = fileText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i]
    try {
      const parsed = JSON.parse(line) as {
        ts?: unknown
        loop_count?: unknown
        backtest?: unknown
        symbols?: unknown
      }
      const heartbeatTs = parseTimestamp(parsed.ts)
      if (!heartbeatTs) continue
      const symbolsTracked =
        parsed.symbols && typeof parsed.symbols === 'object'
          ? Object.keys(parsed.symbols as Record<string, unknown>).length
          : null
      return {
        sourceDate,
        heartbeatTs,
        loopCount: asInteger(parsed.loop_count),
        symbolsTracked,
        backtest: Boolean(parsed.backtest),
        sourceFile: filePath
      }
    } catch {
      continue
    }
  }

  return null
}

const loadLocalArtifacts = async (force = false): Promise<Artifacts> => {
  if (!force && localCache && localCache.expiresAt > Date.now()) {
    return localCache.artifacts
  }

  const dataDir = resolveDailyNewsDir()
  const artifacts: Artifacts = {
    runs: [],
    trades: [],
    heartbeats: [],
    dataDir
  }

  let entries: Dirent[] = []
  try {
    entries = await fs.readdir(dataDir, { withFileTypes: true })
  } catch {
    localCache = { expiresAt: Date.now() + LOCAL_CACHE_TTL_MS, artifacts }
    return artifacts
  }

  const runDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .map((name) => ({ name, runDate: parseRunDate(name) }))
    .filter(
      (entry): entry is { name: string; runDate: string } =>
        Boolean(entry.runDate)
    )
    .sort((a, b) => a.runDate.localeCompare(b.runDate))

  for (const runDir of runDirs) {
    const processedDir = path.join(dataDir, runDir.name, 'processed')
    const backtestPath = path.join(processedDir, 'backtest_results.json')
    const liveLogPath = path.join(processedDir, 'live_loop_log.jsonl')

    const backtestText = await readFileTextIfExists(backtestPath)
    if (backtestText) {
      const parsed = parseBacktestFile(backtestText, runDir.runDate, backtestPath)
      if (parsed) {
        artifacts.runs.push(parsed.run)
        artifacts.trades.push(...parsed.trades)
      }
    }

    const liveLogText = await readFileTextIfExists(liveLogPath)
    if (liveLogText) {
      const heartbeat = parseLatestHeartbeat(
        liveLogText,
        runDir.runDate,
        liveLogPath
      )
      if (heartbeat) {
        artifacts.heartbeats.push(heartbeat)
      }
    }
  }

  localCache = {
    expiresAt: Date.now() + LOCAL_CACHE_TTL_MS,
    artifacts
  }

  return artifacts
}

const hasArtifactContent = (artifacts: Artifacts): boolean =>
  artifacts.runs.length > 0 ||
  artifacts.trades.length > 0 ||
  artifacts.heartbeats.length > 0

const computeTelemetryUpdatedAt = (artifacts: Artifacts): string | null => {
  const candidates: number[] = []

  for (const heartbeat of artifacts.heartbeats) {
    const parsed = Date.parse(heartbeat.heartbeatTs)
    if (!Number.isNaN(parsed)) candidates.push(parsed)
  }

  for (const trade of artifacts.trades) {
    const parsed = Date.parse(trade.exitTime ?? trade.entryTime ?? '')
    if (!Number.isNaN(parsed)) candidates.push(parsed)
  }

  for (const run of artifacts.runs) {
    const parsed = Date.parse(`${run.runDate}T23:59:59.000Z`)
    if (!Number.isNaN(parsed)) candidates.push(parsed)
  }

  if (!candidates.length) return null
  return new Date(Math.max(...candidates)).toISOString()
}

const buildEnvelope = (
  source: DashboardSource,
  artifacts: Artifacts,
  options?: {
    degraded?: boolean
    message?: string
    errorId?: string
  }
): ApiEnvelope<LlmAdvisorMetricsPayload> => {
  const payload = buildPayload(source, artifacts)
  const telemetryUpdatedAt = computeTelemetryUpdatedAt(artifacts)
  return {
    data: payload,
    meta: toApiMeta(telemetryUpdatedAt, source, STALE_THRESHOLDS.llmAdvisor, options)
  }
}

const getCachedResponse = (key: string, force = false) => {
  if (force || !responseCache) return null
  if (responseCache.key !== key) return null
  if (responseCache.expiresAt <= Date.now()) return null
  return responseCache.response
}

const setCachedResponse = (
  key: string,
  source: DashboardSource,
  response: ApiEnvelope<LlmAdvisorMetricsPayload>
) => {
  const ttlMs =
    source === 'supabase'
      ? SUPABASE_CACHE_TTL_MS
      : source === 'empty'
        ? EMPTY_CACHE_TTL_MS
        : LOCAL_CACHE_TTL_MS
  responseCache = {
    key,
    expiresAt: Date.now() + ttlMs,
    response
  }
}

const fetchSupabaseArtifacts = async (): Promise<SupabaseFetchResult> => {
  if (!supabase) return { status: 'missing' }

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
      .select(
        'trade_uid,run_date,order_id,symbol,side,qty,entry_price,stop_loss,take_profit,entry_time,exit_time,exit_price,exit_reason,pnl,status,source_file'
      )
      .order('exit_time', { ascending: false })
      .limit(2500),
    supabase
      .from('llm_advisor_runtime_heartbeats')
      .select('source_date,heartbeat_ts,loop_count,symbols_tracked,backtest,source_file')
      .order('heartbeat_ts', { ascending: false })
      .limit(50)
  ])

  if (runsResult.error || tradesResult.error || heartbeatResult.error) {
    if (
      isMissingTableError(runsResult.error) ||
      isMissingTableError(tradesResult.error) ||
      isMissingTableError(heartbeatResult.error)
    ) {
      return { status: 'missing' }
    }
    const errorId = randomUUID().slice(0, 8)
    console.warn('LLM advisor Supabase metrics fetch error', {
      errorId,
      runsError: runsResult.error,
      tradesError: tradesResult.error,
      heartbeatError: heartbeatResult.error
    })
    return { status: 'error', errorId }
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
      const orderId = asString(row.order_id)
      return {
        tradeUid:
          asString(row.trade_uid) ?? `${runDate}:${orderId ?? `db-idx-${index}`}`,
        runDate,
        orderId,
        symbol: asString(row.symbol) ?? 'UNKNOWN',
        side: asString(row.side),
        qty: asInteger(row.qty),
        entryPrice: asNumber(row.entry_price),
        stopLoss: asNumber(row.stop_loss),
        takeProfit: asNumber(row.take_profit),
        entryTime: parseTimestamp(row.entry_time),
        exitTime: parseTimestamp(row.exit_time),
        exitPrice: asNumber(row.exit_price),
        exitReason: asString(row.exit_reason),
        pnl: asNumber(row.pnl),
        status: asString(row.status),
        sourceFile: asString(row.source_file)
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

  return {
    status: 'ok',
    artifacts: {
      runs,
      trades,
      heartbeats,
      dataDir: null
    }
  }
}

const buildPayload = (
  source: DashboardSource,
  artifacts: Artifacts
): LlmAdvisorMetricsPayload => {
  const nowMs = Date.now()
  const runs = [...artifacts.runs].sort((a, b) => b.runDate.localeCompare(a.runDate))
  const trades = [...artifacts.trades]
  const heartbeats = [...artifacts.heartbeats].sort((a, b) =>
    b.heartbeatTs.localeCompare(a.heartbeatTs)
  )

  const anchorDate = runs.length ? runs[0].runDate : null
  const anchorMs = anchorDate ? getRunDateMs(anchorDate) : null
  const dayMs = 86_400_000

  const sumPnlByDays = (days: number) => {
    if (!runs.length || anchorMs == null) return null
    const cutoff = anchorMs - (days - 1) * dayMs
    return runs.reduce((sum, run) => {
      const runMs = getRunDateMs(run.runDate)
      if (runMs == null || runMs < cutoff) return sum
      return sum + (run.totalPnl ?? 0)
    }, 0)
  }

  const cumulativePnl = runs.length
    ? runs.reduce((sum, run) => sum + (run.totalPnl ?? 0), 0)
    : null

  const latestHeartbeat = heartbeats[0] ?? null
  const heartbeatAgeSeconds = latestHeartbeat
    ? Math.max(
        0,
        Math.round((nowMs - new Date(latestHeartbeat.heartbeatTs).getTime()) / 1000)
      )
    : null

  const closedTrades = trades.filter((trade) => trade.pnl != null)
  const winningTrades = closedTrades.filter((trade) => (trade.pnl ?? 0) > 0)
  const losingTrades = closedTrades.filter((trade) => (trade.pnl ?? 0) < 0)

  const successRate = closedTrades.length
    ? winningTrades.length / closedTrades.length
    : null
  const averageWin = winningTrades.length
    ? winningTrades.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0) /
      winningTrades.length
    : null
  const averageLoss = losingTrades.length
    ? losingTrades.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0) /
      losingTrades.length
    : null
  const rrOverall =
    averageWin != null && averageLoss != null && averageLoss !== 0
      ? averageWin / Math.abs(averageLoss)
      : null

  const recentCutoffMs =
    anchorMs == null ? null : anchorMs - (7 - 1) * dayMs

  const getTradeTimeMs = (trade: NormalizedTrade): number | null => {
    const ts = trade.exitTime ?? trade.entryTime
    if (!ts) return null
    const parsed = new Date(ts)
    return Number.isNaN(parsed.getTime()) ? null : parsed.getTime()
  }

  const recentCount7d = trades.reduce((count, trade) => {
    if (recentCutoffMs == null) return count
    const tradeMs = getTradeTimeMs(trade)
    if (tradeMs == null) return count
    return tradeMs >= recentCutoffMs ? count + 1 : count
  }, 0)

  const recentTrades = [...trades]
    .sort((a, b) => {
      const aMs = getTradeTimeMs(a) ?? 0
      const bMs = getTradeTimeMs(b) ?? 0
      return bMs - aMs
    })
    .slice(0, 8)
    .map((trade) => ({
      tradeUid: trade.tradeUid,
      symbol: trade.symbol,
      side: trade.side,
      pnl: trade.pnl,
      exitReason: trade.exitReason,
      timestamp: trade.exitTime ?? trade.entryTime,
      outcome: toTradeOutcome(trade.pnl)
    }))

  return {
    source,
    generatedAt: new Date().toISOString(),
    anchorDate,
    heartbeat: {
      lastPriceUpdateTs: latestHeartbeat?.heartbeatTs ?? null,
      ageSeconds: heartbeatAgeSeconds,
      loopCount: latestHeartbeat?.loopCount ?? null,
      symbolsTracked: latestHeartbeat?.symbolsTracked ?? null,
      backtest: latestHeartbeat ? latestHeartbeat.backtest : null
    },
    pnl: {
      change1d: sumPnlByDays(1),
      change7d: sumPnlByDays(7),
      change30d: sumPnlByDays(30),
      cumulative: cumulativePnl
    },
    trades: {
      recentCount7d,
      successRate,
      rrOverall,
      averageWin,
      averageLoss,
      recent: recentTrades
    },
    coverage: {
      runCount: runs.length,
      tradeCount: trades.length,
      daysInSample: runs.length,
      dataDir: artifacts.dataDir
    }
  }
}

const chunk = <T,>(items: T[], size: number): T[][] => {
  if (size <= 0) return [items]
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

export async function GET(req: NextRequest) {
  try {
    const sourceParam = req.nextUrl.searchParams.get('source')
    const forceRefresh = req.nextUrl.searchParams.get('force') === 'true'
    const forceLocal = sourceParam === 'local'
    const forceSupabase = sourceParam === 'supabase'
    const canUseLocalFallback = !IS_PRODUCTION
    const cacheKey = `${sourceParam ?? 'default'}:${canUseLocalFallback}`
    const cached = getCachedResponse(cacheKey, forceRefresh)
    if (cached) {
      return NextResponse.json(cached)
    }

    if (forceLocal && canUseLocalFallback) {
      const local = await loadLocalArtifacts(false)
      const source: DashboardSource =
        hasArtifactContent(local)
          ? 'local-files'
          : 'empty'
      const response = buildEnvelope(source, local)
      setCachedResponse(cacheKey, source, response)
      return NextResponse.json(response)
    }

    if (!forceLocal) {
      const supabaseResult = await fetchSupabaseArtifacts()
      if (
        supabaseResult.status === 'ok' &&
        hasArtifactContent(supabaseResult.artifacts)
      ) {
        const response = buildEnvelope('supabase', supabaseResult.artifacts)
        setCachedResponse(cacheKey, 'supabase', response)
        return NextResponse.json(response)
      }

      if (supabaseResult.status === 'error') {
        const response = buildEnvelope(
          'degraded',
          {
            runs: [],
            trades: [],
            heartbeats: [],
            dataDir: null
          },
          {
            degraded: true,
            message:
              'Telemetry provider read failed. Retry soon or inspect server logs with this error ID.',
            errorId: supabaseResult.errorId
          }
        )
        setCachedResponse(cacheKey, 'degraded', response)
        return NextResponse.json(response, { status: 503 })
      }

      if (forceSupabase) {
        const response = buildEnvelope(
          'empty',
          {
            runs: [],
            trades: [],
            heartbeats: [],
            dataDir: null
          },
          { message: EMPTY_TELEMETRY_MESSAGE }
        )
        setCachedResponse(cacheKey, 'empty', response)
        return NextResponse.json(response)
      }
    }

    if (!canUseLocalFallback) {
      const response = buildEnvelope(
        'empty',
        {
          runs: [],
          trades: [],
          heartbeats: [],
          dataDir: null
        },
        { message: EMPTY_TELEMETRY_MESSAGE }
      )
      setCachedResponse(cacheKey, 'empty', response)
      return NextResponse.json(response)
    }

    const local = await loadLocalArtifacts(false)
    const localSource: DashboardSource =
      hasArtifactContent(local)
        ? 'local-files'
        : 'empty'
    const response = buildEnvelope(localSource, local)
    setCachedResponse(cacheKey, localSource, response)
    return NextResponse.json(response)
  } catch (error) {
    const errorId = randomUUID().slice(0, 8)
    console.error('LLM advisor metrics GET error', error)
    return NextResponse.json(
      buildEnvelope(
        'degraded',
        {
          runs: [],
          trades: [],
          heartbeats: [],
          dataDir: null
        },
        {
          degraded: true,
          message:
            'Telemetry response could not be built. Retry soon or inspect server logs with this error ID.',
          errorId
        }
      ),
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!cronSecret) {
      return NextResponse.json(
        { error: 'LLM_ADVISOR_CRON_SECRET is not configured.' },
        { status: 500 }
      )
    }

    const providedSecret = req.headers.get('x-cron-secret')
    if (providedSecret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured.' },
        { status: 500 }
      )
    }

    const local = await loadLocalArtifacts(true)
    const nowIso = new Date().toISOString()

    const runRows = local.runs.map((run) => ({
      run_date: run.runDate,
      total_trades: run.totalTrades,
      closed_trades: run.closedTrades,
      winning_trades: run.winningTrades,
      losing_trades: run.losingTrades,
      total_pnl: run.totalPnl,
      average_win: run.averageWin,
      average_loss: run.averageLoss,
      final_equity: run.finalEquity,
      return_pct: run.returnPct,
      daily_return_pct: run.dailyReturnPct,
      win_rate: run.winRate,
      source_file: run.sourceFile,
      updated_at: nowIso
    }))

    const tradeRows = local.trades.map((trade) => ({
      trade_uid: trade.tradeUid,
      run_date: trade.runDate,
      order_id: trade.orderId,
      symbol: trade.symbol,
      side: trade.side,
      qty: trade.qty,
      entry_price: trade.entryPrice,
      stop_loss: trade.stopLoss,
      take_profit: trade.takeProfit,
      entry_time: trade.entryTime,
      exit_time: trade.exitTime,
      exit_price: trade.exitPrice,
      exit_reason: trade.exitReason,
      pnl: trade.pnl,
      status: trade.status,
      source_file: trade.sourceFile,
      updated_at: nowIso
    }))

    const heartbeatRows = local.heartbeats.map((heartbeat) => ({
      source_date: heartbeat.sourceDate,
      heartbeat_ts: heartbeat.heartbeatTs,
      loop_count: heartbeat.loopCount,
      symbols_tracked: heartbeat.symbolsTracked,
      backtest: heartbeat.backtest,
      source_file: heartbeat.sourceFile,
      updated_at: nowIso
    }))

    for (const runChunk of chunk(runRows, 300)) {
      if (!runChunk.length) continue
      const { error } = await supabase
        .from('llm_advisor_backtest_runs')
        .upsert(runChunk, { onConflict: 'run_date' })
      if (error) {
        throw new Error(`Failed to upsert run rows: ${error.message}`)
      }
    }

    for (const tradeChunk of chunk(tradeRows, 500)) {
      if (!tradeChunk.length) continue
      const { error } = await supabase
        .from('llm_advisor_backtest_trades')
        .upsert(tradeChunk, { onConflict: 'trade_uid' })
      if (error) {
        throw new Error(`Failed to upsert trade rows: ${error.message}`)
      }
    }

    for (const heartbeatChunk of chunk(heartbeatRows, 300)) {
      if (!heartbeatChunk.length) continue
      const { error } = await supabase
        .from('llm_advisor_runtime_heartbeats')
        .upsert(heartbeatChunk, { onConflict: 'source_date,heartbeat_ts' })
      if (error) {
        throw new Error(`Failed to upsert heartbeat rows: ${error.message}`)
      }
    }

    return NextResponse.json({
      ok: true,
      ingested: {
        runs: runRows.length,
        trades: tradeRows.length,
        heartbeats: heartbeatRows.length
      },
      dataDir: local.dataDir,
      timestamp: nowIso
    })
  } catch (error) {
    console.error('LLM advisor metrics POST error', error)
    return NextResponse.json(
      { error: 'Failed to ingest LLM advisor metrics.' },
      { status: 500 }
    )
  }
}
