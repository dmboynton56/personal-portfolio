---
project: matchpoint
last_verified: 2026-07-10
role: faq
source_repo: /Users/drewboynton/Documents/VSCODE_PROJECTS/matchpoint
---

# MatchPoint FAQ for assistants

## What is MatchPoint?

MatchPoint is an AI job search app. It matches a user's resume and explicit preferences against a refreshed corpus of Greenhouse job postings, then ranks roles with structured LLM scoring. It also includes full catalog browsing, natural-language job search filters, favorite/applied tracking, resume storage, and grounded resume suggestions.

## Is MatchPoint only for signed-in users?

No. Anonymous visitors can upload a PDF and receive a 3-job preview. Full persistence requires signup/login: saved resume, profile preferences, 10 persisted matches, favorites, applied jobs, and resume suggestions.

## How many jobs does it search?

The portfolio fallback metrics snapshot says 5,867 live jobs from 70 Greenhouse boards, generated 2026-07-02T19:50:00Z. The actual corpus is refreshed daily and stale rows are purged after 7 days, so the count should be treated as time-sensitive.

## Where do jobs come from?

The daily pipeline calls Greenhouse board APIs for 70 configured company slugs, with a cap of 100 jobs per company. It reads live jobs with content enabled, strips HTML, stores the cleaned description, derives browse metadata, embeds job text, upserts into Turso, and refreshes `last_seen_at`.

## How does matching work?

Matching has two stages. First, the user's resume plus explicit profile preferences are embedded with `text-embedding-3-small` and searched against a precomputed job embedding matrix. Second, the top candidates are scored by a structured LLM scorer across eight weighted fit dimensions. Final ranking uses the weighted fit score, not raw vector similarity.

## What are the eight fit dimensions?

Skills overlap, experience fit, role alignment, seniority match, location fit, compensation fit, preference fit, and interview likelihood. The largest weights are skills overlap (25%), experience fit (18%), and role alignment (17%).

## What do match notes mean?

Each scored job should have exactly three regular match notes. Warnings are optional and highlight material drawbacks such as location mismatch, pay below stated minimum, seniority gaps, or missing critical requirements. Current match-note objects contain short text plus `is_warning`; they do not expose verbatim quote citations.

## What profile preferences affect matches?

Target role, preferred locations, preferred work modes, minimum base salary, and salary currency. These preferences are prepended to the resume text for retrieval and are also passed separately to the scorer as `USER_PREFERENCES`.

## Are matches recalculated automatically?

The job corpus refreshes daily, but user-specific matches are recalculated when a signed-in user uploads/re-uploads a resume or explicitly calls `/matches/recalculate` through the profile "Recalculate now" flow. Do not claim the code performs scheduled per-user match recalculation.

## Why can favorite or applied jobs survive after matches change?

Current matches live in `job_matches`, and recalculation replaces those rows. Favorite/applied jobs can also be mirrored into `user_saved_jobs`, which stores snapshots keyed by user and job ID. Favorites/applied pages read durable saved rows when available, then combine them with current matches.

## What happens when a job expires?

Jobs not seen by the pipeline for 7 days are purged from Turso. If a user's `job_matches` row points to a purged job, the matches API skips it and best-effort deletes that orphaned match row for that user.

## What does `/jobs` do?

`/jobs` is a public catalog browse/search page over the Turso jobs table. It supports keyword search, locations, experience levels, job types, workplace types, pay range, date posted windows, relevance/newest sort, pagination, and a natural-language assistant that converts a sentence into filters.

## What do resume suggestions do?

Resume suggestions look at the stored resume and the user's top matches. They generate 2-5 concrete skill/tool/framework suggestions grounded in real job descriptions. Each suggestion must include citation quotes that are validated as substrings of the cited job descriptions. Suggestions can include why-it-matters text and curated learning links.

## Is the bullet coach available?

The backend has a bullet coach flow, but the current frontend hides the "Coach me on bullets" button and rewrite inputs while a slowness issue is investigated. It is accurate to say the backend exists and is not currently exposed as a normal visible user flow.

## Which data store has what?

Turso has the job corpus, embeddings, metadata, summaries, apply URLs, and freshness markers. Supabase has auth, profiles, resume storage, current matches, suggestion cache, and durable saved-job snapshots when configured.

## Why is there no Postgres foreign key from matches to jobs?

Jobs moved from Supabase/Postgres to Turso/libSQL, so `job_matches.job_id` can no longer reference a Supabase `jobs` table. The FK was intentionally dropped; the API stores Turso UUIDs in match rows and hydrates job details from Turso at read time.

## What should assistants avoid saying?

- Do not say MatchPoint guarantees live counts unless a fresh metric source is available.
- Do not say match notes include verbatim quote citations.
- Do not say user matches refresh automatically every day.
- Do not say bullet rewriting is currently available in the visible frontend.
- Do not describe MatchPoint as a static prototype; it has deployed frontend/backend services and a scheduled ingestion pipeline.
