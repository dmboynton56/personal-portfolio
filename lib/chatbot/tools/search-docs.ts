import { promises as fs } from 'fs'
import path from 'path'
import { getGoogleAccessToken } from '@/lib/chatbot/google'
import type {
  ChatScope,
  SearchDocsInput,
  SearchDocsOutput
} from '@/lib/chatbot/types'

type DocChunk = {
  id: string
  source: string
  title: string
  content: string
  tokens: Set<string>
}

type EmbeddedDocChunk = {
  id: string
  source: string
  title?: string
  content: string
  embedding: number[]
}

const docsRoot = path.join(process.cwd(), 'docs')
const ragEmbeddingsPath = path.join(
  process.cwd(),
  'public',
  'data',
  'rag_embeddings.json'
)

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

let docsCache: DocChunk[] | null = null
let embeddingDocsCache: EmbeddedDocChunk[] | null | undefined
const queryEmbeddingCache = new Map<string, { embedding: number[]; expiresAt: number }>()
const siteOwnerSources = new Set([
  'docs/project-knowledge/site-profile.md',
  'docs/project-knowledge/drew-resume.md'
])

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token && !stopWords.has(token))

const titleForChunk = (source: string, content: string) => {
  const heading = content.match(/^#{1,6}\s+(.+)$/m)?.[1]?.trim()
  return heading || source
}

const listMarkdownFiles = async (directory: string): Promise<string[]> => {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(fullPath)))
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.md') || entry.name.endsWith('.txt'))
    ) {
      files.push(fullPath)
    }
  }

  return files
}

