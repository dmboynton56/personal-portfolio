import { NextResponse } from 'next/server'
import { supabase, isMissingTableError } from '@/lib/supabase'
import { STALE_THRESHOLDS, computeSloBucket, SloBucket } from '@/lib/freshness'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type SurfaceHealth = {
  surface: string
  updatedAt: string | null
  source: 'supabase' | 'empty'
  sloBucket: SloBucket
}

const parseIso = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

const maxIso = (...values: Array<string | null>): string | null => {
  const timestamps = values
    .filter((value): value is string => Boolean(value))
    .map((value) => Date.parse(value))
    .filter((value) => !Number.isNaN(value))
  if (!timestamps.length) return null
  return new Date(Math.max(...timestamps)).toISOString()
}

export async function GET() {
  if (!supabase) {
    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      overall: 'red',
      surfaces: [
        {
          surface: 'sports-edge',
          updatedAt: null,
          source: 'empty',
          sloBucket: 'red'
        },
        {
          surface: 'llm-advisor',
          updatedAt: null,
          source: 'empty',
          sloBucket: 'red'
        },
        {
          surface: 'project-metrics',
          updatedAt: null,
          source: 'empty',
          sloBucket: 'red'
        },
        {
          surface: 'daily-bias',
          updatedAt: null,
          source: 'empty',
          sloBucket: 'red'
        }
      ]
    })
  }

  const surfaces: SurfaceHealth[] = []
  const now = new Date().toISOString()

  const [predictions, heartbeats, llmRuns, llmTrades, projectMetrics, dailyBias] = await Promise.all([
    supabase
      .from('model_predictions')
      .select('asof_ts')
      .order('asof_ts', { ascending: false })
      .limit(1),
    supabase
      .from('llm_advisor_runtime_heartbeats')
      .select('heartbeat_ts')
      .order('heartbeat_ts', { ascending: false })
      .limit(1),
    supabase
      .from('llm_advisor_backtest_runs')
      .select('run_date')
      .order('run_date', { ascending: false })
      .limit(1),
    supabase
      .from('llm_advisor_backtest_trades')
      .select('exit_time,entry_time')
      .order('exit_time', { ascending: false })
      .limit(1),
    supabase
      .from('project_metrics')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1),
    supabase
      .from('premarket_bias')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
  ])

  const pushSurface = (
    surface: string,
    updatedAt: string | null,
    threshold: (typeof STALE_THRESHOLDS)[keyof typeof STALE_THRESHOLDS]
  ) => {
    surfaces.push({
      surface,
      updatedAt,
      source: updatedAt ? 'supabase' : 'empty',
      sloBucket: computeSloBucket(updatedAt, threshold)
    })
  }

  pushSurface(
    'sports-edge',
    parseIso(predictions.data?.[0]?.asof_ts),
    STALE_THRESHOLDS.sportsEdge
  )
  pushSurface(
    'llm-advisor',
    maxIso(
      parseIso(heartbeats.data?.[0]?.heartbeat_ts),
      parseIso(llmTrades.data?.[0]?.exit_time ?? llmTrades.data?.[0]?.entry_time),
      parseIso(
        typeof llmRuns.data?.[0]?.run_date === 'string'
          ? `${llmRuns.data[0].run_date}T23:59:59.000Z`
          : null
      )
    ),
    STALE_THRESHOLDS.llmAdvisor
  )
  pushSurface(
    'project-metrics',
    parseIso(projectMetrics.data?.[0]?.updated_at),
    STALE_THRESHOLDS.projectMetrics
  )

  if (!dailyBias.error) {
    pushSurface(
      'daily-bias',
      parseIso(dailyBias.data?.[0]?.updated_at),
      STALE_THRESHOLDS.dailyBias
    )
  } else if (!isMissingTableError(dailyBias.error)) {
    console.warn('Health daily-bias query error', dailyBias.error)
    pushSurface('daily-bias', null, STALE_THRESHOLDS.dailyBias)
  } else {
    pushSurface('daily-bias', null, STALE_THRESHOLDS.dailyBias)
  }

  const overall: SloBucket = surfaces.some((s) => s.sloBucket === 'red')
    ? 'red'
    : surfaces.some((s) => s.sloBucket === 'yellow')
      ? 'yellow'
      : 'green'

  return NextResponse.json({
    generatedAt: now,
    overall,
    surfaces
  })
}
