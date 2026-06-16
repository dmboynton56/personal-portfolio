import React from 'react'
import { Header } from '@/components/Header'
import { ArrowLeft, Github, ExternalLink, Calendar, BarChart2, Radio, Activity, Code } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ProjectMetric, MetricSource, getIcon } from '@/lib/metrics'
import { track } from '@vercel/analytics'

interface ProjectLayoutProps {
    title: string
    description: string
    tags: string[]
    repoUrl?: string
    liveUrl?: string
    liveUrlLabel?: string
    metrics?: ProjectMetric[] | readonly ProjectMetric[]
    metricsSource?: MetricSource
    metricsGeneratedAt?: string
    /** Renders after the title/description/hero grid and before KPIs (e.g. project chat). */
    belowHero?: React.ReactNode
    children: React.ReactNode
    heroImage?: React.ReactNode // Pass a component or image for the right side of hero
    isLoadingMetrics?: boolean
    metricsError?: string | null
}

export function ProjectLayout({
    title,
    description,
    tags,
    repoUrl,
    liveUrl,
    liveUrlLabel = 'View Live',
    metrics,
    metricsSource,
    metricsGeneratedAt,
    belowHero,
    children,
    heroImage,
    isLoadingMetrics,
    metricsError,
}: ProjectLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="relative z-50">
                <Header />
            </div>

            <main className="container mx-auto px-4 py-8 pt-24">
                {/* Back Button */}
                <Link
                    href="/#work"
                    className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Portfolio
                </Link>

                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            {title}
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                            {description}
                        </p>

                        <div className="flex flex-wrap gap-3 mb-8">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 rounded-full text-sm font-medium bg-secondary/50 border border-secondary text-secondary-foreground"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {liveUrl && (
                                <Button asChild size="lg" className="shine-border group/btn" onClick={() => track('view_live_clicked', { project: title })}>
                                    <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="relative z-10 flex items-center justify-center text-foreground/80 group-hover/btn:text-foreground transition-colors">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        {liveUrlLabel}
                                    </a>
                                </Button>
                            )}
                            {repoUrl && (
                                <Button asChild variant="outline" size="lg" onClick={() => track('view_code_clicked', { project: title })}>
                                    <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                                        <Github className="w-4 h-4 mr-2" />
                                        View Code
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="relative aspect-video lg:aspect-square bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl border border-secondary/20 flex items-center justify-center p-8 overflow-hidden shadow-2xl">
                        {heroImage ? heroImage : (
                            <Code className="w-32 h-32 text-muted-foreground/20" />
                        )}
                    </div>
                </div>

                {belowHero && <div className="mb-16">{belowHero}</div>}

                {/* Metrics Grid */}
                {(metrics || isLoadingMetrics || metricsError) && (
                    <div className="mb-16">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Key Performance Indicators</h2>
                            {metricsSource && (
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full border",
                                        metricsSource === 'supabase' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                                            metricsSource === 'local-files' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                                                metricsSource === 'degraded' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                                "bg-zinc-500/10 border-zinc-500/20 text-zinc-500"
                                    )}>
                                        {metricsSource.toUpperCase().replace('-', ' ')}
                                    </span>
                                    {metricsGeneratedAt && (
                                        <span>Updated {new Date(metricsGeneratedAt).toLocaleString()}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {metricsError ? (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm">
                                {metricsError}
                            </div>
                        ) : isLoadingMetrics ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-card border border-border p-6 rounded-xl h-28" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {metrics?.map((metric, index) => (
                                    <div
                                        key={index}
                                        className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                                    >
                                        <div className="flex items-center text-muted-foreground mb-2">
                                            {getIcon(metric.iconName, <Activity className="w-4 h-4 mr-2" />)}
                                            <span className="text-sm font-medium ml-2">{metric.label}</span>
                                        </div>
                                        <div className="text-2xl md:text-3xl font-bold flex items-baseline gap-2">
                                            {metric.value}
                                            {metric.trend && (
                                                <span className={cn(
                                                    "text-xs font-medium",
                                                    metric.trend === 'up' ? "text-emerald-500" :
                                                        metric.trend === 'down' ? "text-red-500" :
                                                            "text-muted-foreground"
                                                )}>
                                                    {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Main Content Content */}
                <div className="space-y-16">
                    {children}
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-border mt-24 py-12 text-center text-muted-foreground">
                <p>© {new Date().getFullYear()} Drew Boynton. All rights reserved.</p>
            </footer>
        </div>
    )
}
