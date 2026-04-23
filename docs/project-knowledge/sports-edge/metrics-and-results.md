---
project: sports-edge
last_verified: 2026-04-07
source_paths:
  - /home/dmboynton/projects/sports-edge/.github/workflows/daily-refresh.yml
  - /home/dmboynton/projects/sports-edge/data-core/notebooks/cache/masters_2026_predictions.meta.json
  - /home/dmboynton/projects/sports-edge/web/public/data/pga_masters_dashboard.json
  - /home/dmboynton/projects/sports-edge/data-core/docs/SPORTS_EDGE_CBBMM_PLAN.md
---

# Sports Edge Metrics and Results

## Observed metrics

## Metric: Automation cadence

- current_value: 13:00 UTC daily refresh
- interpretation: expected production orchestration start time
- provenance: `sports-edge/.github/workflows/daily-refresh.yml`
- freshness: 2026-04-07
- caveats: manual dispatch/retries can alter observed execution time

## Metric: PGA simulation volume

- current_value: 50,000 simulations
- interpretation: number of Monte Carlo tournament draws in current meta artifact
- provenance: `sports-edge/data-core/notebooks/cache/masters_2026_predictions.meta.json`
- freshness: as-of 2026-04-07 artifact
- caveats: this is run-specific, not guaranteed for all future events

## Metric: PGA field size in cached run

- current_value: 80 players
- interpretation: tournament field represented in current prediction artifact
- provenance: `sports-edge/data-core/notebooks/cache/masters_2026_predictions.meta.json`
- freshness: as-of 2026-04-07 artifact
- caveats: field size changes by event/year

## Metric: Dashboard output payload

- current_value: per-player exp SG, simulation win/top-k rates, multi-model heads, and LR probabilities
- interpretation: breadth of user-visible prediction fields
- provenance: `sports-edge/web/public/data/pga_masters_dashboard.json`
- freshness: check `generatedAt` in JSON
- caveats: payload shape is artifact-specific and may expand

## Metric: CBB planning benchmark envelope

- current_value: 2,278 possible matchups and 10,000+ simulation target
- interpretation: planned simulation scale for full bracket probability exploration
- provenance: `sports-edge/data-core/docs/SPORTS_EDGE_CBBMM_PLAN.md`
- freshness: 2026-04-07
- caveats: this is planning guidance; treat as benchmark unless tied to execution artifacts

## Derived metrics (available but computed externally)

- Cross-league live prediction freshness by comparing workflow run timestamps vs artifact `generatedAt`.
- Calibration drift metrics over time (Brier/log-loss/ECE) from repeated training/inference logs.
- Backtest summary trends by league from notebook/script outputs aggregated over runs.

## Not-yet-materialized metrics

- A single normalized production KPI board spanning NBA/NFL/PGA/CBB is not yet exported as one canonical artifact.
