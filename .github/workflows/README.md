# RAG Embedding Rebuild Workflow

`.github/workflows/rebuild-rag-embeddings.yml` keeps `public/data/rag_embeddings.json` and `public/data/rag_manifest.json` in sync with the docs corpus.

## When it runs

- **On push to main** when any of the following change: `docs/**`, `scripts/build-rag-*.mjs`, or the workflow file itself
- **Weekly** (Sunday 06:00 UTC) as a safety net
- **Manually** from the Actions tab → "rebuild-rag-embeddings" → "Run workflow"

## What it does

1. Checks out the repo and installs dependencies (`npm ci`)
2. Runs `npm run build:rag-manifest` to regenerate `public/data/rag_manifest.json`
3. Runs `npm run build:rag-embeddings` to call Vertex AI and regenerate `public/data/rag_embeddings.json`
4. If either output file changed, commits both with `[skip ci]` and pushes back to main

## Required secrets

Configure these in **Settings → Secrets and variables → Actions**:

| Secret | Required | Notes |
| --- | --- | --- |
| `GCP_SERVICE_ACCOUNT_JSON` | yes (recommended) | Raw service account JSON string. Easier to paste correctly than base64. The service account needs `aiplatform.endpoints.predict` on the project. |
| `GCP_SERVICE_ACCOUNT_JSON_BASE64` | optional | Base64-encoded service account JSON. Used as a fallback if the raw JSON secret is not set. |
| `GCP_PROJECT_ID` | yes | Your Google Cloud project ID. |
| `VERTEX_AI_PROJECT` | recommended | Usually the same as `GCP_PROJECT_ID`. |
| `VERTEX_AI_LOCATION` | optional | Defaults to `us-central1`. |
| `VERTEX_AI_EMBEDDING_MODEL` | optional | Defaults to `text-embedding-004`. |
| `GCP_SERVICE_ACCOUNT_JSON` | optional | Raw JSON string fallback if base64 is unavailable. |

If neither auth secret is set, the embedding step fails with a clear error pointing at the script.

## How to provide a service account key

Two options, in order of preference:

**Option 1: Paste the raw JSON (recommended).** Open the service account `.json` file in a text editor, select all, copy, and paste into the `GCP_SERVICE_ACCOUNT_JSON` secret. The file should start with `{"type": "service_account",` and end with `}`. No encoding required, fewer ways to get it wrong.

**Option 2: Base64-encode the JSON (fallback).** If the raw form is unavailable:

```bash
base64 -i path/to/service-account.json | tr -d '\n' | pbcopy
```

Verify the decode is intact before pasting:

```bash
pbpaste | base64 -d | head -c 20
```

You should see `{"type": "service_account",` or similar. If you see binary garbage or the output is truncated, the original file wasn't a JSON credentials file. Then paste into the `GCP_SERVICE_ACCOUNT_JSON_BASE64` repo secret.

## Concurrency

The workflow uses a concurrency group so only one rebuild runs at a time. New pushes during a running rebuild wait their turn rather than cancelling, to avoid burning Vertex API quota on thrash.

## Debugging a failed run

1. Open the failed run in the Actions tab
2. Expand the failing step
3. The most common failures:
   - **Auth error** → check that `GCP_SERVICE_ACCOUNT_JSON_BASE64` is set and decodes to a valid service account JSON
   - **Vertex quota exceeded** → check the project's `aiplatform.googleapis.com` quota in Cloud Console
   - **No chunks found** → check that the `docs/**` paths contain `.md` or `.txt` files
   - **Push rejected** → check that the `github-actions[bot]` user (or the workflow's `GITHUB_TOKEN`) has write access to main; branch protection rules may need updating

## Manual rebuild

If you need to force a rebuild (e.g., after upgrading the embedding model), use the Actions tab → "rebuild-rag-embeddings" → "Run workflow". This bypasses the path filter and always runs.
