#!/usr/bin/env node
/**
 * Builds public/data/rag_embeddings.json from the local docs corpus.
 *
 * Auth:
 * - GOOGLE_APPLICATION_CREDENTIALS for local ADC/service-account files, or
 * - GCP_SERVICE_ACCOUNT_JSON / GCP_SERVICE_ACCOUNT_JSON_BASE64 for CI.
 */
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { GoogleAuth } from 'google-auth-library'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const docsRoot = path.join(root, 'docs')
const manifestPath = path.join(root, 'public', 'data', 'rag_manifest.json')
const outPath = path.join(root, 'public', 'data', 'rag_embeddings.json')

async function loadEnvFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return

      const separator = trimmed.indexOf('=')
      if (separator === -1) return

      const key = trimmed.slice(0, separator).trim()
      let value = trimmed.slice(separator + 1).trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (key && process.env[key] === undefined) process.env[key] = value
    })
  } catch {
    // Optional local convenience only.
  }
}

await loadEnvFile(path.join(root, '.env.local'))
await loadEnvFile(path.join(root, '.env'))

const projectId = process.env.VERTEX_AI_PROJECT || process.env.GCP_PROJECT_ID || process.env.BIGQUERY_PROJECT_ID
const location = process.env.VERTEX_AI_LOCATION || process.env.GCP_LOCATION || 'us-central1'
const model = process.env.VERTEX_AI_EMBEDDING_MODEL || 'text-embedding-004'
const batchSize = Number.parseInt(process.env.RAG_EMBEDDING_BATCH_SIZE || '16', 10)
const taskType = 'RETRIEVAL_DOCUMENT'

async function walkDocs(dir, acc = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) await walkDocs(fullPath, acc)
    else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.txt'))) acc.push(fullPath)
  }
  return acc
}

function splitDoc(text) {
  return text.split(/\n(?=##\s+)/g).map((chunk) => chunk.trim()).filter(Boolean)
}

function titleFor(source, content) {
  const heading = content.match(/^#{1,6}\s+(.+)$/m)?.[1]?.trim()
  return heading || source
}

async function loadManifestChunks() {
  try {
    const raw = await fs.readFile(manifestPath, 'utf8')
    const manifest = JSON.parse(raw)
    return Array.isArray(manifest) ? manifest : manifest.chunks || []
  } catch {
    return null
  }
}

async function buildChunksFromDocs() {
  const files = await walkDocs(docsRoot).catch(() => [])
  const chunks = []
  for (const file of files) {
    const source = path.relative(root, file).split(path.sep).join('/')
    const content = await fs.readFile(file, 'utf8')
    splitDoc(content).forEach((chunk, index) => {
      chunks.push({
        id: `${source}#${index}`,
        source,
        title: titleFor(source, chunk),
        content: chunk,
        charCount: chunk.length
      })
    })
  }
  return chunks
}

async function buildChunksFromManifest() {
  const manifestChunks = await loadManifestChunks()
  if (!manifestChunks?.length) return buildChunksFromDocs()

  const docCache = new Map()
  const chunks = []
  for (const manifestChunk of manifestChunks) {
    const source = manifestChunk.source
    if (!source) continue

    if (!docCache.has(source)) {
      const filePath = path.join(root, source)
      const raw = await fs.readFile(filePath, 'utf8')
      docCache.set(source, splitDoc(raw))
    }

    const index = Number.parseInt(String(manifestChunk.id || '').split('#').pop() || '0', 10)
    const content = manifestChunk.content || docCache.get(source)?.[index]
    if (!content) continue

    chunks.push({
      id: manifestChunk.id || `${source}#${index}`,
      source,
      title: manifestChunk.title || titleFor(source, content),
      content,
      charCount: content.length
    })
  }

  return chunks
}

function parseJsonCredentials(raw) {
  if (!raw?.trim()) return undefined
  const parsed = JSON.parse(raw)
  if (parsed.private_key) parsed.private_key = parsed.private_key.replace(/\\n/g, '\n')
  return parsed
}

function googleAuth() {
  const credentials =
    parseJsonCredentials(process.env.GCP_SERVICE_ACCOUNT_JSON) ||
    parseJsonCredentials(
      process.env.GCP_SERVICE_ACCOUNT_JSON_BASE64
        ? Buffer.from(process.env.GCP_SERVICE_ACCOUNT_JSON_BASE64, 'base64').toString('utf8')
        : undefined
    )

  return new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    credentials
  })
}

async function prepareCredentialFileEnv() {
  const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (!credentialPath?.trim()) return

  if (process.platform !== 'win32' && /^[a-z]:[\\/]/i.test(credentialPath)) {
    console.warn('Ignoring GOOGLE_APPLICATION_CREDENTIALS because it is a Windows path in this environment.')
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS
    return
  }

  const resolvedPath = path.isAbsolute(credentialPath) ? credentialPath : path.resolve(root, credentialPath)
  try {
    await fs.access(resolvedPath)
    process.env.GOOGLE_APPLICATION_CREDENTIALS = resolvedPath
  } catch {
    console.warn('Ignoring GOOGLE_APPLICATION_CREDENTIALS because the file is not readable in this environment.')
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS
  }
}

async function getAccessToken() {
  await prepareCredentialFileEnv()
  const auth = googleAuth()
  const token = await auth.getAccessToken()
  if (!token) throw new Error('Unable to obtain a Google access token for Vertex AI embeddings.')
  return token
}

async function embedBatch(texts, accessToken) {
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      instances: texts.map((content) => ({ content, task_type: taskType }))
    })
  })

  if (!response.ok) {
    throw new Error(`Vertex embedding request failed (${response.status}): ${await response.text()}`)
  }

  const payload = await response.json()
  return (payload.predictions || []).map((prediction) => prediction.embeddings?.values || prediction.values || prediction.embedding)
}

