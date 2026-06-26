---
project: sports-edge
last_verified: 2026-06-26
source_paths:
  - /home/dmboynton/projects/sports-edge/.github/workflows/daily-refresh.yml
  - /home/dmboynton/projects/sports-edge/data-core/notebooks/cache/us_open_2026_predictions.meta.json
  - /home/dmboynton/projects/sports-edge/web/public/data/performance_history.json
  - /home/dmboynton/projects/sports-edge/data-core/docs/SPORTS_EDGE_CBBMM_PLAN.md
---

# Sports Edge Metrics and Results

## Current Model Quality Readout

The first notebook-backed readout is ATS/ROI for NBA and NFL:

- `sports-edge/data-core/notebooks/nba_ats_roi.ipynb`
- `sports-edge/data-core/notebooks/nfl_ats_roi.ipynb`

The readout contract is documented in `model-quality-readout.md`. Until those notebooks are executed and reviewed, ATS/ROI numbers should be treated as operational readouts, not final validated edge claims.

Cross-league performance summaries are also exported to `sports-edge/web/public/data/performance_history.json` (see `sync-state.md` for the latest synced snapshot).

## Observed metrics

## Metric: Automation cadence

- current_value: 13:00 UTC daily refresh
- interpretation: expected production orchestration start time
- provenance: `sports-edge/.github/workflows/daily-refresh.yml`
- freshness: 2026-06-26
- caveats: manual dispatch/retries can alter observed execution time

## Metric: PGA simulation volume (current event)

- current_value: 20,000 simulations (U.S. Open 2026 artifact)
- interpretation: number of Monte Carlo tournament draws in current meta artifact
- provenance: `sports-edge/data-core/notebooks/cache/us_open_2026_predictions.meta.json`
- freshness: as-of 2026-06-18 artifact
- caveats: simulation count varies by event; check latest `*_predictions.meta.json`

## Metric: PGA field size in cached run

- current_value: 156 players (U.S. Open 2026)
- interpretation: tournament field represented in current prediction artifact
- provenance: `sports-edge/data-core/notebooks/cache/us_open_2026_predictions.meta.json`
- freshness: as-of 2026-06-18 artifact
- caveats: field size changes by event/year

## Metric: Dashboard output payload

- current_value: per-player exp SG, simulation win/top-k rates, multi-model heads, and LR probabilities
- interpretation: breadth of user-visible prediction fields on ops dashboard
- provenance: `sports-edge/web/public/data/pga_tournaments/current.json`
- freshness: check `generatedAt` in JSON
- caveats: payload shape is artifact-specific and may expand

## Metric: CBB planning benchmark envelope

- current_value: 2,278 possible matchups and 10,000+ simulation target
- interpretation: planned simulation scale for full bracket probability exploration
- provenance: `sports-edge/data-core/docs/SPORTS_EDGE_CBBMM_PLAN.md`
- freshness: 2026-06-26
- caveats: this is planning guidance; treat as benchmark unless tied to execution artifacts

## Derived metrics (available but computed externally)

- Cross-league live prediction freshness by comparing workflow run timestamps vs artifact `generatedAt`.
- Calibration drift metrics over time (Brier/log-loss/ECE) from repeated training/inference logs.
- Backtest summary trends by league from `performance_history.json` and notebook/script outputs aggregated over runs.

## Not-yet-materialized metrics

- A single normalized production KPI board spanning NBA/NFL/PGA/CBB is not yet exported as one canonical artifact (see `sync-state.md` for partial live snapshot).
