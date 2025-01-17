'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface NavigationOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function NavigationOverlay({ isOpen, onClose }: NavigationOverlayProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      onClose()
    }
  }

  const menuItems = [
    { name: 'Home', id: 'profile' },
    { name: 'About', id: 'about' },
    { name: 'Work', id: 'work' },
    { name: 'Contact', id: 'contact' },
  ]

  const socialLinks = [
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/drew-boynton-1bba16180/' },
    { name: 'GitHub', href: 'https://github.com/dmboynton56' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed inset-0 z-50 flex items-center ${
            isMobile ? 'justify-center' : 'justify-end'
          } bg-background/80 backdrop-blur-sm`}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className={`h-full bg-card ${
              isMobile ? 'w-full' : 'w-[25%] min-w-[300px] max-w-[55%]'
            } p-8 flex flex-col`}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={onClose}
            >
              <X className="h-6 w-6 text-foreground" />
              <span className="sr-only">Close</span>
            </Button>

            <nav className="flex-grow mt-16">
              <ul className="space-y-8">
                {menuItems.map((item, index) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className="text-3xl font-bold text-foreground hover:text-foreground/80 transition-colors"
                    >
                      {item.name}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="mt-auto">
              <div className="h-px bg-border mb-6" />
              <ul className="flex space-x-4">
                {socialLinks.map((link, index) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

