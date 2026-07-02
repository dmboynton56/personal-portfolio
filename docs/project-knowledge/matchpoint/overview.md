---
project: matchpoint
last_verified: 2026-07-02
role: project_overview
---

# MatchPoint — AI job matcher

MatchPoint is an AI job matcher built during Flatiron School's Accelerated AI Engineering Work-Integrated Program. Upload a PDF resume and get a ranked shortlist of live tech roles scraped from Greenhouse boards—each match scored across eight fit dimensions with grounded highlights and warnings. Authenticated users save preferences, persist matches in Supabase, and get resume suggestions plus a bullet coach powered by smaller GPT models.

## Live surfaces

- **Web app:** https://matchpoint-web-gamma.vercel.app
- **API:** https://matchpoint-lake.vercel.app
- **Portfolio deep dive:** `/projects/matchpoint`

## Architecture summary

### Split-database design

- **Turso (libSQL):** jobs corpus — **5,867 live jobs** (as of 2026-07-02) from 70 Greenhouse boards. HTML stripped, embedded with OpenAI `text-embedding-3-small` (1536-dim). Jobs unseen for 7 days are purged.
- **Supabase (separate project):** user state — profiles, `job_matches`, resume storage, pgvector resume embeddings on `profiles.resume_embedding`. FK to Turso jobs was dropped; orphan matches hydrate at read time.

### Two-stage matching

1. **Vector retrieval:** resume embedding queries a precomputed L2-normalized NumPy matrix (~33 MB) on the `data-cache` git branch for sub-10ms warm search on Vercel serverless. Top 10 for signed-in users; top 3 for anonymous visitors.
2. **LLM scoring:** `gpt-5.4-nano` structured output across eight weighted fit dimensions:

| Dimension | Weight |
|---|---|
| Skills overlap | 25% |
| Experience fit | 18% |
| Role alignment | 17% |
| Seniority match | 10% |
| Location | 10% |
| Compensation | 7.5% |
| Preferences | 7.5% |
| Interview likelihood | 5% |

Output: weighted `match_score`, exactly 3 grounded highlights with citation quotes, optional warnings.

### Resume pipeline

PDF upload → pypdf text extraction → embedding on `profiles.resume_embedding` → `replace_job_matches` RPC. Extras: resume skill suggestions and LLM bullet coach on `gpt-4o-mini`.

### Daily ingestion

GitHub Actions at 10:00 UTC: scrape 70 Greenhouse boards (≤100 jobs each), embed, upsert Turso, purge stale jobs, publish embedding matrix to `data-cache` branch.

Companies include Stripe, Airbnb, Anthropic, Databricks, GitLab, and others configured in the scraper.

## Stack

React 19, TypeScript, Vite, Tailwind 4, FastAPI (Python 3.12), OpenAI, Turso/libSQL, Supabase (auth + RLS + storage), Vercel, GitHub Actions.

## Grounded output rules

Highlights must cite verbatim quotes from job postings. Scorer receives structured job facts and must not invent qualifications. Warnings surface seniority gaps, location conflicts, and missing must-have skills.

## Notes for assistants

- MatchPoint uses its **own Supabase project**, not the shared sports-edge/llm-advisor serving layer.
- Anonymous visitors get a 3-match preview (`requires_signup: true` path) before full access.
- For homepage inventory and ordering, see `docs/project-knowledge/portfolio-overview.md`.
