# Drew Boynton's Portfolio Repository

This repository contains the source code for my personal portfolio website. The site serves as a central hub to showcase my projects, skills, and experience in web development.

## Overview

The portfolio is designed to provide a glimpse into my capabilities as a developer, highlighting:

*   **Project Showcase:** Demonstrations of web applications and projects I have built, illustrating my technical skills and problem-solving abilities. I have a specific interest in Data Analysis/Manipulation and Machine Learning Model Implementations
*   **Technical Skills:** Proficiency in modern web technologies, primarily focused on front-end development with frameworks like React and Next.js, along with responsive design principles and UI/UX considerations. I have also worked extensively in Python libraries like NumPy, Pandas, and SciKit.
*   **Design Implementation:** Ability to translate design concepts into functional, aesthetically pleasing, and user-friendly web interfaces.

This project itself is an example of my work, built using Next.js, TypeScript, and Tailwind CSS, demonstrating attention to detail in UI development and modern web practices.

## Sports Edge data plumbing

The Supabase schema + migrations that back the Sports Edge card live in `supabase/migrations/001_sports_edge_schema.sql`. Apply them with `supabase db push --file supabase/migrations/001_sports_edge_schema.sql` and make sure the following env vars are set in your deployment target:

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Sports Edge odds, game, prediction, and final-score writes now run exclusively from the `sports-edge` repository workflows. This portfolio repo is a read-only consumer of the Supabase tables through `GET /api/sports-edges`; it does not expose a Sports Edge writer or cron POST endpoint.

## Sports Edge Chat + RAG MVP

The Sports Edge project page now includes a hybrid chat assistant:

- SQL path: reads Supabase `games` + latest `model_predictions` to answer result-oriented questions.
- Retrieval path: reads markdown docs in `docs/` for methodology, definitions, and risk caveats.
- Hybrid path: combines both for questions like "Week 12 top edges and why."

Core files:

- `app/api/chat/route.ts`
- `components/chat/ChatPanel.tsx`, `components/chat/ProjectChat.tsx`, `components/chat/PortfolioChatWidget.tsx`
- `docs/data-dictionary.md`
- `docs/metric-definitions.md`
- `docs/model-cards/`
- `docs/project-postmortems/`
- `docs/limitations-and-risk.md`
- `docs/faq.md`

Optional LLM generation:

```
OPENAI_API_KEY
OPENAI_CHAT_MODEL
```

If `OPENAI_API_KEY` is not set, `/api/chat` still works in deterministic fallback mode using SQL summaries + retrieved docs.

## Local Gemini + BigQuery Chat Testing

To test `/api/chat` against your Google stack locally:

1. Copy `.env.example` to `.env.local`.
2. Set:
   - `GCP_PROJECT_ID`
   - `BIGQUERY_PROJECT_ID`
   - `BIGQUERY_DATASET`
   - `BIGQUERY_CHAT_VIEW`
3. Provide credentials with one of:
   - `GOOGLE_APPLICATION_CREDENTIALS` (file path), or
   - `GCP_SERVICE_ACCOUNT_JSON`, or
   - `GCP_SERVICE_ACCOUNT_JSON_BASE64`

The route uses BigQuery for numeric stats questions (for example, home ATS counts) and local `/docs` retrieval for document-grounded responses with citations.

## Chatbot RAG

Generate the local doc manifest:

```bash
npm run build:rag-manifest
```

Generate embeddings with Vertex AI `text-embedding-004`:

```bash
npm run build:rag-embeddings
```

The embedding script writes `public/data/rag_embeddings.json`. Runtime retrieval uses cosine similarity when that file exists and falls back to token overlap if the file is missing or the embedding request fails.

**After you add or edit files under `docs/`** (for example [`docs/project-knowledge/portfolio-overview.md`](docs/project-knowledge/portfolio-overview.md)), re-run **`build:rag-manifest`** and **`build:rag-embeddings`** so default-scope chat and project-scoped RAG both see the new chunks. The default portfolio chat scope includes all of `docs/project-knowledge/`, `docs/model-cards/`, `docs/project-postmortems/`, and the shared root `.txt` references in `docs/`.

## Contact

If you'd like to discuss potential opportunities or collaborations, feel free to reach out:

*   **Email:** dmboynton6@gmail.com
*   **LinkedIn:** [Drew Boynton](https://www.linkedin.com/in/drew-boynton-1bba16180/)
*   **GitHub:** [dmboynton56](https://github.com/dmboynton56)
