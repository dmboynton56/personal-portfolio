import { NextRequest, NextResponse } from 'next/server'
import { BigQuery, type BigQueryOptions } from '@google-cloud/bigquery'
import { GoogleAuth, type JWTInput } from 'google-auth-library'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Intent = 'sql' | 'docs' | 'hybrid'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ChatRequestBody = {
  message?: string
  history?: ChatMessage[]
}

type Citation = {
  source: string
  title: string
  snippet: string
}

type DocChunk = {
  id: string
  source: string
  title: string
  content: string
  tokens: Set<string>
}

type VertexAnswerResult = {
  text: string
  citations: Citation[]
}

const docsRoot = path.join(process.cwd(), 'docs')

const sqlKeywords = [
  'spread', 'cover', 'covered', 'ats', 'record', 'how many', 'count', 
  'home games', 'average', 'win rate', 'season', 'nfl', 'nba', 'percentage', 'won'
]

const docsKeywords = [
  'why', 'how', 'explain', 'method', 'assumption', 'risk', 
  'limitation', 'architecture', 'documentation', 'model card', 'metric definition'
]

const stopWords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have', 
  'how', 'i', 'in', 'is', 'it', 'of', 'on', 'or', 'our', 'that', 'the', 'this', 
  'to', 'what', 'when', 'where', 'which', 'with', 'you', 'your'
])

let docsCache: DocChunk[] | null = null
let credentialsCache: JWTInput | null | undefined
let bigQueryCache: BigQuery | null | undefined

const normalizePrivateKey = (value?: string) =>
  value ? value.replace(/\\n/g, '\n') : value

const parseJsonCredentials = (raw?: string | null): JWTInput | null => {
  if (!raw?.trim()) return null
  try {
    const parsed = JSON.parse(raw) as JWTInput
    if (parsed.private_key) {
      parsed.private_key = normalizePrivateKey(parsed.private_key)
    }
    return parsed
  } catch { return null }
}

const loadFileCredentials = async (filePath?: string | null): Promise<JWTInput | null> => {
  if (!filePath?.trim()) return null
  try {
    const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)
    const content = await fs.readFile(resolvedPath, 'utf8')
    return parseJsonCredentials(content)
  } catch { return null }
}

const getGoogleCredentials = async (): Promise<JWTInput | undefined> => {
  if (credentialsCache !== undefined) return credentialsCache ?? undefined
  const fromJson = parseJsonCredentials(process.env.GCP_SERVICE_ACCOUNT_JSON)
  if (fromJson) { credentialsCache = fromJson; return fromJson }
  const fromFile = await loadFileCredentials(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  if (fromFile) { credentialsCache = fromFile; return fromFile }
  credentialsCache = null
  return undefined
}

const getGoogleAccessToken = async (): Promise<string | null> => {
  const credentials = await getGoogleCredentials()
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    credentials
  })
  const token = await auth.getAccessToken()
  return token ?? null
}

const getBigQueryClient = async (): Promise<BigQuery | null> => {
  if (bigQueryCache !== undefined) return bigQueryCache
  const projectId = process.env.BIGQUERY_PROJECT_ID || process.env.GCP_PROJECT_ID
  if (!projectId) { bigQueryCache = null; return null }
  const credentials = await getGoogleCredentials()
  const options: BigQueryOptions = { projectId }
  if (credentials) options.credentials = credentials
  bigQueryCache = new BigQuery(options)
  return bigQueryCache
}

const detectIntent = (message: string): Intent => {
  const normalized = message.toLowerCase()
  const sqlScore = sqlKeywords.reduce((acc, kw) => acc + (normalized.includes(kw) ? 1 : 0), 0)
  const docsScore = docsKeywords.reduce((acc, kw) => acc + (normalized.includes(kw) ? 1 : 0), 0)
  if (sqlScore > 0 && docsScore > 0) return 'hybrid'
  if (sqlScore > 0) return 'sql'
  if (docsScore > 0) return 'docs'
  return 'hybrid'
}

/**
 * Text-to-SQL using Vertex AI (Gemini)
 */
