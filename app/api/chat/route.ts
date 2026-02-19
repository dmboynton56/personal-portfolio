import { NextRequest, NextResponse } from 'next/server'
import { BigQuery, type BigQueryOptions } from '@google-cloud/bigquery'
import { GoogleAuth, type JWTInput } from 'google-auth-library'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type League = 'NFL' | 'NBA'
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

type BigQueryHomeCoverStats = {
  team: string
  league: League
  season: number
  homeGames: number
  homeCovers: number
  pushes: number
}

type VertexAnswerResult = {
  text: string
  citations: Citation[]
}

type BigQueryRow = Record<string, unknown>

const docsRoot = path.join(process.cwd(), 'docs')

const sqlKeywords = [
  'spread',
  'cover',
  'covered',
  'ats',
  'record',
  'how many',
  'count',
  'home games',
  'average',
  'win rate',
  'season',
  'nfl',
  'nba'
]

const docsKeywords = [
  'why',
  'how',
  'explain',
  'method',
  'assumption',
  'risk',
  'limitation',
  'architecture',
  'documentation',
  'model card',
  'metric definition'
]

const stopWords = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'have',
  'how',
  'i',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'our',
  'that',
  'the',
  'this',
  'to',
  'what',
  'when',
  'where',
  'which',
  'with',
  'you',
  'your'
])

const nbaTeamAliases: Array<{ alias: string; canonical: string }> = [
  { alias: 'hawks', canonical: 'Atlanta Hawks' },
  { alias: 'celtics', canonical: 'Boston Celtics' },
  { alias: 'nets', canonical: 'Brooklyn Nets' },
  { alias: 'hornets', canonical: 'Charlotte Hornets' },
  { alias: 'bulls', canonical: 'Chicago Bulls' },
  { alias: 'cavaliers', canonical: 'Cleveland Cavaliers' },
  { alias: 'cavs', canonical: 'Cleveland Cavaliers' },
  { alias: 'mavericks', canonical: 'Dallas Mavericks' },
  { alias: 'mavs', canonical: 'Dallas Mavericks' },
  { alias: 'nuggets', canonical: 'Denver Nuggets' },
  { alias: 'pistons', canonical: 'Detroit Pistons' },
  { alias: 'warriors', canonical: 'Golden State Warriors' },
  { alias: 'rockets', canonical: 'Houston Rockets' },
  { alias: 'pacers', canonical: 'Indiana Pacers' },
  { alias: 'clippers', canonical: 'Los Angeles Clippers' },
  { alias: 'lakers', canonical: 'Los Angeles Lakers' },
  { alias: 'grizzlies', canonical: 'Memphis Grizzlies' },
  { alias: 'heat', canonical: 'Miami Heat' },
  { alias: 'bucks', canonical: 'Milwaukee Bucks' },
  { alias: 'timberwolves', canonical: 'Minnesota Timberwolves' },
  { alias: 'wolves', canonical: 'Minnesota Timberwolves' },
  { alias: 'pelicans', canonical: 'New Orleans Pelicans' },
  { alias: 'knicks', canonical: 'New York Knicks' },
  { alias: 'thunder', canonical: 'Oklahoma City Thunder' },
  { alias: 'magic', canonical: 'Orlando Magic' },
  { alias: '76ers', canonical: 'Philadelphia 76ers' },
  { alias: 'sixers', canonical: 'Philadelphia 76ers' },
  { alias: 'suns', canonical: 'Phoenix Suns' },
  { alias: 'blazers', canonical: 'Portland Trail Blazers' },
  { alias: 'trail blazers', canonical: 'Portland Trail Blazers' },
  { alias: 'kings', canonical: 'Sacramento Kings' },
  { alias: 'spurs', canonical: 'San Antonio Spurs' },
  { alias: 'raptors', canonical: 'Toronto Raptors' },
  { alias: 'jazz', canonical: 'Utah Jazz' },
  { alias: 'wizards', canonical: 'Washington Wizards' }
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
  } catch {
    return null
  }
}

const decodeBase64Credentials = (base64?: string | null): JWTInput | null => {
  if (!base64?.trim()) return null

  try {
    const json = Buffer.from(base64, 'base64').toString('utf8')
    return parseJsonCredentials(json)
  } catch {
    return null
  }
}

