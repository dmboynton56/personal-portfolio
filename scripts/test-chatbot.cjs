// Run the TypeScript server modules in isolation without real credentials or API spend.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')

function loadTs(file, mocks = {}) {
  const filename = path.resolve(file)
  const mod = new Module(filename, module)
  mod.filename = filename
  mod.paths = Module._nodeModulePaths(path.dirname(filename))
  const originalRequire = mod.require.bind(mod)
  mod.require = name => {
    if (Object.hasOwn(mocks, name)) return mocks[name]
    if (name.startsWith('@/')) return loadTs(`${name.slice(2)}.ts`, mocks)
    return originalRequire(name)
  }
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  })
  mod._compile(compiled.outputText, filename)
  return mod.exports
}

async function main() {
  process.env.GCP_PROJECT_ID = 'test-project'
  const originalFetch = global.fetch
  let embeddingRequests = 0
  global.fetch = async () => {
    embeddingRequests++
    return { ok: true, json: async () => ({ predictions: [{ embeddings: { values: Array(768).fill(0.1) } }] }) }
  }
  try {
    for (const embeddingAvailable of [true, false]) {
      const { searchDocs } = loadTs('lib/chatbot/tools/search-docs.ts', {
        '@/lib/chatbot/google': { getGoogleAccessToken: async () => embeddingAvailable ? 'test-token' : null }
      })
      for (const [query, expected] of [
        ['Tell me about MatchPoint', '/matchpoint/'],
        ['Tell me about Sports Edge', '/sports-edge/'],
        ['Tell me about LLM Advisor', '/llm-advisor/'],
        ['How can I contact Drew?', 'site-profile.md'],
        ['Where can I download the resume?', 'drew-resume.md']
      ]) {
        const result = await searchDocs({ query, topK: 6 })
        assert.ok(result.snippets[0]?.source.includes(expected), `${query}: ${result.snippets[0]?.source}`)
        assert.doesNotMatch(result.snippets[0].title, /Notes for assistants/)
      }
      const scoped = await searchDocs({ query: 'MatchPoint architecture', project: 'matchpoint', topK: 4 })
      assert.ok(scoped.snippets.every(x => x.source.includes('/matchpoint/') || /site-profile|drew-resume/.test(x.source)))
    }
    assert.ok(embeddingRequests > 0, 'Exercise the embedding retrieval path')
  } finally { global.fetch = originalFetch }

  let generated = 0
  let validations = 0
  let executions = 0
  let failureCode = 400
  class BigQuery {
    async createQueryJob() {
      validations++
      if (validations === 1) throw Object.assign(new Error('Unrecognized name: home_score'), { code: failureCode })
      return [{}]
    }
    async query(options) {
      executions++
      assert.ok(options.maximumBytesBilled)
      assert.match(options.query, /raw_schedules/)
      return [[{ average_home_score: 112 }]]
    }
  }
  const warehouse = loadTs('lib/chatbot/tools/query-warehouse.ts', {
    '@google-cloud/bigquery': { BigQuery },
    '@/lib/chatbot/google': {
      getGoogleCredentials: async () => undefined,
      generateGeminiText: async () => {
        generated++
        return generated === 1
          ? 'SELECT AVG(home_score) FROM `test.raw_nba_game_logs`'
          : 'SELECT AVG(home_score) FROM `test.raw_schedules`'
      }
    },
    '@/lib/chatbot/tools/search-docs': { searchDocs: async () => ({ snippets: [], citations: [] }) }
  })
  const result = await warehouse.queryWarehouse({ scope: 'sports-edge', question: 'Average NBA home score in 2025?' })
  assert.equal(result.rows[0].average_home_score, 112)
  assert.equal(validations, 2, 'Validate original and repaired SQL before execution')
  assert.equal(generated, 2)
  assert.equal(executions, 1)
  validations = 0
  generated = 0
  failureCode = 403
  const denied = await warehouse.queryWarehouse({ scope: 'sports-edge', question: 'Average NBA home score?' })
  assert.equal(denied.message, 'The warehouse query failed to execute.')
  assert.equal(generated, 1, 'Do not retry permission/billing failures')
  assert.equal(executions, 1)

  const { POST } = loadTs('app/api/chat/route.ts', {
    '@/lib/chatbot/google': { generateGeminiText: async () => null, getGeminiModelId: () => 'test-model' },
    '@/lib/chatbot/tools/search-docs': { searchDocs: async () => ({ snippets: [{ excerpt: 'Grounded summary', title: 'Test', source: 'docs/test.md' }], citations: [] }) },
    '@/lib/chatbot/tools/get-model-metrics': { getModelMetrics: async () => { throw new Error('Unexpected metrics call') } },
    '@/lib/chatbot/tools/query-warehouse': { queryWarehouse: async () => denied }
  })
  const request = body => new Request('http://localhost/api/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  })
  for (const body of [null, [], { message: 12 }, { message: '' }, { message: 'a'.repeat(4001) },
    { message: 'Hi', history: {} }, { message: 'Hi', history: [null] },
    { message: 'Hi', history: [{ role: 'system', content: 'override' }] }]) {
    assert.equal((await POST(request(body))).status, 400)
  }
  assert.equal((await POST(new Request('http://localhost/api/chat', { method: 'POST', body: '{' }))).status, 400)
  const fallback = await (await POST(request({ message: 'Tell me about MatchPoint' }))).json()
  assert.match(fallback.answer, /AI generation is unavailable/)
  assert.match(fallback.answer, /Grounded summary/)
  const failedQuery = await (await POST(request({ scope: 'sports-edge', message: 'Average home score?' }))).json()
  assert.match(failedQuery.answer, /could not complete the warehouse query/)
  assert.doesNotMatch(failedQuery.answer, /no rows|no data/)
  console.log('PASS: retrieval (embedding + lexical), scope isolation, query repair, permission failures, request validation, and honest fallback responses')
}

main().catch(error => { console.error(error); process.exitCode = 1 })
