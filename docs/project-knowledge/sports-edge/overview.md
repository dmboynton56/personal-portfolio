---
project: sports-edge
last_verified: 2026-04-07
source_paths:
  - /home/dmboynton/projects/sports-edge/README.md
  - /home/dmboynton/projects/sports-edge/.github/workflows/daily-refresh.yml
  - /home/dmboynton/projects/sports-edge/data-core/docs/PGA_REFRESH_PIPELINE.md
  - /home/dmboynton/projects/sports-edge/data-core/docs/CBBMM_CONTEXT.md
---

# Sports Edge Overview

## What is Sports Edge?

Sports Edge is a production-oriented sports modeling stack with:

- BigQuery as data source-of-truth,
- Python pipelines for refresh + inference,
- Supabase as serving cache for web surfaces.

The active scope includes NBA, NFL, PGA, and CBB workflows.

## What problem does it solve?

It centralizes ingestion, feature engineering, prediction, and serving so model outputs can be consumed consistently in portfolio UI and API-driven experiences.

## Workflow summary

1. Raw schedules, lines, and league data are refreshed.
2. Feature snapshots are built for target leagues.
3. Inference jobs generate model outputs.
4. Outputs are synced to serving layers and dashboard artifacts.

## Glossary

## Source-of-truth

The canonical persistence layer used for scoring and historical validation (BigQuery for this project).

## Serving cache

A lightweight layer optimized for frontend/API reads (Supabase in this project).

## Probability matrix

A table/tensor of win probabilities for potential matchups, used for bracket simulation and scenario analysis.

## Calibration

A check that predicted probabilities match realized frequencies across bins, not just ranking performance.
