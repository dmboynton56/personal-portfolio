---
project: cross-project
last_verified: 2026-05-20
role: canonical_site_inventory
---

# Portfolio overview (public showcase)

This file is the **canonical list of projects presented on the portfolio homepage** (`/#work`), aligned with the **WorkSection** carousel. Use it for answers about *what appears on this site*, *what projects are included*, and *flagship vs additional* items.

For **numeric claims, production schedules, and "observed vs planned" metrics**, use `docs/project-knowledge/evidence-register.md` and the relevant `project-knowledge/<project>/` docs—not this overview alone.

## Flagship projects (deep-dive case study pages)

These have dedicated `/projects/...` pages and richer documentation under `docs/project-knowledge/`.

| id | Public title (homepage) | Deep dive URL | Focus |
| --- | --- | --- | --- |
| nba-hof-predictor | NBA Hall of Fame Predictor | `/projects/nba-hof` | XGBoost HoF probability, interactive player lookup, interpretability |
| sports-edge | Sports Edge: NFL/NBA Betting Analysis | `/projects/sports-edge` | ML spreads/edges, BigQuery + Supabase, multi-league pipeline |
| llm-advisor | LLM Advisor: Agentic Trading System | `/projects/llm-advisor` | LLM + execution stack, risk guardrails, telemetry-backed monitoring |

## Additional projects (carousel only)

Shown on the homepage **without** a separate `/projects/*` deep dive in this repo.

| id | Public title (homepage) | Deep dive URL | Focus |
| --- | --- | --- | --- |
| mancala-ai | Mancala AI with Game Theory | *(carousel / interactive embed only)* | Minimax, alpha-beta pruning, game UI |
| houseclusters | Advanced Data Cluster Sorting | *(carousel only)* | Clustering / GMM (course project) |
| project1 | CU Boulder Police Department Heatmap | *(carousel only)* | Geospatial / heatmap visualization |
| simplefitness | Simple Fitness (Tracking App!) | *(carousel only)* | iOS / Swift / CoreData fitness tracker |

## Notes for assistants

- **Listing "what's in the portfolio"** should include **all three flagships** and **all four additional** rows above unless the user asks for a subset.
- **ICTML** on the site may redirect to LLM Advisor (`/projects/ictml` → `/projects/llm-advisor`); treat LLM Advisor as the flagship narrative for trading-advisor work.
- Deep-dive **methodology and limitations** live in per-project folders (e.g. `project-knowledge/sports-edge/`, `llm-advisor/`, model cards). This overview does **not** replace those for technical detail.