const loadFileCredentials = async (filePath?: string | null): Promise<JWTInput | null> => {
  if (!filePath?.trim()) return null

  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath)
    const content = await fs.readFile(resolvedPath, 'utf8')
    return parseJsonCredentials(content)
  } catch {
    return null
  }
}

const getGoogleCredentials = async (): Promise<JWTInput | undefined> => {
  if (credentialsCache !== undefined) {
    return credentialsCache ?? undefined
  }

  const fromJson = parseJsonCredentials(process.env.GCP_SERVICE_ACCOUNT_JSON)
  if (fromJson) {
    credentialsCache = fromJson
    return fromJson
  }

  const fromBase64 = decodeBase64Credentials(process.env.GCP_SERVICE_ACCOUNT_JSON_BASE64)
  if (fromBase64) {
    credentialsCache = fromBase64
    return fromBase64
  }

  const fromFile = await loadFileCredentials(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  if (fromFile) {
    credentialsCache = fromFile
    return fromFile
  }

  credentialsCache = null
  return undefined
}

const getBigQueryClient = async (): Promise<BigQuery | null> => {
  if (bigQueryCache !== undefined) {
    return bigQueryCache
  }

  const projectId = process.env.BIGQUERY_PROJECT_ID || process.env.GCP_PROJECT_ID
  if (!projectId) {
    bigQueryCache = null
    return null
  }

  const credentials = await getGoogleCredentials()

  const options: BigQueryOptions = {
    projectId
  }

  if (credentials) {
    options.credentials = credentials
  }

  bigQueryCache = new BigQuery(options)
  return bigQueryCache
}

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token && !stopWords.has(token))

const detectIntent = (message: string): Intent => {
  const normalized = message.toLowerCase()

  const sqlScore = sqlKeywords.reduce(
    (acc, keyword) => acc + (normalized.includes(keyword) ? 1 : 0),
    0
  )
  const docsScore = docsKeywords.reduce(
    (acc, keyword) => acc + (normalized.includes(keyword) ? 1 : 0),
    0
  )

  if (sqlScore > 0 && docsScore > 0) return 'hybrid'
  if (sqlScore > 0) return 'sql'
  if (docsScore > 0) return 'docs'

  return 'hybrid'
}

const parseLeagueFromMessage = (message: string): League | undefined => {
  if (/\bnba\b|basketball/i.test(message)) return 'NBA'
  if (/\bnfl\b|football/i.test(message)) return 'NFL'
  return undefined
}

const getDefaultSeason = () => {
  const seasonFromEnv = Number(process.env.SPORTS_EDGE_CURRENT_SEASON)
  if (Number.isFinite(seasonFromEnv)) {
    return seasonFromEnv
  }

  const now = new Date()
  return now.getUTCMonth() >= 7 ? now.getUTCFullYear() : now.getUTCFullYear() - 1
}

