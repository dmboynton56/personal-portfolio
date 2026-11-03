import { BigQuery, type BigQueryOptions } from '@google-cloud/bigquery'
import { promises as fs } from 'fs'
import path from 'path'
import { generateGeminiText, getGoogleCredentials } from '@/lib/chatbot/google'
import type { QueryWarehouseInput, QueryWarehouseOutput } from '@/lib/chatbot/types'
import { searchDocs } from '@/lib/chatbot/tools/search-docs'

let bigQueryCache: BigQuery | null | undefined
let warehouseSchemaCache: string | null | undefined

const getBigQueryClient = async (): Promise<BigQuery | null> => {
  if (bigQueryCache !== undefined) return bigQueryCache

  const projectId = process.env.BIGQUERY_PROJECT_ID || process.env.GCP_PROJECT_ID
  if (!projectId) {
    bigQueryCache = null
    return null
  }

  const credentials = await getGoogleCredentials()
  const options: BigQueryOptions = { projectId }
  if (credentials) options.credentials = credentials
  bigQueryCache = new BigQuery(options)
  return bigQueryCache
}

const loadWarehouseSchema = async (): Promise<string> => {
  if (warehouseSchemaCache !== undefined) return warehouseSchemaCache ?? ''

  const candidates = [
    path.join(process.cwd(), 'docs', 'warehouse-schema.txt'),
    path.join(process.cwd(), 'docs', 'data-dictionary.txt')
  ]

  for (const filePath of candidates) {
    try {
      const content = await fs.readFile(filePath, 'utf8')
      if (content.trim()) {
        warehouseSchemaCache = content
        return content
      }
    } catch {
      // try next candidate
    }
  }

  warehouseSchemaCache = 'Schema info unavailable.'
  return warehouseSchemaCache
}

const retrieveWarehouseContext = async (question: string) => {
  const retrievalQuery = `${question} BigQuery schema join recipe spread cover ATS metric`
  const docsResult = await searchDocs({
    query: retrievalQuery,
    project: 'sports-edge',
    topK: 3
  })

  const preferredSources = new Set([
    'docs/warehouse-schema.txt',
    'docs/metric-definitions.txt',
    'docs/data-dictionary.txt'
  ])

  const snippets = docsResult.snippets
    .sort((a, b) => {
      const aScore = preferredSources.has(a.source) ? 0 : 1
      const bScore = preferredSources.has(b.source) ? 0 : 1
      return aScore - bScore
    })
    .slice(0, 3)

  if (!snippets.length) return ''

  return snippets
    .map(
      (snippet) =>
        `[${snippet.source}] ${snippet.title}\n${snippet.excerpt.slice(0, 900)}`
    )
    .join('\n\n')
}

const cleanSql = (raw: string) =>
  raw
    .replace(/```sql|```/gi, '')
    .trim()
    .replace(/;+\s*$/g, '')

const isSelectOnly = (sql: string) => {
  const normalized = sql.trim().toLowerCase()
  if (!normalized.startsWith('select') && !normalized.startsWith('with')) return false
  return !/\b(insert|update|delete|merge|drop|alter|create|truncate|grant|revoke)\b/i.test(sql)
}

const capRows = (sql: string) => {
  if (/\blimit\s+\d+\b/i.test(sql)) return sql
  return `${sql}\nLIMIT 50`
}

