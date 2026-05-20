#!/usr/bin/env node
/**
 * Offline doc index for future embedding/RAG (plan 04-rag-knowledge-strategy).
 * Writes public/data/rag_manifest.json listing chunked markdown paths + token counts.
 * Run build-rag-embeddings.mjs after this to write vector embeddings.
 */
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const docsRoot = path.join(root, 'docs')
const outPath = path.join(root, 'public', 'data', 'rag_manifest.json')

async function walkMd(dir, acc = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) await walkMd(p, acc)
    else if (e.name.endsWith('.md') || e.name.endsWith('.txt')) acc.push(p)
  }
  return acc
}

async function main() {
  let files = []
  try {
    files = await walkMd(docsRoot)
  } catch {
    files = []
  }
  const chunks = []
  for (const file of files) {
    const rel = path.relative(root, file).split(path.sep).join('/')
    const text = await fs.readFile(file, 'utf8')
    const parts = text.split(/\n(?=##\s+)/g)
    parts.forEach((c, i) => {
      const t = c.trim()
      if (!t) return
      chunks.push({
        id: `${rel}#${i}`,
        source: rel,
        charCount: t.length,
      })
    })
  }
  await fs.mkdir(path.dirname(outPath), { recursive: true })
  await fs.writeFile(
    outPath,
    JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), chunks }, null, 2),
    'utf8'
  )
  console.log(`Wrote ${chunks.length} chunks to ${outPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
