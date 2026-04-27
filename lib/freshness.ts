export type SloBucket = 'green' | 'yellow' | 'red'

export type ApiSource =
  | 'supabase'
  | 'local-files'
  | 'fallback-cache'
  | 'empty'
  | 'degraded'

export type FreshnessThreshold = {
  greenHours: number
  yellowHours: number
}

export const STALE_THRESHOLDS: Record<string, FreshnessThreshold> = {
  sportsEdge: { greenHours: 26, yellowHours: 52 },
  llmAdvisor: { greenHours: 48, yellowHours: 96 },
  projectMetrics: { greenHours: 36, yellowHours: 72 },
  dailyBias: { greenHours: 48, yellowHours: 96 }
}

export type ApiMeta = {
  updatedAt: string | null
  sloBucket: SloBucket
  source: ApiSource
  degraded?: boolean
  message?: string
  errorId?: string
}

export type ApiEnvelope<T> = {
  data: T
  meta: ApiMeta
}

export const computeSloBucket = (
  updatedAt: string | null | undefined,
  threshold: FreshnessThreshold,
  nowMs = Date.now()
): SloBucket => {
  if (!updatedAt) return 'red'
  const parsedMs = Date.parse(updatedAt)
  if (Number.isNaN(parsedMs)) return 'red'

  const ageHours = Math.max(0, (nowMs - parsedMs) / 3_600_000)
  if (ageHours < threshold.greenHours) return 'green'
  if (ageHours < threshold.yellowHours) return 'yellow'
  return 'red'
}

export const toApiMeta = (
  updatedAt: string | null | undefined,
  source: ApiSource,
  threshold: FreshnessThreshold,
  options?: {
    degraded?: boolean
    message?: string
    errorId?: string
  }
): ApiMeta => {
  return {
    updatedAt: updatedAt ?? null,
    source,
    sloBucket: computeSloBucket(updatedAt, threshold),
    degraded: options?.degraded,
    message: options?.message,
    errorId: options?.errorId
  }
}
