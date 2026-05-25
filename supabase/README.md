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
   supabase db push --file supabase/migrations/007_llm_advisor_order_events.sql
   supabase db push --file supabase/migrations/008_add_mlb_serving_columns.sql
   ```
   Migration `008` (MLB league constraint + probable pitcher columns) was applied to production on 2026-05-25.
4. Confirm the view returns rows:
   ```bash
   supabase db query 'select * from games_today_enriched limit 5;'
   ```

## Local development
If you run `supabase start`, the same migration file can be applied against the local dockerized Postgres instance. Update your `.env.local` with the local URL + service key so `/api/sports-edges` queries the dev database.


### Odds API hydration

Odds ingestion now runs in the `sports-edge` repository (`data-core/scripts/sync_odds.py` inside `daily-refresh.yml`). This portfolio project no longer exposes a writer endpoint for odds updates.

### Sports Edge serving API

The portfolio serves Sports Edge data through `GET /api/sports-edges`. That route reads Supabase `games` and `model_predictions` and returns a cacheable payload for the project page. Sports Edge writes for `games`, `odds_snapshots`, `model_predictions`, and final scores are owned by the `sports-edge` repository workflows. MLB rows are probability-only and use nullable `home_probable_pitcher` / `away_probable_pitcher` display fields.

### LLM Advisor telemetry ingest

**Production path:** `llm-advisor/.github/workflows/eod_aggregate.yml` runs `scripts/run_eod_aggregate.py`, which upserts into:

- `llm_advisor_backtest_runs`
- `llm_advisor_backtest_trades`
- `llm_advisor_runtime_heartbeats`
- `llm_advisor_order_events`

Schema: `supabase/migrations/005_llm_advisor_telemetry.sql` (applied 2026-05-21) plus `007_llm_advisor_order_events.sql` (applied 2026-05-23). Requires GitHub secrets on the `llm-advisor` repo: `SUPABASE_DB_HOST`, `SUPABASE_DB_PORT`, `SUPABASE_DB_NAME`, `SUPABASE_DB_USER`, `SUPABASE_DB_PASSWORD`.

**Local debugging only:** `POST /api/llm-advisor/metrics` can parse local artifacts when `LLM_ADVISOR_CRON_SECRET` and `LLM_ADVISOR_DAILY_NEWS_DIR` are set.
