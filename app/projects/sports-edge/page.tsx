'use client'

import React from 'react'
import { ProjectLayout } from '@/components/ProjectLayout'
import SportsEdgeCard from '@/components/SportsEdgeCard'
import { SportsEdgeChat } from '@/components/SportsEdgeChat'
import { Activity, Database, Server, TrendingUp, Cpu, LineChart } from 'lucide-react'

export default function SportsEdgePage() {
    const metrics = [
        { label: 'Win Rate (7d)', value: '62.5%', icon: <TrendingUp className="w-4 h-4 text-emerald-500" />, trend: 'up' },
        { label: 'Predictions', value: '1,240+', icon: <Activity className="w-4 h-4 text-blue-500" /> },
        { label: 'Data Points', value: '850K', icon: <Database className="w-4 h-4 text-purple-500" /> },
        { label: 'Pipeline', value: '100% Auto', icon: <Server className="w-4 h-4 text-orange-500" /> },
    ] as const

    return (
        <ProjectLayout
            title="Sports Edge"
            description="An automated machine learning pipeline that predicts NBA and NFL outcomes by analyzing advanced metrics, rest situations, and market inefficiencies."
            tags={['Python', 'BigQuery', 'GCP', 'Next.js', 'LightGBM', 'Supabase']}
            repoUrl="https://github.com/dmboynton56/sports-edge" // Assuming repo URL
            metrics={metrics}
            heroImage={
                <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
                    {/* Visual representation of the live card */}
                    <div className="scale-75 origin-center w-full max-w-md">
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
                            <p className="text-sm text-muted-foreground w-48">Scraping NBA/NFL APIs & Odds APIs daily via GitHub Actions.</p>
                        </div>
                        <div className="hidden md:block h-px w-16 bg-border" />
                        <div className="space-y-2">
                            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto md:mx-0">
                                <Cpu className="w-8 h-8 text-purple-500" />
                            </div>
                            <h3 className="font-semibold">Feature Engineering</h3>
                            <p className="text-sm text-muted-foreground w-48">Rolling averages, rest calc, and situational spots processed in BigQuery.</p>
                        </div>
                        <div className="hidden md:block h-px w-16 bg-border" />
                        <div className="space-y-2">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto md:mx-0">
                                <LineChart className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="font-semibold">Inference</h3>
                            <p className="text-sm text-muted-foreground w-48">LightGBM models score games & push predictions to Supabase.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Code Highlight */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold">Pipeline Logic</h2>
                <p className="text-lg text-muted-foreground">
                    The core pipeline handles everything from checking data freshness to ensuring idempotent writes in BigQuery.
                    Here is how we handle the daily NBA prediction flow:
                </p>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden text-sm">
                    <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                        <span className="ml-2 text-zinc-500 font-mono text-xs">refresh_nba.py</span>
                    </div>
                    <pre className="p-4 overflow-x-auto font-mono text-zinc-300">
                        {`def main() -> None:
    load_dotenv()
    args = _parse_args()
    client = bigquery.Client(project=args.project)

    target_date = args.date or datetime.now(tz=timezone.utc).date()
    # ... setup context ...

    games_df = _query_games(client, args.project, target_date)
    if games_df.empty:
        # Fallback to API if BigQuery is empty
        games_df = fetch_nba_games_for_date(target_date.strftime("%Y-%m-%d"), raise_on_error=True)

    # ... load historical data ...
    
    # Predictor handles feature building automatically
    predictor = GamePredictor("NBA", model_version=args.model_version)
    predictions = predictor.predict_batch(games_df, historical_games, game_logs=game_logs)
    
    # ... result processing & BQ write ...
    _delete_existing_predictions(client, args.project, predictions["game_id"].dropna().tolist(), args.model_version)
    # ... Write to BigQuery ...`}
                    </pre>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-3xl font-bold">Ask the Data</h2>
                <p className="text-lg text-muted-foreground">
                    This MVP assistant routes questions to SQL for current results and to project documentation for methodology,
                    limitations, and metric definitions.
                </p>
                <SportsEdgeChat />
            </section>
        </ProjectLayout>
    )
}
