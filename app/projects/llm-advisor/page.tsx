'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { ProjectLayout } from '@/components/ProjectLayout'
import { ProjectChat } from '@/components/chat/ProjectChat'
import Image from 'next/image'
import {
  Activity,
  BarChart,
  Bot,
  Brain,
  Clock3,
  Gauge,
  Shield,
  Terminal,
  TrendingUp
} from 'lucide-react'
import { ApiEnvelope, ApiMeta } from '@/lib/freshness'

type LlmAdvisorBacktestSnapshot = {
  schema: string
  generated_at: string
  repository?: string
  experiment: {
    title: string
    symbols: string[]
    session_dates_et: string[]
    premarket_context: boolean
    gemini_periodic_overlay: boolean
    commands: string[]
    caveats: string[]
  }
  rollup: {
    n_days: number
    first_date?: string
    last_date?: string
    total_pnl_sum: number
    avg_daily_pnl: number | null
    total_closed_trades: number
    avg_win_rate_daily: number | null
    days?: Array<{ date: string; total_pnl: number; closed_trades: number; win_rate: number | null }>
  }
  linkedin_snippets: string[]
}

type LlmAdvisorMetricsPayload = {
  source: 'supabase' | 'local-files' | 'empty' | 'degraded'
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
  execution: {
    eventCount: number
    signalCount: number
    validationRejectedCount: number
    validationErrorCount: number
    executionAttemptCount: number
    executionSucceededCount: number
    executionFailedCount: number
    recent: Array<{
      eventUid: string
      eventTs: string
      eventType: string
      symbol: string
      setupType: string | null
      side: string | null
      orderId: string | null
      reason: string | null
    }>
  }
  coverage: {
    runCount: number
    tradeCount: number
    orderEventCount: number
    daysInSample: number
    dataDir: string | null
  }
}

const formatCurrency = (value: number | null) => {
  if (value == null) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value)
}

const formatPercent = (value: number | null) => {
  if (value == null) return 'N/A'
  return `${(value * 100).toFixed(1)}%`
}

const formatRatio = (value: number | null) => {
  if (value == null) return 'N/A'
  return `${value.toFixed(2)}R`
}

