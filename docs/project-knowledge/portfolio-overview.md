---
project: cross-project
last_verified: 2026-06-26
role: canonical_site_inventory
---

# Portfolio overview (public showcase)

This file is the **canonical list of projects presented on the portfolio homepage** (`/#work`), aligned with the **WorkSection** carousel. Use it for answers about *what appears on this site*, *what each project is about*, *technologies used*, and *flagship vs additional* items.

For **who Drew is and contact info**, use `docs/project-knowledge/site-profile.md`.

For **numeric claims, production schedules, and "observed vs planned" metrics**, use `docs/project-knowledge/evidence-register.md` and the relevant `project-knowledge/<project>/` docs—not this overview alone.

## Flagship projects (deep-dive case study pages)

These have dedicated `/projects/...` pages, interactive previews on the homepage where noted, and richer documentation under `docs/project-knowledge/`. Homepage order: Sports Edge first, then NBA HOF, LLM Advisor, and this portfolio site last among flagships.

### Sports Edge (`sports-edge`)

- **Homepage title:** Sports Edge: Multi-League Sports Modeling
- **Deep dive:** `/projects/sports-edge`
- **Live ops dashboard:** https://sports-edge.drewboynton.com
- **Summary:** Production sports modeling stack for NBA, NFL, MLB, PGA, CBB, and World Cup. BigQuery holds source-of-truth data; Python pipelines score games and sync to Supabase for the ops dashboard and portfolio embeds. Model spreads and win probabilities are compared to sportsbook lines to surface edges.
- **Technologies:** Python, Scikit-learn, LightGBM, Supabase, Next.js, Sports Analytics
- **Proof points:** Ops dashboard at sports-edge.drewboynton.com; BigQuery source of truth + Supabase serving; automated daily/weekly pipeline across six leagues
- **GitHub:** https://github.com/dmboynton56/sports-edge
- **Interactive on homepage:** yes (live card preview — first flagship slot)

### NBA Hall of Fame Predictor (`nba-hof-predictor`)

- **Homepage title:** NBA Hall of Fame Predictor
- **Deep dive:** `/projects/nba-hof`
- **Summary:** Interactive ML model that estimates NBA players' Hall of Fame chances from career production, peak impact, longevity, and award history. Real-time player lookup and prediction analysis using XGBoost trained on 5,250+ players since 1976.
- **Technologies:** Python, XGBoost, Next.js, TypeScript, Basketball Analytics
- **Proof points:** 5,250+ historical careers; interactive probability search; feature-level reasoning per prediction
- **Interactive on homepage:** yes (player lookup embed)

### LLM Advisor (`llm-advisor`)

- **Homepage title:** LLM Advisor: Agentic Trading System
- **Deep dive:** `/projects/llm-advisor` (ICTML redirects here)
- **Summary:** Autonomous trading agent using Gemini for market context, mean-reversion threshold adjustment, and guarded execution. ICTML premarket bias work is being folded into this single trading-advisor story.
- **Technologies:** Python, Gemini API, Alpaca, Pandas, Backtesting
- **Proof points:** ICTML premarket fold-in in progress; hybrid ML + LLM decision stack; risk controls tied to execution rules
- **GitHub:** https://github.com/dmboynton56/llm-advisor
- **Interactive on homepage:** no (screenshots / metrics on deep dive)

### My Personal Portfolio Website (`personal-portfolio`)

- **Homepage title:** My Personal Portfolio Website
- **Deep dive:** `/projects/personal-portfolio`
- **Summary:** This site — TypeScript and Next.js up front, Supabase and BigQuery underneath. Pulls live sportsbook edges from Sports Edge and trading snapshots from LLM Advisor onto the homepage, plus a Gemini chatbot (Vertex AI, RAG over site content).
- **Technologies:** TypeScript, Next.js, React, Tailwind, Supabase, BigQuery, Gemini / Vertex AI, RAG
- **Interactive on homepage:** yes (card-only; no device preview frame)

## Additional projects (carousel only)

Shown on the homepage **without** a separate `/projects/*` deep dive in this repo.

### Mancala AI with Game Theory (`mancala-ai`)

- **Summary:** Mancala with minimax and alpha-beta pruning (≈5-ply lookahead). AI targets ~70–80% win rate vs random play with large search speedups from pruning; Monte Carlo analysis for strategy validation.
- **Technologies:** Minimax, Alpha-Beta Pruning, Game Theory
- **Interactive on homepage:** yes (play against AI)

### Advanced Data Cluster Sorting (`houseclusters`)

- **Summary:** Individual Advanced Data Science course project clustering similar records using multiple structures and algorithms.
- **Technologies:** Python, Pandas, Gaussian Mixture Models

### CU Boulder Police Department Heatmap (`project1`)

- **Summary:** Heatmap of CU Boulder Police Department incident locations and common occurrence patterns.
- **Technologies:** React, Next.js, TypeScript, Tailwind CSS

### Simple Fitness (`simplefitness`)

- **Summary:** Native iOS app for strength and cardio workout tracking; introduction to iOS/Swift ecosystem.
- **Technologies:** Xcode, Swift, CoreData
- **Device frame on homepage:** mobile layout

## Notes for assistants

- **Listing "what's in the portfolio"** should include **all four flagships** and **all four additional** projects unless the user asks for a subset.
- **Sports Edge is the first homepage flagship** and the recommended starting point for production ML evaluation.
- **ICTML** may redirect to LLM Advisor (`/projects/ictml` → `/projects/llm-advisor`).
- **Methodology, limitations, metrics, and architecture** for flagships: use `project-knowledge/sports-edge/`, `llm-advisor/`, `nba-hof` paths and model cards—not this overview alone.
