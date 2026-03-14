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

type DeterministicAnswer = {
  answer: string
  intent: Intent
  citations: Citation[]
  model: string
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

const TEAM_ALIASES: Array<{ code: string; league: 'NBA' | 'NFL'; aliases: string[] }> = [
  { code: 'ATL', league: 'NBA', aliases: ['atlanta hawks', 'hawks', 'atl'] },
  { code: 'BOS', league: 'NBA', aliases: ['boston celtics', 'celtics', 'bos'] },
  { code: 'BKN', league: 'NBA', aliases: ['brooklyn nets', 'nets', 'bkn'] },
  { code: 'CHA', league: 'NBA', aliases: ['charlotte hornets', 'hornets', 'cha'] },
  { code: 'CHI', league: 'NBA', aliases: ['chicago bulls', 'bulls', 'chi'] },
  { code: 'CLE', league: 'NBA', aliases: ['cleveland cavaliers', 'cavaliers', 'cavs', 'cle'] },
  { code: 'DAL', league: 'NBA', aliases: ['dallas mavericks', 'mavericks', 'mavs', 'dal'] },
  { code: 'DEN', league: 'NBA', aliases: ['denver nuggets', 'nuggets', 'den'] },
  { code: 'DET', league: 'NBA', aliases: ['detroit pistons', 'pistons', 'det'] },
  { code: 'GSW', league: 'NBA', aliases: ['golden state warriors', 'warriors', 'gsw'] },
  { code: 'HOU', league: 'NBA', aliases: ['houston rockets', 'rockets', 'hou'] },
  { code: 'IND', league: 'NBA', aliases: ['indiana pacers', 'pacers', 'ind'] },
  { code: 'LAC', league: 'NBA', aliases: ['la clippers', 'los angeles clippers', 'clippers', 'lac'] },
  { code: 'LAL', league: 'NBA', aliases: ['la lakers', 'los angeles lakers', 'lakers', 'lal'] },
  { code: 'MEM', league: 'NBA', aliases: ['memphis grizzlies', 'grizzlies', 'mem'] },
  { code: 'MIA', league: 'NBA', aliases: ['miami heat', 'heat', 'mia'] },
  { code: 'MIL', league: 'NBA', aliases: ['milwaukee bucks', 'bucks', 'mil'] },
  { code: 'MIN', league: 'NBA', aliases: ['minnesota timberwolves', 'timberwolves', 'wolves', 'min'] },
  { code: 'NOP', league: 'NBA', aliases: ['new orleans pelicans', 'pelicans', 'nop'] },
  { code: 'NYK', league: 'NBA', aliases: ['new york knicks', 'knicks', 'nyk'] },
  { code: 'OKC', league: 'NBA', aliases: ['oklahoma city thunder', 'thunder', 'okc'] },
  { code: 'ORL', league: 'NBA', aliases: ['orlando magic', 'magic', 'orl'] },
  { code: 'PHI', league: 'NBA', aliases: ['philadelphia 76ers', '76ers', 'sixers', 'phi'] },
  { code: 'PHX', league: 'NBA', aliases: ['phoenix suns', 'suns', 'phx'] },
  { code: 'POR', league: 'NBA', aliases: ['portland trail blazers', 'trail blazers', 'blazers', 'por'] },
  { code: 'SAC', league: 'NBA', aliases: ['sacramento kings', 'kings', 'sac'] },
  { code: 'SAS', league: 'NBA', aliases: ['san antonio spurs', 'spurs', 'sas'] },
  { code: 'TOR', league: 'NBA', aliases: ['toronto raptors', 'raptors', 'tor'] },
  { code: 'UTA', league: 'NBA', aliases: ['utah jazz', 'jazz', 'uta'] },
  { code: 'WAS', league: 'NBA', aliases: ['washington wizards', 'wizards', 'was'] },
  { code: 'ARI', league: 'NFL', aliases: ['arizona cardinals', 'cardinals', 'ari'] },
  { code: 'ATL', league: 'NFL', aliases: ['atlanta falcons', 'falcons'] },
  { code: 'BAL', league: 'NFL', aliases: ['baltimore ravens', 'ravens', 'bal'] },
  { code: 'BUF', league: 'NFL', aliases: ['buffalo bills', 'bills', 'buf'] },
  { code: 'CAR', league: 'NFL', aliases: ['carolina panthers', 'panthers', 'car'] },
  { code: 'CHI', league: 'NFL', aliases: ['chicago bears', 'bears'] },
  { code: 'CIN', league: 'NFL', aliases: ['cincinnati bengals', 'bengals', 'cin'] },
  { code: 'CLE', league: 'NFL', aliases: ['cleveland browns', 'browns'] },
  { code: 'DAL', league: 'NFL', aliases: ['dallas cowboys', 'cowboys'] },
  { code: 'DEN', league: 'NFL', aliases: ['denver broncos', 'broncos'] },
  { code: 'DET', league: 'NFL', aliases: ['detroit lions', 'lions'] },
  { code: 'GB', league: 'NFL', aliases: ['green bay packers', 'packers', 'gb'] },
  { code: 'HOU', league: 'NFL', aliases: ['houston texans', 'texans'] },
  { code: 'IND', league: 'NFL', aliases: ['indianapolis colts', 'colts'] },
  { code: 'JAX', league: 'NFL', aliases: ['jacksonville jaguars', 'jaguars', 'jags'] },
  { code: 'KC', league: 'NFL', aliases: ['kansas city chiefs', 'chiefs', 'kc'] },
  { code: 'LAC', league: 'NFL', aliases: ['los angeles chargers', 'chargers'] },
  { code: 'LAR', league: 'NFL', aliases: ['los angeles rams', 'rams'] },
  { code: 'LV', league: 'NFL', aliases: ['las vegas raiders', 'raiders', 'lv'] },
  { code: 'MIA', league: 'NFL', aliases: ['miami dolphins', 'dolphins'] },
  { code: 'MIN', league: 'NFL', aliases: ['minnesota vikings', 'vikings'] },
  { code: 'NE', league: 'NFL', aliases: ['new england patriots', 'patriots'] },
  { code: 'NO', league: 'NFL', aliases: ['new orleans saints', 'saints'] },
  { code: 'NYG', league: 'NFL', aliases: ['new york giants', 'giants'] },
  { code: 'NYJ', league: 'NFL', aliases: ['new york jets', 'jets'] },
  { code: 'PHI', league: 'NFL', aliases: ['philadelphia eagles', 'eagles'] },
  { code: 'PIT', league: 'NFL', aliases: ['pittsburgh steelers', 'steelers'] },
  { code: 'SEA', league: 'NFL', aliases: ['seattle seahawks', 'seahawks'] },
  { code: 'SF', league: 'NFL', aliases: ['san francisco 49ers', '49ers', 'niners', 'sf'] },
  { code: 'TB', league: 'NFL', aliases: ['tampa bay buccaneers', 'buccaneers', 'bucs'] },
  { code: 'TEN', league: 'NFL', aliases: ['tennessee titans', 'titans'] },
  { code: 'WAS', league: 'NFL', aliases: ['washington commanders', 'commanders'] }
]

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

const normalizeForMatch = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const sanitizeIdentifier = (value: string, fallback: string) =>
  /^[A-Za-z_][A-Za-z0-9_]*$/.test(value) ? value : fallback

const getChatViewFqn = () => {
  const projectId = process.env.BIGQUERY_PROJECT_ID || process.env.GCP_PROJECT_ID
  const dataset = process.env.BIGQUERY_DATASET
  const view = process.env.BIGQUERY_CHAT_VIEW

  if (!projectId || !dataset || !view) return null
  if (!/^[A-Za-z0-9_]+$/.test(dataset) || !/^[A-Za-z0-9_]+$/.test(view)) return null
  return `\`${projectId}.${dataset}.${view}\``
}

const chatViewColumns = {
  homeTeam: sanitizeIdentifier(process.env.BIGQUERY_HOME_TEAM_COLUMN ?? 'home_team', 'home_team'),
  awayTeam: sanitizeIdentifier(process.env.BIGQUERY_AWAY_TEAM_COLUMN ?? 'away_team', 'away_team'),
  league: sanitizeIdentifier(process.env.BIGQUERY_LEAGUE_COLUMN ?? 'league', 'league'),
  season: sanitizeIdentifier(process.env.BIGQUERY_SEASON_COLUMN ?? 'season', 'season'),
  homeWin: sanitizeIdentifier(process.env.BIGQUERY_HOME_WIN_COLUMN ?? 'actual_home_win', 'actual_home_win'),
  homeWinProb: sanitizeIdentifier(process.env.BIGQUERY_HOME_WIN_PROB_COLUMN ?? 'my_home_win_prob', 'my_home_win_prob'),
  edgePts: sanitizeIdentifier(process.env.BIGQUERY_EDGE_COLUMN ?? 'edge_pts', 'edge_pts')
}

const getCurrentSeason = () => {
  const env = Number(process.env.SPORTS_EDGE_CURRENT_SEASON)
  if (Number.isFinite(env)) return env

  const today = new Date()
  const year = today.getUTCFullYear()
  const month = today.getUTCMonth() + 1
  return month >= 7 ? year : year - 1
}

const extractRequestedSeason = (message: string) => {
  const explicitSeason = message.match(/\b(20\d{2})\b/)
  if (explicitSeason) return Number(explicitSeason[1])
  return getCurrentSeason()
}

const inferLeague = (message: string): 'NBA' | 'NFL' => {
  const normalized = message.toLowerCase()
  if (normalized.includes('nfl') || normalized.includes('super bowl')) return 'NFL'
  return 'NBA'
}

const extractTeamCodeFromMessage = (message: string, league: 'NBA' | 'NFL') => {
  const normalized = normalizeForMatch(message)
  for (const row of TEAM_ALIASES) {
    if (row.league !== league) continue
    for (const alias of row.aliases) {
      if (normalized.includes(normalizeForMatch(alias))) {
        return row.code
      }
    }
  }
  return null
}

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const formatPct = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`

const runBigQuery = async (
  query: string,
  params?: Record<string, unknown>
): Promise<Record<string, unknown>[] | null> => {
  const client = await getBigQueryClient()
  if (!client) return null

  try {
    const [rows] = await client.query({
      query,
      params,
      useLegacySql: false
    })
    return (rows as Record<string, unknown>[]) ?? null
  } catch (error) {
    console.warn('Deterministic query failed:', error)
    return null
  }
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

TODAY'S DATE: ${new Date().toISOString().split('T')[0]}

RULES:
1. Return ONLY the SQL query. No markdown formatting, no backticks, no explanations.
2. The query must be read-only (SELECT).
3. Use fully qualified table names: \`${process.env.BIGQUERY_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.TABLE_NAME\`.
4. Apply league and season filters if mentioned or implied. (Note: NBA/NFL seasons are identified by their start year, e.g., 2025 for the 2025-26 season).
5. IMPORTANT: Team names in the database are ABBREVIATIONS (e.g., 'BOS' for Celtics, 'LAL' for Lakers, 'KC' for Chiefs, 'SF' for 49ers). ALWAYS convert nicknames or full names to their 2-3 letter abbreviations in your query.
6. If you cannot answer the question with the schema provided, return "NONE".
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
You are a helpful sports data analyst for the Sports Edge project.
The user asked: "${message}"
The database returned these results: ${JSON.stringify(dataRows)}

INSTRUCTIONS:
1. Write a concise, natural language answer based ONLY on the data provided.
2. If the results show 0 games or null values, explain that the team or data might not be found (suggest they use abbreviations like BOS or KC if appropriate).
3. If the results are valid, summarize them clearly.
4. Don't mention BigQuery or SQL. Speak to the user as an analyst.
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
    
    // Filter out Vertex "no summary" boilerplate
    if (!text || text.toLowerCase().includes('summary could not be generated')) return null

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

const deterministicResponse = async (
  message: string
): Promise<DeterministicAnswer | null> => {
  const normalized = normalizeForMatch(message)
  const league = inferLeague(normalized)
  const teamCode = extractTeamCodeFromMessage(normalized, league)
  const season = extractRequestedSeason(normalized)
  const viewFqn = getChatViewFqn()

  const riskQuestion =
    normalized.includes('caution') ||
    normalized.includes('risk') ||
    normalized.includes('limitations') ||
    normalized.includes('should someone take caution')

  if (riskQuestion) {
    const answer =
      'You should treat these outputs as decision support, not guarantees. The key risks are regime shifts, stale or missing upstream data, and small-sample variance. A high hit rate in a narrow slice can be misleading, so always check sample size, model version, and data freshness (`prediction_ts` / `odds_ts`) before trusting any edge.'

    return {
      answer,
      intent: 'docs',
      model: 'deterministic-docs',
      citations: [
        {
          source: 'docs/limitations-and-risk.txt',
          title: 'Limitations and Risk Notes',
          snippet: 'Outputs are educational; monitor non-stationarity, stale data, and sample-size risk.'
        },
        {
          source: 'docs/faq.txt',
          title: 'Portfolio Analytics FAQ',
          snippet: 'Hit rate is one diagnostic and should be segmented by model version and context.'
        }
      ]
    }
  }

  const tatumReturnQuestion =
    (normalized.includes('jayson tatum') || normalized.includes('tatum')) &&
    (normalized.includes('return') || normalized.includes('injury'))

  if (tatumReturnQuestion) {
    const baselineNote =
      viewFqn && teamCode === 'BOS'
        ? await runBigQuery(
            `
            SELECT
              AVG(CAST(${chatViewColumns.homeWinProb} AS FLOAT64)) AS avg_home_win_prob,
              COUNT(1) AS sample_size
            FROM ${viewFqn}
            WHERE UPPER(${chatViewColumns.league}) = 'NBA'
              AND ${chatViewColumns.season} = @season
              AND UPPER(${chatViewColumns.homeTeam}) = 'BOS'
              AND ${chatViewColumns.homeWinProb} IS NOT NULL
            `,
            { season }
          )
        : null

    const avgHomeWinProb = toNumber(baselineNote?.[0]?.avg_home_win_prob)
    const sampleSize = toNumber(baselineNote?.[0]?.sample_size)
    const baselineText =
      avgHomeWinProb != null && sampleSize != null
        ? ` Baseline Celtics home win probability in ${season} from the current facts view is about ${formatPct(avgHomeWinProb)} over ${Math.round(sampleSize)} games.`
        : ''

    const answer =
      `The current Sports Edge features do not explicitly model individual player return events, so any "Tatum returns" effect is a scenario judgment rather than a direct model output.${baselineText} If you want this to be first-class, add injury/availability features (on/off splits, minutes caps, RAPM/EPM deltas) and retrain with those fields.`

    return {
      answer,
      intent: 'hybrid',
      model: 'deterministic-scenario',
      citations: [
        {
          source: 'docs/limitations-and-risk.txt',
          title: 'Limitations and Risk Notes',
          snippet: 'Missing context like late injury news can invalidate priors.'
        }
      ]
    }
  }

  const seasonsQuestion =
    (normalized.includes('how many seasons') || normalized.includes('seasons')) &&
    (normalized.includes('train') || normalized.includes('trained'))

  if (seasonsQuestion && viewFqn) {
    const rows = await runBigQuery(
      `
      SELECT
        COUNT(DISTINCT ${chatViewColumns.season}) AS seasons_count,
        MIN(${chatViewColumns.season}) AS min_season,
        MAX(${chatViewColumns.season}) AS max_season
      FROM ${viewFqn}
      WHERE ${chatViewColumns.season} IS NOT NULL
      `
    )

    const seasonsCount = toNumber(rows?.[0]?.seasons_count)
    const minSeason = toNumber(rows?.[0]?.min_season)
    const maxSeason = toNumber(rows?.[0]?.max_season)

    if (seasonsCount != null && minSeason != null && maxSeason != null) {
      return {
        answer: `Based on the current chat facts view, the models are represented across ${Math.round(seasonsCount)} seasons (${Math.round(minSeason)} through ${Math.round(maxSeason)}).`,
        intent: 'sql',
        model: 'deterministic-sql',
        citations: [
          {
            source: 'bigquery',
            title: 'Live Database Results',
            snippet: 'Distinct season count from chat facts view.'
          }
        ]
      }
    }
  }

  const homeRecordQuestion =
    (normalized.includes('home record') || normalized.includes('record this season')) &&
    (normalized.includes('season') || normalized.includes('this season'))

  if (homeRecordQuestion) {
    if (!teamCode) {
      return {
        answer: 'I can answer that, but I need a team name or abbreviation (for example: BOS, LAL, KC).',
        intent: 'sql',
        model: 'deterministic-sql',
        citations: []
      }
    }

    if (viewFqn) {
      const rows = await runBigQuery(
        `
        SELECT
          COUNT(1) AS home_games,
          SUM(CASE WHEN ${chatViewColumns.homeWin} THEN 1 ELSE 0 END) AS home_wins
        FROM ${viewFqn}
        WHERE UPPER(${chatViewColumns.league}) = @league
          AND ${chatViewColumns.season} = @season
          AND UPPER(${chatViewColumns.homeTeam}) = @team
        `,
        { league, season, team: teamCode }
      )

      const homeGames = toNumber(rows?.[0]?.home_games)
      const homeWins = toNumber(rows?.[0]?.home_wins)
      if (homeGames != null && homeWins != null) {
        const losses = Math.max(0, Math.round(homeGames - homeWins))
        const winRate = homeGames > 0 ? homeWins / homeGames : 0
        return {
          answer: `For ${teamCode} in ${league} season ${season}, the home record is ${Math.round(homeWins)}-${losses} (${formatPct(winRate)} win rate across ${Math.round(homeGames)} home games).`,
          intent: 'sql',
          model: 'deterministic-sql',
          citations: [
            {
              source: 'bigquery',
              title: 'Live Database Results',
              snippet: `Home record query for ${teamCode} in season ${season}.`
            }
          ]
        }
      }
    }
  }

  const homeAwayCounterfactual =
    normalized.includes('away team') &&
    normalized.includes('home team') &&
    (normalized.includes('win percentage') || normalized.includes('winning percentage'))

  if (homeAwayCounterfactual) {
    if (!teamCode) {
      return {
        answer: 'For that counterfactual, tell me the team (for example: BOS or Celtics), and I will compute the baseline home win probability and away flip estimate.',
        intent: 'sql',
        model: 'deterministic-sql',
        citations: []
      }
    }

    if (viewFqn) {
      const rows = await runBigQuery(
        `
        SELECT
          AVG(CAST(${chatViewColumns.homeWinProb} AS FLOAT64)) AS avg_home_win_prob,
          COUNT(1) AS sample_size
        FROM ${viewFqn}
        WHERE UPPER(${chatViewColumns.league}) = @league
          AND ${chatViewColumns.season} = @season
          AND UPPER(${chatViewColumns.homeTeam}) = @team
          AND ${chatViewColumns.homeWinProb} IS NOT NULL
        `,
        { league, season, team: teamCode }
      )

      const avgHomeWinProb = toNumber(rows?.[0]?.avg_home_win_prob)
      const sampleSize = toNumber(rows?.[0]?.sample_size)
      if (avgHomeWinProb != null && sampleSize != null) {
        const awayCounterfactual = 1 - avgHomeWinProb
        const delta = awayCounterfactual - avgHomeWinProb
        const sign = delta >= 0 ? '+' : ''
        return {
          answer: `Using the current ${league} ${season} sample for ${teamCode}, average modeled home win probability is ${formatPct(avgHomeWinProb)}. A simple away-team counterfactual (flipping home/away) is ${formatPct(awayCounterfactual)}, a ${sign}${(delta * 100).toFixed(1)} point shift. This is a directional approximation, not a full re-simulation with venue-dependent features.`,
          intent: 'sql',
          model: 'deterministic-sql',
          citations: [
            {
              source: 'bigquery',
              title: 'Live Database Results',
              snippet: `Average home win probability query for ${teamCode}.`
            }
          ]
        }
      }
    }
  }

  const evQuestion =
    (normalized.includes('expected value') || normalized === 'ev' || normalized.includes(' ev ')) &&
    (normalized.includes('win percentage') || normalized.includes('winning percentage') || normalized.includes('correl'))

  if (evQuestion) {
    const answer =
      'Expected value rises with predicted win probability when market price is fixed. In betting terms, EV = p(win) * payout - (1 - p(win)) * stake. As p(win) increases, EV increases linearly for the same odds. The relationship breaks when market odds move, which is why edge and price quality both matter.'

    return {
      answer,
      intent: 'docs',
      model: 'deterministic-explanation',
      citations: [
        {
          source: 'docs/metric-definitions.txt',
          title: 'Metric Definitions',
          snippet: 'edge_pts and spread-based diagnostics describe disagreement, not guaranteed value.'
        }
      ]
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestBody
    const message = body.message?.trim()
    if (!message) return NextResponse.json({ error: 'A non-empty message is required.' }, { status: 400 })

    const deterministic = await deterministicResponse(message)
    if (deterministic) {
      return NextResponse.json(deterministic)
    }

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
