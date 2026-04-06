import { NextRequest, NextResponse } from 'next/server'
import { supabase, isMissingTableError } from '@/lib/supabase'
import { promises as fs } from 'fs'
import path from 'path'
import { ProjectMetricsPayload, ProjectMetric, MetricSource } from '@/lib/metrics'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function loadFallbackMetrics(project: string): Promise<ProjectMetric[] | null> {
    try {
        const fallbackPath = path.resolve(process.cwd(), 'public/data/project_metrics_fallback.json')
        const fileContent = await fs.readFile(fallbackPath, 'utf8')
        const allFallbacks = JSON.parse(fileContent)
        return allFallbacks[project] || null
    } catch (error) {
        console.warn(`Failed to load fallback metrics for ${project}:`, error)
        return null
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { project: string } }
) {
    const { project } = params
    let metrics: ProjectMetric[] = []
    let source: MetricSource = 'empty'
    let lastUpdated: string | null = null

    try {
        // 1. Try Supabase
        if (supabase) {
            const { data, error } = await supabase
                .from('project_metrics')
                .select('label, value, icon_name, trend, updated_at')
                .eq('project_id', project)
                .order('id', { ascending: true })

            if (error) {
                if (!isMissingTableError(error)) {
                    console.warn(`Supabase error fetching metrics for ${project}:`, error)
                }
            } else if (data && data.length > 0) {
                metrics = data.map(row => ({
                    label: row.label,
                    value: row.value,
                    iconName: row.icon_name,
                    trend: row.trend as any
                }))
                source = 'supabase'
                lastUpdated = data[0].updated_at
            }
        }

        // 2. Try Fallback JSON if Supabase failed or was empty
        if (source === 'empty') {
            const fallback = await loadFallbackMetrics(project)
            if (fallback) {
                metrics = fallback
                source = 'local-files'
                lastUpdated = new Date().toISOString() // Or some default
            }
        }

        const payload: ProjectMetricsPayload = {
            source,
            generatedAt: lastUpdated || new Date().toISOString(),
            metrics
        }

        return NextResponse.json(payload)
    } catch (error) {
        console.error(`Error in project-metrics GET for ${project}:`, error)
        return NextResponse.json(
            { error: `Failed to load metrics for ${project}` },
            { status: 500 }
        )
    }
}