async function generateSql(message: string): Promise<string | null> {
  const projectId = process.env.GCP_PROJECT_ID
  const location = 'us-central1' // aiplatform endpoint
  const modelId = 'gemini-2.5-flash-lite'
  
  if (!projectId) return null

  const accessToken = await getGoogleAccessToken()
  if (!accessToken) return null

  const dictionaryPath = path.join(process.cwd(), 'docs', 'data-dictionary.txt')
  const dictionary = await fs.readFile(dictionaryPath, 'utf8').catch(() => 'Schema info unavailable.')

  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:generateContent`

  const prompt = `
You are a Google BigQuery expert for a sports analytics project.
Based on the SCHEMA below, generate a single, valid BigQuery SQL query to answer the USER QUESTION.

SCHEMA:
${dictionary}

USER QUESTION:
"${message}"

RULES:
1. Return ONLY the SQL query. No markdown formatting, no backticks, no explanations.
2. The query must be read-only (SELECT).
3. Use fully qualified table names: \`${process.env.BIGQUERY_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.TABLE_NAME\`.
4. Apply league and season filters if mentioned or implied.
5. If you cannot answer the question with the schema provided, return "NONE".
`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.0, maxOutputTokens: 500 }
    })
  })

  if (!response.ok) {
    console.error('Gemini SQL Gen Error:', await response.text())
    return null
  }

  const data = await response.json()
  const sql = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  return sql === 'NONE' ? null : sql
}

/**
 * Summarize SQL results into natural language
 */
async function summarizeData(message: string, dataRows: any[]): Promise<string | null> {
  const projectId = process.env.GCP_PROJECT_ID
  const location = 'us-central1'
  const modelId = 'gemini-1.5-flash'
  
  const accessToken = await getGoogleAccessToken()
  if (!accessToken || !projectId) return null

  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:generateContent`

  const prompt = `
You are a helpful sports data analyst.
The user asked: "${message}"
The database returned these results: ${JSON.stringify(dataRows)}

Write a concise, natural language answer based on these results.
If the results are empty, say you couldn't find data for that specific request.
`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 500 }
    })
  })

  if (!response.ok) return null
  const resData = await response.json()
  return resData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
}

const loadVertexAnswer = async ({ message }: { message: string }): Promise<VertexAnswerResult | null> => {
  const projectId = process.env.GCP_PROJECT_ID
  const appId = process.env.VERTEX_APP_ID
  const location = process.env.VERTEX_LOCATION || 'global'

  if (!projectId || !appId) return null

  const accessToken = await getGoogleAccessToken()
  if (!accessToken) return null

  const endpoint = `https://discoveryengine.googleapis.com/v1/projects/${projectId}/locations/${location}/collections/default_collection/engines/${appId}/servingConfigs/default_search:answer`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: { text: message },
        answerGenerationSpec: { includeCitations: true }
      })
    })

    if (!response.ok) {
      console.error(`Vertex AI Search Error (${response.status}):`, await response.text())
      return null
    }

    const payload = (await response.json()) as Record<string, unknown>
    const answerRecord = payload.answer as Record<string, unknown> | undefined
    const text = (answerRecord && typeof answerRecord.answerText === 'string' && answerRecord.answerText.trim()) || ''
    if (!text) return null

    return { text, citations: extractVertexCitations(payload) }
  } catch (err) { return null }
}

const toCitation = (source: unknown): Citation | null => {
  if (!source || typeof source !== 'object') return null
  const record = source as Record<string, unknown>
  const title = (typeof record.title === 'string' && record.title) || (typeof record.documentTitle === 'string' && record.documentTitle) || (typeof record.uri === 'string' && record.uri) || 'Vertex Source'
  const uri = (typeof record.uri === 'string' && record.uri) || (typeof record.referenceId === 'string' && record.referenceId) || 'vertex-ai-search'
  const snippet = (typeof record.snippet === 'string' && record.snippet) || (typeof record.content === 'string' && record.content.slice(0, 280)) || ''
  return { source: uri, title, snippet }
}

