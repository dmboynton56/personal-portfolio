---
project: cross-project
last_verified: 2026-04-07
source_paths:
  - /home/dmboynton/projects/personal-portfolio/docs/project-knowledge/evidence-register.md
  - /home/dmboynton/projects/llm-advisor
  - /home/dmboynton/projects/sports-edge
---

# Monthly Documentation Refresh Checklist

## Cadence

Run this checklist once per month, or immediately after major pipeline/config changes.

## Step 1: Refresh evidence inputs

- Re-read `llm-advisor` runtime config (`src/core/config.py`) and threshold config (`config/thresholds.py`).
- Re-read `sports-edge` workflow and latest output artifacts (daily workflow + meta/dashboard JSON files).
- Record any changed values in `docs/project-knowledge/evidence-register.md`.

## Step 2: Validate deep-dive claims

- Check `app/projects/llm-advisor/page.tsx` against evidence register rows.
- Check `app/projects/sports-edge/page.tsx` against evidence register rows.
- Remove or relabel any claim that cannot be tied to a source path and freshness date.

## Step 3: Apply stale-data policy

- If a metric artifact is older than 30 days, mark it stale in page/doc copy.
- If a number comes only from planning docs, label as benchmark/planning.
- If source conflicts exist, prefer active runtime code paths over legacy/static constants.

## Step 4: Refresh chatbot-grounding docs

- Update changed sections in:
  - `docs/project-knowledge/llm-advisor/*.md`
  - `docs/project-knowledge/sports-edge/*.md`
  - `docs/project-knowledge/question-index.md`
- Keep frontmatter fields (`last_verified`, `source_paths`) current.
- **Embedding rebuild is automated.** A GitHub Action (`.github/workflows/rebuild-rag-embeddings.yml`) re-indexes `public/data/rag_embeddings.json` on every push to `main` that touches `docs/**` or the RAG scripts, plus a weekly Sunday cron. No manual `npm run build:rag-embeddings` step is needed after doc edits land on `main`. See `.github/workflows/README.md` for troubleshooting.

## Step 5: KPI source consistency checks

- Confirm `project_metrics_fallback.json` values still match known artifacts.
- Confirm API routes return correct source labels and generated timestamps.
- Confirm benchmark-vs-live wording remains explicit for both projects.

## Step 6: Final verification gate

- Every published number must have: metric value, source path, freshness date, and caveat when needed.
- No unsupported superlatives (best, strongest, highest accuracy) without direct evidence rows.
- Update `last_verified` date in any edited knowledge docs.
