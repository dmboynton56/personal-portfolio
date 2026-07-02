'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Send } from 'lucide-react'
import { DeviceFrameset } from 'react-device-frameset'
import '@/styles/device-frames.css'
import { BorderBeam } from '@/components/ui/border-beam'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProjectActionButtons } from '@/components/ProjectActionButtons'
import { useVisibleProjects } from '@/hooks/useVisibleProjects'

const ProjectCarousel = dynamic(
  () => import('./ProjectCarousel').then((mod) => ({ default: mod.ProjectCarousel })),
  { ssr: false }
)

const MancalaGame = dynamic(() => import('./MancalaGame'), { ssr: false })
const NBAHofDisplay = dynamic(
  () => import('./NBAHofDisplay').then((mod) => ({ default: mod.NBAHofDisplay })),
  { ssr: false }
)

const STATS_SCREEN_PROJECT_IDS = new Set(['sports-edge', 'llm-advisor', 'matchpoint'])

/** Responsive hint for lazy previews and carousel-friendly fills */
const PROJECT_IMAGE_SIZES = '(max-width: 768px) min(100vw, 896px), min(896px, 75vw)'
const DESKTOP_DEVICE_PREVIEW_CLASS =
  'device-scale device-scale--macbook device-scale--desktop-home'
const MOBILE_DEVICE_PREVIEW_CLASS =
  'device-scale device-scale--iphone device-scale--mobile-home'

function DevicePreview({
  className,
  children,
}: {
  className: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <div className="device-scale-content">{children}</div>
    </div>
  )
}