const loadDocChunks = async (): Promise<DocChunk[]> => {
  if (docsCache) return docsCache

  try {
    const files = await listMarkdownFiles(docsRoot)
    const chunks: DocChunk[] = []

    for (const filePath of files) {
      const content = await fs.readFile(filePath, 'utf8')
      const source = path.relative(process.cwd(), filePath).split(path.sep).join('/')
      const sections = content.split(/\n(?=##\s+)/g)

      sections.forEach((section, index) => {
        const text = section.trim()
        if (!text) return
        chunks.push({
          id: `${source}#${index}`,
          source,
          title: titleForChunk(source, text),
          content: text,
          tokens: new Set(tokenize(text))
        })
      })
    }

    docsCache = chunks
    return chunks
  } catch {
    return []
  }
}

const loadRagEmbeddingChunks = async (): Promise<EmbeddedDocChunk[]> => {
  if (embeddingDocsCache !== undefined) return embeddingDocsCache || []

  try {
    const raw = await fs.readFile(ragEmbeddingsPath, 'utf8')
    const artifact = JSON.parse(raw)
    const chunks = Array.isArray(artifact) ? artifact : artifact.chunks
    embeddingDocsCache = (Array.isArray(chunks) ? chunks : []).filter(
      (chunk): chunk is EmbeddedDocChunk =>
        typeof chunk?.id === 'string' &&
        typeof chunk?.source === 'string' &&
        typeof chunk?.content === 'string' &&
        Array.isArray(chunk?.embedding)
    )
    return embeddingDocsCache
  } catch {
    embeddingDocsCache = null
    return []
  }
}

const cosineSimilarity = (a: number[], b: number[]) => {
  let dot = 0
  let normA = 0
  let normB = 0
  const length = Math.min(a.length, b.length)

  for (let index = 0; index < length; index += 1) {
    dot += a[index] * b[index]
    normA += a[index] * a[index]
    normB += b[index] * b[index]
  }

  if (!normA || !normB) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

const embedQuery = async (message: string): Promise<number[]> => {
  const cacheKey = message.toLowerCase().trim()
  const cached = queryEmbeddingCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.embedding

  const projectId =
    process.env.VERTEX_AI_PROJECT ||
    process.env.GCP_PROJECT_ID ||
    process.env.BIGQUERY_PROJECT_ID
  const location = process.env.VERTEX_AI_LOCATION || process.env.GCP_LOCATION || 'us-central1'
  const modelId = process.env.VERTEX_AI_EMBEDDING_MODEL || 'text-embedding-004'
  if (!projectId) throw new Error('Missing Google project id for query embeddings.')

  const accessToken = await getGoogleAccessToken()
  if (!accessToken) throw new Error('Missing Google access token for query embeddings.')

  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:predict`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      instances: [{ content: message, task_type: 'RETRIEVAL_QUERY' }]
    })
  })

  if (!response.ok) {
    throw new Error(
      `Query embedding request failed (${response.status}): ${await response.text()}`
    )
  }

  const payload = await response.json()
  const prediction = payload.predictions?.[0]
  const embedding =
    prediction?.embeddings?.values || prediction?.values || prediction?.embedding
  if (!Array.isArray(embedding)) {
    throw new Error('Query embedding response did not include a vector.')
  }

  queryEmbeddingCache.set(cacheKey, {
    embedding,
    expiresAt: Date.now() + 5 * 60 * 1000
  })
  return embedding
}

const sourceMatchesScope = (
  source: string,
  project?: Exclude<ChatScope, 'default'>,
  content = ''
) => {
  const normalizedContent = content.toLowerCase()

  if (siteOwnerSources.has(source)) return true

  if (project === 'sports-edge') {
    if (source === 'docs/project-knowledge/evidence-register.md') {
      return normalizedContent.includes('sports edge') || normalizedContent.includes('sports-edge')
    }
    if (source === 'docs/metric-definitions.txt') {
      return !normalizedContent.includes('nba hall of fame')
    }

    return (
      source.startsWith('docs/project-knowledge/sports-edge/') ||
      source.startsWith('docs/model-cards/sports-edge-') ||
      source === 'docs/data-dictionary.txt' ||
      source === 'docs/warehouse-schema.txt' ||
      source === 'docs/metric-definitions.txt' ||
      source === 'docs/limitations-and-risk.txt' ||
      source === 'docs/faq.txt'
    )
  }

  if (project === 'llm-advisor') {
    if (source === 'docs/project-knowledge/evidence-register.md') {
      return (
        normalizedContent.includes('llm advisor') ||
        normalizedContent.includes('llm-advisor')
      )
    }

    return (
      source.startsWith('docs/project-knowledge/llm-advisor/')
    )
  }

  if (project === 'nba-hof') {
    if (source === 'docs/project-knowledge/evidence-register.md') {
      return normalizedContent.includes('nba') || normalizedContent.includes('hof')
    }

    return (
      source === 'docs/model-cards/nba-hof-xgboost.txt' ||
      source.includes('nba-hof')
    )
  }

  if (project === 'matchpoint') {
    if (source === 'docs/project-knowledge/evidence-register.md') {
      return normalizedContent.includes('matchpoint')
    }

    return source.startsWith('docs/project-knowledge/matchpoint/')
  }

  return (
    source.startsWith('docs/project-knowledge/') ||
    source.startsWith('docs/model-cards/') ||
    source.startsWith('docs/project-postmortems/') ||
    source === 'docs/faq.txt' ||
    source === 'docs/metric-definitions.txt' ||
    source === 'docs/limitations-and-risk.txt' ||
    source === 'docs/data-dictionary.txt' ||
    source === 'docs/warehouse-schema.txt'
  )
}

const toOutput = (
  chunks: Array<{ source: string; title: string; content: string }>
): SearchDocsOutput => ({
  snippets: chunks.map((chunk) => ({
    title: chunk.title,
    source: chunk.source,
    excerpt: chunk.content
  })),
  citations: chunks.map((chunk) => ({
    type: 'doc',
    title: chunk.title,
    source: chunk.source,
    snippet: chunk.content.slice(0, 280)
  }))
})

const isMethodologyQuery = (query: string) =>
  /\b(why|how|explain|method|methodology|risk|limitation|architecture|feature|calibration)\b/i.test(
    query
  )

const isSchemaQuery = (query: string) =>
  /\b(schema|bigquery|join|recipe|spread|cover|ats|warehouse|sql|table|column)\b/i.test(
    query
  )

const isPortfolioOverviewQuery = (query: string) =>
  /\b(portfolio|showcases?|projects?\b|work samples?|case studies?|flagships?|deep dives?|carousel|on this site|this site)\b/i.test(
    query
  ) ||
  /\bwhat\b.*\b(include|projects?|showcase|built|offer|have)\b/i.test(query)

const isSiteProfileQuery = (query: string) =>
  /\b(who is|who's|about (me|you|drew)|tell me about|background|bio|engineer|contact|reach|hire|hiring|email|e-mail|phone|linkedin|github|social|resume|résumé|cv)\b/i.test(
    query
  ) ||
  /\bdrew\b/i.test(query) ||
  /\bboynton\b/i.test(query)

const isResumeQuery = (query: string) =>
  /\b(resume|résumé|cv|curriculum vitae)\b/i.test(query) ||
  /\b(download|view|open|get)\b.*\b(pdf|resume|résumé|cv)\b/i.test(query) ||
  /\b(pdf)\b.*\b(download|view|open|get)\b/i.test(query)

const isProjectCatalogQuery = (query: string) =>
  /\b(sports edge|llm advisor|matchpoint|nba|hall of fame|hof|mancala|simple fitness|housecluster|heatmap|ictml|flagship|carousel|project)\b/i.test(
    query
  )

const sourceBoost = (source: string, query: string) => {
  if (isResumeQuery(query)) {
    if (source === 'docs/project-knowledge/drew-resume.md') return 12
    if (source === 'docs/project-knowledge/site-profile.md') return 6
  }
  if (isSiteProfileQuery(query)) {
    if (source === 'docs/project-knowledge/site-profile.md') return 10
    if (source === 'docs/project-knowledge/drew-resume.md') return 4
    if (source === 'docs/project-knowledge/portfolio-overview.md') return 1
    if (source.startsWith('docs/project-knowledge/sports-edge/')) return -4
    if (source.startsWith('docs/project-knowledge/llm-advisor/')) return -3
    if (source.startsWith('docs/project-knowledge/nba-hof')) return -3
    if (source.startsWith('docs/project-knowledge/matchpoint/')) return -3
  }
  if (isPortfolioOverviewQuery(query) || isProjectCatalogQuery(query)) {
    if (source === 'docs/project-knowledge/portfolio-overview.md') return 8
    if (source === 'docs/project-knowledge/question-index.md') return 2
    if (source === 'docs/project-knowledge/site-profile.md') return 1
  }
  if (isSchemaQuery(query)) {
    if (source === 'docs/warehouse-schema.txt') return 6
    if (source === 'docs/metric-definitions.txt') return 5
    if (source === 'docs/data-dictionary.txt') return 3
  }
  if (!isMethodologyQuery(query)) return 0
  if (source === 'docs/data-dictionary.txt') return -2
  if (source === 'docs/metric-definitions.txt') return 4
  if (source.includes('/project-knowledge/')) return 3
  if (source.includes('/model-cards/')) return 2
  return 0
}

const retrieveWithTokenOverlap = async (
  input: SearchDocsInput
): Promise<SearchDocsOutput> => {
  const chunks = (await loadDocChunks()).filter((chunk) =>
    sourceMatchesScope(chunk.source, input.project, chunk.content)
  )
  if (!chunks.length) return { snippets: [], citations: [] }

  const tokens = new Set(tokenize(input.query))
  const scored = chunks
    .map((chunk) => {
      let score = 0
      for (const token of tokens) {
        if (chunk.tokens.has(token)) score += 1
      }
      score += sourceBoost(chunk.source, input.query)
      return { chunk, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, input.topK ?? 4)

  return toOutput(scored.map(({ chunk }) => chunk))
}

const retrieveWithEmbeddings = async (
  input: SearchDocsInput
): Promise<SearchDocsOutput> => {
  const chunks = (await loadRagEmbeddingChunks()).filter((chunk) =>
    sourceMatchesScope(chunk.source, input.project, chunk.content)
  )
  if (!chunks.length) throw new Error('No local RAG embeddings artifact found.')

  const queryEmbedding = await embedQuery(input.query)
  const scored = chunks
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding) + sourceBoost(chunk.source, input.query) * 0.05
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, input.topK ?? 4)

  const embeddingChunks = scored.map(({ chunk }) => ({
      ...chunk,
      title: chunk.title || titleForChunk(chunk.source, chunk.content)
    }))
  const lexicalChunks = (await retrieveWithTokenOverlap(input)).snippets.map((snippet) => ({
    source: snippet.source,
    title: snippet.title,
    content: snippet.excerpt
  }))

  const orderedChunks = isResumeQuery(input.query)
    ? [...lexicalChunks, ...embeddingChunks]
    : [...embeddingChunks, ...lexicalChunks]
  const seen = new Set<string>()
  const mergedChunks = orderedChunks.filter((chunk) => {
    const key = `${chunk.source}:${chunk.title}:${chunk.content}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return toOutput(mergedChunks.slice(0, input.topK ?? 4))
}

export const searchDocs = async (
  input: SearchDocsInput
): Promise<SearchDocsOutput> => {
  const embeddingChunks = await loadRagEmbeddingChunks()
  if (embeddingChunks.length) {
    try {
      return await retrieveWithEmbeddings(input)
    } catch (error) {
      console.warn('Embedding retrieval failed, falling back to token overlap', error)
    }
  }

  return retrieveWithTokenOverlap(input)
}
