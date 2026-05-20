import { NextRequest, NextResponse } from 'next/server'
import { generateGeminiText } from '@/lib/chatbot/google'
import { getScopeConfig } from '@/lib/chatbot/scopes'
import type {
  ChatApiResponse,
  ChatIntent,
  ChatRequestBody,
  Citation,
  GetModelMetricsInput,
  GetModelMetricsOutput,
  QueryWarehouseOutput,
  SearchDocsOutput
} from '@/lib/chatbot/types'
import { getModelMetrics } from '@/lib/chatbot/tools/get-model-metrics'
import { queryWarehouse } from '@/lib/chatbot/tools/query-warehouse'
import { searchDocs } from '@/lib/chatbot/tools/search-docs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const docsKeywords = [
  'why',
  'how',
  'explain',
  'method',
  'methodology',
  'assumption',
  'risk',
  'limitation',
  'architecture',
  'documentation',
  'model card',
  'metric definition',
  'feature',
  'calibration'
]

const metricKeywords = [
  'ats',
  'record',
  'roi',
  'p&l',
  'pnl',
  'profit',
  'performance',
  'perform',
  'cover',
  'covers',
  'covered',
  'spread hit',
  'heartbeat',
  'heartbeats',
  'live loop',
  'run successfully',
  'eod',
  'aggregate',
  'trade count',
  'trades',
  'win rate'
]

const warehouseKeywords = [
  'spread',
  'cover',
  'covered',
  'how many',
  'count',
  'home games',
  'average',
  'season',
  'nfl',
  'nba',
  'percentage',
  'won',
  'points',
  'ppg',
  'scored',
  'allowed',
  'margin',
  'diff',
  'difference',
  'rest',
  'days',
  'back to back',
  'back-to-back',
  'b2b',
  '3in4',
  'schedule',
  'win probability'
]

const includesKeyword = (message: string, keywords: string[]) => {
  const normalized = message.toLowerCase()
  return keywords.some((keyword) => normalized.includes(keyword))
}

const detectIntent = (message: string): ChatIntent => {
  const hasDocs = includesKeyword(message, docsKeywords)
  const hasMetrics = includesKeyword(message, metricKeywords)
  const hasWarehouse = includesKeyword(message, warehouseKeywords)

  if ((hasDocs && hasMetrics) || (hasDocs && hasWarehouse)) return 'hybrid'
  if (hasMetrics) return 'metrics'
  if (hasWarehouse) return 'warehouse'
  if (hasDocs) return 'docs'
  return 'hybrid'
}

const parseLeague = (message: string): 'NBA' | 'NFL' | undefined => {
  const normalized = message.toLowerCase()
  if (/\bnfl\b/.test(normalized)) return 'NFL'
  if (/\bnba\b/.test(normalized)) return 'NBA'
  return undefined
}

const parseSeason = (message: string): number | undefined => {
  const match = message.match(/\b(20\d{2})(?:-\d{2})?\b/)
  if (!match) return undefined
  const parsed = Number(match[1])
  return Number.isInteger(parsed) ? parsed : undefined
}

const parseWindow = (message: string): GetModelMetricsInput['window'] => {
  const normalized = message.toLowerCase()
  if (normalized.includes('30d') || normalized.includes('30 day')) return '30d'
  if (normalized.includes('season')) return 'season'
  if (normalized.includes('all time') || normalized.includes('all-time')) return 'all'
  return '7d'
}

const parseMetric = (
  message: string,
  scope: GetModelMetricsInput['project']
): GetModelMetricsInput['metric'] => {
  const normalized = message.toLowerCase()

  if (scope === 'sports-edge') {
    if (normalized.includes('roi')) return 'roi'
    return 'ats_record'
  }

  if (normalized.includes('heartbeat') || normalized.includes('live loop') || normalized.includes('run successfully')) {
    return 'heartbeats'
  }
  if (normalized.includes('trade count') || normalized.includes('how many trade')) {
    return 'trade_count'
  }
  return 'pnl'
}

const shouldUseDocs = (intent: ChatIntent, metricResult?: GetModelMetricsOutput) =>
  intent === 'docs' ||
  intent === 'hybrid' ||
  Boolean(metricResult?.message) ||
  Boolean(metricResult && metricResult.value === 'No data available')

const shouldUseWarehouse = (
  intent: ChatIntent,
  scope: string,
  hasMetricRoute: boolean,
  mentionsOtherProject: boolean
) =>
  scope === 'sports-edge' &&
  !hasMetricRoute &&
  !mentionsOtherProject &&
  intent !== 'docs' &&
  (intent === 'warehouse' || intent === 'hybrid')

