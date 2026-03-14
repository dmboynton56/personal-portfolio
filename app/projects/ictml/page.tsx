'use client'

import React from 'react'
import { ProjectLayout } from '@/components/ProjectLayout'
import { BrainCircuit, Clock3, LineChart, ShieldAlert, Workflow, Database } from 'lucide-react'

export default function IctmlPage() {
  const metrics = [
    { label: 'Daily Bias Accuracy', value: '84.4%', icon: <LineChart className="w-4 h-4 text-emerald-500" />, trend: 'up' },
    { label: 'Symbols', value: 'QQQ • SPY • IWM', icon: <BrainCircuit className="w-4 h-4 text-blue-500" /> },
    { label: 'Inference Window', value: '9:30-12:00 EST', icon: <Clock3 className="w-4 h-4 text-amber-500" /> },
    { label: 'Pipeline Mode', value: 'Daily Automated', icon: <Workflow className="w-4 h-4 text-violet-500" /> }
  ] as const

  return (
    <ProjectLayout
      title="ICTML Advanced Trading System"
      description="A daily market-bias system that combines historical feature engineering, ensemble modeling, and scheduled inference to classify bullish, bearish, or choppy regimes before execution."
      tags={['Python', 'XGBoost', 'Scikit-learn', 'Pandas', 'Automation']}
      repoUrl="https://github.com/dmboynton56/ICTML"
      metrics={metrics}
      heroImage={
        <div className="w-full h-full p-8 flex items-center justify-center bg-zinc-950 rounded-xl border border-zinc-800">
          <div className="w-full max-w-xl space-y-4">
            <div className="text-sm text-zinc-400">Signal Snapshot</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-center">
                <div className="text-xs text-zinc-400">Bullish</div>
                <div className="text-xl font-bold text-emerald-400">61%</div>
              </div>
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-center">
                <div className="text-xs text-zinc-400">Bearish</div>
                <div className="text-xl font-bold text-red-400">24%</div>
              </div>
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-4 text-center">
                <div className="text-xs text-zinc-400">Choppy</div>
                <div className="text-xl font-bold text-yellow-300">15%</div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">System Workflow</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-card border border-border p-6 rounded-xl space-y-3">
            <Database className="w-6 h-6 text-blue-500" />
            <h3 className="font-semibold">1. Feature Build</h3>
            <p className="text-sm text-muted-foreground">
              Historical candles and session-level statistics are transformed into a stable feature set for each symbol and trade date.
            </p>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl space-y-3">
            <BrainCircuit className="w-6 h-6 text-emerald-500" />
            <h3 className="font-semibold">2. Ensemble Inference</h3>
            <p className="text-sm text-muted-foreground">
              XGBoost and related classifiers score each symbol and produce calibrated class probabilities for market regime.
            </p>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl space-y-3">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            <h3 className="font-semibold">3. Risk Gating</h3>
            <p className="text-sm text-muted-foreground">
              Confidence thresholds and session rules filter low-conviction outputs before downstream strategy logic consumes them.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Daily Inference Logic</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden text-sm">
          <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 font-mono text-xs text-zinc-500">run_premarket.py</div>
          <pre className="p-4 overflow-x-auto font-mono text-zinc-300">
            {`def run_daily_bias_pipeline(symbols, run_date):
    market_data = load_market_data(symbols=symbols, date=run_date)
    features = build_feature_matrix(market_data)
    probs = model.predict_proba(features)

    outputs = []
    for symbol, score in zip(symbols, probs):
        regime = decode_regime(score.argmax())
        confidence = float(score.max())
        if confidence < MIN_CONFIDENCE:
            regime = "choppy"

        outputs.append({
            "symbol": symbol,
            "predicted_bias": regime,
            "confidence": confidence,
            "probabilities": score.tolist()
        })
    return outputs`}
          </pre>
        </div>
      </section>
    </ProjectLayout>
  )
}
