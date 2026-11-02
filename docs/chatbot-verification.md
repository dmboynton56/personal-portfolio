# Chatbot verification — 2026-11-02

Production checked: https://www.drewboynton.com, deployment
`dpl_9a1ErgeUXFTaBUJak2i3B28w4f16`, commit `9431ffc7ffb18cdf7c22cfd0a3d98d462bfa61b5`.

## Runtime and credentials

- Live responses report `gemini-2.5-flash-lite`; the server uses Google Vertex AI with OAuth service-account authentication, independently of llm-advisor OpenAI billing.
- Vercel production has `GEMINI_MODEL_ID`, `GCP_PROJECT_ID`, `GCP_LOCATION`, `BIGQUERY_PROJECT_ID`, and `GCP_SERVICE_ACCOUNT_JSON` configured. Sensitive values are not readable through the connector. BigQuery error logs identify project `learned-pier-478122-p7`. The exact Google region could not be independently read; `us-central1` is the code default only.
- Generation and Supabase reads succeeded. No billing or credential failure was observed. No keys were copied or changed. Local Google ADC is unavailable, so local external-Google checks use mocks.
- Production-only Google project/model/location variables are absent from preview scope; a preview may use the source-summary fallback. A fallback response does not prove live Gemini connectivity.
- The UI posts JSON and receives a complete JSON answer with citations, intent, scope, and model. This implementation does not stream responses or request model-generated structured JSON.

## Production evidence and repairs

- Homepage widget: submitted a contact question and observed a rendered answer with contact links and documentation citations.
- “Tell me about MatchPoint” incorrectly claimed documentation was unavailable. A broad “tell me about” profile rule displaced project documents. Narrowed that rule, boosted named project sources, and prioritized lexical results for named-project queries.
- LLM Advisor scope: a 30-day trade-count question returned a Supabase-backed answer and telemetry citation. This confirms the read path, not upstream trade accounting or equivalence to brokerage performance.
- Sports Edge ATS scope: returned an explicit no-data result for inferred season 2026. This does not prove complete sports data coverage.
- Sports Edge warehouse scope: an average-home-score question generated SQL against nonexistent `raw_nba_game_logs.home_score`. Vercel runtime-error groups confirmed `Unrecognized name: home_score`. Added schema guidance, dry-run validation, one repair attempt for invalid SQL only, and query time/scan limits. Execution failures now return a deterministic unavailable response rather than a claim of zero rows.
- Malformed input (`message: 12`) returned HTTP 500 and an internal exception. Added HTTP 400 validation for JSON, message/history types and size, and generic unexpected-error responses.
- Explicitly included docs and embeddings in Next.js function traces, bounded Google fetch times, reduced external-error logging, and labeled fallback source summaries when synthesis is unavailable.

## Checks and remaining deployment work

`npm run test:chatbot` covers document retrieval with mocked embeddings and lexical fallback, named project ranking, scope filtering, SQL repair, permission failures without retries, malformed requests, and failure/fallback answers. `npm run build` includes TypeScript validation; lint reports existing unrelated warnings.

Merge/deploy the PR, then repeat the production MatchPoint and warehouse probes. Local mocks validate recovery logic but cannot prove corrected warehouse SQL succeeds with production Google credentials. General runtime-log queries returned no records; runtime-error aggregation returned the concrete BigQuery failure. The local Vercel CLI token is invalid; connected Vercel tools remain usable.
