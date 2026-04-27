import React from 'react'
import {
    Activity,
    TrendingUp,
    Database,
    Server,
    Search,
    Cpu,
    CheckCircle2,
    LineChart,
    BrainCircuit,
    Clock3,
    Workflow,
    Shield,
    Gauge,
    Trophy,
    BarChart,
    Bot,
    Terminal,
    ShieldAlert
} from 'lucide-react'

export type MetricSource =
    | 'supabase'
    | 'local-files'
    | 'fallback-cache'
    | 'static'
    | 'empty'
    | 'degraded'
export type MetricTrend = 'up' | 'down' | 'neutral'

export interface ProjectMetric {
    label: string
    value: string
    iconName?: string
    trend?: MetricTrend
}

export interface ProjectMetricsPayload {
    source: MetricSource
    generatedAt: string
    anchorDate?: string | null
    metrics: ProjectMetric[]
    error?: string
}

export const ICON_MAP: Record<string, React.ReactNode> = {
    activity: <Activity className="w-4 h-4" />,
    trendingUp: <TrendingUp className="w-4 h-4" />,
    database: <Database className="w-4 h-4" />,
    server: <Server className="w-4 h-4" />,
    search: <Search className="w-4 h-4" />,
    cpu: <Cpu className="w-4 h-4" />,
    checkCircle: <CheckCircle2 className="w-4 h-4" />,
    lineChart: <LineChart className="w-4 h-4" />,
    brainCircuit: <BrainCircuit className="w-4 h-4" />,
    clock: <Clock3 className="w-4 h-4" />,
    workflow: <Workflow className="w-4 h-4" />,
    shield: <Shield className="w-4 h-4" />,
    gauge: <Gauge className="w-4 h-4" />,
    trophy: <Trophy className="w-4 h-4" />,
    barChart: <BarChart className="w-4 h-4" />,
    bot: <Bot className="w-4 h-4" />,
    terminal: <Terminal className="w-4 h-4" />,
    shieldAlert: <ShieldAlert className="w-4 h-4" />
}

export function getIcon(iconName?: string, fallback: React.ReactNode = <Activity className="w-4 h-4" />) {
    if (!iconName) return fallback
    return ICON_MAP[iconName] || fallback
}
