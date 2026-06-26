# Sports Edge Doc Sync Workflow

`.github/workflows/sync-sports-edge-docs.yml` keeps Sports Edge freshness docs and KPI fallback metrics in sync with upstream dashboard artifacts.

## When it runs

- **repository_dispatch** with type `sports-edge-refresh` (triggered by sports-edge CI after daily/PGA/World Cup refreshes)
- **Daily cron** at 14:00 UTC (safety net, 1 hour after sports-edge daily refresh at 13:00 UTC)
- **Manually** from the Actions tab → "sync-sports-edge-docs" → "Run workflow"

## What it does

1. Runs `npm run sync:sports-edge-docs` (`scripts/sync-sports-edge-docs.mjs`)
2. Fetches upstream JSON from the public sports-edge GitHub repo and optionally Supabase serving freshness
3. Updates:
   - `docs/project-knowledge/sports-edge/sync-state.md` (fully generated)
   - `docs/project-knowledge/evidence-register.md` (marker block only)
   - `public/data/project_metrics_fallback.json` (`sports-edge` block only)
4. Auto-commits to `main` if anything changed
   - Doc changes → commit **without** `[skip ci]` so RAG rebuild runs
   - Fallback-only changes → commit with `[skip ci]`

## Required secrets (optional)

| Secret | Required | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | optional | Enables Supabase serving freshness rows in sync-state.md |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | Same as above |

Upstream GitHub fetches use public raw URLs and need no token.

## Upstream trigger (sports-edge repo)

The sports-edge repo should dispatch after successful refreshes:

```yaml
- name: Notify portfolio doc sync
  if: success()
  env:
    PORTFOLIO_DISPATCH_TOKEN: ${{ secrets.PORTFOLIO_DISPATCH_TOKEN }}
  run: |
    curl -sf -X POST \
      -H "Authorization: Bearer ${PORTFOLIO_DISPATCH_TOKEN}" \
      -H "Accept: application/vnd.github+json" \
      https://api.github.com/repos/dmboynton56/personal-portfolio/dispatches \
      -d "{\"event_type\":\"sports-edge-refresh\",\"client_payload\":{\"source\":\"daily-refresh\",\"run_id\":\"${{ github.run_id }}\"}}"
```

Configure `PORTFOLIO_DISPATCH_TOKEN` in the **sports-edge** repo. For a **fine-grained PAT** on `personal-portfolio`, you need:

- **Contents:** Read and write
- **Metadata:** Read-only (auto-included)

**Actions: Read and write alone is not enough** — that permission does not cover `repository_dispatch` and returns 403.

Classic PAT alternative: **`repo`** scope (or **`public_repo`** if the target were public-only).

## Manual sync

```bash
npm run sync:sports-edge-docs
```
