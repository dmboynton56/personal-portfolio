'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, BarChart3, Loader2 } from 'lucide-react'
import { ApiEnvelope, ApiMeta } from '@/lib/freshness'

type League = 'NBA' | 'NFL'

type AtsSummary = {
    league: League
    season: number
    wins: number
    losses: number
    pushes: number
    gradedGames: number
    atsPct: number | null
    roiPct: number | null
    updatedAt: string | null
}

type AtsBucket = AtsSummary & {
    week: number
    label: string
}

type AtsPayload = {
    league: League
    season: number
    summary: AtsSummary
    weekly: AtsBucket[]
}

type LoadState =
    | { status: 'loading' }
    | { status: 'ready'; payload: AtsPayload; meta: ApiMeta }
    | { status: 'error'; message: string }

const formatPct = (value: number | null, digits = 1) => {
    if (value == null) return 'N/A'
    return `${(value * 100).toFixed(digits)}%`
}

const formatRecord = (summary: AtsSummary) => {
    const pushText = summary.pushes > 0 ? `-${summary.pushes}` : ''
    return `${summary.wins}-${summary.losses}${pushText}`
}

const formatDate = (value: string | null) => {
    if (!value) return 'No graded games yet'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    }).format(parsed)
}

export function AtsSummaryCard({
    league = 'NBA',
    season
}: {
    league?: League
    season?: number
}) {
    const [state, setState] = useState<LoadState>({ status: 'loading' })

    const query = useMemo(() => {
        const params = new URLSearchParams({ league })
        if (season) params.set('season', String(season))
        return params.toString()
    }, [league, season])

    useEffect(() => {
        let cancelled = false

        async function loadMetrics() {
            setState({ status: 'loading' })

            try {
                const response = await fetch(`/api/sports-edges/ats-weekly?${query}`, {
                    cache: 'no-store'
                })
                const json = (await response.json()) as ApiEnvelope<AtsPayload>

                if (!cancelled) {
                    setState({
                        status: 'ready',
                        payload: json.data,
                        meta: json.meta
                    })
                }
            } catch (error) {
                if (!cancelled) {
                    setState({
                        status: 'error',
                        message:
                            error instanceof Error
                                ? error.message
                                : 'ATS metrics could not be loaded.'
                    })
                }
            }
        }

        loadMetrics()

        return () => {
            cancelled = true
        }
    }, [query])

    if (state.status === 'loading') {
        return (
            <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading {league} ATS results...</span>
                </div>
            </div>
        )
    }

    if (state.status === 'error') {
        return (
            <div className="rounded-xl border border-destructive/30 bg-card p-5">
                <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{state.message}</span>
                </div>
            </div>
        )
    }

    const { payload, meta } = state
    const { summary } = payload
    const hasData = summary.gradedGames > 0 && !meta.degraded

    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BarChart3 className="h-4 w-4 text-blue-500" />
                        <span>{payload.league} ATS Result Path</span>
                    </div>
                    <h3 className="mt-2 text-2xl font-bold">
                        {hasData ? formatRecord(summary) : 'Pending graded games'}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {meta.message ??
                            `Season ${payload.season}, latest update ${formatDate(summary.updatedAt)}`}
                    </p>
                </div>

                <div className="rounded-lg border border-border px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Activity
                            className={
                                meta.sloBucket === 'green'
                                    ? 'h-4 w-4 text-emerald-500'
                                    : meta.sloBucket === 'yellow'
                                      ? 'h-4 w-4 text-amber-500'
                                      : 'h-4 w-4 text-red-500'
                            }
                        />
                        <span className="capitalize">{meta.source}</span>
                    </div>
                </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg bg-muted/30 p-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Cover Rate
                    </div>
                    <div className="mt-1 text-xl font-semibold">
                        {formatPct(summary.atsPct)}
                    </div>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Flat ROI at -110
                    </div>
                    <div className="mt-1 text-xl font-semibold">
                        {formatPct(summary.roiPct)}
                    </div>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Graded Games
                    </div>
                    <div className="mt-1 text-xl font-semibold">
                        {summary.gradedGames}
                    </div>
                </div>
            </div>
        </div>
    )
}