const formatAge = (seconds: number | null) => {
  if (seconds == null) return 'N/A'
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`
  if (seconds < 86_400) return `${Math.round(seconds / 3600)}h ago`
  return `${Math.round(seconds / 86_400)}d ago`
}

const formatTimestamp = (value: string | null) => {
  if (!value) return 'N/A'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'N/A'
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const formatSource = (source: LlmAdvisorMetricsPayload['source']) => {
  if (source === 'supabase') return 'Supabase'
  if (source === 'local-files') return 'Local backtest files'
  if (source === 'degraded') return 'Telemetry degraded'
  return 'No telemetry'
}

const formatEventType = (value: string) =>
  value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const getAgentState = (metrics: LlmAdvisorMetricsPayload | null) => {
  if (!metrics || metrics.heartbeat.ageSeconds == null) return 'NO FEED'
  if (metrics.heartbeat.ageSeconds <= 180) return 'ACTIVE'
  if (metrics.heartbeat.ageSeconds <= 1800) return 'DELAYED'
  return 'STALE'
}

export default function LlmAdvisorPage() {
  const [metricsData, setMetricsData] = useState<LlmAdvisorMetricsPayload | null>(null)
  const [metricsMeta, setMetricsMeta] = useState<ApiMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<LlmAdvisorBacktestSnapshot | null>(null)
  const [snapshotError, setSnapshotError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const response = await fetch('/api/llm-advisor/metrics', {
          cache: 'no-store'
        })
        const rawPayload = (await response.json()) as
          | (ApiEnvelope<LlmAdvisorMetricsPayload> & { error?: string })
          | { error?: string }
        const envelope =
          rawPayload && typeof rawPayload === 'object' && 'data' in rawPayload
            ? (rawPayload as ApiEnvelope<LlmAdvisorMetricsPayload>)
            : null
        const payload = envelope?.data ?? null
        const meta = envelope?.meta ?? null
        const errorPayload = rawPayload as { error?: string }
        if (cancelled) return
        if (payload) {
          setMetricsData(payload)
          setMetricsMeta(meta)
        }
        if (!response.ok) {
          setLoadError(
            meta?.message ??
              errorPayload.error ??
              'Failed to load LLM Advisor metrics'
          )
          return
        }
        setLoadError(meta?.message ?? null)
      } catch (error) {
        if (cancelled) return
        const message =
          error instanceof Error ? error.message : 'Failed to load metrics.'
        setLoadError(message)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()
    const interval = window.setInterval(load, 60_000)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadSnap = async () => {
      try {
        const res = await fetch('/data/llm_advisor_backtest_snapshot.json', { cache: 'no-store' })
        if (!res.ok) {
          throw new Error(`Snapshot HTTP ${res.status}`)
        }
        const json = (await res.json()) as LlmAdvisorBacktestSnapshot
        if (!cancelled) {
          setSnapshot(json)
          setSnapshotError(null)
        }
      } catch (e) {
        if (!cancelled) {
          setSnapshot(null)
          setSnapshotError(e instanceof Error ? e.message : 'Failed to load snapshot')
        }
      }
    }
    loadSnap()
    return () => {
      cancelled = true
    }
  }, [])

  const topMetrics = useMemo(
    () =>
      [
        {
          label: 'Last Feed Update',
          value: formatAge(metricsData?.heartbeat.ageSeconds ?? null),
          iconName: 'clock'
        },
        {
          label: 'P/L (7d)',
          value: formatCurrency(metricsData?.pnl.change7d ?? null),
          iconName: 'trendingUp',
          trend: (metricsData?.pnl.change7d ?? 0) > 0 ? 'up' : (metricsData?.pnl.change7d ?? 0) < 0 ? 'down' : 'neutral'
        },
        {
          label: 'Success Rate',
          value: formatPercent(metricsData?.trades.successRate ?? null),
          iconName: 'gauge'
        },
        {
          label: 'Signals Seen',
          value: String(metricsData?.execution?.signalCount ?? 0),
          iconName: 'activity'
        }
      ] as const,
    [metricsData]
  )

  return (
    <ProjectLayout
      title="LLM Advisor"
      description="An autonomous trading system that combines STDEV mean-reversion signals with Gemini market-analysis overlays and strict execution risk controls."
      tags={['Python', 'Gemini API', 'Alpaca', 'Pandas', 'Backtesting']}
      repoUrl="https://github.com/dmboynton56/llm-advisor"
      metrics={topMetrics}
      metricsSource={metricsData?.source}
      metricsGeneratedAt={metricsMeta?.updatedAt ?? metricsData?.generatedAt}
      isLoadingMetrics={isLoading}
      metricsError={loadError}
      belowHero={
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Ask the Data</h2>
          <p className="text-lg text-muted-foreground">
            This assistant answers from LLM Advisor documentation and Supabase telemetry. Ask about run health,
            risk controls, signal flow, or how live metrics relate to the write-ups on this page.
          </p>
          <ProjectChat scope="llm-advisor" />
        </section>
      }
      heroImage={
        <div className="flex flex-col items-center justify-center h-full w-full text-zinc-500 bg-zinc-900/50">
          <Bot className="w-24 h-24 mb-4 text-emerald-500" />
          <div className="font-mono text-sm bg-black/50 px-3 py-1 rounded">
            <span className="text-emerald-500">USER:</span> Analyze SPY sentiment
          </div>
          <div className="font-mono text-sm bg-black/50 px-3 py-1 rounded mt-2">
            <span className="text-blue-500">AGENT:</span> Volatility high. Reducing position size.
          </div>
        </div>
      }
    >
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Agentic Workflow</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-500" />
              <h3 className="text-xl font-semibold">1. Sentiment Analysis</h3>
            </div>
            <p className="text-muted-foreground">
              Every 15 minutes (runtime default), the loop runs market analysis with <strong>Gemini 3 Flash</strong>.
              It returns threshold multipliers and confidence signals that adjust technical gates without bypassing hard risk limits.
            </p>
          </div>

          <div className="bg-card border border-border p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <Terminal className="w-6 h-6 text-emerald-500" />
              <h3 className="text-xl font-semibold">2. Statistical Execution</h3>
            </div>
            <p className="text-muted-foreground">
              The execution engine computes rolling mu/sigma/z-score states and evaluates MR/TC setups
              against configured thresholds before sending bracketed orders through Alpaca.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Live Monitoring Dashboard</h2>
        <p className="text-lg text-muted-foreground">
          This dashboard is fed by the telemetry API. Production serves Supabase telemetry only, while local file fallback is reserved for non-production debugging.
        </p>
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <div>
            Data source: <span className="text-foreground">{formatSource(metricsData?.source ?? 'empty')}</span>
          </div>
          <div>
            Telemetry as-of: <span className="text-foreground">{formatTimestamp(metricsMeta?.updatedAt ?? null)}</span>
          </div>
          <div>
            Last generated: <span className="text-foreground">{formatTimestamp(metricsData?.generatedAt ?? null)}</span>
          </div>
          <div>
            Anchor date: <span className="text-foreground">{metricsData?.anchorDate ?? 'N/A'}</span>
          </div>
          {metricsMeta?.sloBucket && (
            <div>
              Freshness bucket: <span className="text-foreground uppercase">{metricsMeta.sloBucket}</span>
            </div>
          )}
          {metricsMeta?.errorId && (
            <div>
              Error ID: <span className="text-foreground font-mono">{metricsMeta.errorId}</span>
            </div>
          )}
          {loadError && (
            <div className="text-red-400">Telemetry load warning: {loadError}</div>
          )}
          {isLoading && !metricsData && (
            <div>Loading telemetry...</div>
          )}
        </div>
        {metricsData?.source === 'empty' && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
            No telemetry is available yet. This panel will populate after the next successful end-of-day aggregate.
          </div>
        )}
        {metricsData?.source === 'degraded' && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            Telemetry provider is currently degraded. Data may be stale or incomplete until upstream reads recover.
          </div>
        )}
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              Coverage window: <span className="text-foreground">{metricsData?.coverage.daysInSample ?? 0} run day(s)</span>
            </div>
            <div>
              Trades indexed: <span className="text-foreground">{metricsData?.coverage.tradeCount ?? 0}</span>
            </div>
            <div>
              Order events indexed: <span className="text-foreground">{metricsData?.coverage.orderEventCount ?? 0}</span>
            </div>
            <div>
              Runtime loops seen: <span className="text-foreground">{metricsData?.heartbeat.loopCount ?? 'N/A'}</span>
            </div>
            <div>
              Feed mode: <span className="text-foreground">{metricsData?.heartbeat.backtest == null ? 'Unknown' : metricsData.heartbeat.backtest ? 'Backtest stream' : 'Live stream'}</span>
            </div>
          </div>
          {metricsData?.coverage.dataDir && (
            <div className="mt-2 text-xs">
              Local artifact path: <span className="text-foreground">{metricsData.coverage.dataDir}</span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock3 className="w-4 h-4" />
              <span className="text-sm">Last Price Update</span>
            </div>
            <p className="text-2xl font-bold">{formatAge(metricsData?.heartbeat.ageSeconds ?? null)}</p>
            <p className="text-xs text-muted-foreground">
              {formatTimestamp(metricsData?.heartbeat.lastPriceUpdateTs ?? null)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BarChart className="w-4 h-4" />
              <span className="text-sm">P/L Windows</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(metricsData?.pnl.change7d ?? null)} (7d)</p>
            <p className="text-xs text-muted-foreground">
              1d: {formatCurrency(metricsData?.pnl.change1d ?? null)} | 30d: {formatCurrency(metricsData?.pnl.change30d ?? null)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Activity className="w-4 h-4" />
              <span className="text-sm">Recent Trades</span>
            </div>
            <p className="text-2xl font-bold">{metricsData?.trades.recentCount7d ?? 0}</p>
            <p className="text-xs text-muted-foreground">Count in last 7 days of sample window.</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Gauge className="w-4 h-4" />
              <span className="text-sm">Success Rate</span>
            </div>
            <p className="text-2xl font-bold">{formatPercent(metricsData?.trades.successRate ?? null)}</p>
            <p className="text-xs text-muted-foreground">
              {metricsData?.coverage.tradeCount ?? 0} trades available.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Risk/Reward</span>
            </div>
            <p className="text-2xl font-bold">{formatRatio(metricsData?.trades.rrOverall ?? null)}</p>
            <p className="text-xs text-muted-foreground">
              Avg win: {formatCurrency(metricsData?.trades.averageWin ?? null)} | Avg loss: {formatCurrency(metricsData?.trades.averageLoss ?? null)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Bot className="w-4 h-4" />
              <span className="text-sm">Agent State</span>
            </div>
            <p className="text-2xl font-bold">{getAgentState(metricsData)}</p>
            <p className="text-xs text-muted-foreground">
              Loop: {metricsData?.heartbeat.loopCount ?? 'N/A'} | Symbols: {metricsData?.heartbeat.symbolsTracked ?? 'N/A'}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Brain className="w-4 h-4" />
              <span className="text-sm">Signal Flow</span>
            </div>
            <p className="text-2xl font-bold">{metricsData?.execution?.signalCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">
              Rejected: {metricsData?.execution?.validationRejectedCount ?? 0} | Parser errors: {metricsData?.execution?.validationErrorCount ?? 0}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Terminal className="w-4 h-4" />
              <span className="text-sm">Order Attempts</span>
            </div>
            <p className="text-2xl font-bold">{metricsData?.execution?.executionAttemptCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">
              Filled: {metricsData?.execution?.executionSucceededCount ?? 0} | Failed: {metricsData?.execution?.executionFailedCount ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-3">Recent Trades</h3>
          {metricsData?.trades.recent.length ? (
            <div className="space-y-2">
              {metricsData.trades.recent.map((trade) => (
                <div
                  key={trade.tradeUid}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border border-border rounded-lg px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-semibold">{trade.symbol}</span>
                    <span className="text-muted-foreground ml-2 uppercase">{trade.side ?? 'unknown'}</span>
                    <span className="text-muted-foreground ml-2">{trade.exitReason ?? 'n/a'}</span>
                  </div>
                  <div
                    className={
                      trade.outcome === 'win'
                        ? 'text-emerald-400'
                        : trade.outcome === 'loss'
                          ? 'text-red-400'
                          : 'text-muted-foreground'
                    }
                  >
                    {formatCurrency(trade.pnl)}
                  </div>
                  <div className="text-muted-foreground">{formatTimestamp(trade.timestamp)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No trades found in telemetry yet.</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-3">Recent Execution Events</h3>
          {metricsData?.execution?.recent.length ? (
            <div className="space-y-2">
              {metricsData.execution.recent.map((event) => (
                <div
                  key={event.eventUid}
                  className="grid gap-2 border border-border rounded-lg px-3 py-2 text-sm md:grid-cols-[1fr_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-semibold">{event.symbol}</span>
                      <span className="text-muted-foreground">{formatEventType(event.eventType)}</span>
                      {event.setupType && (
                        <span className="text-muted-foreground uppercase">{event.setupType}</span>
                      )}
                      {event.side && (
                        <span className="text-muted-foreground uppercase">{event.side}</span>
                      )}
                      {event.orderId && (
                        <span className="font-mono text-xs text-muted-foreground">{event.orderId}</span>
                      )}
                    </div>
                    {event.reason && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">{event.reason}</p>
                    )}
                  </div>
                  <div className="text-muted-foreground md:text-right">{formatTimestamp(event.eventTs)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No signal or order lifecycle events found yet.</p>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Model Visuals</h2>
        <p className="text-lg text-muted-foreground">
          Feature-importance plots from current training artifacts.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-3">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-border">
              <Image src="/images/projects/llm-advisor/spy-feature-importances.png" alt="SPY feature importances" fill className="object-contain bg-white" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">SPY feature importance</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-border">
              <Image src="/images/projects/llm-advisor/qqq-feature-importances.png" alt="QQQ feature importances" fill className="object-contain bg-white" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">QQQ feature importance</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-border">
              <Image src="/images/projects/llm-advisor/iwm-feature-importances.png" alt="IWM feature importances" fill className="object-contain bg-white" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">IWM feature importance</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Automated Risk Manager</h2>
        <p className="text-lg text-muted-foreground">
          The runtime configuration enforces strict limits before execution: bounded risk per trade, minimum reward/risk, fixed session windows, and end-of-day flattening.
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden text-sm">
          <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            <span className="ml-2 text-zinc-500 font-mono text-xs">src/core/config.py + config/thresholds.py</span>
          </div>
          <pre className="p-4 overflow-x-auto font-mono text-zinc-300">
            {`# Runtime defaults (overridable via env)
max_risk_per_trade_percent = 1.0
min_risk_reward_ratio = 1.5
trading_window_start = "09:30"
trading_window_end = "12:00"
end_of_day_close_time = "15:50"

# Base STDEV thresholds
mr_arm_z = 1.2
mr_trigger_z = 0.6
tc_arm_z = 1.8
tc_trigger_z = 0.6
atr_multiplier_sl = 1.4
atr_percentile_cap = 85.0`}
          </pre>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Notebook Analyses</h2>
        <p className="text-lg text-muted-foreground">
          Week-2 notebook work is now scaffolded to publish reproducible analysis artifacts for this project.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <a href="/notebooks/trade_journal.html" className="rounded-xl border border-border bg-card p-4 hover:border-emerald-500/50 transition-colors">
            <h3 className="font-semibold">Trade Journal</h3>
            <p className="text-sm text-muted-foreground mt-1">Per-trade narrative context and outcomes.</p>
          </a>
          <a href="/notebooks/pnl_attribution.html" className="rounded-xl border border-border bg-card p-4 hover:border-emerald-500/50 transition-colors">
            <h3 className="font-semibold">PnL Attribution</h3>
            <p className="text-sm text-muted-foreground mt-1">P&L breakdown by symbol, regime, and exits.</p>
          </a>
          <a href="/notebooks/threshold_sensitivity.html" className="rounded-xl border border-border bg-card p-4 hover:border-emerald-500/50 transition-colors">
            <h3 className="font-semibold">Threshold Sensitivity</h3>
            <p className="text-sm text-muted-foreground mt-1">Grid search of MR/TC thresholds and risk multipliers.</p>
          </a>
          <a href="/notebooks/premarket_bias_evaluation.html" className="rounded-xl border border-border bg-card p-4 hover:border-emerald-500/50 transition-colors">
            <h3 className="font-semibold">Premarket Bias Evaluation</h3>
            <p className="text-sm text-muted-foreground mt-1">Bias hit-rate and calibration against realized direction.</p>
          </a>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Offline simulation snapshot</h2>
        <p className="text-lg text-muted-foreground">
          Versioned JSON under{' '}
          <code className="text-sm bg-muted px-1 rounded">public/data/llm_advisor_backtest_snapshot.json</code> —
          reproducible headline stats for portfolio / LinkedIn, with explicit limitations (technical replay only; no LLM overlay in this batch).
        </p>
        {snapshotError && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
            Snapshot unavailable: {snapshotError}
          </div>
        )}
        {snapshot && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <p className="text-sm text-muted-foreground">{snapshot.experiment.title}</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Sessions</p>
                  <p className="text-xl font-semibold">{snapshot.rollup.n_days} day(s)</p>
                  <p className="text-xs text-muted-foreground">{snapshot.experiment.session_dates_et.join(' → ')}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Sum daily P/L</p>
                  <p className="text-xl font-semibold">{formatCurrency(snapshot.rollup.total_pnl_sum)}</p>
                  <p className="text-xs text-muted-foreground">Independent daily resets — not compounded.</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Closed trades</p>
                  <p className="text-xl font-semibold">{snapshot.rollup.total_closed_trades}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Avg daily win rate</p>
                  <p className="text-xl font-semibold">
                    {formatPercent(snapshot.rollup.avg_win_rate_daily ?? null)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs">
                <span
                  className={
                    snapshot.experiment.premarket_context ? 'text-emerald-400' : 'text-muted-foreground'
                  }
                >
                  Premarket context: {snapshot.experiment.premarket_context ? 'yes' : 'no'}
                </span>
                <span
                  className={
                    snapshot.experiment.gemini_periodic_overlay ? 'text-emerald-400' : 'text-muted-foreground'
                  }
                >
                  Gemini overlay: {snapshot.experiment.gemini_periodic_overlay ? 'yes' : 'no'}
                </span>
                <span className="text-muted-foreground">
                  Generated {formatTimestamp(snapshot.generated_at)}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
              <h3 className="font-semibold text-emerald-200">Copy-ready (LinkedIn)</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                {snapshot.linkedin_snippets.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 space-y-2">
              <h3 className="font-semibold text-red-200">Read before you quote</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {snapshot.experiment.caveats.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>

            <details className="rounded-xl border border-border bg-card p-4 text-sm">
              <summary className="cursor-pointer font-medium">Per-session breakdown</summary>
              <div className="mt-3 space-y-2">
                {(snapshot.rollup.days ?? []).map((d) => (
                  <div key={d.date} className="flex flex-wrap justify-between gap-2 border border-border rounded px-3 py-2">
                    <span className="font-mono">{d.date}</span>
                    <span>{formatCurrency(d.total_pnl)}</span>
                    <span className="text-muted-foreground">{d.closed_trades} trades</span>
                    <span>{formatPercent(d.win_rate ?? null)} win rate</span>
                  </div>
                ))}
              </div>
            </details>

            <details className="rounded-xl border border-border bg-card p-4 text-sm">
              <summary className="cursor-pointer font-medium">Reproduce locally</summary>
              <pre className="mt-3 overflow-x-auto font-mono text-xs text-muted-foreground whitespace-pre-wrap">
                {snapshot.experiment.commands.join('\n')}
              </pre>
              {snapshot.repository && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Repo:{' '}
                  <a href={snapshot.repository} className="text-emerald-400 underline">
                    {snapshot.repository}
                  </a>
                </p>
              )}
            </details>
          </div>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Data Caveat</h2>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-muted-foreground">
            Metrics shown here are evidence-backed but mixed-source. If the feed mode is <strong>Backtest stream</strong>,
            P/L and win-rate reflect historical simulation artifacts; if it is <strong>Live stream</strong>,
            values come from persisted runtime telemetry. Deep-dive claims are restricted to what is currently materialized in those sources.
          </p>
        </div>
      </section>
    </ProjectLayout>
  )
}
