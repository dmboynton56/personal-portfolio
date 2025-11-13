'use client'

import type { ComponentType } from 'react'
import * as NFLIcons from 'react-nfl-logos'
import clsx from 'clsx'
import { getTeamMeta } from '@/lib/nflTeams'

type LogoComponent = ComponentType<{ size?: number | string }>

const LOGO_MAP = NFLIcons as Record<string, LogoComponent>

type Props = {
  team: string
  size?: number
  className?: string
}

export function NflTeamLogo({ team, size = 32, className }: Props) {
  const meta = getTeamMeta(team)
  const LogoComponent = meta ? LOGO_MAP[meta.code] : null

  if (!LogoComponent) {
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
    <div className={clsx('flex items-center justify-center', className)}>
      <LogoComponent size={size} />
    </div>
  )
}
