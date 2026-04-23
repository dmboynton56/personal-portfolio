---
project: llm-advisor
last_verified: 2026-04-07
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
