'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Send, TrendingUp, TrendingDown, Star, BarChart3, Trophy, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

interface ChatMessage {
  type: 'user' | 'bot'
  content: string
  prediction?: PlayerPrediction
  timestamp: Date
}

export function NBAHofPredictor() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: 'bot',
      content: "Welcome! I'm trained on 5,250+ NBA players from 1976-2025. Enter any player's name to see their Hall of Fame prediction! Try: LeBron James, Stephen Curry, Michael Jordan, Kobe Bryant, etc.",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [predictions, setPredictions] = useState<Record<string, PlayerPrediction>>({})
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load predictions data on component mount
  useEffect(() => {
    const loadPredictions = async () => {
      try {
        const response = await fetch('/data/nba_hof_predictions.json')
        if (response.ok) {
          const data = await response.json()
          setPredictions(data)
          console.log(`Loaded ${Object.keys(data).length} player predictions`)
        } else {
          console.error('Failed to load predictions data')
        }
      } catch (error) {
        console.error('Error loading predictions:', error)
      }
    }
    loadPredictions()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Get search suggestions as user types
  const getSearchSuggestions = (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchSuggestions([])
      return
    }

    const normalizedQuery = query.toLowerCase().trim()
    const matches = Object.keys(predictions)
      .filter(key => 
        key.includes(normalizedQuery) || 
        predictions[key].player.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 5)
      .map(key => predictions[key].player)

    setSearchSuggestions(matches)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)
    getSearchSuggestions(value)
  }

  const handleSubmit = async (playerName?: string) => {
    const searchQuery = playerName || input.trim()
    if (!searchQuery || isLoading) return

    const userMessage: ChatMessage = {
      type: 'user',
      content: searchQuery,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setSearchSuggestions([])
    setIsLoading(true)

    // Simulate slight delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800))

    const playerKey = searchQuery.toLowerCase().trim()
    let prediction = predictions[playerKey]

    // If direct match not found, try fuzzy search
    if (!prediction) {
      const fuzzyMatch = Object.keys(predictions).find(key => 
        key.includes(playerKey) || 
        predictions[key].player.toLowerCase().includes(playerKey)
      )
      if (fuzzyMatch) {
        prediction = predictions[fuzzyMatch]
      }
    }

    if (prediction) {
      const botMessage: ChatMessage = {
        type: 'bot',
        content: `Here's the Hall of Fame analysis for ${prediction.player}:`,
        prediction,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    } else {
      const popularPlayers = ['LeBron James', 'Michael Jordan', 'Kobe Bryant', 'Stephen Curry', 'Magic Johnson', 'Larry Bird']
      const botMessage: ChatMessage = {
        type: 'bot',
        content: `I couldn't find "${searchQuery}" in my database of 5,250+ players. Try these popular players: ${popularPlayers.join(', ')}, or check the spelling.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    }

    setIsLoading(false)
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const getProbabilityColor = (prob: number) => {
    if (prob >= 0.8) return 'text-green-500'
    if (prob >= 0.5) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getProbabilityIcon = (prob: number) => {
    if (prob >= 0.8) return <TrendingUp className="w-4 h-4" />
    if (prob >= 0.5) return <BarChart3 className="w-4 h-4" />
    return <TrendingDown className="w-4 h-4" />
  }

  const getStatusBadge = (prediction: PlayerPrediction) => {
    if (prediction.isHOF) {
      return <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded-full flex items-center gap-1">
        <Trophy className="w-3 h-3" />
        Already in HOF
      </span>
    }
    if (prediction.isActive) {
      return <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded-full">Active Player</span>
    }
    return <span className="text-xs bg-gray-500/20 text-gray-600 px-2 py-1 rounded-full">Retired</span>
  }

  return (
    <div className="w-full h-full bg-background rounded-lg border border-border shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background-emphasis rounded-t-lg">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          NBA Hall of Fame Predictor
          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">XGBoost ML</span>
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          5,250+ players • Career outcomes • Model-backed reasoning
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto max-h-96 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg ${
              message.type === 'user' 
                ? 'bg-accent text-accent-foreground ml-6' 
                : 'bg-muted text-muted-foreground mr-6'
            }`}>
              <p className="text-sm">{message.content}</p>
              
              {message.prediction && (
                <div className="mt-3 space-y-3">
                  {/* Player Status & Basic Info */}
                  <div className="bg-background p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-foreground">{message.prediction.player}</span>
                      {getStatusBadge(message.prediction)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Career: {message.prediction.keyStats.seasons} seasons • Last played: {message.prediction.lastSeason}
                    </div>
                  </div>

                  {/* HOF Probability */}
                  <div className="bg-background p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">Hall of Fame Probability</span>
                      <div className={`flex items-center gap-1 font-bold ${getProbabilityColor(message.prediction.hofProbability)}`}>
                        {getProbabilityIcon(message.prediction.hofProbability)}
                        {(message.prediction.hofProbability * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="w-full bg-border rounded-full h-3 mb-2">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          message.prediction.hofProbability >= 0.8 ? 'bg-green-500' :
                          message.prediction.hofProbability >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.max(message.prediction.hofProbability * 100, 2)}%` }}
                      />
                    </div>
                    <span className={`text-xs ${
                      message.prediction.confidence === 'Very High' ? 'text-green-600' :
                      message.prediction.confidence === 'High' ? 'text-green-600' :
                      message.prediction.confidence === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {message.prediction.confidence} Confidence
                    </span>
                  </div>

                  {/* Career Statistics */}
                  <div className="bg-background p-3 rounded-lg border">
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Career Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Points: <span className="font-medium">{formatNumber(message.prediction.keyStats.careerPoints)}</span></div>
                      <div>Rebounds: <span className="font-medium">{formatNumber(message.prediction.keyStats.careerRebounds)}</span></div>
                      <div>Assists: <span className="font-medium">{formatNumber(message.prediction.keyStats.careerAssists)}</span></div>
                      <div>Blocks: <span className="font-medium">{formatNumber(message.prediction.keyStats.careerBlocks)}</span></div>
                      <div>Win Shares: <span className="font-medium">{message.prediction.keyStats.careerWinShares.toFixed(1)}</span></div>
                      <div>VORP: <span className="font-medium">{message.prediction.keyStats.careerVORP.toFixed(1)}</span></div>
                    </div>
                  </div>

                  {/* Awards & Honors */}
                  <div className="bg-background p-3 rounded-lg border">
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      Accolades
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>All-Star: <span className="font-medium text-yellow-600">{message.prediction.keyStats.allStarSelections}×</span></div>
                      <div>All-NBA: <span className="font-medium text-purple-600">{message.prediction.keyStats.allNBATeams}×</span></div>
                      <div>All-Defense: <span className="font-medium text-blue-600">{message.prediction.keyStats.allDefenseTeams}×</span></div>
                      <div>MVP: <span className="font-medium text-gold">{message.prediction.keyStats.mvpAwards}×</span></div>
                    </div>
                  </div>

                  {/* Advanced Metrics */}
                  <div className="bg-background p-3 rounded-lg border">
                    <h4 className="font-medium text-foreground mb-2">Peak Performance</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Peak PER: <span className="font-medium">{message.prediction.keyStats.peakPER.toFixed(1)}</span></div>
                      <div>Peak BPM: <span className="font-medium">{message.prediction.keyStats.peakBPM.toFixed(1)}</span></div>
                      <div>Peak VORP: <span className="font-medium">{message.prediction.keyStats.peakVORP.toFixed(1)}</span></div>
                      <div>Peak WS: <span className="font-medium">{message.prediction.keyStats.peakWinShares.toFixed(1)}</span></div>
                    </div>
                  </div>

                  {/* Model Reasoning */}
                  <div className="bg-background p-3 rounded-lg border">
                    <h4 className="font-medium text-foreground mb-2">Analysis Factors</h4>
                    <ul className="text-xs space-y-1">
                      {message.prediction.reasoning.map((reason, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-accent mt-0.5">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              <p className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground p-3 rounded-lg mr-6">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm">Analyzing career data...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input with Suggestions */}
      <div className="relative">
        {searchSuggestions.length > 0 && (
          <div className="absolute bottom-full left-4 right-4 mb-1 bg-background border border-border rounded-lg shadow-lg max-h-32 overflow-y-auto z-10">
            {searchSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSubmit(suggestion)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors border-b border-border last:border-b-0"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-4 border-t border-border bg-background-emphasis rounded-b-lg">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Enter NBA player name (e.g., LeBron James, Michael Jordan)..."
                className="pl-9"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={!input.trim() || isLoading} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 