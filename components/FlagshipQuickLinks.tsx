import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { flagshipProjectLinks } from '@/lib/flagshipProjects'

export function FlagshipQuickLinks() {
  return (
    <section
      id="work"
      aria-label="Selected work"
      className="border-t border-border/40 bg-background-alt py-16 md:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <h2 className="mb-10 text-3xl font-bold text-foreground md:text-4xl">
          Selected Work
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
          {flagshipProjectLinks.map((project) => (
            <Link
              key={project.id}
              href={project.caseStudyUrl}
              className="group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-md transition-all hover:-translate-y-0.5 hover:border-cyan-500/40 hover:shadow-[0_0_24px_rgba(34,211,238,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900/80">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 380px"
                  className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border/50 px-4 py-3.5">
                <span className="text-sm font-semibold text-foreground md:text-base">
                  {project.shortTitle}
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-cyan-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
