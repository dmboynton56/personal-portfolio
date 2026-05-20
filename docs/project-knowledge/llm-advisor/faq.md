---
project: llm-advisor
last_verified: 2026-05-20
source_paths:
  - /home/dmboynton/projects/llm-advisor/src/live/loop.py
  - /home/dmboynton/projects/llm-advisor/src/core/config.py
  - /home/dmboynton/projects/personal-portfolio/app/api/llm-advisor/metrics/route.ts
---

# LLM Advisor FAQ

## Why does the portfolio show this project as under construction or work in progress?

The deep dive and homepage carousel intentionally show a **work in progress / rebuild** state because:

1. **ICTML premarket bias** is being **folded into** the **LLM Advisor** live stack — one public narrative instead of two.
2. The product goal is **one consolidated dashboard** for signals, guardrails, backtests, and execution telemetry.
3. **Premarket bias**, **LLM thresholds**, and **execution metrics** are each moving **into one project surface** (as shown on the marketing mock).
4. **Public dashboard polish** is ongoing while **signal and execution layers** consolidate.

This is **product and platform consolidation**, not a claim that the underlying design is absent from the repo. For whether *today’s* telemetry numbers are live or empty, use data-sources-and-freshness and Supabase/API status — that is separate from the “under construction” label.

## How often does LLM analysis run?

By default, every 15 minutes via `market_analysis_interval_minutes` in runtime settings.

## Is LLM Advisor trading live or backtesting?

It can do both; use telemetry feed mode and artifact/source checks to determine whether current metrics are from backtest streams or live streams.

## What controls risk before execution?

Risk is constrained by max-risk-per-trade, minimum reward/risk ratio, session window bounds, ATR filters, and end-of-day close logic.

## Are deep-dive P/L metrics always real brokerage P/L?

No. If telemetry is sourced from backtest artifacts, reported performance is simulation-derived and should be labeled accordingly.

## Why are there conflicting config values in the repo?

`config/settings.py` contains legacy constants; active runtime values are loaded from `src/core/config.py` in the current loop path.

## What is the minimum evidence needed to publish a new claim?

A source path with a materialized value, plus freshness context (date/timestamp) and benchmark-vs-live labeling where relevant.
