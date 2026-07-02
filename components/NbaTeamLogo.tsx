'use client'

import type { ComponentType } from 'react'
import dynamic from 'next/dynamic'
import clsx from 'clsx'
import { getNbaTeamMeta } from '@/lib/nbaTeams'

type LogoComponent = ComponentType<{ size?: number | string }>

// react-nba-logos bundles every team SVG. Loading it lazily keeps it out of
// the page's first-load JS; the placeholder renders until it arrives.
const LazyNbaLogo = dynamic(
  () =>
    import('react-nba-logos').then((mod) => {
      const LOGO_MAP = mod as unknown as Record<string, LogoComponent>
      function Logo({ code, size }: { code: string; size?: number | string }) {
        const LogoComponent = LOGO_MAP[code]
        return LogoComponent ? <LogoComponent size={size} /> : null
      }
      return Logo
    }),
  { ssr: false, loading: () => null }
)

type Props = {
  team: string
  size?: number
  className?: string
}

export function NbaTeamLogo({ team, size = 32, className }: Props) {
  const meta = getNbaTeamMeta(team)

  if (!meta) {
    return (
      <div
        className={clsx(
          'flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[10px] font-semibold uppercase text-foreground',
          className
        )}
      >
        {(team ?? '?').slice(0, 3)}
      </div>
    )
  }

  return (
    <div
      className={clsx('flex items-center justify-center', className)}
      style={{ minWidth: size, minHeight: size }}
    >
      <LazyNbaLogo code={meta.code} size={size} />
    </div>
  )
}
