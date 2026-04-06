'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { ProjectLayout } from '@/components/ProjectLayout'
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

type LlmAdvisorMetricsPayload = {
  source: 'supabase' | 'local-files' | 'empty'
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
  return 'No telemetry'
}

const getAgentState = (metrics: LlmAdvisorMetricsPayload | null) => {
  if (!metrics || metrics.heartbeat.ageSeconds == null) return 'NO FEED'
  if (metrics.heartbeat.ageSeconds <= 180) return 'ACTIVE'
  if (metrics.heartbeat.ageSeconds <= 1800) return 'DELAYED'
  return 'STALE'
}

export default function LlmAdvisorPage() {
  const [metricsData, setMetricsData] = useState<LlmAdvisorMetricsPayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const response = await fetch('/api/llm-advisor/metrics', {
          cache: 'no-store'
        })
        const payload = (await response.json()) as LlmAdvisorMetricsPayload & {
          error?: string
        }
        if (!response.ok) {
          throw new Error(payload.error ?? 'Failed to load LLM Advisor metrics')
        }
        if (cancelled) return
        setMetricsData(payload)
        setLoadError(null)
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
          label: 'Risk/Reward',
          value: formatRatio(metricsData?.trades.rrOverall ?? null),
          iconName: 'shield'
        }
      ] as const,
    [metricsData]
  )

  return (
    <ProjectLayout
      title="LLM Advisor"
      description="An autonomous trading agent that combines statistical mean reversion with LLM-based sentiment analysis for risk management."
      tags={['Python', 'Gemini API', 'Alpaca', 'Pandas', 'Backtesting']}
      repoUrl="https://github.com/dmboynton56/llm-advisor"
      metrics={topMetrics}
      metricsSource={metricsData?.source}
      metricsGeneratedAt={metricsData?.generatedAt}
      isLoadingMetrics={isLoading}
      metricsError={loadError}
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
              Every 15 minutes, the system feeds headlines and market context into <strong>Gemini 1.5 Flash</strong>.
              The LLM outputs a market-state score and risk multipliers used by execution guards.
            </p>
          </div>

          <div className="bg-card border border-border p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <Terminal className="w-6 h-6 text-emerald-500" />
              <h3 className="text-xl font-semibold">2. Statistical Execution</h3>
            </div>
            <p className="text-muted-foreground">
              The core engine calculates Z-scores on price action. If the Z-score exceeds the
              dynamically adjusted threshold, it executes mean reversion trades via Alpaca.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Live Monitoring Dashboard</h2>
        <p className="text-lg text-muted-foreground">
          This section is now backed by a real telemetry API using Supabase storage with local artifact fallback.
        </p>
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <div>
            Data source: <span className="text-foreground">{formatSource(metricsData?.source ?? 'empty')}</span>
          </div>
          <div>
            Last generated: <span className="text-foreground">{formatTimestamp(metricsData?.generatedAt ?? null)}</span>
          </div>
          <div>
            Anchor date: <span className="text-foreground">{metricsData?.anchorDate ?? 'N/A'}</span>
          </div>
          {loadError && (
            <div className="text-red-400">Telemetry load warning: {loadError}</div>
          )}
          {isLoading && !metricsData && (
            <div>Loading telemetry...</div>
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
          Safety logic includes hard-coded circuit breakers that override AI decisions at configured drawdown thresholds.
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden text-sm">
          <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            <span className="ml-2 text-zinc-500 font-mono text-xs">risk_manager.py</span>
          </div>
          <pre className="p-4 overflow-x-auto font-mono text-zinc-300">
            {`def check_risk_parameters(current_pnl, max_drawdown_limit):
    """
    Hard stop if we exceed daily loss limit.
    """
    if current_pnl < -max_drawdown_limit:
        logger.critical(f"Daily stop loss hit: {current_pnl}")
        return {
            "can_trade": False,
            "action": "LIQUIDATE_ALL",
            "reason": "MAX_DRAWDOWN_HIT"
        }

    # ... other checks (exposure, volatility) ...
    return {"can_trade": True}`}
          </pre>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Data Caveat</h2>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-muted-foreground">
            Current metrics are sourced from backtest artifacts and live-loop telemetry. Once real broker fills are persisted into the same schema,
            the dashboard will reflect true production P/L instead of backtest-only trade outcomes.
          </p>
        </div>
      </section>
    </ProjectLayout>
  )
}