const extractVertexCitations = (payload: Record<string, unknown>): Citation[] => {
  const citations: Citation[] = []
  const seen = new Set<string>()
  const pushCitation = (citation: Citation | null) => {
    if (!citation) return
    const key = `${citation.source}::${citation.title}`
    if (seen.has(key)) return
    seen.add(key)
    citations.push(citation)
  }
  const answer = payload.answer
  if (answer && typeof answer === 'object') {
    const answerRecord = answer as Record<string, unknown>
    const answerCitations = answerRecord.citations
    if (Array.isArray(answerCitations)) {
      for (const entry of answerCitations) {
        if (!entry || typeof entry !== 'object') continue
        const sources = (entry as Record<string, unknown>).sources
        if (Array.isArray(sources)) for (const s of sources) pushCitation(toCitation(s))
      }
    }
  }
  return citations.slice(0, 6)
}

const listMarkdownFiles = async (directory: string): Promise<string[]> => {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await listMarkdownFiles(fullPath)))
    else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.txt'))) files.push(fullPath)
  }
  return files
}

const tokenize = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((t) => t && !stopWords.has(t))

const loadDocChunks = async (): Promise<DocChunk[]> => {
  if (docsCache) return docsCache
  try {
    const files = await listMarkdownFiles(docsRoot)
    const allChunks: DocChunk[] = []
    for (const filePath of files) {
      const content = await fs.readFile(filePath, 'utf8')
      const source = path.relative(process.cwd(), filePath).split(path.sep).join('/')
      const chunks = content.split(/\n(?=##\s+)/g)
      chunks.forEach((c, i) => {
        const text = c.trim()
        if (!text) return
        allChunks.push({ id: `${source}#${i}`, source, title: source, content: text, tokens: new Set(tokenize(text)) })
      })
    }
    docsCache = allChunks; return allChunks
  } catch { return [] }
}

const retrieveLocalDocCitations = async (message: string): Promise<Citation[]> => {
  const chunks = await loadDocChunks()
  if (!chunks.length) return []
  const tokens = new Set(tokenize(message))
  const scored = chunks.map(chunk => {
    let score = 0
    for (const token of tokens) if (chunk.tokens.has(token)) score += 1
    return { chunk, score }
  }).filter(i => i.score > 0).sort((a, b) => b.score - a.score).slice(0, 3)
  return scored.map(({ chunk }) => ({ source: chunk.source, title: chunk.title, snippet: chunk.content.slice(0, 280) }))
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestBody
    const message = body.message?.trim()
    if (!message) return NextResponse.json({ error: 'A non-empty message is required.' }, { status: 400 })

    const intent = detectIntent(message)
    let sqlAnswer: string | null = null
    let sqlCitation: Citation | null = null

    // 1. DYNAMIC SQL PATH
    if (intent === 'sql' || intent === 'hybrid') {
      const generatedSql = await generateSql(message)
      if (generatedSql) {
        const bqClient = await getBigQueryClient()
        if (bqClient) {
          try {
            console.log('Executing Generated SQL:', generatedSql)
            const [rows] = await bqClient.query({ query: generatedSql, useLegacySql: false })
            if (rows && rows.length > 0) {
              sqlAnswer = await summarizeData(message, rows)
              sqlCitation = { source: 'bigquery', title: 'Live Database Results', snippet: `Generated query results for: ${message}` }
            }
          } catch (err) {
            console.error('BigQuery Execution Error:', err)
          }
        }
      }
    }

    // 2. DOCUMENTATION PATH (Fallback or Hybrid)
    const shouldLoadDocs = intent === 'docs' || intent === 'hybrid' || !sqlAnswer
    let docsAnswer: VertexAnswerResult | null = null
    if (shouldLoadDocs) docsAnswer = await loadVertexAnswer({ message })

    const citations: Citation[] = []
    if (sqlCitation) citations.push(sqlCitation)
    if (docsAnswer?.citations?.length) citations.push(...docsAnswer.citations)
    else if (shouldLoadDocs) citations.push(...(await retrieveLocalDocCitations(message)))

    let answer = ''
    if (sqlAnswer && docsAnswer?.text) answer = `${sqlAnswer}\n\n${docsAnswer.text}`
    else if (sqlAnswer) answer = sqlAnswer
    else if (docsAnswer?.text) answer = docsAnswer.text
    else if (citations.length > 0) answer = `I found some relevant documentation, but couldn't generate a full summary: "${citations[0].snippet}..."`
    else answer = 'I could not find a specific answer in the live data or project documentation. Please try rephrasing your question.'

    return NextResponse.json({ answer, intent, model: 'gemini-1.5-flash-sql', citations })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
