'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { Search, Send } from 'lucide-react'
import { ProjectCarousel } from './ProjectCarousel'
import { DeviceFrameset } from 'react-device-frameset'
import '@/styles/device-frames.css'
import { BorderBeam } from '@/components/ui/border-beam'
import { NBAHofDisplay } from './NBAHofDisplay'
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
    image: '/images/projects/project1-1.JPG', // Placeholder for behind-the-scenes
    images: [
      '/images/projects/project1-1.JPG', // Model training process
      '/images/projects/project3-1.JPG', // Data analysis
      '/images/projects/project3-2.JPG'  // Feature importance
    ],
    technologies: ['Python', 'XGBoost', 'Next.js', 'TypeScript', 'Basketball Analytics'],
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
    title: 'E-commerce Dashboard',
    description: 'A comprehensive dashboard for managing online stores, featuring real-time analytics, inventory management, and customer insights. Built with a focus on usability and performance.',
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
    description: 'A simple fitness tracking app for logging strength training and cardio workouts. Built natively on iOS, which makes this my actual go to app for tracking my workouts.',
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
              <div className={`grid grid-cols-1 gap-16 ${
                project.type === 'desktop' 
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
                      <div className="flex flex-wrap gap-2">
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

                <div
                  className={`relative mx-auto w-full ${
                    project.type === 'desktop'
                      ? 'h-[500px] mt-8'
                      : 'h-[600px] flex items-center justify-center'
                  }`}
                >
                  {project.isInteractive && project.id === 'nba-hof-predictor' ? (
                    // Interactive NBA Predictor
                    <div className="w-full h-full flex items-center justify-center">
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
                      <div className="absolute inset-0 bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
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
              </div>
            </div>
          ))}
        </div>
      </div>

      {isCarouselOpen && selectedProject && (
        <ProjectCarousel
          images={selectedProject.images || [selectedProject.image]}
          projectType={selectedProject.type}
          onClose={() => {
            setIsCarouselOpen(false)
            setSelectedProject(null)
          }}
        />
      )}
    </section>
  )
}

