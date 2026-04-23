---
project: sports-edge
last_verified: 2026-04-07
source_paths:
  - /home/dmboynton/projects/sports-edge/README.md
  - /home/dmboynton/projects/sports-edge/.github/workflows/daily-refresh.yml
  - /home/dmboynton/projects/sports-edge/data-core/docs/PGA_REFRESH_PIPELINE.md
  - /home/dmboynton/projects/sports-edge/data-core/notebooks/cache/masters_2026_predictions.meta.json
  - /home/dmboynton/projects/sports-edge/web/public/data/pga_masters_dashboard.json
---

# Sports Edge Data Sources and Freshness

## Source tiers

## Tier 1: Scheduled pipeline outputs

Daily workflow updates raw data, builds features, generates NBA/NFL outputs, and syncs serving tables.

## Tier 2: Domain-specific artifacts

- PGA meta/prediction bundles in `data-core/notebooks/cache/`
- web-export dashboard JSON in `web/public/data/`

## Tier 3: Planning docs and notebooks

Useful for methodology and benchmarks, but should be labeled as benchmark/planning unless linked to dated execution output.

## Freshness indicators

- Workflow cron and latest run status (operations freshness).
- Artifact `generatedAt` fields where present (data freshness).
- Meta `as_of` and `latest_result_start` markers for PGA runs (domain freshness).

## Staleness policy

- If an artifact date is older than 30 days, mark claims as stale.
- If only planning docs support a numeric claim, label it benchmark-only.
- If root README conflicts with deeper module docs, prefer league/module docs with explicit file-level evidence.
