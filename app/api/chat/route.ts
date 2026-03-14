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

type VertexSearchResult = {
  snippets: string[]
  citations: Citation[]
}

const docsRoot = path.join(process.cwd(), 'docs')

const sqlKeywords = [
  'spread', 'cover', 'covered', 'ats', 'record', 'how many', 'count', 
  'home games', 'average', 'win rate', 'season', 'nfl', 'nba', 'percentage', 'won',
  'points', 'ppg', 'scored', 'allowed', 'margin', 'diff', 'difference', 'rest', 'days',
  'back to back', 'back-to-back', 'b2b', '3in4', 'schedule', 'win probability'
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
  const modelId = 'gemini-2.0-flash-001'
  
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
3. Use fully qualified table names as described in the SCHEMA.
4. Apply league and season filters if mentioned or implied. (e.g. \`season = 2025\`).
5. If you cannot answer the question with the schema provided, return "NONE".
6. Team names in the database are abbreviations (e.g. "BOS", "LAL", "KC"). Do NOT use full names in your WHERE clauses.
7. Always wrap OR conditions in parentheses when combined with AND (e.g., AND (home_team = 'BOS' OR away_team = 'BOS')).
8. IMPORTANT: For \`training_feature_view_v2\`, you MUST JOIN with \`learned-pier-478122-p7.sports_edge_raw.raw_schedules\` ON game_id to filter by team name, as the view does NOT have 'home_team' or 'away_team' columns. Example: \`JOIN \\\`learned-pier-478122-p7.sports_edge_raw.raw_schedules\\\` AS rs USING (game_id) WHERE rs.home_team = 'BOS'\`
9. DO NOT CAST BOOL fields to BIGNUMERIC or other numeric types. Use intermediate functions like COUNTIF or CASE WHEN ... THEN 1 ELSE 0 END.
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
  let sql = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  
  if (!sql || sql === 'NONE') return null

  // CLEANUP: Aggressively strip any markdown or backticks
  sql = sql.replace(/```sql|```/gi, '').trim()
  
  return sql
}

/**
 * Summarize SQL results into natural language
 */
async function summarizeData(message: string, dataRows: any[]): Promise<string | null> {
  const projectId = process.env.GCP_PROJECT_ID
  const location = 'us-central1'
  const modelId = 'gemini-2.0-flash-001'
  
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

const loadVertexSearch = async ({
  message
}: {
  message: string
}): Promise<VertexSearchResult | null> => {
  const projectId = process.env.GCP_PROJECT_ID
  const appId = process.env.VERTEX_APP_ID
  const location = process.env.VERTEX_LOCATION || 'global'

  if (!projectId || !appId) return null

  const accessToken = await getGoogleAccessToken()
  if (!accessToken) return null

  const endpoint = `https://discoveryengine.googleapis.com/v1/projects/${projectId}/locations/${location}/collections/default_collection/engines/${appId}/servingConfigs/default_search:search`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: message,
        pageSize: 5,
        contentSearchSpec: {
          snippetSpec: {
            maxSnippetCount: 1
          }
        }
      })
    })

    if (!response.ok) {
      console.error(`Vertex AI Search Error (${response.status}):`, await response.text())
      return null
    }

    const payload = (await response.json()) as any
    const results = payload.results || []
    
    const snippets: string[] = []
    const citations: Citation[] = []

    for (const result of results) {
      const doc = result.document
      const derivedData = doc?.derivedStructData
      const snippet = derivedData?.snippets?.[0]?.snippet || derivedData?.extractive_segments?.[0]?.content || ""
      
      if (snippet) snippets.push(snippet)
      
      citations.push({
        source: doc?.name || 'Vertex Search',
        title: derivedData?.title || doc?.id || 'Documentation Source',
        snippet: snippet.slice(0, 300)
      })
    }

    return { snippets, citations: citations.slice(0, 5) }
  } catch (err) {
    return null
  }
}

/**
 * Expert Consultant: Synthesizes search results + general wisdom + SQL data
 */
