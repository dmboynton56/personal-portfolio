'use client'

import React from 'react'
import { ProjectLayout } from '@/components/ProjectLayout'
import { Bot, Shield, Brain, Terminal, Zap, BarChart } from 'lucide-react'

export default function LlmAdvisorPage() {
    const metrics = [
        { label: 'Backtest Sharpe', value: '2.14', icon: <BarChart className="w-4 h-4 text-emerald-500" />, trend: 'up' },
        { label: 'Max Drawdown', value: '-8.5%', icon: <TrendingUp className="w-4 h-4 text-red-500" /> }, // TrendingUp used for simplicity
        { label: 'Avg Trade', value: '+0.45%', icon: <Zap className="w-4 h-4 text-yellow-500" /> },
        { label: 'Risk Checks', value: 'Real-time', icon: <Shield className="w-4 h-4 text-blue-500" /> },
    ] as const

    // Placeholder for TrendingUp component if not imported
    function TrendingUp(props: any) { return <span {...props}>📉</span> }


    return (
        <ProjectLayout
            title="LLM Advisor"
            description="An autonomous trading agent that combines statistical mean reversion with LLM-based sentiment analysis for risk management."
            tags={['Python', 'Gemini API', 'Alpaca', 'Pandas', 'Backtesting']}
            repoUrl="https://github.com/dmboynton56/llm-advisor" // Assuming repo URL
            metrics={metrics}
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
            {/* Architecture / Logic Section */}
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
                            The LLM outputs a "Market State" score (Bullish/Bearish/Choppy) and a suggested risk multiplier.
                        </p>
                    </div>

                    <div className="bg-card border border-border p-6 rounded-xl space-y-4">
                        <div className="flex items-center gap-3">
                            <Terminal className="w-6 h-6 text-emerald-500" />
                            <h3 className="text-xl font-semibold">2. Statistical Execution</h3>
                        </div>
                        <p className="text-muted-foreground">
                            The core engine calculates Z-scores on price action. If the Z-score exceeds the
                            <em>dynamically adjusted</em> threshold (set by the Agent), it executes mean reversion trades via Alpaca.
                        </p>
                    </div>
                </div>
            </section>

            {/* Risk Management Code */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold">Automated Risk Manager</h2>
                <p className="text-lg text-muted-foreground">
                    Safety is paramount. The system includes hard-coded circuit breakers that override AI decisions if maximum drawdown is hit.
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
        </ProjectLayout>
    )
}
