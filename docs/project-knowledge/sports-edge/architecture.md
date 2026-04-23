---
project: sports-edge
last_verified: 2026-04-07
source_paths:
  - /home/dmboynton/projects/sports-edge/README.md
  - /home/dmboynton/projects/sports-edge/.github/workflows/daily-refresh.yml
  - /home/dmboynton/projects/sports-edge/data-core/docs/PGA_REFRESH_PIPELINE.md
  - /home/dmboynton/projects/sports-edge/data-core/docs/CBBMM_CONTEXT.md
---

# Sports Edge Architecture

## Data and compute layers

## Ingestion Layer

League-specific scripts and APIs pull schedules/results/odds into project datasets.

## Feature Layer

Feature builders create rolling and matchup-aware representations for training and inference.

## Inference Layer

Refresh modules (`refresh_nba`, `refresh_nfl`, PGA scripts, CBB tooling) generate scored outputs and simulation artifacts.

## Serving Layer

Results are exported to:

- Supabase-backed endpoints for frontend cards/chat,
- web data bundles (for example PGA dashboard JSON).

## Scheduling and operations

The main refresh workflow runs daily at 13:00 UTC and executes raw updates, feature snapshots, league inference, and Supabase sync.

## Architecture caveat

Project documentation spans multiple domains; root-level summaries emphasize NFL/NBA while deeper docs/artifacts include PGA and CBB modules.
