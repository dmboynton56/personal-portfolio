'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { Search, Send } from 'lucide-react'
import { ProjectCarousel } from './ProjectCarousel'
import { DeviceFrameset } from 'react-device-frameset'
import '@/styles/device-frames.css'
import { BorderBeam } from '@/components/ui/border-beam'
import { NBAHofDisplay } from './NBAHofDisplay'
import { DailyBiasDisplay } from './DailyBiasDisplay'
import { SportsEdgeDisplay } from './SportsEdgeDisplay'
import MancalaGame from './MancalaGame'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Project {
  id: string
  title: string
  description: string
  type: 'desktop' | 'mobile'
  image: string
  images?: string[]
  technologies: string[]
  isInteractive?: boolean
  caseStudyUrl?: string
}

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

const mockProjects: Project[] = [
  {
    id: 'nba-hof-predictor',
    title: 'NBA Hall of Fame Predictor 🏀',
    description: 'Interactive machine learning model that predicts NBA players\' Hall of Fame chances with 99% accuracy. Features real-time player lookup and detailed prediction analysis using XGBoost trained on 5,250+ players since 1976. Try entering any NBA player name!',
    type: 'desktop',
    image: '/images/projects/nba-hof-top-20.png', // Placeholder for behind-the-scenes
    images: [
      '/images/projects/nba-hof-top-20.png',
      '/images/projects/nba-hof-roc-curves.png',
      '/images/projects/nba-hof-career-ws.png',
      '/images/projects/nba-hof-hold-out-prob.png',
      '/images/projects/nba-hof-mvp-chart.png'
    ],
    technologies: ['Python', 'XGBoost', 'Next.js', 'TypeScript', 'Basketball Analytics'],
    isInteractive: true
  },
  {
    id: 'ictml-trading-system',
    title: 'ICTML Advanced Trading System 📈',
    description: 'Real-time machine learning trading system achieving 84.4% accuracy in daily market bias prediction for QQQ, SPY, and IWM. Features ensemble models, premium session filtering (9:30-12:00 EST), and daily bias probability vectors.',
    type: 'desktop',
    image: '/images/projects/ICTML_accuracies.png',
    images: [
      '/images/projects/ICTML_accuracies.png', // Model performance metrics
      '/images/projects/ICTML_features.png',   // Feature importance analysis
      '/images/projects/ICTML_matrices.png'    // Confusion matrices
    ],
    technologies: ['Python', 'XGBoost', 'Scikit-learn', 'Ensemble Methods'],
    isInteractive: true
  },
  {
    id: 'sports-edge',
    title: 'Sports Edge: NFL/NBA Betting Analysis 🏈',
    description: 'Machine learning pipeline that computes model spreads and home win probabilities for NFL/NBA games, compares against sportsbook lines, and identifies betting edges. Features real-time odds integration, feature engineering (rest days, form metrics, opponent strength), and automated daily predictions.',
    type: 'desktop',
    image: '/images/projects/project3-1.JPG',
    images: [
      '/images/projects/project3-1.JPG',
      '/images/projects/project3-2.JPG'
    ],
    technologies: ['Python', 'Scikit-learn', 'LightGBM', 'Supabase', 'Next.js', 'Sports Analytics'],
    isInteractive: true,
    caseStudyUrl: '/projects/sports-edge'
  },
  {
    id: 'llm-advisor',
    title: 'LLM Advisor: Agentic Trading System 🤖',
    description: 'Autonomous trading agent that uses Google Gemini 1.5 Flash to analyze market sentiment and adjust statistical mean-reversion thresholds in real-time. Features automated risk management, backtesting engine, and Alpaca trade execution.',
    type: 'desktop',
    image: '/images/projects/llm-advisor-dashboard.png', // Placeholder
    images: [],
    technologies: ['Python', 'Gemini API', 'Alpaca', 'Pandas', 'Backtesting'],
    isInteractive: false,
    caseStudyUrl: '/projects/llm-advisor'
  },
  {
    id: 'mancala-ai',
    title: 'Mancala AI with Game Theory (Try to beat the AI!)',
    description: 'Intelligent Mancala game implementing minimax algorithm with alpha-beta pruning optimization. The AI evaluates game states 5 moves ahead, achieving 70-80% win rate against random opponents with 10x performance improvement through pruning. Features Monte Carlo simulation analysis for strategic validation.',
    type: 'desktop',
    image: '/images/projects/mancala-output.png', // Placeholder - will need actual game screenshots
    images: [
      '/images/projects/mancala-output.png',
      '/images/projects/mancala-workflow.JPG',
      '/images/projects/Mancala-4.JPG',
      '/images/projects/Mancala-1.JPG',
      '/images/projects/Mancala-2.JPG', // Game interface
      '/images/projects/Mancala-3.JPG'  // AI performance analysis
    ],
    technologies: ['Minimax Algorithm', 'Alpha-Beta Pruning', 'Game Theory'],
    isInteractive: true
  },
  {
    id: 'houseclusters',
    title: 'Advanced Data Cluster Sorting',
    description: 'Project for my Advanced Data Science class. This project was a individual effort to sort data into clusters based on their similarity. We used a variety of data structures and algorithms to achieve this.',
    type: 'desktop',
    image: '/images/projects/project3-1.JPG',
    images: [
      '/images/projects/project3-1.JPG',
      '/images/projects/project3-2.JPG'
    ],
    technologies: ['Python', 'Pandas', 'Gaussian Mixture Models']
  },
  {
    id: 'project1',
    title: 'CU Boulder Police Department Heatmap',
    description: 'A simple heatmap of the CU Boulder Police Department data and its most common location occurrences.',
    type: 'desktop',
    image: '/images/projects/project1-1.JPG',
    images: [
      '/images/projects/project1-1.JPG',
      '/images/projects/project1-2.JPG'
    ],
    technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS']
  },
  {
    id: 'simplefitness',
    title: 'Simple Fitness (Tracking App!)',
    description: 'A native iOS app for tracking strength training and cardio workouts. Built with Swift and CoreData, this was a fun introduction to iOS development and its ecosystem compatibility. This was more a fun project just to learn more about iOS development and its language capabilities. ',
    type: 'mobile',
    image: '/images/projects/simplefitness-1.png',
    images: [
      '/images/projects/simplefitness-1.png',
      '/images/projects/simplefitness-2.png',
      '/images/projects/simplefitness-3.png',
      '/images/projects/simplefitness-4.png'
    ],
    technologies: ['Xcode', 'Swift', 'CoreData']
  }
]