async function withRetry(fn, attempts = 3) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt === attempts) break
      await new Promise((resolve) => setTimeout(resolve, 750 * attempt))
    }
  }
  throw lastError
}

function chunkArray(values, size) {
  const chunks = []
  for (let i = 0; i < values.length; i += size) chunks.push(values.slice(i, i + size))
  return chunks
}

async function main() {
  if (!projectId) {
    throw new Error('Set VERTEX_AI_PROJECT, GCP_PROJECT_ID, or BIGQUERY_PROJECT_ID before building embeddings.')
  }

  const chunks = await buildChunksFromManifest()
  if (!chunks.length) throw new Error(`No docs chunks found under ${docsRoot}.`)

  const accessToken = await getAccessToken()
  const embeddedChunks = []
  const batches = chunkArray(chunks, Number.isFinite(batchSize) && batchSize > 0 ? batchSize : 16)

  for (let i = 0; i < batches.length; i += 1) {
    const batch = batches[i]
    const embeddings = await withRetry(() => embedBatch(batch.map((chunk) => chunk.content), accessToken))
    if (embeddings.length !== batch.length || embeddings.some((embedding) => !Array.isArray(embedding))) {
      throw new Error(`Embedding response shape mismatch for batch ${i + 1}.`)
    }
    batch.forEach((chunk, index) => {
      embeddedChunks.push({ ...chunk, embedding: embeddings[index] })
    })
    console.log(`Embedded batch ${i + 1}/${batches.length}`)
  }

  await fs.mkdir(path.dirname(outPath), { recursive: true })
  await fs.writeFile(
    outPath,
    JSON.stringify(
      {
        version: 1,
        generatedAt: new Date().toISOString(),
        provider: 'vertex-ai',
        model,
        taskType,
        chunks: embeddedChunks
      },
      null,
      2
    ),
    'utf8'
  )
  console.log(`Wrote ${embeddedChunks.length} embedded chunks to ${outPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
