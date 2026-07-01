import { ArrowRight, ExternalLink, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ProjectActionButtonsProps = {
  caseStudyUrl?: string
  liveUrl?: string
  liveUrlLabel?: string
  repoUrl?: string
  className?: string
  deepDiveLabel?: string
  onLiveClick?: () => void
  onRepoClick?: () => void
}

function LiveIndicator() {
  return (
    <span className="relative mr-2 flex h-2.5 w-2.5 shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-90" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
    </span>
  )
}

const deepDiveClasses =
  'h-12 border-0 bg-gradient-to-r from-cyan-500 to-blue-600 px-6 font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.45),0_0_40px_rgba(59,130,246,0.25)] transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_28px_rgba(34,211,238,0.65),0_0_50px_rgba(59,130,246,0.35)]'

const liveLinkClasses =
  'h-12 border-2 border-emerald-500 bg-emerald-50 px-6 font-semibold text-emerald-800 shadow-[0_0_16px_rgba(52,211,153,0.35)] transition-all hover:border-emerald-600 hover:bg-emerald-100 hover:shadow-[0_0_24px_rgba(52,211,153,0.5)] dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-300 dark:shadow-[0_0_20px_rgba(52,211,153,0.4),inset_0_0_12px_rgba(52,211,153,0.08)] dark:hover:border-emerald-300 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-200 dark:hover:shadow-[0_0_28px_rgba(52,211,153,0.55),inset_0_0_16px_rgba(52,211,153,0.12)]'

export function ProjectActionButtons({
  caseStudyUrl,
  liveUrl,
  liveUrlLabel = 'View Live',
  repoUrl,
  className,
  deepDiveLabel = 'View Deep Dive',
  onLiveClick,
  onRepoClick,
}: ProjectActionButtonsProps) {
  if (!caseStudyUrl && !liveUrl && !repoUrl) return null

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {caseStudyUrl && (
        <Button asChild size="lg" className={deepDiveClasses}>
          <a href={caseStudyUrl} className="flex items-center">
            {deepDiveLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      )}
      {liveUrl && (
        <Button asChild size="lg" variant="outline" className={liveLinkClasses}>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
            onClick={onLiveClick}
          >
            <LiveIndicator />
            <ExternalLink className="mr-2 h-4 w-4" />
            {liveUrlLabel}
          </a>
        </Button>
      )}
      {repoUrl && (
        <Button
          asChild
          size="lg"
          variant="outline"
          className="h-12 border-2 border-border px-6 font-semibold hover:bg-secondary/50"
        >
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
            onClick={onRepoClick}
          >
            <Github className="mr-2 h-4 w-4" />
            View Code
          </a>
        </Button>
      )}
    </div>
  )
}
