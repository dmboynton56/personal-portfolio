# Sports Edge Supabase Setup

This folder keeps the SQL migrations that provision the `games`, `odds_snapshots`, `model_predictions`, `features`, `model_runs`, and `games_today_enriched` view the portfolio needs.

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
3. Push the migration in this folder:
   ```bash
   supabase db push --file supabase/migrations/001_sports_edge_schema.sql
   ```
4. Confirm the view returns rows:
   ```bash
   supabase db query 'select * from games_today_enriched limit 5;'
   ```

## Local development
If you run `supabase start`, the same migration file can be applied against the local dockerized Postgres instance. Update your `.env.local` with the local URL + service key so `/api/sports-edges` queries the dev database.


### Odds API hydration

Use the new POST endpoint at `/api/sports-edges/odds` (protected by the same `SPORTS_EDGE_CRON_SECRET`) to fetch spreads from [The Odds API](https://the-odds-api.com/) and write them into the `games.book_spread` column. Configure the request via:

```
THE_ODDS_API_KEY
THE_ODDS_API_REGIONS (optional, default `us`)
THE_ODDS_API_MARKETS (optional, default `spreads`)
THE_ODDS_API_BOOKMAKERS (optional comma list, default `draftkings,betmgm`)
```

Trigger it from your scheduler before hitting `/api/sports-edges` so the UI reads fresh numbers from Supabase.
