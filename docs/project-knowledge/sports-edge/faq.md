---
project: sports-edge
last_verified: 2026-04-07
source_paths:
  - /home/dmboynton/projects/sports-edge/README.md
  - /home/dmboynton/projects/sports-edge/.github/workflows/daily-refresh.yml
  - /home/dmboynton/projects/sports-edge/data-core/docs/PGA_REFRESH_PIPELINE.md
  - /home/dmboynton/projects/sports-edge/data-core/docs/CBBMM_CONTEXT.md
---

# Sports Edge FAQ

## Does Sports Edge only cover NFL and NBA?

No. NFL/NBA are core production flows, but the repository also contains active PGA and CBB pipelines, docs, and artifacts.

## Where do production-facing numbers come from?

BigQuery-backed pipelines and exported artifacts (plus Supabase-serving sync), not from static marketing copy.

## How often does the pipeline refresh?

The primary workflow is scheduled daily at 13:00 UTC.

## What should be labeled benchmark instead of live?

Any number taken from planning docs/notebook commentary without a dated execution artifact should be benchmark-labeled.

## Why can two docs seem to describe different scope?

Root summaries focus on NFL/NBA, while domain docs under `data-core/docs` detail PGA/CBB additions and specialized workflows.

## What evidence is required before publishing a new metric?

A source file path with a concrete value, date/freshness context, and explicit classification as observed, derived, or benchmark.