const dedupeCitations = (citations: Citation[]) => {
  const seen = new Set<string>()
  return citations.filter((citation) => {
    const key = `${citation.type}:${citation.source}:${citation.title}:${citation.query ?? ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const formatEvidence = ({
  docsResult,
  metricResult,
  warehouseResult
}: {
  docsResult?: SearchDocsOutput
  metricResult?: GetModelMetricsOutput
  warehouseResult?: QueryWarehouseOutput
}) => {
  const blocks: string[] = []

  if (docsResult?.snippets.length) {
    blocks.push(
      `DOCUMENTATION:\n${docsResult.snippets
        .map(
          (snippet) =>
            `- ${snippet.title} (${snippet.source})\n${snippet.excerpt.slice(0, 1600)}`
        )
        .join('\n\n')}`
    )
  }

  if (metricResult) {
    blocks.push(
      `CANNED METRIC:\n${JSON.stringify(
        {
          metric: metricResult.metric,
          value: metricResult.value,
          breakdown: metricResult.breakdown,
          source: metricResult.source,
          generatedAt: metricResult.generatedAt,
          message: metricResult.message
        },
        null,
        2
      )}`
    )
  }

  if (warehouseResult) {
    blocks.push(
      `WAREHOUSE RESULT:\n${JSON.stringify(
        {
          sql: warehouseResult.sql,
          rows: warehouseResult.rows,
          rowCount: warehouseResult.rowCount,
          source: warehouseResult.source,
          message: warehouseResult.message
        },
        null,
        2
      )}`
    )
  }

  return blocks.length ? blocks.join('\n\n---\n\n') : 'No tool evidence was found.'
}

const buildFallbackAnswer = ({
  docsResult,
  metricResult,
  warehouseResult,
  scopeGuard
}: {
  docsResult?: SearchDocsOutput
  metricResult?: GetModelMetricsOutput
  warehouseResult?: QueryWarehouseOutput
  scopeGuard?: string
}) => {
  if (scopeGuard) {
    return `Short answer: ${scopeGuard}\n\nEvidence:\n- Scope registry: this chat request is constrained to the selected project scope.\n\nCaveat:\nAsk the same question in the matching project scope to use that project's docs or telemetry.`
  }

  if (metricResult) {
    return `Short answer: ${metricResult.message ?? `${metricResult.metric}: ${metricResult.value}`}\n\nEvidence:\n- ${metricResult.source}: ${metricResult.metric}, generated ${metricResult.generatedAt}\n\nCaveat:\nThis answer is limited to the retrieved metric payload.`
  }

  if (warehouseResult) {
    const source = warehouseResult.sql ? 'BigQuery warehouse query' : 'BigQuery'
    return `Short answer: ${warehouseResult.message ?? `The query returned ${warehouseResult.rowCount} rows.`}\n\nEvidence:\n- ${source}\n\nCaveat:\nThis answer is limited to the retrieved warehouse rows.`
  }

  if (docsResult?.snippets.length) {
    const first = docsResult.snippets[0]
    const excerpt = first.excerpt
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 420)
    return `Short answer: ${excerpt || `I found relevant project documentation in ${first.source}.`}\n\nEvidence:\n- Doc: ${first.title} (${first.source})\n\nCaveat:\nThe answer is limited to the retrieved documentation.`
  }

  return 'Short answer: I could not find project-specific evidence for that question.\n\nEvidence:\n- No docs or data matched the request.\n\nCaveat:\nI am not filling the gap with an invented answer.'
}

