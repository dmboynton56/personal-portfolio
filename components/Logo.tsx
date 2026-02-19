'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

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
  const router = useRouter()
  const pathname = usePathname()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick()
    } else if (clickable) {
      if (pathname === '/') {
        // If we're already on home, just scroll to top
        e.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        // If we're on a deep dive or other page, go back to home
        router.push('/')
      }
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

  const logoContent = (
    <Image
      src={logoSrc}
      alt="Drew Boynton Logo"
      width={size}
      height={size}
      className="rounded-sm"
    />
  )

  if (clickable) {
    return (
      <Link
        href="/"
        className={`inline-flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity ${className}`}
        onClick={handleClick as any}
        role="button"
        aria-label="Go to home page"
      >
        {logoContent}
      </Link>
    )
  }

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
    >
      {logoContent}
    </div>
  )
}
