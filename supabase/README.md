# Sports Edge Supabase Setup

This folder keeps the SQL migrations that provision the `games`, `odds_snapshots`, `model_predictions`, `features`, `model_runs`, and `games_today_enriched` view for Sports Edge, plus LLM Advisor telemetry tables.

## Prerequisites
- A Supabase project (or self-hosted Postgres 15+).
- Supabase CLI installed locally (`npm i -g supabase` or `brew install supabase/tap/supabase`).
- The following secrets available for the Next.js server runtime (never expose them to the browser):
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SPORTS_EDGE_CRON_SECRET` (used by the GitHub Action cron POST, see below)

## Apply the schema
1. Authenticate the CLI:
   ```bash
   supabase login
   ```
2. Link the CLI to your project (only once):
   ```bash
   supabase link --project-ref <your-ref>
   ```
3. Push the migrations in this folder:
   ```bash
   supabase db push --file supabase/migrations/001_sports_edge_schema.sql
   supabase db push --file supabase/migrations/002_add_week_column.sql
   supabase db push --file supabase/migrations/004_add_actual_scores.sql
   supabase db push --file supabase/migrations/005_llm_advisor_telemetry.sql
   ```
4. Confirm the view returns rows:
   ```bash
   supabase db query 'select * from games_today_enriched limit 5;'
   ```

## Local development
If you run `supabase start`, the same migration file can be applied against the local dockerized Postgres instance. Update your `.env.local` with the local URL + service key so `/api/sports-edges` queries the dev database.


### Odds API hydration

Odds ingestion now runs in the `sports-edge` repository (`data-core/scripts/sync_odds.py` inside `daily-refresh.yml`). This portfolio project no longer exposes a writer endpoint for odds updates.

### LLM Advisor telemetry ingest

Use `POST /api/llm-advisor/metrics` in local/non-production debugging to parse local LLM Advisor artifacts and upsert them into:
- `llm_advisor_backtest_runs`
- `llm_advisor_backtest_trades`
- `llm_advisor_runtime_heartbeats`

Required env vars:

```
LLM_ADVISOR_CRON_SECRET=...
LLM_ADVISOR_DAILY_NEWS_DIR=../llm-advisor/data/daily_news
```

Example cron call:

```bash
curl -X POST http://localhost:3000/api/llm-advisor/metrics \
  -H "x-cron-secret: $LLM_ADVISOR_CRON_SECRET"
```

The dashboard endpoint `GET /api/llm-advisor/metrics` is Supabase-only in production. Local file fallback is enabled only in non-production environments for debugging.
