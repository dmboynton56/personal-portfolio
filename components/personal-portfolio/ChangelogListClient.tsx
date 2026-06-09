'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

export type ChangelogEntry = {
    version: string
    title: string
    date: string | null
    groups: Array<{
        type: 'Added' | 'Changed' | 'Deprecated' | 'Removed' | 'Fixed' | 'Security'
        items: string[]
    }>
}

export type ChangelogPayload = {
    generatedAt: string
    entries: ChangelogEntry[]
}

const GROUP_COLORS: Record<ChangelogEntry['groups'][number]['type'], string> = {
    Added: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Changed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    Deprecated: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Removed: 'bg-red-500/10 text-red-500 border-red-500/20',
    Fixed: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    Security: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20',
}

function ChangelogListView({ data, limit = 8 }: { data: ChangelogPayload; limit?: number }) {
    const entries = data.entries.slice(0, limit)

    return (
        <div className="space-y-4">
            <ol className="relative space-y-6 border-l border-border/60 pl-6">
                {entries.map((entry) => (
                    <li key={entry.version} className="relative">
                        <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-foreground" aria-hidden="true" />
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            {entry.date && (
                                <time className="text-xs font-mono text-muted-foreground">{entry.date}</time>
                            )}
                            <h3 className="text-base font-semibold text-foreground">
                                {entry.title && entry.title !== '—' ? entry.title : entry.version}
                            </h3>
                            {entry.version && entry.version !== 'Unreleased' && entry.version !== entry.date && (
                                <span className="text-xs text-muted-foreground font-mono">v{entry.version}</span>
                            )}
                        </div>
                        <div className="mt-3 space-y-3">
                            {entry.groups.map((group) => (
                                <div key={group.type} className="space-y-1.5">
                                    <Badge variant="outline" className={`text-xs ${GROUP_COLORS[group.type]}`}>
                                        {group.type}
                                    </Badge>
                                    <ul className="list-disc list-outside pl-5 text-sm text-muted-foreground space-y-1 marker:text-border">
                                        {group.items.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </li>
                ))}
            </ol>
            {data.entries.length > limit && (
                <p className="text-xs text-muted-foreground">
                    Showing the {limit} most recent entries · {data.entries.length} total. Edit{' '}
                    <code className="text-foreground bg-secondary px-1.5 py-0.5 rounded">CHANGELOG.md</code> and rerun
                    <code className="text-foreground bg-secondary px-1.5 py-0.5 rounded">npm run build:changelog</code> to update.
                </p>
            )}
        </div>
    )
}

function ChangelogListEmpty() {
    return (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
            Changelog is empty. Run <code className="text-foreground bg-secondary px-1.5 py-0.5 rounded">npm run build:changelog</code> to generate
            <code className="text-foreground bg-secondary px-1.5 py-0.5 rounded">public/data/changelog.json</code> from <code className="text-foreground bg-secondary px-1.5 py-0.5 rounded">CHANGELOG.md</code>.
        </div>
    )
}

export function ChangelogList({ limit = 8 }: { limit?: number }) {
    const [data, setData] = useState<ChangelogPayload | null>(null)
    const [loaded, setLoaded] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        fetch('/data/changelog.json')
            .then((r) => {
                if (!r.ok) throw new Error(`Failed to load changelog: ${r.status}`)
                return r.json() as Promise<ChangelogPayload>
            })
            .then((payload) => {
                if (!cancelled) {
                    setData(payload)
                    setLoaded(true)
                }
            })
            .catch((e) => {
                if (!cancelled) {
                    setError(e instanceof Error ? e.message : 'Failed to load changelog')
                    setLoaded(true)
                }
            })
        return () => {
            cancelled = true
        }
    }, [])

    if (!loaded) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
                Loading changelog…
            </div>
        )
    }

    if (error || !data || data.entries.length === 0) {
        return <ChangelogListEmpty />
    }

    return <ChangelogListView data={data} limit={limit} />
}