const generateSportsEdgeSql = async (question: string, correction = ''): Promise<string | null> => {
  const [schema, retrievedContext] = await Promise.all([
    loadWarehouseSchema(),
    retrieveWarehouseContext(question)
  ])

  const prompt = `
You are a Google BigQuery expert for the Sports Edge sports analytics project.
Based on the SCHEMA and RETRIEVED CONTEXT below, generate a single valid BigQuery SQL query to answer the USER QUESTION.

CANONICAL SCHEMA (from storage inventory exports):
${schema}

RETRIEVED CONTEXT (question-specific docs):
${retrievedContext || 'No additional context retrieved.'}

USER QUESTION:
"${question}"

RULES:
1. Return ONLY the SQL query. No markdown, no backticks, no explanations.
2. The query must be read-only: SELECT or WITH ... SELECT only.
3. Use fully qualified table names as described in the schema.
4. Apply league and season filters if mentioned or implied.
5. If the schema cannot answer the question, return "NONE".
6. Team names in the database are abbreviations. Do not invent full-name filters.
7. Always wrap OR conditions in parentheses when combined with AND.
8. For training_feature_view_v2, join raw_schedules on game_id to filter by team or read scores.
9. Do not cast BOOL fields to numeric types; use COUNTIF or CASE.
10. For spread-cover or ATS counts, join model_predictions with raw_schedules and use predicted_spread — never home_margin alone.
11. If the question is a season ATS record summary, return "NONE" (use Supabase serving metrics instead).
12. Limit non-aggregate result sets to at most 50 rows.
13. Home/away scores live in raw_schedules. raw_nba_game_logs has points_scored/points_allowed, NOT home_score/away_score. Use only columns listed for the selected table.

${correction}
`

  const sql = await generateGeminiText({
    prompt,
    temperature: 0,
    maxOutputTokens: 700
  })

  if (!sql || sql.trim().toUpperCase() === 'NONE') return null
  const cleaned = cleanSql(sql)
  if (!isSelectOnly(cleaned)) return null
  return capRows(cleaned)
}

export const queryWarehouse = async (
  input: QueryWarehouseInput
): Promise<QueryWarehouseOutput> => {
  if (input.scope !== 'sports-edge') {
    return {
      sql: null,
      rows: [],
      rowCount: 0,
      source: 'bigquery',
      citations: [],
      message:
        'Generated warehouse SQL is currently enabled only for Sports Edge. Use canned telemetry metrics for LLM Advisor.'
    }
  }

  let sql = await generateSportsEdgeSql(input.question)
  if (!sql) {
    return {
      sql: null,
      rows: [],
      rowCount: 0,
      source: 'bigquery',
      citations: [],
      message: 'No safe warehouse query could be generated for this question.'
    }
  }

  const bqClient = await getBigQueryClient()
  if (!bqClient) {
    return {
      sql,
      rows: [],
      rowCount: 0,
      source: 'bigquery',
      citations: [
        {
          type: 'bigquery',
          title: 'Sports Edge Warehouse Query',
          source: 'BigQuery',
          query: sql,
          generatedAt: new Date().toISOString()
        }
      ],
      message: 'BigQuery is not configured for this environment.'
    }
  }

  try {
    const options = { useLegacySql: false, maximumBytesBilled: '1000000000', jobTimeoutMs: 15000 }
    try {
      await bqClient.createQueryJob({ ...options, query: sql, dryRun: true })
    } catch (error) {
      // Only repair invalid SQL, never retry permissions, billing or quota failures.
      if ((error as { code?: number }).code !== 400) throw error
      const reason = error instanceof Error ? error.message.slice(0, 500) : 'Invalid query'
      const repaired = await generateSportsEdgeSql(input.question,
        `The previous SQL failed BigQuery validation: ${reason}\nPrevious SQL:\n${sql}\nCorrect it using the canonical schema.`)
      if (!repaired) throw new Error('No valid warehouse query could be generated.')
      sql = repaired
      await bqClient.createQueryJob({ ...options, query: sql, dryRun: true })
    }
    const [rows] = await bqClient.query({ ...options, query: sql })
    const safeRows = Array.isArray(rows) ? rows.slice(0, 50) : []
    const generatedAt = new Date().toISOString()

    return {
      sql,
      rows: safeRows,
      rowCount: safeRows.length,
      source: 'bigquery',
      citations: [
        {
          type: 'bigquery',
          title: 'Sports Edge Warehouse Query',
          source: 'BigQuery',
          query: sql,
          generatedAt
        }
      ],
      message: safeRows.length ? undefined : 'The warehouse query returned no rows.'
    }
  } catch (error) {
    console.error('BigQuery execution failed', { code: (error as { code?: number }).code })
    return {
      sql,
      rows: [],
      rowCount: 0,
      source: 'bigquery',
      citations: [
        {
          type: 'bigquery',
          title: 'Sports Edge Warehouse Query',
          source: 'BigQuery',
          query: sql,
          generatedAt: new Date().toISOString()
        }
      ],
      message: 'The warehouse query failed to execute.'
    }
  }
}
