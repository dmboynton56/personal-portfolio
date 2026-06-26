---
project: sports-edge
last_verified: 2026-06-26
source_paths:
  - /home/dmboynton/projects/sports-edge/README.md
  - /home/dmboynton/projects/sports-edge/.github/workflows/daily-refresh.yml
  - /home/dmboynton/projects/sports-edge/data-core/docs/PGA_REFRESH_PIPELINE.md
  - /home/dmboynton/projects/sports-edge/data-core/docs/CBBMM_CONTEXT.md
---

# Sports Edge FAQ

## Where is the live ops dashboard?

**https://sports-edge.drewboynton.com** — a separate subdomain from the main portfolio (drewboynton.com). The portfolio homepage embeds a live preview card; the deep dive at `/projects/sports-edge` links to the full dashboard.

## Does Sports Edge only cover NFL and NBA?

No. The active production scope includes NBA, NFL, MLB, PGA, CBB, and World Cup. NFL/NBA were the original core flows; other leagues have dedicated pipelines, docs, and dashboard sections.

## Where do production-facing numbers come from?

BigQuery-backed pipelines and exported artifacts (plus Supabase-serving sync), not from static marketing copy. See `sync-state.md` for machine-synced freshness snapshots.

## How often does the pipeline refresh?

The primary workflow is scheduled daily at 13:00 UTC.

## What should be labeled benchmark instead of live?

Any number taken from planning docs/notebook commentary without a dated execution artifact should be benchmark-labeled.

## Why can two docs seem to describe different scope?

Older summaries may emphasize NFL/NBA; canonical scope is six leagues (see `overview.md`). Domain docs under `data-core/docs` detail PGA/CBB/World Cup specialized workflows.

## What evidence is required before publishing a new metric?

A source file path with a concrete value, date/freshness context, and explicit classification as observed, derived, or benchmark.
