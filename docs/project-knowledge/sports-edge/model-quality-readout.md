---
project: sports-edge
last_verified: 2026-04-30
source_paths:
  - sports-edge/data-core/notebooks/nba_ats_roi.ipynb
  - sports-edge/data-core/notebooks/nfl_ats_roi.ipynb
  - personal-portfolio/app/api/sports-edges/ats-weekly/route.ts
---

# Sports Edge Model Quality Readout

This document defines the first model-quality readout for Sports Edge. It is intentionally narrow: ATS record and flat-unit ROI from scored games with model predictions.

The notebook-backed source is:

- `sports-edge/data-core/notebooks/nba_ats_roi.ipynb`
- `sports-edge/data-core/notebooks/nfl_ats_roi.ipynb`

The portfolio API implementation is:

- `personal-portfolio/app/api/sports-edges/ats-weekly/route.ts`

## Current Readout Contract

For each league and season, compute:

- scored games with latest model prediction
- ATS wins, losses, and pushes
- ATS hit rate excluding pushes
- flat-unit ROI at -110
- model edge versus book line, bucketed
- biggest hits and misses by cover margin
- win-probability calibration buckets when enough completed games exist

## ATS Definition

The ATS calculation is from the home team's perspective:

```text
actual_margin = home_score - away_score
cover_margin = actual_margin + model_spread
```

Result:

- `cover_margin > 0`: model side covered
- `cover_margin < 0`: model side missed
- `cover_margin ~= 0`: push

This matches the current portfolio ATS route. If the route changes, update the notebooks in the same change.

## ROI Definition

Flat-unit ROI assumes one unit risked per non-push game at -110 odds:

```text
win_profit = 100 / 110
net_units = wins * win_profit - losses
roi = net_units / (wins + losses)
```

Pushes are excluded from risked-game ROI.

## First Practical Questions

The first notebook run should answer:

1. Is there any positive ROI overall, or is the model only useful in specific edge buckets?
2. Does performance improve when `abs(model_spread - book_spread)` is larger?
3. Are the biggest misses explainable by injuries, rest, garbage time, or stale lines?
4. Does the win-probability model look calibrated enough to use in chatbot answers?
5. Are NBA and NFL behaving differently enough to require separate chatbot caveats?

## Current Status

The result path is now scaffolded but not yet promoted to canonical portfolio claims. Until the notebooks are executed and reviewed, the chatbot should phrase ATS/ROI answers as current computed results, not long-term validated edge.

Safe answer shape:

```text
The current computed NBA ATS record from scored games is X-Y-Z, with Y% cover rate and Z% flat ROI at -110. This is a live operational readout, not a final backtest claim.
```

Unsafe answer shape:

```text
The NBA model beats the market.
```

## Follow-Up Outputs

Once executed, copy the reviewed summary into:

- `docs/project-knowledge/sports-edge/metrics-and-results.md`
- `docs/model-cards/sports-edge-nba-model.md`
- `docs/model-cards/sports-edge-nfl-model.md`

The same numbers should eventually be exported into `project_metrics`.
