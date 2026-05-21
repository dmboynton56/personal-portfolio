---
project: llm-advisor
last_verified: 2026-05-21
source_paths:
  - /home/dmboynton/projects/personal-portfolio/app/api/llm-advisor/metrics/route.ts
  - /home/dmboynton/projects/llm-advisor/scripts/run_eod_aggregate.py
  - /home/dmboynton/projects/llm-advisor/.github/workflows/eod_aggregate.yml
  - /home/dmboynton/projects/personal-portfolio/supabase/migrations/005_llm_advisor_telemetry.sql
---

# LLM Advisor Data Sources and Freshness

## Source tiers

### Tier 1: Supabase telemetry tables (production path)

Populated by `llm-advisor` EOD workflow after each trading session:

| Table | Content |
|-------|---------|
| `llm_advisor_backtest_runs` | Daily session summary (`run_date`, trade counts, P&L aggregates) |
| `llm_advisor_backtest_trades` | Individual trade lifecycle rows |
| `llm_advisor_runtime_heartbeats` | Last loop tick / shutdown heartbeat per session |

Schema: `personal-portfolio/supabase/migrations/005_llm_advisor_telemetry.sql`. Applied to production Supabase 2026-05-21.

### Tier 2: BigQuery `trading_signals` (warehouse)

Live loop writes when `STORAGE_ENV=bq`: `trades`, `trade_signals`, `live_loop_logs`, etc. EOD may merge BQ rows with artifact ingest before optional `sync_bq_to_supabase.py`.

### Tier 3: Local artifacts (non-production fallback only)

- `data/daily_news/<date>/processed/session_summary.json`
- `data/daily_news/<date>/processed/live_loop_log.jsonl`
- `data/daily_news/<date>/processed/backtest_results.json` (simulation / batch backtests)

### Tier 4: Empty/degraded states

- `empty`: no telemetry rows yet (e.g. before first EOD or no-trade day with run row only).
- `degraded`: upstream read failed; response includes an error id for logs.

## Refresh cadence

| Event | When | Writes |
|-------|------|--------|
| Live loop | Weekdays ~09:27–12:00 ET | BQ rows + GH artifact |
| EOD aggregate | Auto after successful Live | Supabase upsert from artifact (+ optional BQ sync) |
| Manual EOD backfill | `workflow_dispatch` | Same, with pinned `live_loop_run_id` |

## Freshness rules

- `generatedAt` on API payloads = build time, not last trade time.
- `meta.updatedAt` = latest telemetry timestamp used for SLO bucketing.
- `anchorDate` = latest `run_date` in aggregated metrics.
- Heartbeat age derived from latest `llm_advisor_runtime_heartbeats.heartbeat_ts`.

## Staleness thresholds

- Fresh: heartbeat age ≤ 180 seconds (during session)
- Delayed: heartbeat age ≤ 1800 seconds
- Stale: heartbeat age > 1800 seconds or missing (expect stale on weekends — live loop does not run Sat/Sun)

## Data quality cautions (2026-05-21)

- May 21 live session (#74 on `22dc784`): full telemetry, **0 Alpaca fills**; Supabase run row correctly shows `total_trades=0`.
- Premarket ML `.pkl` files on `main` are **dev placeholders** until replaced with production-trained models.
- EOD auto-run failed once (#22) before Supabase secrets/schema were configured; backfill #23 succeeded.
