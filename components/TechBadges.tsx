'use client'

import {
  SiPython,
  SiTypescript,
  SiNextdotjs,
  SiReact,
  SiSupabase,
  SiGooglebigquery,
  SiGooglegemini,
  SiTailwindcss,
} from 'react-icons/si'

const technologies = [
  { name: 'Python', icon: SiPython, color: '#FFD43B', glow: 'rgba(255, 212, 59, 0.35)' },
  { name: 'TypeScript', icon: SiTypescript, color: '#3178C6', glow: 'rgba(49, 120, 198, 0.35)' },
  { name: 'Next.js', icon: SiNextdotjs, color: '#e4e4e7', glow: 'rgba(228, 228, 231, 0.25)' },
  { name: 'React', icon: SiReact, color: '#61DAFB', glow: 'rgba(97, 218, 251, 0.35)' },
  { name: 'Supabase', icon: SiSupabase, color: '#3ECF8E', glow: 'rgba(62, 207, 142, 0.35)' },
  { name: 'BigQuery', icon: SiGooglebigquery, color: '#669DF6', glow: 'rgba(102, 157, 246, 0.35)' },
  { name: 'Gemini', icon: SiGooglegemini, color: '#8E75B2', glow: 'rgba(142, 117, 178, 0.35)' },
  { name: 'Tailwind', icon: SiTailwindcss, color: '#06B6D4', glow: 'rgba(6, 182, 212, 0.35)' },
]

export function TechBadges() {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2 md:gap-3">
      {technologies.map(({ name, icon: Icon, color, glow }) => (
        <div
          key={name}
          className="group flex items-center gap-2 rounded-full border bg-background/50 px-3 py-1.5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03]"
          style={{
            borderColor: `${color}55`,
            boxShadow: `0 0 14px ${glow}`,
          }}
        >
          <Icon
            className="h-4 w-4 transition-colors duration-300"
            style={{ color: `${color}cc` }}
            aria-hidden
          />
          <span
            className="text-xs font-medium transition-colors duration-300 group-hover:text-foreground"
            style={{ color: `${color}ee` }}
          >
            {name}
          </span>
        </div>
      ))}
    </div>
  )
}
