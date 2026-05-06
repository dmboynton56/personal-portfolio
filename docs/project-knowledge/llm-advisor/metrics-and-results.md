---
project: llm-advisor
last_verified: 2026-05-06
source_paths:
  - /home/dmboynton/projects/llm-advisor/src/core/config.py
  - /home/dmboynton/projects/llm-advisor/config/thresholds.py
  - /home/dmboynton/projects/llm-advisor/.github/workflows/premarket.yml
  - /home/dmboynton/projects/llm-advisor/.github/workflows/live_loop.yml
  - /home/dmboynton/projects/personal-portfolio/app/api/llm-advisor/metrics/route.ts
  - /home/dmboynton/projects/personal-portfolio/public/data/llm_advisor_backtest_snapshot.json
  - /home/dmboynton/projects/llm-advisor/scripts/run_backtest.py
  - /home/dmboynton/projects/llm-advisor/scripts/aggregate_backtest_results.py
---

# LLM Advisor Metrics and Results

## Metric: Offline SPY simulation snapshot (2026-05-06)

- **Artifact:** `personal-portfolio/public/data/llm_advisor_backtest_snapshot.json`
- **Window:** three NYSE sessions `2025-04-30`, `2025-05-01`, `2025-05-02` (ET calendar dates), symbol **SPY** only.
- **Headline numbers:** `total_closed_trades = 29`, sum of per-day simulated P/L `total_pnl_sum ≈ +$628` across the three independent daily replays (see **caveats** in JSON — not compounded equity).
- **Mode:** technical STDEV replay with **no** premarket context and **no** Gemini periodic overlay (production stack adds both).
- **Repro:** commands listed under `experiment.commands` in the JSON.
- **Caveats:** read `experiment.caveats` in the JSON before quoting externally (LinkedIn/portfolio).

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

- current_value: premarket starts ~9:15 ET → artifact ready ~9:20 ET (`15 13` / `15 14` UTC weekdays); live ~9:28 ET (`28 13` / `28 14` UTC weekdays)
- interpretation: expected automation timing in GitHub Actions
- provenance: `llm-advisor/.github/workflows/premarket.yml`, `llm-advisor/.github/workflows/live_loop.yml`
- freshness: 2026-04-07
- caveats: manual dispatch and retries can alter actual run time

## Metric: Dashboard telemetry source contract

- current_value: production uses `supabase` -> `empty`/`degraded`; non-production can use `local-files` fallback
- interpretation: deep-dive metrics source-of-truth hierarchy
- provenance: `personal-portfolio/app/api/llm-advisor/metrics/route.ts`
- freshness: 2026-04-24
- caveats: `degraded` indicates upstream read failures, while `empty` indicates no telemetry materialized yet

## Derived metrics (available but computed at query time)

- Trade funnel conversion (signal to validation to execution) from persisted rows.
- Rolling 1d/7d/30d pnl windows from run-level totals.
- Win-rate/risk-reward aggregates from closed trade outcomes.

## Not-yet-materialized metrics

- Time-series token/cost telemetry for each LLM call is not currently persisted as a first-class dashboard metric.
