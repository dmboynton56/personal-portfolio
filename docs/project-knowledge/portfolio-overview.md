---
project: cross-project
last_verified: 2026-07-02
role: canonical_site_inventory
---

# Portfolio overview (public showcase)

This file is the **canonical list of projects presented on the portfolio homepage** (`/#work`), aligned with the **WorkSection** carousel. Use it for answers about *what appears on this site*, *what each project is about*, *technologies used*, and *flagship vs additional* items.

For **who Drew is and contact info**, use `docs/project-knowledge/site-profile.md`.

For **numeric claims, production schedules, and "observed vs planned" metrics**, use `docs/project-knowledge/evidence-register.md` and the relevant `project-knowledge/<project>/` docs—not this overview alone.

## Flagship projects (deep-dive case study pages)

These have dedicated `/projects/...` pages, laptop previews on the homepage where noted, and richer documentation under `docs/project-knowledge/`.

**Homepage order (2026-07):** Sports Edge → LLM Advisor → MatchPoint → NBA HOF → Personal Portfolio (card-only, last).

**Hero quick links (3 cards):** Sports Edge, LLM Advisor, MatchPoint.

### Sports Edge (`sports-edge`)

- **Homepage title:** Sports Edge: Multi-League Sports Modeling
- **Deep dive:** `/projects/sports-edge`
- **Live ops dashboard:** https://sports-edge.drewboynton.com
- **Summary:** Public ops dashboard with graded predictions, data-quality monitoring, and fail-closed sportsbook price checks. BigQuery warehouse, Cloud Run serving, GitHub Actions pipelines. Covers NBA, NFL, MLB, PGA, CBB, and World Cup modeling workflows. Current MLB HR board: 79 model candidates, 0 priced (all odds_status=missing_odds). Serving pipeline and Supabase work; OddsPapi had no fresh MLB HR markets.
- **Technologies:** Python, Scikit-learn, LightGBM, Supabase, Next.js, Sports Analytics
- **Proof points:** Public ops dashboard with graded predictions and data quality monitoring; BigQuery warehouse + Supabase serving + Cloud Run APIs; daily automated pipelines across NBA, NFL, MLB, PGA, CBB, World Cup
- **GitHub:** https://github.com/dmboynton56/sports-edge
- **Homepage laptop:** stats-screen display (click through to deep dive)

### LLM Advisor (`llm-advisor`)

- **Homepage title:** LLM Advisor: Paper-Trading Ops Dashboard
- **Deep dive:** `/projects/llm-advisor` (ICTML redirects here)
- **Live ops dashboard:** https://llm-advisor.drewboynton.com
- **Summary:** Paper-trading ops dashboard with live decision ledger, win-rate tracking, and Gemini veto logs. LLM adds context and adjusts thresholds; rules keep control. Alpaca paper account, Supabase telemetry, real-time heartbeat monitoring. Paper equity ~$96,454 (-3.03% since 2026-07-06). Last heartbeat ~4h after US cash close. 30d: 59.2% win rate, 49 closed trades, +$1,612 realized. Decision ledger shows Gemini vetoes with reasons (e.g. premarket_data_quality).
- **Technologies:** Python, Gemini API, Alpaca, Pandas, Backtesting
- **Proof points:** Live ops dashboard with decision ledger and Gemini veto logs; paper-trading account: 59.2% win rate (30d), 49 closed trades; LLM adjusts thresholds, rules enforce risk limits
- **GitHub:** https://github.com/dmboynton56/llm-advisor
- **Homepage laptop:** dashboard screenshot (click through to deep dive)

### MatchPoint (`matchpoint`) — NEW

- **Homepage title:** MatchPoint: AI Job Matcher
- **Deep dive:** `/projects/matchpoint`
- **Live app:** https://matchpoint-web-gamma.vercel.app
- **Summary:** AI job matcher with daily ingestion from 70 Greenhouse boards, two-stage embedding + LLM matching against your resume. Turso holds the jobs corpus; Supabase holds user state.
- **Technologies:** React 19, FastAPI, OpenAI, Turso, Supabase, Vercel
- **Proof points:** 5,867 live jobs (as of 2026-07-02); 8-dimension LLM fit scoring; sub-10ms vector search via precomputed matrix
- **GitHub:** https://github.com/dmboynton56/matchpoint
- **Homepage laptop:** stats-screen display (click through to deep dive)

### NBA Hall of Fame Predictor (`nba-hof-predictor`)

- **Homepage title:** NBA Hall of Fame Predictor
- **Deep dive:** `/projects/nba-hof`
- **Summary:** Interactive ML model that estimates NBA players' Hall of Fame chances from career production, peak impact, longevity, and award history. Real-time player lookup and prediction analysis using XGBoost trained on 5,250+ players since 1976.
- **Technologies:** Python, XGBoost, Next.js, TypeScript, Basketball Analytics
- **Proof points:** 5,250+ historical careers; interactive probability search; feature-level reasoning per prediction
- **Interactive on homepage:** yes (player lookup embed)

### My Personal Portfolio Website (`personal-portfolio`)

- **Homepage title:** My Personal Portfolio Website
- **Deep dive:** `/projects/personal-portfolio`
- **Summary:** This site — TypeScript and Next.js up front, Supabase and BigQuery underneath. Flagship projects use stats-screen laptop displays; deep dives link out to live ops dashboards where applicable. Includes a Gemini chatbot (Vertex AI, RAG over site content).
- **Technologies:** TypeScript, Next.js, React, Tailwind, Supabase, BigQuery, Gemini / Vertex AI, RAG
- **Interactive on homepage:** card-only; no device preview frame

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

## Serving-layer handoff (2026-08)

- **Sports Edge:** Graded predictions, data-quality page, sportsbook price freshness, and cross-league results live at https://sports-edge.drewboynton.com. Portfolio deep dive keeps architecture, season-level ATS/ROI, and links out prominently.
- **LLM Advisor:** Paper equity, decision ledger with Gemini veto logs, trade breakdowns, and execution funnel at https://llm-advisor.drewboynton.com. Portfolio deep dive keeps high-level telemetry and links out prominently.
- **MatchPoint:** portfolio links to the live web app; deep dive covers architecture and matching design.

## Notes for assistants

- **Listing "what's in the portfolio"** should include **all five flagships** and **all four additional** projects unless the user asks for a subset.
- **Homepage flagship order:** sports-edge, llm-advisor, matchpoint, nba-hof, personal-portfolio (card-only last).
- **Hero quick links:** sports-edge, llm-advisor, matchpoint only.
- **ICTML** may redirect to LLM Advisor (`/projects/ictml` → `/projects/llm-advisor`).
- **Methodology, limitations, metrics, and architecture** for flagships: use `project-knowledge/sports-edge/`, `llm-advisor/`, `matchpoint/`, `nba-hof` paths and model cards—not this overview alone.
