---
project: sports-edge
last_verified: 2026-04-30
source_paths:
  - sports-edge/data-core/notebooks/nba_ats_roi.ipynb
  - sports-edge/data-core/notebooks/nfl_ats_roi.ipynb
---

# Sports Edge Known Failure Modes

This doc gives the chatbot concrete caveats. It should be used whenever a user asks whether a Sports Edge prediction is actionable, reliable, or likely to beat the market.

## Late Injury And Inactive News

The model can miss late scratches, quarterback injury news, minute restrictions, and surprise inactive reports. These events can move real prices faster than the daily refresh captures them.

Detection:

- model edge looks large but the market moved after prediction time
- biggest-miss notebook rows cluster around teams with late injury news

Mitigation:

- cite prediction timestamp
- avoid claiming betting edge without current injury context
- use `web_search` for current injury/news questions

## NBA Back-To-Backs And Rotation Volatility

NBA rotations can change sharply on back-to-backs, especially late in the season or around playoff seeding. Rest features help, but they do not fully encode coach-specific rotation choices.

Detection:

- misses cluster on rest-disadvantage games
- model confidence is high while lineup uncertainty is also high

Mitigation:

- mention rest/rotation uncertainty
- prefer calibrated probability language over hard claims

## NFL Short Weeks And Weather

Thursday games, international travel, and weather can make NFL games less comparable to normal weekly rest patterns. Weather is especially relevant for totals and margin volatility.

Detection:

- misses cluster around short weeks or outdoor weather games
- book line moves materially after initial model prediction

Mitigation:

- call out short-week/weather uncertainty
- use external search for current weather or injury context

## Garbage-Time Scoring

Spread outcomes can flip late in games because of prevent defense, bench units, fouling, or low-leverage drives. A model can be directionally right about team strength and still miss ATS.

Detection:

- win probability direction was correct but `cover_margin` was sharply negative
- biggest misses include blowout or end-game scoring artifacts

Mitigation:

- separate win-probability quality from ATS result quality
- avoid over-weighting one-game ATS outcomes

## Stale Or Missing Book Lines

The ATS and ROI readouts depend on `book_spread`. If a spread is stale, missing, or from a different market timestamp than the model prediction, apparent edge can be misleading.

Detection:

- `book_spread` is null
- odds snapshot timestamp is old
- large model edge appears without matching line provenance

Mitigation:

- require line timestamp in serious answers
- prefer `get_model_metrics` for canonical metrics over ad hoc line arithmetic

## Small Samples

NFL weekly data and short NBA windows are noisy. ATS records can swing heavily over a few games.

Detection:

- low graded-game count in ATS notebook/API
- edge buckets have fewer than roughly 20 games

Mitigation:

- include sample size in answers
- avoid "the model is strong/weak" claims from tiny buckets

## Distribution Shift For Hypothetical Matchups

The prediction service should only answer matchups the model supports: same league, valid teams, plausible dates, and no cross-sport hypotheticals.

Detection:

- invalid team names
- teams from different leagues
- dates far outside trained or current season context

Mitigation:

- `predict_matchup` should return a distribution-shift error instead of forcing a prediction
- chatbot should explain the constraint plainly
