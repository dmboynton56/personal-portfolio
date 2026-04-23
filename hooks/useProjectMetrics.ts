'use client'

import { useState, useEffect } from 'react'
import { ProjectMetricsPayload } from '@/lib/metrics'
import { ApiEnvelope } from '@/lib/freshness'

export function useProjectMetrics(projectId: string) {
    const [metrics, setMetrics] = useState<ProjectMetricsPayload | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        const fetchMetrics = async () => {
            try {
                const response = await fetch(`/api/project-metrics/${projectId}`)
                if (!response.ok) {
                    throw new Error(`Failed to load metrics for ${projectId}`)
                }
                const payload = await response.json() as ProjectMetricsPayload | ApiEnvelope<ProjectMetricsPayload>
                const data: ProjectMetricsPayload =
                    payload && typeof payload === 'object' && 'data' in payload
                        ? (payload as ApiEnvelope<ProjectMetricsPayload>).data
                        : (payload as ProjectMetricsPayload)
                if (isMounted) {
                    setMetrics(data)
                    setError(null)
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to load metrics')
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        fetchMetrics()
        // Poll every 5 minutes
        const interval = setInterval(fetchMetrics, 5 * 60 * 1000)

        return () => {
            isMounted = false
            clearInterval(interval)
        }
    }, [projectId])

    return { metrics, isLoading, error }
}
