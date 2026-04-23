---
project: llm-advisor
last_verified: 2026-04-07
source_paths:
  - /home/dmboynton/projects/llm-advisor/src/live/loop.py
  - /home/dmboynton/projects/llm-advisor/src/core/config.py
  - /home/dmboynton/projects/llm-advisor/config/thresholds.py
  - /home/dmboynton/projects/llm-advisor/.github/workflows/premarket.yml
  - /home/dmboynton/projects/llm-advisor/.github/workflows/live_loop.yml
---

# LLM Advisor Architecture

## Runtime components

## Configuration Layer

`Settings.load()` in `src/core/config.py` sets watchlist, risk caps, session windows, and LLM cadence/model defaults.

## Signal Layer

`STDEVThresholds` in `config/thresholds.py` defines the base MR/TC arm and trigger boundaries plus ATR/risk filters.

## Orchestration Layer

`src/live/loop.py` controls:

- feature updates,
- threshold evaluation,
- timed market analysis,
- optional trade validation,
- execution attempts,
- tick logging and persistence.

## Storage and telemetry layer

The portfolio API (`/api/llm-advisor/metrics`) can read from:

- Supabase tables (`llm_advisor_backtest_runs`, `llm_advisor_backtest_trades`, `llm_advisor_runtime_heartbeats`),
- or local daily artifacts under `data/daily_news/*/processed/`.

## Automation schedule

- Premarket workflow: 13:30 UTC weekdays.
- Live-loop workflow: 14:30 UTC weekdays.
- Live-loop timeout guard: 420 minutes.

## Architecture caveat

There is a legacy `config/settings.py` module with values that differ from runtime defaults; deep-dive claims should prefer `src/core/config.py` and active loop wiring.
