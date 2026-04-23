# Evidence Register: Project Deep Dives

Last verified: 2026-04-07

## Purpose

This register defines what we can claim on deep-dive pages and in chatbot docs.
Each line item is tagged as:

- `observed`: directly present in committed artifacts or source files.
- `derived`: computable from committed artifacts or database tables.
- `planned`: intended metric not currently materialized.

## LLM Advisor

| Status | Metric | Value | Provenance | Notes |
| --- | --- | --- | --- | --- |
| observed | LLM market-analysis interval | 15 minutes (default) | `llm-advisor/src/core/config.py` | Runtime config used by `Settings.load()`. |
| observed | Runtime watchlist default | SPY, QQQ, IWM, NVDA, TSLA | `llm-advisor/src/core/config.py` | Runtime default differs from legacy config module. |
| observed | Trading window | 09:30-12:00 ET | `llm-advisor/src/core/config.py` | Used in live loop session bounds. |
| observed | End-of-day flatten time | 15:50 ET | `llm-advisor/src/core/config.py` | Applied by loop and order manager flow. |
| observed | Base STDEV thresholds | MR arm 1.2, MR trigger 0.6, TC arm 1.8, TC trigger 0.6 | `llm-advisor/config/thresholds.py` | Technical signal gates. |
| observed | Risk defaults | max risk 1.0%, min R:R 1.5 | `llm-advisor/src/core/config.py` | Runtime defaults consumed by loop. |
| observed | Workflow schedule: premarket | 13:30 UTC (Mon-Fri) | `llm-advisor/.github/workflows/premarket.yml` | Premarket context artifact generated daily. |
| observed | Workflow schedule: live loop | 14:30 UTC (Mon-Fri) | `llm-advisor/.github/workflows/live_loop.yml` | Live loop starts at market open equivalent. |
| observed | Live loop timeout budget | 420 minutes | `llm-advisor/.github/workflows/live_loop.yml` | Prevents unbounded workflow runtime. |
| observed | Premarket artifact retention | 1 day | `llm-advisor/.github/workflows/premarket.yml` | `premarket_context.json` retention period. |
| observed | Backtest output schema fields | trades, win rate, pnl, equity, avg win/loss | `llm-advisor/scripts/analyze_backtest.py` | Defines directly reportable metrics from artifacts. |
| observed | Dashboard telemetry sources | supabase, local-files, empty | `personal-portfolio/app/api/llm-advisor/metrics/route.ts` | Used by deep-dive telemetry panel. |
| observed | Legacy config mismatch exists | max risk 50.0%, min R:R 2.0, 11-symbol watchlist | `llm-advisor/config/settings.py` | Legacy module conflicts with runtime config path. |
| derived | Trade funnel conversion | signal -> validation -> executed trade counts | `llm-advisor` storage tables and telemetry API | Requires aggregation across saved rows/artifacts. |
| derived | Rolling performance windows | 1d, 7d, 30d pnl windows | `personal-portfolio/app/api/llm-advisor/metrics/route.ts` | Calculated from run-level totals. |
| planned | Token/cost latency series | Per-call token + latency time series | `llm-advisor/src/analysis/llm_client.py` | Fields exist in response model, not persisted as dashboard series. |

## Sports Edge

| Status | Metric | Value | Provenance | Notes |
| --- | --- | --- | --- | --- |
| observed | Automated refresh schedule | 13:00 UTC daily | `sports-edge/.github/workflows/daily-refresh.yml` | Core production refresh cadence. |
| observed | CI/runtime python version | 3.11 | `sports-edge/.github/workflows/daily-refresh.yml` | Workflow environment baseline. |
| observed | NBA production model version | v3 | `sports-edge/README.md` and workflow commands | Used in `refresh_nba`. |
| observed | NFL production model version | v1 | `sports-edge/README.md` and workflow commands | Used in `refresh_nfl`. |
| observed | Pipeline architecture | BigQuery source-of-truth + Supabase serving cache | `sports-edge/README.md` | Core serving/data flow statement. |
| observed | PGA simulation sample size | 50,000 sims | `sports-edge/data-core/notebooks/cache/masters_2026_predictions.meta.json` | Tournament simulation volume. |
| observed | PGA field size in artifact | 80 players | `sports-edge/data-core/notebooks/cache/masters_2026_predictions.meta.json` | Current field bundle size. |
| observed | PGA artifact as-of date | 2026-04-07 | `sports-edge/data-core/notebooks/cache/masters_2026_predictions.meta.json` | Snapshot freshness reference. |
| observed | Latest result start used in PGA run | 2026-04-02 | `sports-edge/data-core/notebooks/cache/masters_2026_predictions.meta.json` | Upstream results window anchor. |
| observed | CBB simulation framing | 2,278 possible matchups, 10,000+ sims target | `sports-edge/data-core/docs/SPORTS_EDGE_CBBMM_PLAN.md` | Planning benchmark for bracket simulation depth. |
| observed | CBB client-side base probability kernel | logistic seed model | `sports-edge/data-core/docs/CBBMM_CONTEXT.md` | Baseline simulation logic in docs. |
| observed | Web PGA export path | `web/public/data/pga_masters_dashboard.json` | `sports-edge/data-core/docs/PGA_REFRESH_PIPELINE.md` | Frontend bundle source for PGA outputs. |
| derived | Live model calibration quality | Brier/log-loss/ECE trends over time | `masters_2026_predictions.meta.json` metrics list + training outputs | Requires historical run logging aggregation. |
| derived | Prediction freshness SLA | hours since last successful export | workflow run history + dashboard `generatedAt` | Needs runtime checks in monitoring layer. |
| planned | Unified cross-league performance board | One dashboard for NBA/NFL/PGA/CBB KPIs | no single artifact today | Requires standardized metric export contracts. |

## Publishing Rules

- Do not publish a numeric claim unless the exact source path is in this register.
- Label all benchmark metrics as benchmark unless they come from live production telemetry.
- If artifact date is older than 30 days, mark metric as stale in deep-dive copy and docs.
