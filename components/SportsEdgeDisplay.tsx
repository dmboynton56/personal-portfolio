'use client'

import type { MouseEvent } from 'react'
import SportsEdgeCard from './SportsEdgeCard'

export function SportsEdgeDisplay() {
  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  return (
    <div className="h-full bg-background p-4 overflow-y-auto" onClick={stopPropagation} onMouseDown={stopPropagation}>
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">🏈⚽ Sports Edge Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Model predictions vs sportsbook lines
          </p>
        </div>

        {/* Sports Edge Card */}
        <div className="flex-1">
          <SportsEdgeCard />
        </div>
      </div>
    </div>
  )
}

