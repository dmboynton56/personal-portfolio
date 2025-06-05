'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface LogoProps {
  size?: number
  className?: string
  onClick?: () => void
  clickable?: boolean
  alwaysWhite?: boolean
}

export function Logo({ size = 32, className = '', onClick, clickable = false, alwaysWhite = false }: LogoProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (clickable) {
      scrollToTop()
    }
  }

  if (!mounted) {
    return (
      <div 
        className={`inline-block ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  // Use white version if alwaysWhite is true, otherwise switch based on theme
  const logoSrc = alwaysWhite 
    ? '/images/general/newicon.png' 
    : (theme === 'dark' ? '/images/general/newicon.png' : '/images/general/newicon_dark.png')

  return (
    <div
      className={`inline-flex items-center justify-center ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      onClick={clickable ? handleClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      } : undefined}
    >
      <Image
        src={logoSrc}
        alt="Drew Boynton Logo"
        width={size}
        height={size}
        className="rounded-sm"
      />
    </div>
  )
} 