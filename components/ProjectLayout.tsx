import React from 'react'
import { Header } from '@/components/Header'
import { ArrowLeft, Github, ExternalLink, Calendar, BarChart2, Radio, Activity, Code } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Metric {
    label: string
    value: string
    icon?: React.ReactNode
    trend?: 'up' | 'down' | 'neutral'
}

interface ProjectLayoutProps {
    title: string
    description: string
    tags: string[]
    repoUrl?: string
    liveUrl?: string
    metrics?: Metric[] | readonly Metric[]
    children: React.ReactNode
    heroImage?: React.ReactNode // Pass a component or image for the right side of hero
}

export function ProjectLayout({
    title,
    description,
    tags,
    repoUrl,
    liveUrl,
    metrics,
    children,
    heroImage,
}: ProjectLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="relative z-50">
                <Header />
            </div>

            <main className="container mx-auto px-4 py-8 pt-24">
                {/* Back Button */}
                <Link
                    href="/#work"
                    className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Portfolio
                </Link>

                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            {title}
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                            {description}
                        </p>

                        <div className="flex flex-wrap gap-3 mb-8">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 rounded-full text-sm font-medium bg-secondary/50 border border-secondary text-secondary-foreground"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            {liveUrl && (
                                <Button asChild size="lg" className="shine-border">
                                    <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View Live
                                    </a>
                                </Button>
                            )}
                            {repoUrl && (
                                <Button asChild variant="outline" size="lg">
                                    <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                                        <Github className="w-4 h-4 mr-2" />
                                        View Code
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="relative aspect-video lg:aspect-square bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl border border-secondary/20 flex items-center justify-center p-8 overflow-hidden shadow-2xl">
                        {heroImage ? heroImage : (
                            <Code className="w-32 h-32 text-muted-foreground/20" />
                        )}
                    </div>
                </div>

                {/* Metrics Grid (if provided) */}
                {metrics && metrics.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                        {metrics.map((metric, index) => (
                            <div
                                key={index}
                                className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center text-muted-foreground mb-2">
                                    {metric.icon || <Activity className="w-4 h-4 mr-2" />}
                                    <span className="text-sm font-medium ml-2">{metric.label}</span>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold">
                                    {metric.value}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Main Content Content */}
                <div className="space-y-16">
                    {children}
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-border mt-24 py-12 text-center text-muted-foreground">
                <p>© {new Date().getFullYear()} Drew Boynton. All rights reserved.</p>
            </footer>
        </div>
    )
}
