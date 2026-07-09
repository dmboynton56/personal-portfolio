# Evidence Register: Project Deep Dives

Last verified: 2026-06-26

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
| observed | PGA simulation sample size | 20,000 sims (U.S. Open 2026) | `sports-edge/data-core/notebooks/cache/us_open_2026_predictions.meta.json` | Tournament simulation volume for current event. |
| observed | PGA field size in artifact | 156 players | `sports-edge/data-core/notebooks/cache/us_open_2026_predictions.meta.json` | U.S. Open 2026 field bundle. |
| observed | PGA artifact as-of date | 2026-06-18 | `sports-edge/data-core/notebooks/cache/us_open_2026_predictions.meta.json` | Snapshot freshness reference. |
| observed | Ops dashboard URL | https://sports-edge.drewboynton.com | `personal-portfolio/components/WorkSection.tsx`, `sports-edge/README.md` | Standalone subdomain; portfolio embeds live card. |
| observed | World Cup model version | world-cup-v0-live-2026-06-15 | Supabase serving + `sports-edge/overview.md` verification | 72 match predictions, 48 team rows, 50,000 sims. |
| observed | Performance history export | `web/public/data/performance_history.json` | `sports-edge/web/public/data/performance_history.json` | Cross-league model versions and sample sizes. |

<!-- BEGIN SYNC:sports-edge-derived -->
| derived | Performance history generatedAt | 2026-07-06T17:22:45.624026+00:00 | sports-edge/web/public/data/performance_history.json | Synced 2026-07-09. |
| derived | Latest PGA meta artifact | us_open_2026_predictions.meta.json | sports-edge/data-core/notebooks/cache/us_open_2026_predictions.meta.json | 20000 sims, 156 players, as-of 2026-06-18. |
| derived | Current PGA dashboard event | Genesis Scottish Open (in_progress) | sports-edge/web/public/data/pga_tournaments/current.json | generatedAt 2026-07-09T21:29:34.675544+00:00. |
<!-- END SYNC:sports-edge-derived -->
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
