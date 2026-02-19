'use client'

import { useState, type MouseEvent } from 'react'
import SportsEdgeCard from './SportsEdgeCard'
import { ProjectCarousel } from './ProjectCarousel'
import { ImageIcon } from 'lucide-react'

export function SportsEdgeDisplay() {
  const [showCarousel, setShowCarousel] = useState(false)

  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  const images = [
    '/images/projects/sports-edge/sports-edge-week-outputs.png',
    '/images/projects/sports-edge/model_spreads_vs_book.png',
    '/images/projects/sports-edge/sports_edge_model_predictions_shap.png',
    '/images/projects/sports-edge/sports_edge_model_predictions_shap_bars.png',
  ]

  return (
    <div 
      className="h-full bg-background p-4 overflow-y-auto" 
      onClick={stopPropagation} 
      onMouseDown={stopPropagation}
      style={{ overscrollBehavior: 'contain' }}
    >
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">🏈⚽ Sports Edge Analysis</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Model predictions vs sportsbook lines
          </p>
          <button
            onClick={() => setShowCarousel(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            View Model Visuals
          </button>
        </div>

        {/* Sports Edge Card */}
        <div className="flex-1 min-h-0">
          <SportsEdgeCard />
        </div>
      </div>

      {showCarousel && (
        <ProjectCarousel
          images={images}
          onClose={() => setShowCarousel(false)}
          projectType="desktop"
        />
      )}
    </div>
  )
}
