'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'

export type StatChip = {
  label: string
  value: string
  accent?: string
}

type StatsScreenDisplayProps = {
  stats: StatChip[]
  accentColor?: string
  backgroundImage?: string
  asOf?: string
  projectLabel?: string
}

const CHIP_SLOTS: Array<{ top: string; left?: string; right?: string }> = [
  { top: '10%', left: '6%' },
  { top: '14%', right: '8%' },
  { top: '38%', left: '4%' },
  { top: '42%', right: '5%' },
  { top: '66%', left: '10%' },
  { top: '70%', right: '12%' },
  { top: '28%', left: '38%' },
  { top: '52%', right: '36%' },
]

export function StatsScreenDisplay({
  stats,
  accentColor = '#22d3ee',
  backgroundImage,
  asOf,
  projectLabel,
}: StatsScreenDisplayProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="relative h-full w-full overflow-hidden bg-zinc-950">
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt=""
          fill
          className="object-cover opacity-20"
          sizes="1280px"
          priority={false}
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 15% 20%, ${accentColor}22, transparent 35%),
            radial-gradient(circle at 85% 75%, ${accentColor}18, transparent 38%),
            linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)
          `,
        }}
      />

      <div className="absolute inset-0 opacity-25">
        <div className="grid h-full w-full grid-cols-12 grid-rows-8 gap-3 p-10">
          {Array.from({ length: 48 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-white/[0.06] bg-white/[0.02]" />
          ))}
        </div>
      </div>

      {projectLabel && (
        <div className="absolute left-8 top-8 z-20">
          <span
            className="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ borderColor: `${accentColor}55`, color: accentColor }}
          >
            {projectLabel}
          </span>
        </div>
      )}

      {stats.map((stat, index) => {
        const slot = CHIP_SLOTS[index % CHIP_SLOTS.length]
        const chipAccent = stat.accent ?? accentColor

        return (
          <motion.div
            key={`${stat.label}-${index}`}
            className="absolute z-10 min-w-[140px] max-w-[220px] rounded-2xl border border-white/10 bg-black/55 px-4 py-3 shadow-xl backdrop-blur-md"
            style={{
              top: slot.top,
              left: slot.left,
              right: slot.right,
            }}
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
            animate={
              reduceMotion
                ? { opacity: 1, y: 0, scale: 1 }
                : {
                    opacity: 1,
                    y: [0, -4, 0],
                    scale: 1,
                  }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    opacity: { delay: index * 0.08, duration: 0.45 },
                    y: {
                      delay: index * 0.08 + 0.45,
                      duration: 4 + (index % 3),
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                    scale: { delay: index * 0.08, duration: 0.45 },
                  }
            }
          >
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
              {stat.label}
            </div>
            <div
              className="text-xl font-bold leading-tight text-white md:text-2xl"
              style={{ color: chipAccent }}
            >
              {stat.value}
            </div>
          </motion.div>
        )
      })}

      {asOf && (
        <div className="absolute bottom-6 right-8 z-20 text-xs text-zinc-500">As of {asOf}</div>
      )}
    </div>
  )
}
