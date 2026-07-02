export type ChatScope = 'default' | 'sports-edge' | 'llm-advisor' | 'nba-hof' | 'matchpoint'

export type ChatToolName = 'search_docs' | 'query_warehouse' | 'get_model_metrics'

export type ChatScopeConfig = {
  label: string
  systemPrompt: string
  allowedTools: ChatToolName[]
  starterPrompts: string[]
  docFilters: {
    project?: Exclude<ChatScope, 'default'>
    league?: 'NFL' | 'NBA' | 'PGA' | 'CBB'
  }
}

export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  role: ChatRole
  content: string
}

export type Citation = {
  type: 'doc' | 'bigquery' | 'supabase' | 'web' | 'model'
  title: string
  source: string
  snippet?: string
  query?: string
  generatedAt?: string
}

export type ChatRequestBody = {
  message?: string
  history?: ChatMessage[]
  scope?: ChatScope
}

export type ChatApiResponse = {
  answer: string
  model: string
  scope: ChatScope
  intent: ChatIntent
  citations: Citation[]
  error?: string
}

export type ChatIntent = 'docs' | 'metrics' | 'warehouse' | 'hybrid'

export type SearchDocsInput = {
  query: string
  project?: Exclude<ChatScope, 'default'>
  league?: 'NFL' | 'NBA' | 'PGA' | 'CBB'
  topK?: number
}

export type SearchDocsOutput = {
  snippets: Array<{
    title: string
    source: string
    excerpt: string
  }>
  citations: Citation[]
}

export type QueryWarehouseInput = {
  question: string
  scope: Extract<ChatScope, 'sports-edge' | 'llm-advisor'>
}

export type QueryWarehouseOutput = {
  sql: string | null
  rows: unknown[]
  rowCount: number
  source: 'bigquery' | 'supabase'
  citations: Citation[]
  message?: string
}

export type ModelMetric =
  | 'ats_record'
  | 'roi'
  | 'calibration'
  | 'pnl'
  | 'heartbeats'
  | 'trade_count'

export type MetricWindow = '7d' | '30d' | 'season' | 'all'

export type GetModelMetricsInput = {
  project: Extract<ChatScope, 'sports-edge' | 'llm-advisor'>
  metric: ModelMetric
  window: MetricWindow
  league?: 'NBA' | 'NFL'
  season?: number
}

export type GetModelMetricsOutput = {
  metric: string
  value: number | string
  breakdown?: unknown
  generatedAt: string
  source: string
  citations: Citation[]
  message?: string
}