interface Project {
  id: string
  title: string
  description: string
  category: 'flagship' | 'additional'
  type: 'desktop' | 'mobile'
  image: string
  images?: string[]
  technologies: string[]
  proofPoints?: string[]
  isInteractive?: boolean
  caseStudyUrl?: string
  liveUrl?: string
  liveUrlLabel?: string
  cardOnly?: boolean
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
    id: 'sports-edge',
    title: 'Sports Edge: Multi-League Sports Modeling 🏈',
    description:
      'Production sports modeling stack covering NBA, NFL, MLB, PGA, CBB, and World Cup. BigQuery holds source-of-truth data; Python pipelines score games and sync to Supabase for the ops dashboard and this portfolio. Compare model spreads and win probabilities against sportsbook lines to surface edges.',
    category: 'flagship',
    type: 'desktop',
    image: '/images/projects/sports-edge/dashboard-screenshot.png',
    images: [
      '/images/projects/sports-edge/dashboard-screenshot.png',
      '/images/projects/sports-edge/sports-edge-week-outputs.png',
      '/images/projects/sports-edge/model_spreads_vs_book.png',
    ],
    technologies: ['Python', 'Scikit-learn', 'LightGBM', 'Supabase', 'Next.js', 'Sports Analytics'],
    proofPoints: [
      'Ops dashboard at sports-edge.drewboynton.com',
      'BigQuery source of truth + Supabase serving layer',
      'Automated daily/weekly prediction pipeline across six leagues'
    ],
    isInteractive: false,
    caseStudyUrl: '/projects/sports-edge',
    liveUrl: 'https://sports-edge.drewboynton.com',
    liveUrlLabel: 'Ops Dashboard',
  },
  {
    id: 'llm-advisor',
    title: 'LLM Advisor: Agentic Trading System 🤖',
    description:
      'Autonomous trading agent that uses Gemini to analyze market context, adjust mean-reversion thresholds, and execute paper options with guardrails. Premarket bias from ICTML folds into one trading-advisor story.',
    category: 'flagship',
    type: 'desktop',
    image: '/images/projects/llm-advisor/dashboard-screenshot.png',
    images: [
      '/images/projects/llm-advisor/dashboard-screenshot.png',
      '/images/projects/llm-advisor/spy-feature-importances.png',
      '/images/projects/llm-advisor/qqq-feature-importances.png',
      '/images/projects/llm-advisor/iwm-feature-importances.png',
    ],
    technologies: ['Python', 'Gemini API', 'Alpaca', 'Pandas', 'Backtesting'],
    proofPoints: [
      'Paper options on 7–14 DTE with MR/TC setup types',
      'Hybrid ML + LLM validation funnel',
      'Risk controls tied to execution rules'
    ],
    isInteractive: false,
    caseStudyUrl: '/projects/llm-advisor',
    liveUrl: 'https://llm-advisor.drewboynton.com',
    liveUrlLabel: 'Ops Dashboard',
  },
  {
    id: 'matchpoint',
    title: 'MatchPoint: AI Job Matcher 🎯',
    description:
      'AI job matcher: daily ingestion from 70 Greenhouse boards, two-stage embedding + LLM matching against your resume.',
    category: 'flagship',
    type: 'desktop',
    image: '/images/projects/matchpoint/dashboard-screenshot.png',
    images: [
      '/images/projects/matchpoint/dashboard-screenshot.png',
      '/images/projects/matchpoint/upload-flow.png',
      '/images/projects/matchpoint/match-detail.png',
      '/images/projects/matchpoint/architecture.png',
    ],
    technologies: ['React 19', 'FastAPI', 'OpenAI', 'Turso', 'Supabase', 'Vercel'],
    proofPoints: [
      '5,867 live jobs corpus refreshed daily',
      '8-dimension LLM fit scoring with grounded highlights',
      'Sub-10ms vector search via precomputed embedding matrix'
    ],
    isInteractive: false,
    caseStudyUrl: '/projects/matchpoint',
    liveUrl: 'https://matchpoint-web-gamma.vercel.app',
    liveUrlLabel: 'Try MatchPoint',
  },
  {
    id: 'nba-hof-predictor',
    title: 'NBA Hall of Fame Predictor 🏀',
    description:
      'Interactive machine learning model that estimates NBA players\' Hall of Fame chances from career production, peak impact, longevity, and award history. Features real-time player lookup and detailed prediction analysis using XGBoost trained on 5,250+ players since 1976. Try entering any NBA player name!',
    category: 'flagship',
    type: 'desktop',
    image: '/images/projects/nba-hof-top-20.png',
    images: [
      '/images/projects/nba-hof-top-20.png',
      '/images/projects/nba-hof-roc-curves.png',
      '/images/projects/nba-hof-career-ws.png',
      '/images/projects/nba-hof-hold-out-prob.png',
      '/images/projects/nba-hof-mvp-chart.png'
    ],
    technologies: ['Python', 'XGBoost', 'Next.js', 'TypeScript', 'Basketball Analytics'],
    proofPoints: [
      '5,250+ historical player careers',
      'Interactive probability search for any player',
      'Feature-level model reasoning on each prediction'
    ],
    isInteractive: true,
    caseStudyUrl: '/projects/nba-hof'
  },
  {
    id: 'personal-portfolio',
    title: 'My Personal Portfolio Website',
    description:
      'What started as a portfolio site grew into its own project - TypeScript and Next.js up front, Supabase and BigQuery underneath. Flagship projects use stats-screen laptop displays and link out to live ops dashboards; includes a Gemini chatbot (Vertex AI, RAG over this site\'s content).',
    category: 'flagship',
    type: 'desktop',
    image: '/images/projects/personal-portfolio-hero.png',
    images: ['/images/projects/personal-portfolio-hero.png'],
    technologies: ['TypeScript', 'Next.js', 'React', 'Tailwind', 'Supabase', 'BigQuery', 'Gemini / Vertex AI', 'RAG'],
    isInteractive: true,
    caseStudyUrl: '/projects/personal-portfolio',
    cardOnly: true
  },
  {
    id: 'mancala-ai',
    title: 'Mancala AI with Game Theory (Try to beat the AI!)',
    description:
      'Intelligent Mancala game implementing minimax algorithm with alpha-beta pruning optimization. The AI evaluates game states 5 moves ahead, achieving 70-80% win rate against random opponents with 10x performance improvement through pruning. Features Monte Carlo simulation analysis for strategic validation.',
    category: 'additional',
    type: 'desktop',
    image: '/images/projects/Mancala-Output.png',
    images: [
      '/images/projects/Mancala-Output.png',
      '/images/projects/Mancala-Workflow.JPG',
      '/images/projects/Mancala-4.JPG',
      '/images/projects/Mancala-1.JPG',
      '/images/projects/Mancala-2.JPG',
      '/images/projects/Mancala-3.JPG'
    ],
    technologies: ['Minimax Algorithm', 'Alpha-Beta Pruning', 'Game Theory'],
    isInteractive: true
  },
  {
    id: 'houseclusters',
    title: 'Advanced Data Cluster Sorting',
    description:
      'Project for my Advanced Data Science class. This project was a individual effort to sort data into clusters based on their similarity. We used a variety of data structures and algorithms to achieve this.',
    category: 'additional',
    type: 'desktop',
    image: '/images/projects/project3-1.JPG',
    images: ['/images/projects/project3-1.JPG', '/images/projects/project3-2.JPG'],
    technologies: ['Python', 'Pandas', 'Gaussian Mixture Models']
  },
  {
    id: 'project1',
    title: 'CU Boulder Police Department Heatmap',
    description:
      'A simple heatmap of the CU Boulder Police Department data and its most common location occurrences.',
    category: 'additional',
    type: 'desktop',
    image: '/images/projects/project1-1.JPG',
    images: ['/images/projects/project1-1.JPG', '/images/projects/project1-2.JPG'],
    technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS']
  },
  {
    id: 'simplefitness',
    title: 'Simple Fitness (Tracking App!)',
    description:
      'A native iOS app for tracking strength training and cardio workouts. Built with Swift and CoreData, this was a fun introduction to iOS development and its ecosystem compatibility. This was more a fun project just to learn more about iOS development and its language capabilities. ',
    category: 'additional',
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

const flagshipProjects = mockProjects.filter((project) => project.category === 'flagship')
const additionalProjects = mockProjects.filter((project) => project.category === 'additional')
const orderedProjects = [...flagshipProjects, ...additionalProjects]

export function WorkSection() {
  const observerRefs = useRef<(HTMLDivElement | null)[]>([])
  const { visibleProjectIds, observeProjectEl } = useVisibleProjects()
  const [isCarouselOpen, setIsCarouselOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const [nbaInput, setNbaInput] = useState('')
  const [nbaIsLoading, setNbaIsLoading] = useState(false)
  const [nbaCurrentPrediction, setNbaCurrentPrediction] = useState<PlayerPrediction | null>(null)
  const [nbaNoResults, setNbaNoResults] = useState(false)
  const [nbaSearchSuggestions, setNbaSearchSuggestions] = useState<string[]>([])
  const [nbaPredictions, setNbaPredictions] = useState<Record<string, PlayerPrediction>>({})
  const [nbaDataLoading, setNbaDataLoading] = useState(false)
  const nbaPredictionsLoadedRef = useRef(false)
  const nbaLoadPromiseRef = useRef<Promise<void> | null>(null)

  const ensureNbaPredictionsLoaded = useCallback(async () => {
    if (nbaPredictionsLoadedRef.current) return
    if (nbaLoadPromiseRef.current) {
      await nbaLoadPromiseRef.current
      return
    }
    const p = (async () => {
      setNbaDataLoading(true)
      try {
        const response = await fetch('/data/nba_hof_predictions.json')
        if (response.ok) {
          const data = await response.json()
          setNbaPredictions(data)
          nbaPredictionsLoadedRef.current = true
        }
      } catch (error) {
        console.error('Error loading NBA predictions:', error)
      } finally {
        setNbaDataLoading(false)
        nbaLoadPromiseRef.current = null
      }
    })()
    nbaLoadPromiseRef.current = p
    await p
  }, [])

  useEffect(() => {
    if (!visibleProjectIds.has('nba-hof-predictor')) return
    void ensureNbaPredictionsLoaded()
  }, [visibleProjectIds, ensureNbaPredictionsLoaded])

  useEffect(() => {
    const observer = new IntersectionObserver(
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

    observerRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      observerRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [])

  const handleImageClick = (project: Project) => {
    setSelectedProject(project)
    setIsCarouselOpen(true)
  }

  const getNbaSearchSuggestions = (query: string) => {
    if (!query.trim() || query.length < 2) {
      setNbaSearchSuggestions([])
      return
    }

    const normalizedQuery = query.toLowerCase().trim()
    const matches = Object.keys(nbaPredictions)
      .filter(
        (key) =>
          key.includes(normalizedQuery) || nbaPredictions[key].player.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 5)
      .map((key) => nbaPredictions[key].player)

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

    await ensureNbaPredictionsLoaded()

    await new Promise((resolve) => setTimeout(resolve, 800))

    const playerKey = searchQuery.toLowerCase().trim()
    let prediction = nbaPredictions[playerKey]

    if (!prediction) {
      const fuzzyMatch = Object.keys(nbaPredictions).find(
        (key) =>
          key.includes(playerKey) || nbaPredictions[key].player.toLowerCase().includes(playerKey)
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

  const renderStatsScreen = (project: Project) => (
    <Link
      href={project.caseStudyUrl!}
      aria-label={`View ${project.title} case study`}
      className="relative flex h-full w-full cursor-pointer items-center justify-center transition-transform hover:scale-[1.02] group"
    >
      <DevicePreview className={DESKTOP_DEVICE_PREVIEW_CLASS}>
        <DeviceFrameset device="MacBook Pro" color="silver">
          <div className="relative h-[800px] w-[1280px] overflow-hidden bg-background">
            <div className="absolute inset-[8px] overflow-hidden">
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes={PROJECT_IMAGE_SIZES}
                className="object-cover"
              />
            </div>
          </div>
          <div className="bottom-bar" />
        </DeviceFrameset>
      </DevicePreview>
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-background/10 opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  )

  const renderInteractivePlaceholder = (project: Project) => (
    <div
      className={`relative mx-auto w-full flex items-center justify-center ${
        project.type === 'desktop' ? 'h-[500px] mt-8' : 'h-[600px] flex items-center justify-center'
      }`}
    >
      <button
        type="button"
        onClick={() => handleImageClick(project)}
        className="relative h-full w-full max-w-3xl rounded-xl border border-border/60 bg-muted/10 transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes={PROJECT_IMAGE_SIZES}
          className="object-contain p-6"
        />
        <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow">
          Scroll to load interactive demo
        </span>
      </button>
    </div>
  )

  return (
    <>
      <section id="work-detail" className="min-h-screen bg-background-alt py-24 pt-12 md:pt-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="space-y-64">
            {orderedProjects.map((project, index) => (
              <div
                key={project.id}
                ref={(el) => {
                  observerRefs.current[index] = el
                  observeProjectEl(project.id, el)
                }}
                className="opacity-0 translate-y-10 transition-all duration-1000 ease-out"
              >
                {index === 0 && (
                  <div className="mb-12">
                    <h3 className="text-2xl md:text-3xl font-semibold text-foreground">Flagship Systems</h3>
                    <p className="text-muted-foreground mt-2">
                      End-to-end systems with measurable outcomes, live interfaces, and automated data pipelines.
                    </p>
                  </div>
                )}
                {index === flagshipProjects.length && (
                  <div className="mb-12 border-t border-border pt-12">
                    <h3 className="text-2xl md:text-3xl font-semibold text-foreground">Additional Projects</h3>
                    <p className="text-muted-foreground mt-2">
                      Smaller builds and experiments that highlight breadth across data science, frontend, and algorithmic thinking.
                    </p>
                  </div>
                )}
                <div
                  className={`grid grid-cols-1 gap-16 ${project.type === 'desktop' ? '' : 'md:grid-cols-2 md:items-center'}`}
                >
                  <div className="relative rounded-xl p-[2px] bg-gradient-to-r from-accent/80 via-accent/60 to-accent/80 shadow-[0_0_25px_rgba(0,0,0,0.25)] hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-shadow">
                    <div className={`bg-background-emphasis p-12 rounded-xl relative overflow-hidden group`}>
                      <BorderBeam
                        colorFrom="hsl(var(--accent))"
                        colorTo="hsl(var(--accent))"
                        duration={4}
                        size={100}
                        borderWidth={1}
                      />
                      <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-foreground mb-6">{project.title}</h3>
                        <p className="text-muted-foreground mb-8">{project.description}</p>
                        {project.proofPoints && project.proofPoints.length > 0 && (
                          <ul className="space-y-2 mb-8 text-sm text-foreground/85">
                            {project.proofPoints.map((point) => (
                              <li key={point} className="flex items-start gap-2">
                                <span className="text-accent mt-[2px]">-</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <ProjectActionButtons
                          caseStudyUrl={project.caseStudyUrl}
                          liveUrl={project.liveUrl}
                          liveUrlLabel={project.liveUrlLabel}
                          className="mb-8"
                        />

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
                      </div>
                    </div>
                  </div>

                  {!project.cardOnly && (
                  <div
                    className={`relative mx-auto w-full flex items-center justify-center ${
                      project.type === 'desktop' ? 'h-[500px] mt-8' : 'h-[600px] flex items-center justify-center'
                    }`}
                  >
                    {project.isInteractive && project.id === 'mancala-ai' ? (
                      visibleProjectIds.has('mancala-ai') ? (
                        <DevicePreview className={DESKTOP_DEVICE_PREVIEW_CLASS}>
                          <DeviceFrameset device="MacBook Pro" color="silver">
                            <div className="relative w-[1280px] h-[800px] bg-background flex items-center justify-center">
                              <MancalaGame />
                            </div>
                            <div className="bottom-bar" />
                          </DeviceFrameset>
                        </DevicePreview>
                      ) : (
                        renderInteractivePlaceholder(project)
                      )
                    ) : project.isInteractive && project.id === 'nba-hof-predictor' ? (
                      visibleProjectIds.has('nba-hof-predictor') ? (
                        <div
                          onClick={() => handleImageClick(project)}
                          className="relative cursor-pointer transition-transform hover:scale-[1.02] flex items-center justify-center w-full h-full group"
                        >
                          <DevicePreview className={DESKTOP_DEVICE_PREVIEW_CLASS}>
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
                          </DevicePreview>
                          <div className="pointer-events-none absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                        </div>
                      ) : (
                        renderInteractivePlaceholder(project)
                      )
                    ) : STATS_SCREEN_PROJECT_IDS.has(project.id) ? (
                      visibleProjectIds.has(project.id) ? (
                        renderStatsScreen(project)
                      ) : (
                        renderInteractivePlaceholder(project)
                      )
                    ) : (
                      <div
                        onClick={() => handleImageClick(project)}
                        className="relative cursor-pointer transition-transform hover:scale-[1.02] flex items-center justify-center w-full h-full group"
                      >
                        {project.type === 'mobile' ? (
                          <DevicePreview className={MOBILE_DEVICE_PREVIEW_CLASS}>
                            <DeviceFrameset device="iPhone X" color="black" landscape={false}>
                              <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                sizes={PROJECT_IMAGE_SIZES}
                                className="object-contain"
                              />
                            </DeviceFrameset>
                          </DevicePreview>
                        ) : (
                          <DevicePreview className={DESKTOP_DEVICE_PREVIEW_CLASS}>
                            <DeviceFrameset device="MacBook Pro" color="silver">
                              <div className="relative w-[1280px] h-[800px] bg-background">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Image
                                    src={project.image}
                                    alt={project.title}
                                    fill
                                    sizes={PROJECT_IMAGE_SIZES}
                                    className="object-contain"
                                    style={{ padding: '2px' }}
                                  />
                                </div>
                              </div>
                              <div className="bottom-bar" />
                            </DeviceFrameset>
                          </DevicePreview>
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                      </div>
                    )}
                  </div>
                  )}

                  {project.isInteractive && project.id === 'nba-hof-predictor' && (
                    <div className="mt-8 relative max-w-2xl mx-auto">
                      {nbaSearchSuggestions.length > 0 && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-background border border-border rounded-lg shadow-lg max-h-32 overflow-y-auto z-10">
                          {nbaSearchSuggestions.map((suggestion, suggestionIndex) => (
                            <button
                              key={suggestionIndex}
                              type="button"
                              onClick={() => handleNbaSubmit(suggestion)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors border-b border-border last:border-b-0"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}

                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          void handleNbaSubmit()
                        }}
                        className="flex gap-3"
                      >
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            value={nbaInput}
                            onChange={handleNbaInputChange}
                            placeholder="Enter NBA player name (e.g., LeBron James, Michael Jordan)..."
                            className="pl-9 h-12 text-base"
                            disabled={nbaIsLoading || nbaDataLoading}
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={!nbaInput.trim() || nbaIsLoading || nbaDataLoading}
                          size="lg"
                          className="h-12 px-6"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Predict
                        </Button>
                      </form>

                      <p className="text-center text-sm text-muted-foreground mt-3">
                        {nbaDataLoading && Object.keys(nbaPredictions).length === 0
                          ? 'Loading player dataset…'
                          : 'Search from 5,250+ NBA players • Click the screen above to see behind-the-scenes'}
                      </p>
                    </div>
                  )}

                  {STATS_SCREEN_PROJECT_IDS.has(project.id) && (
                    <div className="mt-8 relative max-w-2xl mx-auto text-center">
                      <p className="text-center text-sm text-muted-foreground">
                        {project.id === 'sports-edge' &&
                          'Telemetry stats on the laptop — click through for the pipeline story or open the ops dashboard for live predictions.'}
                        {project.id === 'llm-advisor' &&
                          'Paper-trading ops dashboard at llm-advisor.drewboynton.com — click the laptop for the deep dive.'}
                        {project.id === 'matchpoint' &&
                          'Click the laptop for architecture and matching details, or try the live app.'}
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
