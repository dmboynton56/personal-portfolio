'use client'

import React from 'react'
import { ProjectLayout } from '@/components/ProjectLayout'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { getScopeUICopy } from '@/components/chat/scope-copy'
import {
    Activity,
    Database,
    Cpu,
    Cloud,
    BrainCircuit,
    Workflow,
    GitCommit,
    Wrench,
} from 'lucide-react'
import { useProjectMetrics } from '@/hooks/useProjectMetrics'
import { ChangelogList } from '@/components/personal-portfolio/ChangelogListClient'

export default function PersonalPortfolioPage() {
    const { metrics, isLoading, error } = useProjectMetrics('personal-portfolio')
    const chatCopy = getScopeUICopy('default')

    return (
        <ProjectLayout
            title="My Personal Portfolio Website"
            description="The site you're reading this on, treated as a system. Next.js front end, Supabase and BigQuery as a data spine, a Gemini chatbot grounded on the site's own content, and a project_metrics table that makes the whole thing observable."
            tags={['TypeScript', 'Next.js', 'React', 'Tailwind', 'Supabase', 'BigQuery', 'Gemini / Vertex AI', 'RAG']}
            repoUrl="https://github.com/dmboynton56/personal-portfolio"
            liveUrl="/"
            metrics={metrics?.metrics}
            metricsSource={metrics?.source}
            metricsGeneratedAt={metrics?.generatedAt}
            isLoadingMetrics={isLoading}
            metricsError={error}
            belowHero={
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold">Ask the Site</h2>
                    <p className="text-lg text-muted-foreground">
                        The same chatbot that powers the rest of the portfolio is available here.
                        It is grounded on the site's own content (RAG), so you can ask about the
                        stack, the data sources, or the project you're currently reading about.
                    </p>
                    <div className="rounded-xl border border-border bg-card p-4 md:p-6">
                        <ChatPanel
                            scope="default"
                            variant="inline"
                            title={chatCopy.title}
                            subtitle={chatCopy.subtitle}
                            welcomeMessage={chatCopy.welcomeMessage}
                            placeholder={chatCopy.placeholder}
                            showHeader
                        />
                    </div>
                </section>
            }
        >
            {/* Section A — What you're looking at */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold">What You're Looking At</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    This page is part of a Next.js 15 application deployed as a static export
                    with selective ISR. It serves as the public surface for everything else I
                    build: Sports Edge feeds the live betting cards, LLM Advisor feeds the
                    trading snapshots, and a Gemini-backed chatbot answers questions grounded
                    on the site's own content. The rest of this page is the case study — the
                    site is the artifact, and this is the postmortem.
                </p>
                <div className="bg-card border border-border p-8 rounded-xl">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
                        <div className="space-y-2">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto md:mx-0">
                                <Cloud className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="font-semibold">Edge Delivery</h3>
                            <p className="text-sm text-muted-foreground w-48">Static export served from a CDN. ISR revalidates the data-backed pages on a schedule so a push doesn't require a full rebuild.</p>
                        </div>
                        <div className="hidden md:block h-px w-16 bg-border" />
                        <div className="space-y-2">
                            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto md:mx-0">
                                <Cpu className="w-8 h-8 text-purple-500" />
                            </div>
                            <h3 className="font-semibold">Next.js Route Layer</h3>
                            <p className="text-sm text-muted-foreground w-48">App Router pages, server components for data, client components for the chatbot and interactive demos.</p>
                        </div>
                        <div className="hidden md:block h-px w-16 bg-border" />
                        <div className="space-y-2">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto md:mx-0">
                                <Database className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="font-semibold">Data Spine</h3>
                            <p className="text-sm text-muted-foreground w-48">Supabase for serving, BigQuery for warehouse. Same GCP project, different access patterns.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section B — Live Metrics */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold">Live System Metrics</h2>
                    <span className="text-xs text-muted-foreground">Refreshes every 5 min · source: project_metrics table</span>
                </div>
                <p className="text-lg text-muted-foreground">
                    The four KPIs above the hero (and the long-form view below) come from a
                    Supabase table that gets upserted on a schedule. This is the only project
                    in the portfolio whose metrics are about the portfolio itself.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Database className="w-4 h-4 text-emerald-500" />
                            <h3 className="font-semibold">RAG Index</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Content from project case studies, READMEs, and methodology docs is chunked, embedded,
                            and stored for retrieval-augmented generation. The chatbot only answers from indexed content,
                            which is why it can stay honest about what it does and doesn't know.
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Workflow className="w-4 h-4 text-blue-500" />
                            <h3 className="font-semibold">Build &amp; Deploy</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Static export for the public surface, ISR for the data-backed routes, and a single
                            environment-driven deploy. No runtime servers for the marketing pages; only the API
                            routes and the chatbot hit serverless functions.
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-purple-500" />
                            <h3 className="font-semibold">Live Data Sources</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Sports Edge publishes a JSON snapshot of model spreads and edges on a daily cron.
                            LLM Advisor publishes a backtest summary. The portfolio reads both at build time and
                            bakes them into the static pages, with ISR refresh on stale data.
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <BrainCircuit className="w-4 h-4 text-amber-500" />
                            <h3 className="font-semibold">Chatbot Stack</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Gemini via Vertex AI for generation. The prompt includes a system message that scopes
                            the assistant to "answer only from retrieved content or refuse." Retrieval confidence
                            threshold decides whether to answer or escalate to "I don't know."
                        </p>
                    </div>
                </div>
            </section>

            {/* Section C — Changelog */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <GitCommit className="w-6 h-6 text-muted-foreground" />
                    <h2 className="text-3xl font-bold">Changelog</h2>
                </div>
                <p className="text-lg text-muted-foreground">
                    Every meaningful change to this site is recorded here, in reverse chronological order.
                    This file is committed to the repo, so the changelog is also the audit trail.
                </p>
                <ChangelogList limit={10} />
            </section>

            {/* Section D — Under the Hood */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <Wrench className="w-6 h-6 text-muted-foreground" />
                    <h2 className="text-3xl font-bold">Under the Hood</h2>
                </div>
                <p className="text-lg text-muted-foreground">
                    A tour of the subsystems that make this site work. Each subsection is short on
                    purpose — enough to understand the choice, not a tutorial.
                </p>

                <div className="space-y-8 mt-8">
                    <article className="space-y-3">
                        <h3 className="text-2xl font-semibold">1. Static-first rendering</h3>
                        <p className="text-muted-foreground">
                            The site is a Next.js 15 app with <code className="text-foreground bg-secondary px-1.5 py-0.5 rounded">output: 'export'</code> for the public surface.
                            Marketing pages, project cards, and case studies are pre-rendered at build time and
                            served as static assets from the CDN. The few pages that need fresh data
                            (Sports Edge, project metrics) use ISR with a revalidation window so a code change
                            doesn't force a full rebuild of the data layer.
                        </p>
                    </article>

                    <article className="space-y-3">
                        <h3 className="text-2xl font-semibold">2. Supabase as the serving layer</h3>
                        <p className="text-muted-foreground">
                            Supabase is the read path. The <code className="text-foreground bg-secondary px-1.5 py-0.5 rounded">project_metrics</code> table
                            stores the KPIs you see on every case study. A scheduled job upserts rows from
                            <code className="text-foreground bg-secondary px-1.5 py-0.5 rounded">public/data/project_metrics_seed.json</code>.
                            The site reads via a typed <code className="text-foreground bg-secondary px-1.5 py-0.5 rounded">useProjectMetrics(id)</code> hook
                            that polls every five minutes. The <code className="text-foreground bg-secondary px-1.5 py-0.5 rounded">service_role</code> key
                            is only used in scripts, never in the browser.
                        </p>
                    </article>

                    <article className="space-y-3">
                        <h3 className="text-2xl font-semibold">3. BigQuery as the source of truth</h3>
                        <p className="text-muted-foreground">
                            Heavy aggregations live in BigQuery. The portfolio project itself doesn't
                            run those jobs — the upstream repos (Sports Edge, LLM Advisor) do — but
                            it consumes the results through Supabase. The contract is simple: warehouse
                            computes, serving layer serves, the portfolio renders. This keeps the
                            static site cheap to host while still letting the data side stay heavy.
                        </p>
                    </article>

                    <article className="space-y-3">
                        <h3 className="text-2xl font-semibold">4. The chatbot / RAG pipeline</h3>
                        <p className="text-muted-foreground">
                            Build-time scripts (<code className="text-foreground bg-secondary px-1.5 py-0.5 rounded">build:rag-manifest</code>,
                            <code className="text-foreground bg-secondary px-1.5 py-0.5 rounded">build:rag-embeddings</code>) walk the repo's docs and case studies,
                            chunk them, embed them with Vertex AI, and write the index to
                            <code className="text-foreground bg-secondary px-1.5 py-0.5 rounded">public/data/rag_embeddings.json</code>. At request
                            time, the user's question is embedded, the top-k chunks are retrieved, and Gemini
                            generates an answer scoped to that context. A confidence threshold
                            determines whether the assistant answers or admits it doesn't know.
                        </p>
                    </article>

                    <article className="space-y-3">
                        <h3 className="text-2xl font-semibold">5. Live data wiring</h3>
                        <p className="text-muted-foreground">
                            The Sports Edge card and the LLM Advisor backtest card both read JSON
                            snapshots published by their respective repos. A GitHub Action in each
                            upstream repo writes the latest snapshot to its <code className="text-foreground bg-secondary px-1.5 py-0.5 rounded">public/</code> folder
                            on a schedule. The portfolio pulls them at build time. The result: a
                            visitor hitting the homepage sees today's edges, not last week's.
                        </p>
                    </article>

                    <article className="space-y-3">
                        <h3 className="text-2xl font-semibold">6. The "site-as-product" loop</h3>
                        <p className="text-muted-foreground">
                            The whole reason this page exists: to make the site legible as a system, not a vibe.
                            Project metrics, a changelog, a system diagram, and a chatbot that can be queried
                            about any of it. The portfolio doesn't just show projects — it shows the infrastructure
                            that makes the portfolio work, and treats that infrastructure the same way it treats
                            everything else. That's the only thing that makes this not a gimmick.
                        </p>
                    </article>
                </div>
            </section>

            {/* Section E — Code Highlight */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold">Pipeline Logic</h2>
                <p className="text-lg text-muted-foreground">
                    Three small scripts do most of the work at build time. They run in order:
                    manifest, warehouse schema, embeddings. The site stays deployable as long as
                    each script produces a valid artifact.
                </p>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden text-sm">
                    <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                        <span className="ml-2 text-zinc-500 font-mono text-xs">package.json (build scripts)</span>
                    </div>
                    <pre className="p-4 overflow-x-auto font-mono text-zinc-300">
{`"build:rag-manifest":     "node scripts/build-rag-manifest.mjs",
"build:warehouse-schema": "node scripts/build-warehouse-schema.mjs",
"build:rag-embeddings":   "node scripts/build-rag-embeddings.mjs",
"refresh-project-metrics":"node scripts/refresh-project-metrics.mjs"`}
                    </pre>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-3xl font-bold">Try It / Break It</h2>
                <div className="rounded-xl border border-border bg-card p-5 text-muted-foreground">
                    <p>
                        Three concrete things you can do right now:
                    </p>
                    <ul className="list-disc list-inside space-y-2 mt-3">
                        <li>Open the chatbot above and ask "What stack is this site built on?" — it should walk you through it from indexed content.</li>
                        <li>Ask the chatbot something it doesn't know (e.g. "What's the weather in Tokyo?") — it should refuse rather than confabulate.</li>
                        <li>
                            <a href="https://github.com/dmboynton56/personal-portfolio" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4 hover:text-blue-500">Read the source on GitHub</a>
                            {' '}— every section on this page links to a real file in the repo.
                        </li>
                    </ul>
                </div>
            </section>
        </ProjectLayout>
    )
}