const parseSeasonFromMessage = (message: string): number => {
  const yearMatch = message.match(/\b(20\d{2})\b/)
  if (yearMatch) {
    const parsed = Number(yearMatch[1])
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  if (/\bthis\s+(year|season)\b|\bcurrent\s+season\b/i.test(message)) {
    return getDefaultSeason()
  }

  return getDefaultSeason()
}

const parseTeamFromMessage = (message: string): { league: League; canonical: string } | null => {
  const normalized = message.toLowerCase()
  for (const team of nbaTeamAliases) {
    const pattern = new RegExp(`\\b${team.alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i')
    if (pattern.test(normalized)) {
      return { league: 'NBA', canonical: team.canonical }
    }
  }

  return null
}

const isHomeCoverCountQuestion = (message: string) => {
  const normalized = message.toLowerCase()
  const asksCount = /how many|count|record|what is|what's|show me/i.test(normalized)
  const asksCover = /covered?\s+the\s+spread|against\s+the\s+spread|\bats\b/i.test(normalized)
  const asksHome = /\bhome\b/.test(normalized)

  return asksCount && asksCover && asksHome
}

const isValidIdentifier = (value: string) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)

const getChatViewConfig = () => {
  const projectId = process.env.BIGQUERY_PROJECT_ID || process.env.GCP_PROJECT_ID
  const dataset = process.env.BIGQUERY_DATASET
  const view = process.env.BIGQUERY_CHAT_VIEW

  if (!projectId || !dataset || !view) {
    return null
  }

  const homeTeamCol = process.env.BIGQUERY_HOME_TEAM_COLUMN || 'home_team'
  const leagueCol = process.env.BIGQUERY_LEAGUE_COLUMN || 'league'
  const seasonCol = process.env.BIGQUERY_SEASON_COLUMN || 'season'
  const atsCol = process.env.BIGQUERY_ATS_RESULT_COLUMN || 'ats_result'

  if (
    !isValidIdentifier(homeTeamCol) ||
    !isValidIdentifier(leagueCol) ||
    !isValidIdentifier(seasonCol) ||
    !isValidIdentifier(atsCol)
  ) {
    return null
  }

  return {
    tableRef: `\`${projectId}.${dataset}.${view}\``,
    homeTeamCol,
    leagueCol,
    seasonCol,
    atsCol,
    homeCoverValue: (process.env.BIGQUERY_HOME_COVER_VALUE || 'HOME_COVER').toUpperCase(),
    pushValue: (process.env.BIGQUERY_PUSH_VALUE || 'PUSH').toUpperCase()
  }
}

const asNumber = (value: unknown) => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const loadTeamHomeCoverStats = async ({
  team,
  league,
  season
}: {
  team: string
  league: League
  season: number
}): Promise<BigQueryHomeCoverStats | null> => {
  const client = await getBigQueryClient()
  const viewConfig = getChatViewConfig()

  if (!client || !viewConfig) return null

  const query = `
    SELECT
      COUNT(1) AS home_games,
      COUNTIF(UPPER(CAST(${viewConfig.atsCol} AS STRING)) = @homeCoverValue) AS home_covers,
      COUNTIF(UPPER(CAST(${viewConfig.atsCol} AS STRING)) = @pushValue) AS pushes
    FROM ${viewConfig.tableRef}
    WHERE UPPER(CAST(${viewConfig.leagueCol} AS STRING)) = @league
      AND CAST(${viewConfig.seasonCol} AS INT64) = @season
      AND (
        LOWER(CAST(${viewConfig.homeTeamCol} AS STRING)) = @team
        OR LOWER(CAST(${viewConfig.homeTeamCol} AS STRING)) = @teamShort
      )
      AND ${viewConfig.atsCol} IS NOT NULL
  `

  const teamShort = team.split(' ').slice(-1)[0].toLowerCase()

  const [rows] = await client.query({
    query,
    useLegacySql: false,
    params: {
      league,
      season,
      team: team.toLowerCase(),
      teamShort,
      homeCoverValue: viewConfig.homeCoverValue,
      pushValue: viewConfig.pushValue
    }
  })

  const row = rows[0] as BigQueryRow | undefined
  if (!row) return null

  return {
    team,
    league,
    season,
    homeGames: asNumber(row.home_games),
    homeCovers: asNumber(row.home_covers),
    pushes: asNumber(row.pushes)
  }
}

const formatHomeCoverAnswer = (stats: BigQueryHomeCoverStats) => {
  if (stats.homeGames <= 0) {
    return `I found no completed ${stats.league} home games for ${stats.team} in season ${stats.season} in the configured BigQuery view.`
  }

  const coverRate = (stats.homeCovers / stats.homeGames) * 100

  return `${stats.team} have covered the spread in ${stats.homeCovers} of ${stats.homeGames} home games in the ${stats.season}-${stats.season + 1} season (${coverRate.toFixed(1)}%), with ${stats.pushes} pushes.`
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

const toCitation = (source: unknown): Citation | null => {
  if (!source || typeof source !== 'object') return null

  const record = source as Record<string, unknown>
  const title =
    (typeof record.title === 'string' && record.title) ||
    (typeof record.documentTitle === 'string' && record.documentTitle) ||
    (typeof record.uri === 'string' && record.uri) ||
    'Vertex Source'

  const uri =
    (typeof record.uri === 'string' && record.uri) ||
    (typeof record.referenceId === 'string' && record.referenceId) ||
    'vertex-ai-search'

  const snippet =
    (typeof record.snippet === 'string' && record.snippet) ||
    (typeof record.content === 'string' && record.content.slice(0, 280)) ||
    ''

  return {
    source: uri,
    title,
    snippet
  }
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
      for (const citationEntry of answerCitations) {
        if (!citationEntry || typeof citationEntry !== 'object') continue
        const entryRecord = citationEntry as Record<string, unknown>
        const sources = entryRecord.sources
        if (Array.isArray(sources)) {
          for (const source of sources) {
            pushCitation(toCitation(source))
          }
        }
      }
    }

    const references = answerRecord.references
    if (Array.isArray(references)) {
      for (const reference of references) {
        pushCitation(toCitation(reference))
      }
    }
  }

  const searchResultList = payload.searchResultList
  if (searchResultList && typeof searchResultList === 'object') {
    const listRecord = searchResultList as Record<string, unknown>
    const results = listRecord.results
    if (Array.isArray(results)) {
      for (const result of results) {
        if (!result || typeof result !== 'object') continue
        const resultRecord = result as Record<string, unknown>
        const document = resultRecord.document
        pushCitation(toCitation(document ?? result))
      }
    }
  }

  return citations.slice(0, 6)
}

const loadVertexAnswer = async ({
  message
}: {
  message: string
}): Promise<VertexAnswerResult | null> => {
  const projectId = process.env.GCP_PROJECT_ID
  const appId = process.env.VERTEX_APP_ID
  const location = process.env.VERTEX_LOCATION || 'global'

  if (!projectId || !appId) return null

  const accessToken = await getGoogleAccessToken()
  if (!accessToken) return null

  const endpoint =
    `https://discoveryengine.googleapis.com/v1/projects/${projectId}` +
    `/locations/${location}/collections/default_collection/engines/${appId}` +
    '/servingConfigs/default_search:answer'

  const body: Record<string, unknown> = {
    query: {
      text: message
    },
    answerGenerationSpec: {
      includeCitations: true
    }
  }

  const timeoutMs = Number(process.env.VERTEX_TIMEOUT_MS || 45000)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: controller.signal
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as Record<string, unknown>
    const answerRecord = payload.answer as Record<string, unknown> | undefined
    const text =
      (answerRecord &&
        typeof answerRecord.answerText === 'string' &&
        answerRecord.answerText.trim()) ||
      ''

    if (!text) return null

    return {
      text,
      citations: extractVertexCitations(payload)
    }
  } finally {
    clearTimeout(timeout)
  }
}

