---
project: sports-edge
league: NFL
last_verified: 2026-04-30
source_paths:
  - sports-edge/data-core/notebooks/nfl_ats_roi.ipynb
  - sports-edge/data-core/src/pipeline/refresh_nfl.py
  - sports-edge/data-core/src/models/
---

# Sports Edge NFL Model Card

## Intended Use

Predict NFL game outcomes for portfolio-facing analysis:

- model spread from the home team's perspective
- home win probability
- weekly ATS readouts after final scores are available

This model is for analysis and demonstration. It is not a betting recommendation engine.

## Data Sources

Current serving/evaluation path:

- Supabase `games` for schedule, teams, book spread, and final scores
- Supabase `model_predictions` for latest model spread and home win probability
- BigQuery `sports_edge_raw`, `sports_edge_curated`, and `sports_edge_results` for warehouse/raw/curated context

The checked storage contracts live under `plans/docs/`.

## Prediction Targets

- `my_spread`: predicted home-team spread/margin convention used by the portfolio API
- `my_home_win_prob`: predicted probability that the home team wins

## Current Production Version

Pending explicit registry confirmation.

Known current implementation paths:

- `sports-edge/data-core/src/pipeline/refresh_nfl.py`
- `sports-edge/data-core/src/models/`

Follow-up: confirm the loaded model artifact and add it to `sports-edge/data-core/models/DECISIONS.md` and the planned `model_registry`.

## Performance Metrics

Pending execution/review of:

- `sports-edge/data-core/notebooks/nfl_ats_roi.ipynb`
- future `nfl_calibration.ipynb`

Metrics to fill:

- ATS record
- flat-unit ROI at -110
- ROI by model-edge bucket
- Brier score
- calibration ECE
- biggest misses and likely causes

Until those notebooks are run and reviewed, chatbot answers should describe NFL ATS/ROI as live computed readouts, not validated market edge.

## Known Limitations

- Quarterback injuries and late inactive news can dominate spread outcomes.
- Weather, travel, and short-week rest effects may not be represented with enough detail.
- Small weekly sample sizes make short-term ATS claims noisy.
- Book-line movement between prediction time and game time can change apparent edge.
- Garbage-time scoring and prevent defense can change spread outcomes without changing the quality of the pregame read.

See `docs/project-knowledge/sports-edge/known-failure-modes.md`.

## Monitoring

Current monitoring path:

- daily refresh workflow success/failure
- strict Supabase validation
- scored-game coverage
- ATS/ROI notebook readout

Planned monitoring:

- weekly calibration notebook
- drift alerts when spread error or calibration worsens versus baseline
- model registry entries per promoted version

## Safe Chatbot Summary

The chatbot can say:

> The NFL model currently produces weekly spread and win-probability predictions. We track ATS record and ROI from scored games, but those live readouts are noisy because NFL sample sizes are small.

The chatbot should not say:

> The NFL model has a durable betting edge.
