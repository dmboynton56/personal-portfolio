---
project: cross-project
last_verified: 2026-07-10
source_paths:
  - /home/dmboynton/projects/personal-portfolio/docs/project-knowledge/llm-advisor
  - /home/dmboynton/projects/personal-portfolio/docs/project-knowledge/sports-edge
  - /home/dmboynton/projects/personal-portfolio/docs/project-knowledge/matchpoint
  - /home/dmboynton/projects/personal-portfolio/docs/project-knowledge/evidence-register.md
  - /home/dmboynton/projects/personal-portfolio/docs/project-knowledge/portfolio-overview.md
---

# Project Knowledge Question Index

## LLM Advisor question routing

## Why is the project “under construction” or “work in progress” on the portfolio?

Use:

- `docs/project-knowledge/llm-advisor/faq.md`
- `docs/project-knowledge/llm-advisor/overview.md` (section on portfolio deep-dive status)

## How does LLM Advisor work end to end?

Use:

- `docs/project-knowledge/llm-advisor/overview.md`
- `docs/project-knowledge/llm-advisor/architecture.md`

## What are the active risk limits and thresholds?

Use:

- `docs/project-knowledge/llm-advisor/metrics-and-results.md`
- `docs/project-knowledge/llm-advisor/faq.md`

## Are these performance numbers live or backtest?

Use:

- `docs/project-knowledge/llm-advisor/data-sources-and-freshness.md`
- `docs/project-knowledge/evidence-register.md`

## Sports Edge question routing

## Where is the dashboard / live app / ops surface?

Use:

- `docs/project-knowledge/sports-edge/overview.md` (Operations dashboard section)
- `docs/project-knowledge/sports-edge/faq.md`
- `docs/project-knowledge/portfolio-overview.md` (Sports Edge liveUrl)

## What leagues and modules are currently covered?

Use:

- `docs/project-knowledge/sports-edge/overview.md`
- `docs/project-knowledge/sports-edge/architecture.md`

## What are the most recent observed outputs?

Use:

- `docs/project-knowledge/sports-edge/sync-state.md` (auto-synced live snapshot)
- `docs/project-knowledge/sports-edge/metrics-and-results.md`
- `docs/project-knowledge/evidence-register.md`

## Which numbers are benchmark targets vs production evidence?

Use:

- `docs/project-knowledge/sports-edge/data-sources-and-freshness.md`
- `docs/project-knowledge/sports-edge/faq.md`
- `docs/project-knowledge/evidence-register.md`

## MatchPoint question routing

## What is MatchPoint and what can users do with it?

Use:

- `docs/project-knowledge/matchpoint/overview.md`
- `docs/project-knowledge/matchpoint/faq.md`
- `docs/project-knowledge/portfolio-overview.md` for homepage placement and live app URL

## How does MatchPoint match resumes to jobs?

Use:

- `docs/project-knowledge/matchpoint/overview.md` (How matching works, fit dimensions)
- `docs/project-knowledge/matchpoint/architecture.md` (resume upload path, vector retrieval, LLM scorer)

## What is the split-database design?

Use:

- `docs/project-knowledge/matchpoint/architecture.md` (Turso, Supabase, FK removal)
- `docs/project-knowledge/matchpoint/overview.md` (Data stores)

## How fresh is the job corpus and where do jobs come from?

Use:

- `docs/project-knowledge/matchpoint/overview.md` (Job data and freshness)
- `docs/project-knowledge/matchpoint/architecture.md` (daily ingestion, vector matrix)
- `docs/project-knowledge/matchpoint/faq.md`

## Are favorites, applied jobs, and resume suggestions supported?

Use:

- `docs/project-knowledge/matchpoint/overview.md` (What users can do, resume suggestions)
- `docs/project-knowledge/matchpoint/architecture.md` (saved/applied jobs, suggestions architecture)
- `docs/project-knowledge/matchpoint/faq.md`

## Is bullet coaching available?

Use:

- `docs/project-knowledge/matchpoint/overview.md` (Currently limited or hidden UI)
- `docs/project-knowledge/matchpoint/architecture.md` (Bullet coach backend)
- `docs/project-knowledge/matchpoint/faq.md`

## Cross-project routing

## Who is Drew Boynton / about the site owner / background / contact / resume?

Use:

- `docs/project-knowledge/site-profile.md` (canonical homepage + about + **email, phone, LinkedIn, GitHub**)
- `docs/project-knowledge/drew-resume.md` (direct public resume PDF link)

Optional:

- `docs/project-knowledge/portfolio-overview.md` (what projects are showcased, not personal bio)

## How do I contact Drew / LinkedIn / GitHub / email / phone?

Use:

- `docs/project-knowledge/site-profile.md` section **Contact (public)**

## Can I view, download, open, or get Drew's resume / CV / PDF?

Use:

- `docs/project-knowledge/drew-resume.md`
- `docs/project-knowledge/site-profile.md` section **Resume**

## What is [project name] / tell me about Sports Edge / Mancala / etc.?

Use:

- `docs/project-knowledge/portfolio-overview.md` for homepage card summary, tech stack, and deep-dive URL
- Then `docs/project-knowledge/<project>/` for methodology, metrics, limitations

## What projects appear on this portfolio / homepage / showcase?

Use:

- `docs/project-knowledge/portfolio-overview.md` (canonical list: flagships + additional carousel projects)

Optional context:

- `docs/faq.txt`

## What claims are safe to publish on deep-dive pages?

Use:

- `docs/project-knowledge/evidence-register.md`

## How should stale data be handled?

Use:

- `docs/project-knowledge/maintenance-checklist.md`
