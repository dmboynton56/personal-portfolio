'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface BiasData {
  symbol: string
  predicted_bias: 'bullish' | 'bearish' | 'choppy'
  confidence: number
  current_price: number
  previous_close: number
  gap_pct: number
  data_source?: string
  probabilities: {
    bearish: number
    bullish: number
    choppy: number
  }
}

interface DailyBiasData {
  lastUpdated: string
  date: string
  predictions: {
    QQQ: BiasData
    SPY: BiasData
    IWM: BiasData
  }
}

export function DailyBiasDisplay() {
  const [biasData, setBiasData] = useState<DailyBiasData | null>(null)

  const loadBiasData = async () => {
    try {
      const response = await fetch('/data/daily_bias_predictions.json')
      if (response.ok) {
        const data = await response.json()
        setBiasData(data)
      }
    } catch (error) {
      console.error('Error loading bias data:', error)
    }
  }

  useEffect(() => {
    loadBiasData()
    // Poll every 60 seconds for updates
    const interval = setInterval(() => {
      loadBiasData()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case 'bullish': return 'text-green-400'
      case 'bearish': return 'text-red-400'
      case 'choppy': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getBiasBackgroundTint = (bias: string) => {
    switch (bias) {
      case 'bullish': return 'bg-green-500/5 border-green-500/20'
      case 'bearish': return 'bg-red-500/5 border-red-500/20'
      case 'choppy': return 'bg-yellow-500/5 border-yellow-500/20'
      default: return 'bg-gray-500/5 border-gray-500/20'
    }
  }

  const getBiasIcon = (bias: string) => {
    switch (bias) {
      case 'bullish': return <TrendingUp className="w-5 h-5" />
      case 'bearish': return <TrendingDown className="w-5 h-5" />
      case 'choppy': return <Minus className="w-5 h-5" />
      default: return <Minus className="w-5 h-5" />
    }
  }

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return 'Very High'
    if (confidence >= 0.7) return 'High'
    if (confidence >= 0.6) return 'Medium'
    if (confidence >= 0.5) return 'Low'
    return 'Very Low'
  }

  if (!biasData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading daily bias predictions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-background p-4 overflow-y-auto">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">📈 Daily Market Bias</h2>
          <p className="text-sm text-muted-foreground">
            Predictions for {biasData.date}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {new Date(biasData.lastUpdated).toLocaleString('en-US')}
          </p>
        </div>

        {/* Three Vertical Cards - 80% Height */}
        <div className="mb-6 grid grid-cols-3 gap-8">
          {Object.values(biasData.predictions).map((prediction) => (
            <div 
              key={prediction.symbol}
              className={`rounded-xl p-6 border-2 transition-all duration-300 hover:scale-[1.02] ${getBiasBackgroundTint(prediction.predicted_bias)} flex flex-col justify-between`}
            >
              {/* Symbol Header */}
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-foreground mb-2">{prediction.symbol}</div>
                <div className={`flex items-center justify-center gap-2 ${getBiasColor(prediction.predicted_bias)}`}>
                  {getBiasIcon(prediction.predicted_bias)}
                  <span className="font-bold uppercase text-lg">
                    {prediction.predicted_bias}
                  </span>
                </div>
              </div>

              {/* Price Info */}
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-foreground">
                  ${prediction.current_price.toFixed(2)}
                </div>
                <div className={`text-lg font-semibold ${prediction.gap_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {prediction.gap_pct >= 0 ? '+' : ''}{prediction.gap_pct.toFixed(2)}%
                </div>
              </div>

              {/* Confidence */}
              <div className="text-center mb-6">
                <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                <div className="font-bold text-xl">
                  {(prediction.confidence * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  ({getConfidenceLevel(prediction.confidence)})
                </div>
              </div>

              {/* Probability Bars */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-10 text-green-400 font-medium">Bull</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${prediction.probabilities.bullish * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-medium">{(prediction.probabilities.bullish * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-10 text-red-400 font-medium">Bear</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-red-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${prediction.probabilities.bearish * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-medium">{(prediction.probabilities.bearish * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-10 text-yellow-400 font-medium">Chop</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${prediction.probabilities.choppy * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-medium">{(prediction.probabilities.choppy * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Previous Close */}
              <div className="text-center pt-3 border-t border-border/30">
                <div className="text-xs text-muted-foreground">Previous Close</div>
                <div className="text-sm font-semibold">${prediction.previous_close.toFixed(2)}</div>
                {prediction.data_source && (
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Source: {prediction.data_source}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 