export function WorkSection() {
  const observerRefs = useRef<(HTMLDivElement | null)[]>([])
  const [isCarouselOpen, setIsCarouselOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // NBA Predictor state
  const [nbaInput, setNbaInput] = useState('')
  const [nbaIsLoading, setNbaIsLoading] = useState(false)
  const [nbaCurrentPrediction, setNbaCurrentPrediction] = useState<PlayerPrediction | null>(null)
  const [nbaNoResults, setNbaNoResults] = useState(false)
  const [nbaSearchSuggestions, setNbaSearchSuggestions] = useState<string[]>([])
  const [nbaPredictions, setNbaPredictions] = useState<Record<string, PlayerPrediction>>({})

  useEffect(() => {
    const observers = mockProjects.map((_, index) => {
      return new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('opacity-100', 'translate-y-0')
              entry.target.classList.remove('opacity-0', 'translate-y-10')
            }
          })
        },
        {
          threshold: 0.1,
          rootMargin: '-50px'
        }
      )
    })

    observerRefs.current.forEach((ref, index) => {
      if (ref) observers[index].observe(ref)
    })

    return () => {
      observerRefs.current.forEach((ref, index) => {
        if (ref) observers[index].unobserve(ref)
      })
    }
  }, [])

  const handleImageClick = (project: Project) => {
    setSelectedProject(project)
    setIsCarouselOpen(true)
  }

  // Load NBA predictions data
  useEffect(() => {
    const loadNBAPredictions = async () => {
      try {
        const response = await fetch('/data/nba_hof_predictions.json')
        if (response.ok) {
          const data = await response.json()
          setNbaPredictions(data)
        }
      } catch (error) {
        console.error('Error loading NBA predictions:', error)
      }
    }
    loadNBAPredictions()
  }, [])

  // NBA search suggestions
  const getNbaSearchSuggestions = (query: string) => {
    if (!query.trim() || query.length < 2) {
      setNbaSearchSuggestions([])
      return
    }

    const normalizedQuery = query.toLowerCase().trim()
    const matches = Object.keys(nbaPredictions)
      .filter(key =>
        key.includes(normalizedQuery) ||
        nbaPredictions[key].player.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 5)
      .map(key => nbaPredictions[key].player)

    setNbaSearchSuggestions(matches)
  }

  const handleNbaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNbaInput(value)
    getNbaSearchSuggestions(value)
  }

  const handleNbaSubmit = async (playerName?: string) => {
    const searchQuery = playerName || nbaInput.trim()
    if (!searchQuery || nbaIsLoading) return

    setNbaInput(playerName || nbaInput)
    setNbaSearchSuggestions([])
    setNbaIsLoading(true)
    setNbaNoResults(false)
    setNbaCurrentPrediction(null)

    // Simulate delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800))

    const playerKey = searchQuery.toLowerCase().trim()
    let prediction = nbaPredictions[playerKey]

    // Try fuzzy search if direct match not found
    if (!prediction) {
      const fuzzyMatch = Object.keys(nbaPredictions).find(key =>
        key.includes(playerKey) ||
        nbaPredictions[key].player.toLowerCase().includes(playerKey)
      )
      if (fuzzyMatch) {
        prediction = nbaPredictions[fuzzyMatch]
      }
    }

    if (prediction) {
      setNbaCurrentPrediction(prediction)
      setNbaNoResults(false)
    } else {
      setNbaCurrentPrediction(null)
      setNbaNoResults(true)
    }

    setNbaIsLoading(false)
  }

  return (
    <>
      <section id="work" className="min-h-screen bg-background-alt py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">Selected Work</h2>

          <div className="space-y-64">
            {mockProjects.map((project, index) => (
              <div
                key={project.id}
                ref={el => {
                  observerRefs.current[index] = el
                }}
                className="opacity-0 translate-y-10 transition-all duration-1000 ease-out"
              >
                <div className={`grid grid-cols-1 gap-16 ${project.type === 'desktop'
                    ? ''
                    : 'md:grid-cols-2 md:items-center'
                  }`}>
                  <div className="relative rounded-xl p-[2px] bg-gradient-to-r from-accent/80 via-accent/60 to-accent/80 shadow-[0_0_25px_rgba(0,0,0,0.25)] hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-shadow">
                    <div
                      className={`bg-background-emphasis p-12 rounded-xl relative overflow-hidden group`}
                    >
                      <BorderBeam
                        colorFrom="hsl(var(--accent))"
                        colorTo="hsl(var(--accent))"
                        duration={4}
                        size={100}
                        borderWidth={1}
                      />
                      <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-foreground mb-6">
                          {project.title}
                        </h3>
                        <p className="text-muted-foreground mb-8">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-8">
                          {project.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1 rounded-full shine-border group/tag transition-all duration-300 hover:scale-[1.02]"
                              style={{ '--shine-degree': '45deg' } as React.CSSProperties}
                            >
                              <span className="relative z-10 text-muted-foreground group-hover/tag:text-foreground text-sm transition-colors">
                                {tech}
                              </span>
                            </span>
                          ))}
                        </div>

                        {project.caseStudyUrl && (
                          <Button asChild className="shine-border w-full sm:w-auto group/btn">
                            <a href={project.caseStudyUrl} className="relative z-10 flex items-center justify-center text-foreground/80 group-hover/btn:text-foreground transition-colors">
                              View Deep Dive <div className="ml-2">→</div>
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`relative mx-auto w-full flex items-center justify-center ${project.type === 'desktop'
                        ? 'h-[500px] mt-8'
                        : 'h-[600px] flex items-center justify-center'
                      }`}
                  >
                    {project.isInteractive && project.id === 'mancala-ai' ? (
                      <div className="transform scale-[0.25] sm:scale-[0.4] md:scale-[0.55] lg:scale-[0.7] origin-center flex items-center justify-center w-full h-full">
                        <DeviceFrameset device="MacBook Pro" color="silver">
                          <div className="relative w-[1280px] h-[800px] bg-background flex items-center justify-center">
                            <MancalaGame />
                          </div>
                          <div className="bottom-bar" />
                        </DeviceFrameset>
                      </div>
                    ) : project.isInteractive && project.id === 'nba-hof-predictor' ? (
                      // Interactive NBA Predictor
                      <div
                        onClick={() => handleImageClick(project)}
                        className="relative cursor-pointer transition-transform hover:scale-[1.02] flex items-center justify-center w-full h-full group"
                      >
                        <div className="transform scale-[0.25] sm:scale-[0.4] md:scale-[0.55] lg:scale-[0.7] origin-center">
                          <DeviceFrameset device="MacBook Pro" color="silver">
                            <div className="relative w-[1280px] h-[800px] bg-background">
                              <div className="absolute inset-[8px] overflow-hidden">
                                <NBAHofDisplay
                                  prediction={nbaCurrentPrediction || undefined}
                                  isLoading={nbaIsLoading}
                                  searchQuery={nbaInput}
                                  noResults={nbaNoResults}
                                />
                              </div>
                            </div>
                            <div className="bottom-bar" />
                          </DeviceFrameset>
                        </div>
                        <div className="pointer-events-none absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                      </div>
                    ) : project.isInteractive && project.id === 'ictml-trading-system' ? (
                      // Interactive ICTML Daily Bias
                      <div
                        onClick={() => handleImageClick(project)}
                        className="relative cursor-pointer transition-transform hover:scale-[1.02] flex items-center justify-center w-full h-full group"
                      >
                        <div className="transform scale-[0.25] sm:scale-[0.4] md:scale-[0.55] lg:scale-[0.7] origin-center">
                          <DeviceFrameset device="MacBook Pro" color="silver">
                            <div className="relative w-[1280px] h-[800px] bg-background">
                              <div className="absolute inset-[8px] overflow-hidden">
                                <DailyBiasDisplay />
                              </div>
                            </div>
                            <div className="bottom-bar" />
                          </DeviceFrameset>
                        </div>
                        <div className="pointer-events-none absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                      </div>
                    ) : project.isInteractive && project.id === 'sports-edge' ? (
                      // Interactive Sports Edge (no carousel)
                      <div
                        onClick={(event) => event.stopPropagation()}
                        onPointerDown={(event) => event.stopPropagation()}
                        className="relative transition-transform hover:scale-[1.02] flex items-center justify-center w-full h-full group"
                      >
                        <div className="transform scale-[0.25] sm:scale-[0.4] md:scale-[0.55] lg:scale-[0.7] origin-center">
                          <DeviceFrameset device="MacBook Pro" color="silver">
                            <div className="relative w-[1280px] h-[800px] bg-background">
                              <div className="absolute inset-[8px] overflow-hidden">
                                <SportsEdgeDisplay />
                              </div>
                            </div>
                            <div className="bottom-bar" />
                          </DeviceFrameset>
                        </div>
                        <div className="pointer-events-none absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                      </div>
                    ) : (
                      // Standard image display
                      <div
                        onClick={() => handleImageClick(project)}
                        className="relative cursor-pointer transition-transform hover:scale-[1.02] flex items-center justify-center w-full h-full group"
                      >
                        {project.type === 'mobile' ? (
                          <div className="transform scale-[0.65] md:scale-[0.85] origin-center">
                            <DeviceFrameset device="iPhone X" color="black" landscape={false}>
                              <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                className="object-contain"
                              />
                            </DeviceFrameset>
                          </div>
                        ) : (
                          <div className="transform scale-[0.25] sm:scale-[0.4] md:scale-[0.55] lg:scale-[0.7] origin-center">
                            <DeviceFrameset device="MacBook Pro" color="silver">
                              <div className="relative w-[1280px] h-[800px] bg-background">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Image
                                    src={project.image}
                                    alt={project.title}
                                    fill
                                    className="object-contain"
                                    style={{ padding: '2px' }}
                                  />
                                </div>
                              </div>
                              <div className="bottom-bar" />
                            </DeviceFrameset>
                          </div>
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                      </div>
                    )}
                  </div>

                  {/* NBA Search Bar - appears below MacBook for NBA project */}
                  {project.isInteractive && project.id === 'nba-hof-predictor' && (
                    <div className="mt-8 relative max-w-2xl mx-auto">
                      {/* Search Suggestions */}
                      {nbaSearchSuggestions.length > 0 && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-background border border-border rounded-lg shadow-lg max-h-32 overflow-y-auto z-10">
                          {nbaSearchSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleNbaSubmit(suggestion)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors border-b border-border last:border-b-0"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Search Input */}
                      <form onSubmit={(e) => { e.preventDefault(); handleNbaSubmit(); }} className="flex gap-3">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            value={nbaInput}
                            onChange={handleNbaInputChange}
                            placeholder="Enter NBA player name (e.g., LeBron James, Michael Jordan)..."
                            className="pl-9 h-12 text-base"
                            disabled={nbaIsLoading}
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={!nbaInput.trim() || nbaIsLoading}
                          size="lg"
                          className="h-12 px-6"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Predict
                        </Button>
                      </form>

                      <p className="text-center text-sm text-muted-foreground mt-3">
                        Search from 5,250+ NBA players • Click the screen above to see behind-the-scenes
                      </p>
                    </div>
                  )}

                  {/* ICTML Info - appears below MacBook for ICTML project */}
                  {project.isInteractive && project.id === 'ictml-trading-system' && (
                    <div className="mt-8 relative max-w-2xl mx-auto text-center">
                      <p className="text-center text-sm text-muted-foreground">
                        Live daily bias predictions for QQQ, SPY, and IWM • 84.4% accuracy • Updated daily at 9:30 AM EST • Click the screen above to see model analysis
                      </p>
                    </div>
                  )}

                  {/* Sports Edge Info - appears below MacBook for Sports Edge project */}
                  {project.isInteractive && project.id === 'sports-edge' && (
                    <div className="mt-8 relative max-w-2xl mx-auto text-center">
                      <p className="text-center text-sm text-muted-foreground">
                        Live NFL/NBA game predictions vs sportsbook lines • Examine the spreads in the screen above to see model analysis
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isCarouselOpen && selectedProject && (
        <ProjectCarousel
          images={selectedProject.images || [selectedProject.image]}
          projectType={selectedProject.type}
          initialImage={selectedProject.image}
          onClose={() => {
            setIsCarouselOpen(false)
            setSelectedProject(null)
          }}
        />
      )}
    </>
  )
}