const listMarkdownFiles = async (directory: string): Promise<string[]> => {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(fullPath)))
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

const relativePath = (absolutePath: string) =>
  path.relative(process.cwd(), absolutePath).split(path.sep).join('/')

const pushDocChunk = (
  chunks: DocChunk[],
  source: string,
  title: string,
  text: string,
  index: number
) => {
  const content = text.trim()
  if (!content) return

  chunks.push({
    id: `${source}#${index}`,
    source,
    title,
    content,
    tokens: new Set(tokenize(`${title} ${content}`))
  })
}

const chunkMarkdown = (source: string, markdown: string): DocChunk[] => {
  const chunks: DocChunk[] = []
  const baseHeadingMatch = markdown.match(/^#\s+(.+)$/m)
  const baseTitle = baseHeadingMatch?.[1]?.trim() || source
  const sections = markdown
    .split(/\n(?=##\s+)/g)
    .map((section) => section.trim())
    .filter(Boolean)

  let index = 0

  if (sections.length === 0) {
    pushDocChunk(chunks, source, baseTitle, markdown, index)
    return chunks
  }

  for (const section of sections) {
    const lines = section.split('\n')
    const headingLine = lines.find((line) => line.startsWith('## '))
    const title = headingLine
      ? `${baseTitle} / ${headingLine.replace(/^##\s+/, '').trim()}`
      : baseTitle

    const sectionBody = headingLine
      ? lines.filter((line) => line !== headingLine).join('\n').trim()
      : section

    if (!sectionBody) continue

    const paragraphs = sectionBody
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean)

    let buffer = ''
    for (const paragraph of paragraphs) {
      if ((buffer + '\n\n' + paragraph).trim().length > 900 && buffer) {
        pushDocChunk(chunks, source, title, buffer, index)
        index += 1
        buffer = paragraph
      } else {
        buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph
      }
    }

    if (buffer) {
      pushDocChunk(chunks, source, title, buffer, index)
      index += 1
    }
  }

  return chunks
}

const loadDocChunks = async (): Promise<DocChunk[]> => {
  if (docsCache) return docsCache

  try {
    const files = await listMarkdownFiles(docsRoot)
    const markdownFiles = files.filter((filePath) =>
      relativePath(filePath).startsWith('docs/')
    )

    const allChunks: DocChunk[] = []
    for (const filePath of markdownFiles) {
      const content = await fs.readFile(filePath, 'utf8')
      const source = relativePath(filePath)
      allChunks.push(...chunkMarkdown(source, content))
    }

    docsCache = allChunks
    return allChunks
  } catch {
    docsCache = []
    return []
  }
}

const retrieveLocalDocCitations = async (message: string): Promise<Citation[]> => {
  const chunks = await loadDocChunks()
  if (!chunks.length) return []

  const tokens = new Set(tokenize(message))

  const scored = chunks
    .map((chunk) => {
      let score = 0
      for (const token of tokens) {
        if (chunk.tokens.has(token)) score += 1
      }

      return { chunk, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  return scored.map(({ chunk }) => ({
    source: chunk.source,
    title: chunk.title,
    snippet: chunk.content.slice(0, 280).replace(/\s+/g, ' ').trim()
  }))
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestBody
    const message = body.message?.trim()

    if (!message) {
      return NextResponse.json({ error: 'A non-empty message is required.' }, { status: 400 })
    }

    const intent = detectIntent(message)
    const parsedTeam = parseTeamFromMessage(message)
    const requestedLeague = parseLeagueFromMessage(message) || parsedTeam?.league || 'NFL'
    const requestedSeason = parseSeasonFromMessage(message)

    let sqlAnswer: string | null = null
    let sqlCitation: Citation | null = null

    if (intent === 'sql' || intent === 'hybrid') {
      if (isHomeCoverCountQuestion(message) && parsedTeam) {
        const stats = await loadTeamHomeCoverStats({
          team: parsedTeam.canonical,
          league: parsedTeam.league,
          season: requestedSeason
        })

        if (stats) {
          sqlAnswer = formatHomeCoverAnswer(stats)
          sqlCitation = {
            source: `bigquery:${process.env.BIGQUERY_DATASET || 'dataset'}.${process.env.BIGQUERY_CHAT_VIEW || 'chat_view'}`,
            title: 'BigQuery Chat Facts View',
            snippet: `Season ${stats.season}, ${stats.team} home ATS: ${stats.homeCovers}/${stats.homeGames} with ${stats.pushes} pushes.`
          }
        } else {
          sqlAnswer =
            'I could not query BigQuery chat facts. Check BIGQUERY_PROJECT_ID, BIGQUERY_DATASET, BIGQUERY_CHAT_VIEW, and your view column mappings.'
        }
      }
    }

    const shouldLoadDocs = intent === 'docs' || intent === 'hybrid' || !sqlAnswer
    let docsAnswer: VertexAnswerResult | null = null

    if (shouldLoadDocs) {
      docsAnswer = await loadVertexAnswer({ message })
    }

    const citations: Citation[] = []
    if (sqlCitation) citations.push(sqlCitation)

    if (docsAnswer?.citations?.length) {
      citations.push(...docsAnswer.citations)
    } else if (shouldLoadDocs) {
      citations.push(...(await retrieveLocalDocCitations(message)))
    }

    let answer = ''
    if (sqlAnswer && docsAnswer?.text) {
      answer = `${sqlAnswer}\n\n${docsAnswer.text}`
    } else if (sqlAnswer) {
      answer = sqlAnswer
    } else if (docsAnswer?.text) {
      answer = docsAnswer.text
    } else {
      answer =
        'I could not reach Vertex or BigQuery with the current environment config. Verify local credentials and environment variables, then retry.'
    }

    return NextResponse.json({
      answer,
      intent,
      league: requestedLeague,
      season: requestedSeason,
      model: process.env.VERTEX_MODEL || 'vertex-search-answer',
      citations
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
