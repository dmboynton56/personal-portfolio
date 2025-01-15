'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { NavigationOverlay } from './NavigationOverlay'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './ui/button'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div className="absolute inset-0 bg-background/75 backdrop-blur-md border-b border-border/40" />
      <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="text-foreground hover:text-foreground/80 transition-colors"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </div>
      <NavigationOverlay isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </header>
  )
}

