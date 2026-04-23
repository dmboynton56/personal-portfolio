---
project: llm-advisor
last_verified: 2026-04-07
source_paths:
  - /home/dmboynton/projects/llm-advisor/src/core/config.py
  - /home/dmboynton/projects/llm-advisor/config/thresholds.py
  - /home/dmboynton/projects/llm-advisor/.github/workflows/premarket.yml
  - /home/dmboynton/projects/llm-advisor/.github/workflows/live_loop.yml
  - /home/dmboynton/projects/personal-portfolio/app/api/llm-advisor/metrics/route.ts
---

# LLM Advisor Metrics and Results

## Observed metrics

## Metric: LLM market-analysis interval

- current_value: 15 minutes (default runtime)
- interpretation: cadence for periodic market context refresh
- provenance: `llm-advisor/src/core/config.py`
- freshness: 2026-04-07
- caveats: env can override this default

## Metric: Session window

- current_value: 09:30-12:00 ET, EOD close 15:50 ET
- interpretation: allowed trade-entry session plus forced flattening time
- provenance: `llm-advisor/src/core/config.py`
- freshness: 2026-04-07
- caveats: session enforcement depends on runtime mode and market-open checks

## Metric: Base threshold contract

- current_value: MR arm 1.2, MR trigger 0.6, TC arm 1.8, TC trigger 0.6, ATR SL multiplier 1.4, ATR percentile cap 85
- interpretation: baseline signal envelope before multiplier adjustment
- provenance: `llm-advisor/config/thresholds.py`
- freshness: 2026-04-07
- caveats: LLM multipliers can shift effective thresholds in-session

## Metric: Workflow schedule

- current_value: premarket 13:30 UTC weekdays; live loop 14:30 UTC weekdays
- interpretation: expected automation timing in GitHub Actions
- provenance: `llm-advisor/.github/workflows/premarket.yml`, `llm-advisor/.github/workflows/live_loop.yml`
- freshness: 2026-04-07
- caveats: manual dispatch and retries can alter actual run time

## Metric: Dashboard telemetry source contract

- current_value: `supabase` -> `local-files` -> `empty` fallback order
- interpretation: deep-dive metrics source-of-truth hierarchy
- provenance: `personal-portfolio/app/api/llm-advisor/metrics/route.ts`
- freshness: 2026-04-07
- caveats: numbers are only as complete as ingested artifacts/tables

## Derived metrics (available but computed at query time)

- Trade funnel conversion (signal to validation to execution) from persisted rows.
- Rolling 1d/7d/30d pnl windows from run-level totals.
- Win-rate/risk-reward aggregates from closed trade outcomes.

## Not-yet-materialized metrics

- Time-series token/cost telemetry for each LLM call is not currently persisted as a first-class dashboard metric.
