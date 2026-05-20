---
project: llm-advisor
last_verified: 2026-05-20
source_paths:
  - /home/dmboynton/projects/llm-advisor/README.md
  - /home/dmboynton/projects/llm-advisor/src/core/config.py
  - /home/dmboynton/projects/llm-advisor/src/live/loop.py
---

# LLM Advisor Overview

## What is LLM Advisor?

LLM Advisor is a hybrid trading system that combines:

- technical STDEV signal logic (mu/sigma/z-score state),
- periodic LLM market analysis,
- and rule-bound execution/risk controls.

The runtime loop is implemented in `src/live/loop.py`, with defaults loaded from `src/core/config.py`.

## What problem does it solve?

It attempts to make intraday execution more adaptive than a static rules-only strategy:

- technical setup detection remains deterministic,
- while qualitative market context is converted into threshold multipliers and confidence overlays.

## Portfolio deep-dive: why it shows as work in progress / under construction

The public portfolio (`/#work` carousel and `/projects/llm-advisor`) labels this work as **in progress** — not because core trading concepts are undefined, but because **several surfaces are being consolidated into one flagship story**.

**What “under construction” means here**

- **LLM Advisor rebuild underway:** ICTML premarket bias work is being **folded into** the live advisor stack so the site presents **one** trading-advisor project instead of parallel narratives.
- **Product goal:** Ship **one dashboard** for signals, guardrails, backtests, and execution telemetry (instead of scattered UIs and docs).
- **Areas called out on the marketing surface as “coming into one project surface”:** premarket bias, LLM-driven threshold adjustment, and execution metrics — each integrated into the same advisor surface over time.
- **ICTML:** The ICTML route on the portfolio **redirects** to this deep dive (`/projects/ictml` → `/projects/llm-advisor`); consolidation is intentional.
- **Dashboard copy on the site:** *“ICTML is being folded into this project. Public dashboard polish is in progress while the signal and execution layers consolidate.”*

**Assistant guidance:** If a visitor asks why the project is “under construction” or “work in progress,” answer with the above consolidation narrative. Do **not** imply the project has no runtime or docs — telemetry may still be empty or degraded for unrelated reasons; distinguish **UI/product consolidation** from **missing evidence for numeric claims** (use `data-sources-and-freshness.md` and the evidence register for the latter).

## Core workflow summary

1. Premarket context is generated and loaded.
2. Symbol state is initialized with rolling statistics.
3. During the session, the loop updates features and evaluates trade thresholds.
4. Market analysis runs on a timed cadence and adjusts multipliers.
5. Trade execution and logging occur with storage hooks for analytics.

## Glossary

## STDEV Thresholds

The configured z-score boundaries used to arm and trigger mean-reversion or continuation setups.

## Threshold Multiplier

A scaling factor from market analysis that shifts base thresholds without changing the underlying strategy code.

## Premarket Context

A structured snapshot from the premarket pipeline containing symbol-level bias and supporting context.

## Feed Mode

Whether telemetry currently reflects backtest artifacts or live runtime persistence.