async function generateExpertAnswer({
  message,
  snippets,
  sqlData
}: {
  message: string
  snippets: string[]
  sqlData?: any[]
}): Promise<string | null> {
  const projectId = process.env.GCP_PROJECT_ID
  const location = 'us-central1'
  const modelId = 'gemini-2.0-flash-001'
  
  const accessToken = await getGoogleAccessToken()
  if (!accessToken || !projectId) return null

  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:generateContent`

  const contextBlock = snippets.length > 0 
    ? `DOCUMENTATION CONTEXT:\n${snippets.join('\n---\n')}`
    : "No specific documentation found for this query."

  const dataBlock = sqlData && sqlData.length > 0
    ? `LIVE DATABASE RESULTS:\n${JSON.stringify(sqlData)}`
    : ""

  const prompt = `
You are a Senior Sports Analytics Consultant and Betting Expert.
You are helping a user understand Drew Boynton's "Sports Edge" project.

USER QUESTION: "${message}"

${contextBlock}

${dataBlock}

INSTRUCTIONS:
1. Primary Goal: Answer the user's question using the provided DOCUMENTATION and DATABASE results if available.
   - CRITICAL: If LIVE DATABASE RESULTS are provided, you MUST explicitly state the actual numbers and results in your response. Do not just summarize generally; provide the specific figures returned by the query and explain what they mean.
   - NEVER output SQL queries in your response. The user only wants to see the numbers and your analysis, not the underlying code.
   - If LIVE DATABASE RESULTS are missing or empty, DO NOT attempt to write a SQL query for the user. Simply state that the data could not be retrieved and answer based on your expertise and documentation.
   - Note: The system automatically translates user questions into SQL and executes them before passing the results to you. If the results are empty, it means the system's generated query returned no data. DO NOT attempt to write a query for the user to run.
2. Expertise: Beyond the documentation, use your deep knowledge of sports statistics, betting markets, and machine learning risks to provide a nuanced, expert perspective.
3. Tone: Professional, analytical, but casual and helpful. Treat the user as an expert.
4. Gaps: If you notice gaps in the documentation or data, point them out as areas for caution.
5. Variance: Always mention the inherent variability and risk in sports betting when applicable.
6. Formatting: Use clear paragraphs and bullet points for readability.

Respond with your expert analysis:
`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 1000 }
    })
  })

  if (!response.ok) {
    console.error('Gemini Expert Answer Error:', await response.text())
    return null
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
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

const retrieveLocalDocSnippets = async (message: string): Promise<string[]> => {
  const chunks = await loadDocChunks()
  if (!chunks.length) return []
  const tokens = new Set(tokenize(message))
  const scored = chunks.map(chunk => {
    let score = 0
    for (const token of tokens) if (chunk.tokens.has(token)) score += 1
    return { chunk, score }
  }).filter(i => i.score > 0).sort((a, b) => b.score - a.score).slice(0, 3)
  return scored.map(({ chunk }) => chunk.content)
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
    let sqlData: any[] | undefined = undefined
    let sqlCitation: Citation | null = null

    // 1. DYNAMIC SQL PATH
    if (intent === 'sql' || intent === 'hybrid') {
      const generatedSql = await generateSql(message)
      if (generatedSql) {
        const bqClient = await getBigQueryClient()
        if (bqClient) {
          try {
            console.log('--- GENERATED SQL ---')
            console.log(generatedSql)
            console.log('---------------------')
            const [rows] = await bqClient.query({ query: generatedSql, useLegacySql: false })
            if (rows && rows.length > 0) {
              console.log(`BigQuery returned ${rows.length} rows.`)
              sqlData = rows
              sqlCitation = { 
                source: 'bigquery', 
                title: 'Live Database Results', 
                snippet: `Generated query results for: ${message}` 
              }
            } else {
              console.log('BigQuery returned 0 rows.')
            }
          } catch (err) {
            console.error('BigQuery Execution Error:', err)
          }
        }
      }
    }

    // 2. DOCUMENTATION PATH (Fallback or Hybrid)
    const shouldLoadDocs = intent === 'docs' || intent === 'hybrid' || !sqlData
    let searchResults: VertexSearchResult | null = null
    if (shouldLoadDocs) {
      searchResults = await loadVertexSearch({ message })
    }

    const snippets = searchResults?.snippets || []
    const citations: Citation[] = []
    
    if (sqlCitation) citations.push(sqlCitation)
    if (searchResults?.citations?.length) {
      citations.push(...searchResults.citations)
    } else if (shouldLoadDocs) {
      const localSnippets = await retrieveLocalDocSnippets(message)
      snippets.push(...localSnippets)
      citations.push(...(await retrieveLocalDocCitations(message)))
    }

    // 3. GENERATE EXPERT ANSWER
    const answer = await generateExpertAnswer({ 
      message, 
      snippets, 
      sqlData 
    }) || "I'm sorry, I couldn't generate an expert analysis for this query. Please try rephrasing."

    return NextResponse.json({ 
      answer, 
      intent, 
      model: 'gemini-2.0-flash-expert', 
      citations: citations.slice(0, 6) 
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
