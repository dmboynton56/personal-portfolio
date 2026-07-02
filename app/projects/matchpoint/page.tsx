'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ProjectLayout } from '@/components/ProjectLayout'
import { ProjectChat } from '@/components/chat/ProjectChat'
import { MatchPointStatsScreen } from '@/components/project-stats/MatchPointStatsScreen'
import {
  ArrowUpRight,
  Brain,
  Database,
  GitBranch,
  Layers,
  Search,
  Upload,
  Workflow,
} from 'lucide-react'
import { useProjectMetrics } from '@/hooks/useProjectMetrics'

const FIT_DIMENSIONS = [
  { dimension: 'Skills overlap', weight: '25%' },
  { dimension: 'Experience fit', weight: '18%' },
  { dimension: 'Role alignment', weight: '17%' },
  { dimension: 'Seniority match', weight: '10%' },
  { dimension: 'Location', weight: '10%' },
  { dimension: 'Compensation', weight: '7.5%' },
  { dimension: 'Preferences', weight: '7.5%' },
  { dimension: 'Interview likelihood', weight: '5%' },
]

export default function MatchPointPage() {
  const { metrics, isLoading, error } = useProjectMetrics('matchpoint')

  return (
    <ProjectLayout
      title="MatchPoint"
      description="AI job matcher that ingests 5,867 live roles from 70 Greenhouse boards, retrieves candidates with a precomputed embedding matrix, then scores fit with structured LLM output grounded in job facts."
      tags={['React 19', 'FastAPI', 'OpenAI', 'Turso', 'Supabase', 'Vercel']}
      repoUrl="https://github.com/dmboynton56/matchpoint"
      liveUrl="https://matchpoint-web-gamma.vercel.app"
      liveUrlLabel="Try MatchPoint"
      metrics={metrics?.metrics}
      metricsSource={metrics?.source}
      metricsGeneratedAt={metrics?.generatedAt}
      isLoadingMetrics={isLoading}
      metricsError={error}
      belowHero={
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Ask the Data</h2>
          <p className="text-lg text-muted-foreground">
            This assistant answers from MatchPoint documentation on this site: ingestion cadence, the
            two-stage matcher, split-database design, and resume pipeline.
          </p>
          <ProjectChat scope="matchpoint" />
        </section>
      }
      heroImage={
        <div className="relative h-full w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
          <div className="absolute inset-0 scale-[0.55] origin-top-left">
            <div className="relative h-[800px] w-[1280px]">
              <MatchPointStatsScreen />
            </div>
          </div>
        </div>
      }
    >
      <section className="space-y-6">
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-6">
          <h2 className="text-2xl font-bold mb-3">Live product</h2>
          <p className="text-muted-foreground mb-4">
            Upload a resume, get ranked matches with grounded highlights, and explore fit signals across
            eight weighted dimensions. Anonymous visitors see a 3-match preview before signup.
          </p>
          <Link
            href="https://matchpoint-web-gamma.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-400"
          >
            Try MatchPoint
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Split-database design</h2>
        <p className="text-lg text-muted-foreground">
          Jobs live in Turso (libSQL) for fast vector retrieval at scale. User state — profiles, matches,
          saved jobs, resume storage — lives in MatchPoint&apos;s own Supabase project with RLS. The FK
          between job matches and the Turso corpus was dropped intentionally; orphaned matches hydrate
          from Turso at read time.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <Database className="h-6 w-6 text-indigo-400" />
            <h3 className="font-semibold">Turso jobs corpus</h3>
            <p className="text-sm text-muted-foreground">
              Up to 5,867 live jobs from 70 Greenhouse boards. HTML stripped, embedded with OpenAI{' '}
              <code className="rounded bg-muted px-1 text-xs">text-embedding-3-small</code> (1536-dim).
              Jobs unseen for 7 days are purged.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <Layers className="h-6 w-6 text-emerald-400" />
            <h3 className="font-semibold">Supabase user state</h3>
            <p className="text-sm text-muted-foreground">
              Auth, profiles, <code className="rounded bg-muted px-1 text-xs">job_matches</code>, resume
              storage bucket, and pgvector resume embeddings on{' '}
              <code className="rounded bg-muted px-1 text-xs">profiles.resume_embedding</code>.
            </p>
          </div>
        </div>
        <div className="relative aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-zinc-950">
          <Image
            src="/images/projects/matchpoint/architecture.png"
            alt="MatchPoint system architecture: Greenhouse ingestion, Turso jobs corpus, FastAPI matching, Supabase user state, React SPA"
            fill
            className="object-contain p-4"
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Two-stage matching</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <Search className="h-6 w-6 text-cyan-400" />
            <h3 className="text-xl font-semibold">1. Vector retrieval</h3>
            <p className="text-muted-foreground">
              Resume embedding queries a precomputed L2-normalized NumPy matrix (~33 MB) published to a{' '}
              <code className="rounded bg-muted px-1 text-xs">data-cache</code> git branch for warm
              sub-10ms search on Vercel serverless. Top 10 candidates for signed-in users; top 3 for
              anonymous visitors.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <Brain className="h-6 w-6 text-purple-400" />
            <h3 className="text-xl font-semibold">2. LLM scoring</h3>
            <p className="text-muted-foreground">
              <code className="rounded bg-muted px-1 text-xs">gpt-5.4-nano</code> structured output scores
              each candidate across eight fit dimensions, producing a weighted{' '}
              <code className="rounded bg-muted px-1 text-xs">match_score</code>, exactly three grounded
              highlights with citation quotes, and optional warnings.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Fit dimension</th>
                <th className="px-4 py-3 text-right font-semibold">Weight</th>
              </tr>
            </thead>
            <tbody>
              {FIT_DIMENSIONS.map((row) => (
                <tr key={row.dimension} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3">{row.dimension}</td>
                  <td className="px-4 py-3 text-right font-mono">{row.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Resume pipeline</h2>
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="flex flex-col gap-4">
            <div className="space-y-2 rounded-xl border border-border bg-card p-5">
              <Upload className="h-5 w-5 text-amber-400" />
              <h3 className="font-semibold">Upload → extract → embed</h3>
              <p className="text-sm text-muted-foreground">
                PDF upload → pypdf text extraction → embedding stored on{' '}
                <code className="rounded bg-muted px-1 text-xs">profiles.resume_embedding</code>.
              </p>
            </div>
            <div className="space-y-2 rounded-xl border border-border bg-card p-5">
              <Workflow className="h-5 w-5 text-emerald-400" />
              <h3 className="font-semibold">Match persistence</h3>
              <p className="text-sm text-muted-foreground">
                Matches persisted via a{' '}
                <code className="rounded bg-muted px-1 text-xs">replace_job_matches</code> RPC. Extras:
                resume skill suggestions and an LLM bullet coach on{' '}
                <code className="rounded bg-muted px-1 text-xs">gpt-4o-mini</code>.
              </p>
            </div>
          </div>
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-zinc-950">
            <Image
              src="/images/projects/matchpoint/upload-flow.png"
              alt="MatchPoint resume upload dropzone and preferences"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Daily ingestion</h2>
        <p className="text-lg text-muted-foreground">
          GitHub Actions runs daily at 10:00 UTC: scrape up to 100 jobs per board across 70 Greenhouse
          companies (Stripe, Airbnb, Anthropic, Databricks, GitLab, …), embed new/changed rows, upsert
          to Turso, purge stale jobs, and force-push the embedding matrix to the{' '}
          <code className="rounded bg-muted px-1 text-xs">data-cache</code> branch.
        </p>
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 text-sm">
          <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-950 px-4 py-2">
            <GitBranch className="h-4 w-4 text-zinc-500" />
            <span className="font-mono text-xs text-zinc-500">.github/workflows/daily-pipeline.yml</span>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-zinc-300">
            {`schedule:
  - cron: "0 10 * * *"  # 10:00 UTC daily

steps:
  - scrape 70 Greenhouse boards (≤100 jobs each)
  - strip HTML, embed with text-embedding-3-small
  - upsert to Turso jobs table
  - purge jobs unseen for 7 days
  - publish L2-normalized embedding matrix → data-cache branch`}
          </pre>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Grounded output</h2>
        <p className="text-lg text-muted-foreground">
          Every highlight cites a verbatim quote from the job posting. The scorer receives structured job
          facts (title, requirements, location, comp when available) and must not invent qualifications.
          Warnings surface mismatches (seniority gap, location conflict, missing must-have skills).
        </p>
        <div className="relative aspect-[16/10] w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-zinc-950">
          <Image
            src="/images/projects/matchpoint/match-detail.png"
            alt="MatchPoint match card with fit signals, highlights, and warnings"
            fill
            className="object-contain"
          />
        </div>
      </section>
    </ProjectLayout>
  )
}
