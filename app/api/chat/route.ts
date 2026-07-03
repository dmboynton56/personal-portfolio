import { NextRequest, NextResponse } from 'next/server'
import { generateGeminiText, getGeminiModelId } from '@/lib/chatbot/google'
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
  'contact',
  'email',
  'linkedin',
  'github',
  'phone',
  'reach',
  'hire',
  'resume',
  'résumé',
  'cv',
  'download',
  'view',
  'pdf',
  'who is',
  'about drew',
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
  scopeGuard,
  voice
}: {
  docsResult?: SearchDocsOutput
  metricResult?: GetModelMetricsOutput
  warehouseResult?: QueryWarehouseOutput
  scopeGuard?: string
  voice: 'narrative' | 'data'
}) => {
  if (scopeGuard) {
    return `${scopeGuard} Open the chat on the matching project page if you want answers that use that project's docs or live data.`
  }

  if (metricResult) {
    const msg = metricResult.message ?? `${metricResult.metric}: ${metricResult.value}`
    const when = metricResult.generatedAt
      ? ` As of ${new Date(metricResult.generatedAt).toLocaleString()}, this is what the saved metrics feed shows.`
      : ''
    return `Here's the latest from the metrics connection: ${msg}.${when} That comes from the ${metricResult.source} feed—not a guess.`
  }

  if (warehouseResult) {
    const summary =
      warehouseResult.message ??
      (warehouseResult.rowCount > 0
        ? `The warehouse returned ${warehouseResult.rowCount} row(s) for your question.`
        : 'The warehouse query came back with no rows.')
    return `${summary} This is from the queried sports data, not general knowledge.`
  }

  if (docsResult?.snippets.length) {
    const first = docsResult.snippets[0]
    const excerpt = first.excerpt
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 560)

    if (voice === 'narrative') {
      return (
        excerpt ||
        'I found relevant material in the project write-ups linked on this site—take a look at the source links below if you want the full detail.'
      )
    }

    return `${excerpt || 'Here is what the retrieved documentation says.'} Supporting references are listed below.`
  }

  return voice === 'narrative'
    ? "I don't have anything in the project materials I can see that answers that directly—worth asking a more specific question or checking the deep-dive sections on the page."
    : "I couldn't find matching numbers or rows for that request in the data I can query right now."
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
  const responseVoice: 'narrative' | 'data' =
    metricResult || warehouseResult ? 'data' : 'narrative'

  const recentHistory =
    history
      ?.slice(-6)
      .map((entry) => `${entry.role.toUpperCase()}: ${entry.content}`)
      .join('\n') || 'No prior conversation.'

  const narrativeRules = `
RESPONSE RULES (portfolio visitor — explanations and docs only):
1. Use only TOOL EVIDENCE. Do not invent metrics, tables, trades, run status, SQL, or claims not supported by the evidence.
2. Write in clear, conversational plain English (one or two short paragraphs, or a few tight bullets). This is a portfolio website, not an internal incident report.
3. Do NOT use section labels like "Short answer:", "Evidence:", or "Caveat:". Do NOT paste filenames, repo paths, or "docs/..." strings — the chat UI already shows source links as citations.
4. For questions about why something is "under construction," "in progress," or the product story: explain using the documentation excerpts. Do NOT lead with empty telemetry, missing Supabase, or "no data available" unless the user explicitly asked about live metrics, dashboards, or today's run status.
5. Mention missing data or limitations only when it truly changes what a visitor should believe—and keep it to one short sentence.
6. If there is no useful evidence, say briefly that the materials you can see don't cover it — do not invent filler.
7. Never show SQL unless the user explicitly asks for it.
8. When sharing URLs, email, or phone from evidence, use markdown links so they are clickable: [LinkedIn](https://...), [GitHub](https://...), [email](mailto:...). For contact questions, list email, phone, LinkedIn, and GitHub when they appear in evidence—do not defer to "the footer" alone.
`.trim()

  const dataRules = `
RESPONSE RULES (data-backed: metrics and/or warehouse in evidence):
1. Use only TOOL EVIDENCE for numbers and factual claims.
2. Lead with the takeaway in plain language (what the numbers mean for the user). Do NOT use section labels like "Short answer:", "Evidence:", or "Caveat:".
3. You may add one short sentence that figures come from saved telemetry or a warehouse query, with approximate timing from the evidence if present. Do not dump JSON, raw rows, or file paths — citations appear in the UI.
4. If the metric or query came back empty, say that plainly in one sentence without dramatizing.
5. Never show SQL unless the user explicitly asks for it.
`.trim()

  const prompt = `
${systemPrompt}

USER QUESTION:
${message}

RECENT HISTORY:
${recentHistory}

TOOL EVIDENCE:
${evidence}

${responseVoice === 'data' ? dataRules : narrativeRules}
`

  return (
    (await generateGeminiText({
      prompt,
      temperature: responseVoice === 'narrative' ? 0.35 : 0.25,
      maxOutputTokens: 1000
    })) ||
    buildFallbackAnswer({
      docsResult,
      metricResult,
      warehouseResult,
      scopeGuard,
      voice: responseVoice
    })
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
    const docsTopK = scope === 'default' ? 6 : 4
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
        topK: docsTopK
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
        topK: docsTopK
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
      model: getGeminiModelId(),
      scope,
      citations: dedupeCitations(citations).slice(0, 8)
    }

    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
