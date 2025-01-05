'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { NavigationOverlay } from './NavigationOverlay'

export function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-white shadow-sm">
        <div className="text-xl font-bold text-neutral-900">YourName</div>
        <Button variant="ghost" size="icon" onClick={() => setIsNavOpen(true)}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Menu</span>
        </Button>
      </header>
      <NavigationOverlay isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
    </>
  )
}