const generateAnswer = async ({
  message,
  history,
  systemPrompt,
  docsResult,
  metricResult,
  warehouseResult,
  scopeGuard
}: {
  message: string
  history: ChatRequestBody['history']
  systemPrompt: string
  docsResult?: SearchDocsOutput
  metricResult?: GetModelMetricsOutput
  warehouseResult?: QueryWarehouseOutput
  scopeGuard?: string
}) => {
  const evidence = formatEvidence({ docsResult, metricResult, warehouseResult })
  const recentHistory =
    history
      ?.slice(-6)
      .map((entry) => `${entry.role.toUpperCase()}: ${entry.content}`)
      .join('\n') || 'No prior conversation.'

  const prompt = `
${systemPrompt}

USER QUESTION:
${message}

RECENT HISTORY:
${recentHistory}

TOOL EVIDENCE:
${evidence}

RESPONSE RULES:
1. Answer only from TOOL EVIDENCE. Do not invent metrics, tables, trades, predictions, run status, or citations.
2. Start with "Short answer:" and give the direct answer.
3. Then include "Evidence:" with bullets naming the exact doc/data sources used.
4. Then include "Caveat:" with one or two important limits, especially missing telemetry or betting/model risk.
5. If evidence is missing or empty, say exactly what is missing and do not fill the gap with general claims.
6. Never show SQL unless the user explicitly asks for it.
`

  return (
    (await generateGeminiText({
      prompt,
      temperature: 0.2,
      maxOutputTokens: 1000
    })) || buildFallbackAnswer({ docsResult, metricResult, warehouseResult, scopeGuard })
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestBody
    const message = body.message?.trim()
    if (!message) {
      return NextResponse.json(
        { error: 'A non-empty message is required.' },
        { status: 400 }
      )
    }

    const { scope, config } = getScopeConfig(body.scope)
    const intent = detectIntent(message)
    const isDocsQuestion = includesKeyword(message, docsKeywords)
    const isMetricQuestion = includesKeyword(message, metricKeywords)
    const mentionsOtherProject =
      (scope === 'sports-edge' &&
        /\bllm advisor\b|\blive loop\b|\bpremarket\b|\beod\b/i.test(message)) ||
      (scope === 'llm-advisor' &&
        /\bsports edge\b|\bats\b|\bnba\b|\bnfl\b|\bspread\b/i.test(message)) ||
      (scope === 'nba-hof' &&
        /\bsports edge\b|\bllm advisor\b|\bats\b|\bpnl\b|\bp&l\b/i.test(message)) ||
      (scope === 'default' &&
        /\bats\b|\bpnl\b|\bp&l\b|\blive loop\b|\btrade count\b/i.test(message))
    const citations: Citation[] = []
    let docsResult: SearchDocsOutput | undefined
    let metricResult: GetModelMetricsOutput | undefined
    let warehouseResult: QueryWarehouseOutput | undefined

    const canUseMetrics = config.allowedTools.includes('get_model_metrics')
    const hasMetricRoute =
      canUseMetrics &&
      !mentionsOtherProject &&
      isMetricQuestion &&
      (intent === 'metrics' ||
        (intent === 'hybrid' && !isDocsQuestion) ||
        (scope === 'sports-edge' &&
          /\bats\b|\broi\b|\brecord\b|\bcover\b|\bcovers\b|\bcovered\b|\bspread hit\b/i.test(
            message
          )) ||
        (scope === 'llm-advisor' &&
          /\bp&l\b|\bpnl\b|\bprofit\b|\bheartbeat\b|\blive loop\b|\beod\b|\btrade count\b|\btrades\b|\brun successfully\b/i.test(
            message
          )))

    if (hasMetricRoute && (scope === 'sports-edge' || scope === 'llm-advisor')) {
      metricResult = await getModelMetrics({
        project: scope,
        metric: parseMetric(message, scope),
        window: parseWindow(message),
        league: parseLeague(message),
        season: parseSeason(message)
      })
      citations.push(...metricResult.citations)
    }

    if (shouldUseWarehouse(intent, scope, hasMetricRoute, mentionsOtherProject)) {
      warehouseResult = await queryWarehouse({
        question: message,
        scope: 'sports-edge'
      })
      citations.push(...warehouseResult.citations)
    }

    if (
      config.allowedTools.includes('search_docs') &&
      !mentionsOtherProject &&
      shouldUseDocs(intent, metricResult)
    ) {
      docsResult = await searchDocs({
        query: message,
        project: config.docFilters.project,
        league: config.docFilters.league,
        topK: 4
      })
      citations.push(...docsResult.citations)
    }

    if (
      !mentionsOtherProject &&
      !docsResult &&
      !metricResult &&
      !warehouseResult &&
      config.allowedTools.includes('search_docs')
    ) {
      docsResult = await searchDocs({
        query: message,
        project: config.docFilters.project,
        league: config.docFilters.league,
        topK: 4
      })
      citations.push(...docsResult.citations)
    }

    const scopeGuard = mentionsOtherProject
      ? `This ${config.label} chat scope cannot use another project's docs, tools, or telemetry for that request.`
      : undefined

    const answer = await generateAnswer({
      message: mentionsOtherProject
        ? `${message}\n\nScope guard: This request appears to mention another project. Do not answer with out-of-scope data. State that this ${config.label} scope cannot use that other project's tools or telemetry.`
        : message,
      history: body.history,
      systemPrompt: config.systemPrompt,
      docsResult,
      metricResult,
      warehouseResult,
      scopeGuard
    })

    const response: ChatApiResponse = {
      answer,
      intent,
      model: 'gemini-2.0-flash-scoped',
      scope,
      citations: dedupeCitations(citations).slice(0, 8)
    }

    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
