# Portfolio Repository Structure

This repository is the public portfolio surface. It should stay focused on
displaying projects, serving recruiter-facing metrics, and answering questions
from curated project documentation. Project pipelines live in their own repos.

## Runtime Stack

- Next.js App Router and TypeScript for the site.
- Tailwind CSS and local UI components for the visual system.
- Supabase for serving metrics and lightweight public data reads.
- BigQuery for Sports Edge warehouse-backed chat questions.
- Vertex/Gemini for scoped portfolio chat synthesis and embeddings.

## Key Directories

```text
app/
  api/
    chat/                    scoped portfolio/project assistant
    sports-edges/            Sports Edge card and ATS serving APIs
    llm-advisor/metrics/     LLM Advisor Supabase telemetry API
    project-metrics/[project] static/fallback project metric API
  projects/                  project deep-dive pages
components/
  chat/                      shared chat surfaces
  sports-edge/               Sports Edge metric cards
  *.tsx                      homepage sections and project-specific displays
docs/
  project-knowledge/         source material for RAG answers
  model-cards/               model summaries for recruiter-facing claims
lib/
  chatbot/                   scopes, BigQuery, Supabase metric tools, retrieval
  freshness.ts               shared API freshness metadata
public/
  data/                      static JSON bundles used by project pages/RAG
  images/                    screenshots and visual assets
scripts/
  build-rag-manifest.mjs     docs manifest generation
  build-rag-embeddings.mjs   Vertex embedding generation
supabase/
  migrations/                serving schema for Sports Edge and LLM Advisor
```

## Data Ownership

- `sports-edge` owns Sports Edge data production: raw updates, feature
  snapshots, model predictions, odds sync, final scores, and Supabase writes.
- `llm-advisor` owns trading telemetry production: premarket artifacts, live
  loop outputs, BigQuery persistence, and EOD Supabase upserts.
- `personal-portfolio` consumes those serving tables. It should not contain
  standalone trading or sports data production jobs.

The legacy standalone ICTML daily-bias workflow was removed from this repo.
ICTML is now represented as part of the LLM Advisor story, and the
`/projects/ictml` route redirects to `/projects/llm-advisor`.

## Documentation Flow

Project chat answers are grounded by files under `docs/`. After changing those
files, rebuild:

```bash
npm run build:rag-manifest
npm run build:rag-embeddings
```

The manifest is committed at `public/data/rag_manifest.json`. The embedding
artifact `public/data/rag_embeddings.json` is generated locally/deploy-side and
ignored because it is large and can be rebuilt from the docs.

## Cleanup Rules

- Keep project pipeline code in the owning repo, not here.
- Keep only public-facing static data needed by the site.
- Do not add local model artifacts, notebooks, or generated raw data to this
  repo.
- Keep README and `docs/project-knowledge/*` aligned with the deployed site,
  Supabase serving tables, and current project workflows.
