'use client'

import React from 'react'
import { ProjectLayout } from '@/components/ProjectLayout'
import SportsEdgeCard from '@/components/SportsEdgeCard'
import { ProjectChat } from '@/components/chat/ProjectChat'
import { AtsSummaryCard } from '@/components/sports-edge/AtsSummaryCard'
import { Activity, Database, Server, TrendingUp, Cpu, LineChart } from 'lucide-react'
import { useProjectMetrics } from '@/hooks/useProjectMetrics'

export default function SportsEdgePage() {
    const { metrics, isLoading, error } = useProjectMetrics('sports-edge')

    return (
        <ProjectLayout
            title="Sports Edge"
            description="A production sports modeling pipeline with BigQuery as source-of-truth, Supabase serving, and documented outputs across NBA, NFL, MLB, World Cup, PGA, and CBB workflows."
            tags={['Python', 'BigQuery', 'GCP', 'Next.js', 'LightGBM', 'Supabase']}
            repoUrl="https://github.com/dmboynton56/sports-edge"
            liveUrl="https://sports-edge.drewboynton.com"
            liveUrlLabel="Open Operations Dashboard"
            metrics={metrics?.metrics}
            metricsSource={metrics?.source}
            metricsGeneratedAt={metrics?.generatedAt}
            isLoadingMetrics={isLoading}
            metricsError={error}
            belowHero={
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold">Ask the Data</h2>
                    <p className="text-lg text-muted-foreground">
                        This MVP assistant routes questions to SQL for current results and to project documentation for methodology,
                        limitations, and metric definitions.
                    </p>
                    <ProjectChat scope="sports-edge" />
                </section>
            }
            heroImage={
                <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
                    {/* Visual representation of the live card */}
                    <div className="h-full w-full max-w-md overflow-y-auto p-2" style={{ overscrollBehavior: 'contain' }}>
                        <SportsEdgeCard />
                    </div>
                </div>
            }
        >
            {/* Architecture Section */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold">System Architecture</h2>
                <div className="bg-card border border-border p-8 rounded-xl">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
                        <div className="space-y-2">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto md:mx-0">
                                <Database className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="font-semibold">Data Ingestion</h3>
                            <p className="text-sm text-muted-foreground w-48">Daily GitHub Actions refresh league schedules, odds, and curated artifacts into BigQuery.</p>
                        </div>
                        <div className="hidden md:block h-px w-16 bg-border" />
                        <div className="space-y-2">
                            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto md:mx-0">
                                <Cpu className="w-8 h-8 text-purple-500" />
                            </div>
                            <h3 className="font-semibold">Feature Engineering</h3>
                            <p className="text-sm text-muted-foreground w-48">League-specific feature builders compute rolling form, rest, and matchup context for scoring.</p>
                        </div>
                        <div className="hidden md:block h-px w-16 bg-border" />
                        <div className="space-y-2">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto md:mx-0">
                                <LineChart className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="font-semibold">Inference</h3>
                            <p className="text-sm text-muted-foreground w-48">Model outputs are produced in Python, then synced to Supabase for web experiences and API access.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Code Highlight */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold">Pipeline Logic</h2>
                <p className="text-lg text-muted-foreground">
                    The daily refresh is fully scripted in GitHub Actions and runs every day at 13:00 UTC.
                    This is the production job skeleton that orchestrates data, features, inference, and serving sync:
                </p>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden text-sm">
                    <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                        <span className="ml-2 text-zinc-500 font-mono text-xs">.github/workflows/daily-refresh.yml</span>
                    </div>
                    <pre className="p-4 overflow-x-auto font-mono text-zinc-300">
                        {`schedule:
  - cron: "0 13 * * *"  # 13:00 UTC daily

steps:
  - python scripts/backfill_nba_raw.py ...
  - python scripts/backfill_nfl_raw.py ...
  - python scripts/build_feature_snapshots.py --league NBA ...
  - python scripts/build_feature_snapshots.py --league NFL ...
  - python -m src.pipeline.refresh_nba --model-version v3
  - python -m src.pipeline.refresh_nfl --model-version v1
  - python -m src.pipeline.refresh_mlb --model-version v3
  - python scripts/sync_bq_to_supabase.py --league NBA --append
  - python scripts/sync_bq_to_supabase.py --league NFL --append
  - python scripts/sync_bq_to_supabase.py --league MLB --append
  - python scripts/sync_odds.py ...`}
                    </pre>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-3xl font-bold">Observed Output Snapshot</h2>
                <p className="text-lg text-muted-foreground">
                    These values come from committed artifacts in the repository (not synthetic placeholders).
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            <h3 className="font-semibold">PGA Simulation Run</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Latest meta bundle records <strong>80 players</strong> and <strong>50,000 simulations</strong> with an as-of date of <strong>2026-04-07</strong>.
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <h3 className="font-semibold">Serving and Freshness</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            The web dashboard export includes a generated timestamp and per-player outputs (expected SG, sim win/top-k rates, model heads, and probability estimates).
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Server className="w-4 h-4 text-purple-500" />
                            <h3 className="font-semibold">Automation Contract</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Production refresh executes daily at 13:00 UTC and runs NBA, NFL, and probability-only MLB generation before syncing to Supabase.
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Database className="w-4 h-4 text-amber-500" />
                            <h3 className="font-semibold">CBB + PGA Context</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            CBB and PGA documentation/workflows are integrated in `data-core/docs` and cache artifacts, so project knowledge is broader than only NBA/NFL/MLB.
                        </p>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-3xl font-bold">Live Results</h2>
                <p className="text-lg text-muted-foreground">
                    The first Week-2 result path is live: graded games and latest model predictions are joined from Supabase to compute ATS record and flat-unit ROI.
                </p>
                <AtsSummaryCard league="NBA" />
            </section>

            <section className="space-y-6">
                <h2 className="text-3xl font-bold">Benchmark vs Live Metrics</h2>
                <div className="rounded-xl border border-border bg-card p-5 text-muted-foreground">
                    <p>
                        Deep-dive claims are split into two classes: <strong>observed live artifacts</strong> (workflow schedules, generated dashboards, cached model outputs)
                        and <strong>benchmark targets</strong> (for example, CBB log-loss bands in planning docs). Benchmarks are treated as goals/comparators, not as
                        claimed production performance unless tied to a dated output artifact.
                    </p>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-3xl font-bold">Notebook Analyses</h2>
                <p className="text-lg text-muted-foreground">
                    Week-2 notebook publishing is being rolled out so every key metric on this page links to full reproducible analysis.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <a href="/notebooks/nfl_backtest_2025.html" className="rounded-xl border border-border bg-card p-4 hover:border-blue-500/50 transition-colors">
                        <h3 className="font-semibold">NFL Backtest 2025</h3>
                        <p className="text-sm text-muted-foreground mt-1">Backtest metrics, ATS performance, and model diagnostics.</p>
                    </a>
                    <a href="/notebooks/nba_backtest_2025.html" className="rounded-xl border border-border bg-card p-4 hover:border-blue-500/50 transition-colors">
                        <h3 className="font-semibold">NBA Backtest 2025-26</h3>
                        <p className="text-sm text-muted-foreground mt-1">No-leakage backtest and threshold strategy review.</p>
                    </a>
                    <a href="/notebooks/nfl_calibration.html" className="rounded-xl border border-border bg-card p-4 hover:border-blue-500/50 transition-colors">
                        <h3 className="font-semibold">NFL Calibration</h3>
                        <p className="text-sm text-muted-foreground mt-1">Reliability curves and calibration error tracking.</p>
                    </a>
                    <a href="/notebooks/nba_calibration.html" className="rounded-xl border border-border bg-card p-4 hover:border-blue-500/50 transition-colors">
                        <h3 className="font-semibold">NBA Calibration</h3>
                        <p className="text-sm text-muted-foreground mt-1">Probabilistic calibration checks and drift analysis.</p>
                    </a>
                </div>
            </section>

        </ProjectLayout>
    )
}
