'use client'

import { Trophy, Award, Star, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

interface PlayerPrediction {
  player: string
  hofProbability: number
  confidence: 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low'
  keyStats: {
    allStarSelections: number
    careerPoints: number
    careerRebounds: number
    careerAssists: number
    careerBlocks: number
    seasons: number
    peakVORP: number
    peakPER: number
    peakBPM: number
    peakWinShares: number
    careerVORP: number
    careerWinShares: number
    allNBATeams: number
    firstTeamAllNBA: number
    allDefenseTeams: number
    mvpAwards: number
    dpoyAwards: number
  }
  lastSeason: number
  isActive: boolean
  isHOF: boolean
  reasoning: string[]
}

interface NBAHofDisplayProps {
  prediction?: PlayerPrediction
  isLoading?: boolean
  searchQuery?: string
  noResults?: boolean
}

export function NBAHofDisplay({ prediction, isLoading, searchQuery, noResults }: NBAHofDisplayProps) {
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const getProbabilityColor = (prob: number) => {
    if (prob >= 0.8) return 'text-green-500'
    if (prob >= 0.5) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getProbabilityIcon = (prob: number) => {
    if (prob >= 0.8) return <TrendingUp className="w-5 h-5" />
    if (prob >= 0.5) return <BarChart3 className="w-5 h-5" />
    return <TrendingDown className="w-5 h-5" />
  }

  const getStatusBadge = (prediction: PlayerPrediction) => {
    if (prediction.isHOF) {
      return <span className="text-sm bg-yellow-500/20 text-yellow-600 px-3 py-1 rounded-full flex items-center gap-1">
        <Trophy className="w-4 h-4" />
        Hall of Famer
      </span>
    }
    if (prediction.isActive) {
      return <span className="text-sm bg-green-500/20 text-green-600 px-3 py-1 rounded-full">Active Player</span>
    }
    return <span className="text-sm bg-gray-500/20 text-gray-600 px-3 py-1 rounded-full">Retired</span>
  }

  // Default welcome screen
  if (!prediction && !isLoading && !noResults) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-6">
          <div className="text-6xl">🏀</div>
          <h1 className="text-3xl font-bold text-foreground">NBA Hall of Fame Predictor</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            XGBoost machine learning model trained on 5,250+ players from 1976-2025
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-background/50 p-3 rounded-lg">
              <div className="text-lg font-bold text-green-600">99%</div>
              <div className="text-muted-foreground">Accuracy</div>
            </div>
            <div className="bg-background/50 p-3 rounded-lg">
              <div className="text-lg font-bold text-blue-600">5,250+</div>
              <div className="text-muted-foreground">Players</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Search for any NBA player below to see their Hall of Fame prediction
          </p>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full bg-background flex flex-col items-center justify-center p-8">
        <div className="space-y-4 text-center">
          <div className="flex gap-2 justify-center">
            <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-lg text-muted-foreground">Analyzing career data...</p>
          {searchQuery && (
            <p className="text-sm text-muted-foreground">Searching for "{searchQuery}"</p>
          )}
        </div>
      </div>
    )
  }

  // No results state
  if (noResults) {
    return (
      <div className="w-full h-full bg-background flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="text-4xl">🔍</div>
          <h3 className="text-xl font-semibold text-foreground">Player Not Found</h3>
          <p className="text-muted-foreground max-w-md">
            Couldn't find "{searchQuery}" in our database of 5,250+ players.
          </p>
          <div className="text-sm text-muted-foreground">
            <p>Try these popular players:</p>
            <p className="mt-1 font-medium">LeBron James, Michael Jordan, Kobe Bryant, Stephen Curry</p>
          </div>
        </div>
      </div>
    )
  }

  // Main prediction display
  if (prediction) {
    return (
      <div className="w-full h-full bg-background overflow-y-auto">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{prediction.player}</h2>
              <p className="text-sm text-muted-foreground">
                {prediction.keyStats.seasons} seasons • Last played: {prediction.lastSeason}
              </p>
            </div>
            {getStatusBadge(prediction)}
          </div>

          {/* HOF Probability - Featured */}
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-6 rounded-xl border-2 border-accent/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Hall of Fame Probability</h3>
              <div className={`flex items-center gap-2 text-2xl font-bold ${getProbabilityColor(prediction.hofProbability)}`}>
                {getProbabilityIcon(prediction.hofProbability)}
                {(prediction.hofProbability * 100).toFixed(1)}%
              </div>
            </div>
            <div className="w-full bg-border rounded-full h-4 mb-3">
              <div 
                className={`h-4 rounded-full transition-all duration-1500 ${
                  prediction.hofProbability >= 0.8 ? 'bg-green-500' :
                  prediction.hofProbability >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.max(prediction.hofProbability * 100, 3)}%` }}
              />
            </div>
            <span className={`text-sm font-medium ${
              prediction.confidence === 'Very High' ? 'text-green-600' :
              prediction.confidence === 'High' ? 'text-green-600' :
              prediction.confidence === 'Medium' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {prediction.confidence} Confidence Prediction
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Career Stats */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Career Statistics
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Points:</span>
                  <span className="font-medium">{formatNumber(prediction.keyStats.careerPoints)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rebounds:</span>
                  <span className="font-medium">{formatNumber(prediction.keyStats.careerRebounds)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Assists:</span>
                  <span className="font-medium">{formatNumber(prediction.keyStats.careerAssists)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Win Shares:</span>
                  <span className="font-medium">{prediction.keyStats.careerWinShares.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Awards */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Accolades
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>All-Star:</span>
                  <span className="font-medium text-yellow-600">{prediction.keyStats.allStarSelections}×</span>
                </div>
                <div className="flex justify-between">
                  <span>All-NBA:</span>
                  <span className="font-medium text-purple-600">{prediction.keyStats.allNBATeams}×</span>
                </div>
                <div className="flex justify-between">
                  <span>MVP:</span>
                  <span className="font-medium text-orange-600">{prediction.keyStats.mvpAwards}×</span>
                </div>
                <div className="flex justify-between">
                  <span>All-Defense:</span>
                  <span className="font-medium text-blue-600">{prediction.keyStats.allDefenseTeams}×</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Reasoning */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium text-foreground mb-3">Model Analysis</h4>
            <ul className="space-y-1">
              {prediction.reasoning.slice(0, 4).map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-accent mt-1">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Advanced Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Peak Performance</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>PER:</span>
                  <span className="font-medium">{prediction.keyStats.peakPER.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VORP:</span>
                  <span className="font-medium">{prediction.keyStats.peakVORP.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Impact Metrics</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>BPM:</span>
                  <span className="font-medium">{prediction.keyStats.peakBPM.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Peak WS:</span>
                  <span className="font-medium">{prediction.keyStats.peakWinShares.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
} 