#!/usr/bin/env node
/**
 * Builds docs/warehouse-schema.txt from plans/docs BigQuery inventory exports.
 * Run after inventory JSON changes; wire into CI alongside build:rag-manifest.
 */
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const portfolioRoot = path.join(__dirname, '..')
const inventoryRoot = path.join(portfolioRoot, '..', 'plans', 'docs', 'gcp-bigquery-datasets')
const supabaseInventoryPath = path.join(
  portfolioRoot,
  '..',
  'plans',
  'docs',
  'supabase_tables',
  'personal_portfolio_project_tables.json'
)
const outPath = path.join(portfolioRoot, 'docs', 'warehouse-schema.txt')

const projectId =
  process.env.BIGQUERY_PROJECT_ID || process.env.GCP_PROJECT_ID || 'learned-pier-478122-p7'

const sportsEdgeDatasets = [
  { file: 'sports_edge_raw_tables.json', dataset: 'sports_edge_raw' },
  { file: 'sports_edge_curated_tables.json', dataset: 'sports_edge_curated' },
  { file: 'sports_edge_results_tables.json', dataset: 'sports_edge_results' }
]

const tableHints = {
  raw_schedules:
    'Historical schedules and final scores. Join on game_id for team names and home_score/away_score.',
  raw_nba_game_logs: 'Team-level game logs and scoring trends.',
  feature_snapshots: 'Latest feature snapshots for current/upcoming games.',
  training_feature_view_v2:
    'Historical feature history (rest, B2B, margins). No team names — join raw_schedules on game_id.',
  training_feature_view: 'Legacy training feature view; prefer training_feature_view_v2 when possible.',
  model_predictions:
    'Model outputs per game. Use predicted_spread (BigQuery) — not my_spread (Supabase only).',
  model_runs: 'Model training/run metadata.',
  game_results: 'Evaluated game outcomes in the results dataset.',
  pga_player_wind_skill: 'PGA wind-skill feature table.'
}

const loadColumnRows = async (filePath) => {
  const raw = await fs.readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw)
  return Array.isArray(parsed) ? parsed : []
}

const groupByTable = (rows) => {
  const tables = new Map()
  for (const row of rows) {
    const name = row.table_name
    if (!name) continue
    if (!tables.has(name)) tables.set(name, [])
    tables.get(name).push({
      column: row.column_name,
      type: row.data_type || 'UNKNOWN'
    })
  }
  return tables
}

const formatTableSection = (dataset, tables) => {
  const lines = [`## Dataset: \`${projectId}.${dataset}\``, '']
  const sortedNames = [...tables.keys()].sort()

  for (const tableName of sortedNames) {
    const fq = `\`${projectId}.${dataset}.${tableName}\``
    const hint = tableHints[tableName]
    lines.push(`### Table: ${fq}`)
    if (hint) lines.push(hint)
    lines.push('')
    for (const { column, type } of tables.get(tableName)) {
      lines.push(`- \`${column}\` (${type})`)
    }
    lines.push('')
  }

  return lines
}

const loadSupabaseSummary = async () => {
  try {
    const raw = await fs.readFile(supabaseInventoryPath, 'utf8')
    const parsed = JSON.parse(raw)
    const tables = parsed?.[0]?.json_agg
    if (!Array.isArray(tables)) return null
    return tables
  } catch {
    return null
  }
}

const staticRecipes = () => [
  '# Warehouse Schema (generated)',
  '',
  `Generated at: ${new Date().toISOString()}`,
  `Source of truth: plans/docs/gcp-bigquery-datasets/*.json`,
  '',
  '## Scope',
  'Use this file for Sports Edge BigQuery text-to-SQL. Supabase serving tables are documented below for column-name mapping only.',
  '',
  '## Query routing',
  '- ATS record, ROI, season spread record, or "how many covers" summary → prefer Supabase canned metrics (games + model_predictions), NOT ad-hoc warehouse SQL.',
  '- Warehouse SQL is for historical analytics: rest/B2B, feature trends, multi-table aggregates, and deep season slices.',
  '',
  '## Supabase serving column map (not in BigQuery)',
  '- Supabase `games`: id, league, season, home_team, away_team, home_score, away_score, game_time_utc, book_spread',
  '- Supabase `model_predictions`: game_id, my_spread, my_home_win_prob, asof_ts, model_version',
  '- BigQuery `model_predictions.predicted_spread` corresponds to Supabase `model_predictions.my_spread`',
  '',
  '## ATS / spread cover recipe (BigQuery)',
  'For model-side spread covers on completed games:',
  '```sql',
  'actual_margin = s.home_score - s.away_score',
  'cover_margin = actual_margin + p.predicted_spread',
  'cover = cover_margin > 0  -- push when ABS(cover_margin) < 0.001',
  '```',
  'Required joins:',
  '- `model_predictions` p ON game_id',
  '- `raw_schedules` s ON game_id (for home_score, away_score, league, season, teams)',
  'Do NOT use `home_margin > 0` alone for spread covers — that is outright win, not ATS.',
  'Do NOT use `training_feature_view_v2` alone for spread-cover counts — it has no spread column.',
  '',
  '## Join rules',
  '- Default join key: `game_id`',
  '- Always filter `league` IN (\'NBA\', \'NFL\') when applicable',
  '- Team codes are abbreviations (BOS, LAL, NE, KC) — not full city names',
  '- `training_feature_view_v2` lacks home_team/away_team — join `raw_schedules` to filter by team',
  '',
  '## Read-only SQL rules',
  '- SELECT or WITH ... SELECT only',
  '- LIMIT 50 rows unless the question is a single aggregate scalar',
  ''
]

async function main() {
  const lines = staticRecipes()
  const supabaseTables = await loadSupabaseSummary()

  if (supabaseTables?.length) {
    lines.push('## Supabase inventory (serving layer)', '')
    for (const table of supabaseTables) {
      lines.push(`### Supabase table: \`${table.table_name}\``)
      lines.push(`Columns: ${(table.columns || []).join(', ')}`)
      lines.push('')
    }
  }

  for (const { file, dataset } of sportsEdgeDatasets) {
    const filePath = path.join(inventoryRoot, file)
    const rows = await loadColumnRows(filePath)
    if (!rows.length) {
      console.warn(`Skipping empty or missing inventory: ${file}`)
      continue
    }
    lines.push(...formatTableSection(dataset, groupByTable(rows)))
  }

  await fs.mkdir(path.dirname(outPath), { recursive: true })
  await fs.writeFile(outPath, `${lines.join('\n').trim()}\n`, 'utf8')
  console.log(`Wrote ${outPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
