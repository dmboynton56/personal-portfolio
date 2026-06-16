---
project: sports-edge
last_verified: 2026-04-07
source_paths:
  - /home/dmboynton/projects/sports-edge/README.md
  - /home/dmboynton/projects/sports-edge/.github/workflows/daily-refresh.yml
  - /home/dmboynton/projects/sports-edge/data-core/docs/PGA_REFRESH_PIPELINE.md
  - /home/dmboynton/projects/sports-edge/data-core/docs/CBBMM_CONTEXT.md
  - /home/dmboynton/projects/sports-edge/data-core/docs/WORLD_CUP_PREDICTION_PLAN.md
---

# Sports Edge Overview

## What is Sports Edge?

Sports Edge is a production-oriented sports modeling stack with:

- BigQuery as data source-of-truth,
- Python pipelines for refresh + inference,
- Supabase as serving cache for web surfaces.

The active scope includes NBA, NFL, MLB, PGA, CBB, and a World Cup forecasting extension.

## What problem does it solve?

It centralizes ingestion, feature engineering, prediction, and serving so model outputs can be consumed consistently in portfolio UI and API-driven experiences.

## Workflow summary

1. Raw schedules, lines, and league data are refreshed.
2. Feature snapshots are built for target leagues.
3. Inference jobs generate model outputs.
4. Outputs are synced to serving layers and dashboard artifacts.

## World Cup extension

World Cup forecasts use the same Sports Edge pattern: raw FIFA/Elo/odds/player
inputs land in BigQuery, a Python team-rating model produces match
probabilities, Monte Carlo simulation produces group and tournament odds, and
Supabase `world_cup_*` tables serve the portfolio's World Cup tab.

Implemented World Cup entry points in `sports-edge`:

- `data-core/scripts/build_world_cup_inputs.py` normalizes fixtures/results,
  FIFA rankings, World Football Elo, recent results, historical World Cup
  experience, player form, and market odds into model-ready CSVs.
- `data-core/scripts/predict_world_cup.py` writes the portfolio-shaped
  prediction JSON.
- `data-core/scripts/sync_world_cup_to_supabase.py` upserts that JSON into the
  World Cup serving tables.
- `data-core/sql/bigquery_world_cup_tables.sql` defines the raw and curated
  BigQuery tables for the warehouse path.

Live verification on 2026-06-15: Supabase served model version
`world-cup-v0-live-2026-06-15` with 72 match predictions, 48 team probability
rows, 12 group-rank sections, 50,000 simulations, and
`configured_round_of_32_slots` as the bracket source.

## Glossary

## Source-of-truth

The canonical persistence layer used for scoring and historical validation (BigQuery for this project).

## Serving cache

A lightweight layer optimized for frontend/API reads (Supabase in this project).

## Probability matrix

A table/tensor of win probabilities for potential matchups, used for bracket simulation and scenario analysis.

## Calibration

A check that predicted probabilities match realized frequencies across bins, not just ranking performance.
