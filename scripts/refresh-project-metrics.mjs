#!/usr/bin/env node
/**
 * Upsert rows from public/data/project_metrics_seed.json into Supabase project_metrics.
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (same as server-side ingest).
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const seedPath = path.join(root, 'public', 'data', 'project_metrics_seed.json')

async function main() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(url, key)
  const rows = JSON.parse(fs.readFileSync(seedPath, 'utf8'))
  const { error } = await supabase.from('project_metrics').upsert(rows, {
    onConflict: 'project_id,metric_key',
  })
  if (error) {
    console.error(error)
    process.exit(1)
  }
  console.log(`Upserted ${rows.length} project_metrics rows.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
