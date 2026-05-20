'use client'

import React from 'react'
import { ProjectLayout } from '@/components/ProjectLayout'
import { ProjectChat } from '@/components/chat/ProjectChat'
import { Trophy, BarChart3, Cpu } from 'lucide-react'
import { useProjectMetrics } from '@/hooks/useProjectMetrics'

export default function NbaHofPage() {
  const { metrics, isLoading, error } = useProjectMetrics('nba-hof')

  return (
    <ProjectLayout
      title="NBA Hall of Fame Predictor"
      description="An interactive ML system that estimates Hall of Fame probability from career outcomes, peak performance indicators, and awards profile. The interface lets users query players and inspect model-backed reasoning."
      tags={['Python', 'XGBoost', 'Next.js', 'TypeScript', 'Sports Analytics']}
      metrics={metrics?.metrics}
      metricsSource={metrics?.source}
      metricsGeneratedAt={metrics?.generatedAt}
      isLoadingMetrics={isLoading}
      metricsError={error}
      belowHero={
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Ask the Data</h2>
          <p className="text-lg text-muted-foreground">
            This assistant answers from the Hall of Fame project docs on this site: model design, feature importance,
            and stated limitations. It does not fetch live prediction tables.
          </p>
          <ProjectChat scope="nba-hof" />
        </section>
      }
      heroImage={
        <div className="w-full h-full p-8 flex items-center justify-center bg-zinc-950 rounded-xl border border-zinc-800">
          <div className="max-w-md w-full space-y-4">
            <div className="flex items-center gap-2 text-zinc-300">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">LeBron James</span>
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="text-xs text-zinc-400 mb-1">Hall of Fame Probability</div>
              <div className="text-3xl font-bold text-emerald-400">99.8%</div>
            </div>
            <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
              <div className="text-xs text-zinc-400 mb-2">Top Drivers</div>
              <div className="space-y-2 text-sm text-zinc-300">
                <div>All-Star selections</div>
                <div>Career win shares</div>
                <div>MVP and All-NBA awards</div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Model Design</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border p-6 rounded-xl space-y-3">
            <BarChart3 className="w-6 h-6 text-emerald-500" />
            <h3 className="font-semibold">Feature Set</h3>
            <p className="text-sm text-muted-foreground">
              Inputs combine volume stats, peak advanced metrics (PER/BPM/VORP), longevity, and accolades to capture both peak and career value.
            </p>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl space-y-3">
            <Cpu className="w-6 h-6 text-blue-500" />
            <h3 className="font-semibold">Gradient Boosted Trees</h3>
            <p className="text-sm text-muted-foreground">
              XGBoost handles nonlinear interactions between awards, usage, and efficiency while remaining interpretable enough for per-player explanations.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Prediction Pipeline</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden text-sm">
          <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 font-mono text-xs text-zinc-500">predict_hof.py</div>
          <pre className="p-4 overflow-x-auto font-mono text-zinc-300">
            {`def predict_player(player_row):
    features = vectorize_player(player_row)
    probability = float(model.predict_proba(features)[0, 1])
    confidence = confidence_bucket(probability)

    return {
        "player": player_row["name"],
        "hof_probability": probability,
        "confidence": confidence,
        "reasoning": explain_prediction(model, features)
    }`}
          </pre>
        </div>
      </section>
    </ProjectLayout>
  )
}
