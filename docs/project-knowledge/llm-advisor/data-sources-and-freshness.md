---
project: llm-advisor
last_verified: 2026-04-07
source_paths:
  - /home/dmboynton/projects/personal-portfolio/app/api/llm-advisor/metrics/route.ts
  - /home/dmboynton/projects/llm-advisor/scripts/analyze_backtest.py
  - /home/dmboynton/projects/llm-advisor/.github/workflows/premarket.yml
---

# LLM Advisor Data Sources and Freshness

## Source tiers

## Tier 1: Supabase telemetry tables

Used when available for backtest runs, trades, and runtime heartbeats.

## Tier 2: Local artifacts

Fallback source from:

- `data/daily_news/<date>/processed/backtest_results.json`
- `data/daily_news/<date>/processed/live_loop_log.jsonl`

## Tier 3: Empty state

Returned when neither Supabase nor local artifacts contain usable data.

## Freshness rules

- `generatedAt` indicates payload build time, not trade event time.
- `anchorDate` is the latest run date represented in aggregated metrics.
- heartbeat age is derived from latest heartbeat timestamp and current server time.

## Staleness thresholds

- Fresh: heartbeat age <= 180 seconds
- Delayed: heartbeat age <= 1800 seconds
- Stale: heartbeat age > 1800 seconds or missing

## Data quality cautions

- Backtest artifacts can look production-like; always check feed mode before quoting results.
- Missing premarket context in backtests can lead to neutral-multiplier fallback behavior.
- Legacy config constants should not be treated as active runtime values without confirming import path.
