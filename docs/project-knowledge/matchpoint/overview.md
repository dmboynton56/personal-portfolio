---
project: matchpoint
last_verified: 2026-07-10
role: project_overview
source_repo: /Users/drewboynton/Documents/VSCODE_PROJECTS/matchpoint
---

# MatchPoint - AI job matcher

MatchPoint is a resume-first job search app. A visitor can upload a PDF resume and receive a short preview of ranked roles. A signed-in user can save a resume, set target-role/location/work-mode/pay preferences, get a 10-role ranked match list, browse the full job catalog, mark roles as favorite or applied, and request resume suggestions grounded in the jobs they are matching against.

The project was built during Flatiron School's Accelerated AI Engineering Work-Integrated Program. It is a full-stack product rather than a static demo: React/Vite frontend, FastAPI backend, OpenAI embeddings and structured outputs, Turso for the job corpus, Supabase for auth/user state/storage, Vercel deployments, and a GitHub Actions job ingestion pipeline.

## Live surfaces

- Web app: https://matchpoint-web-gamma.vercel.app
- Public jobs browse page: https://matchpoint-web-gamma.vercel.app/jobs
- Backend API: https://matchpoint-lake.vercel.app
- Portfolio deep dive: `/projects/matchpoint`
- GitHub: https://github.com/dmboynton56/matchpoint

## What users can do

### Anonymous visitors

- Upload a PDF resume from the landing page.
- The backend extracts text with `pypdf`, embeds the resume text with OpenAI `text-embedding-3-small`, retrieves the top 3 vector-similar jobs, and scores those 3 jobs with the LLM scorer.
- Response includes `requires_signup: true`, a resume text preview, and ranked preview jobs. Visitors can inspect the preview but need an account to persist matches, profile preferences, favorites, applied jobs, resume storage, and suggestions.

### Signed-in users

- Upload, view, re-upload, or delete a PDF resume on `/resume`.
- Save match preferences on `/profile`: target role, preferred locations, preferred work modes, minimum base salary, and salary currency.
- Uploading a resume or clicking "Recalculate now" runs the full matcher, persists the resume file to Supabase Storage, stores extracted resume text and a resume embedding on the user's profile, and replaces the user's current `job_matches` rows.
- View ranked matches on `/matches`, including match percentage, three positive match notes, warning notes when material drawbacks exist, and fit chips for location/pay/role.
- Favorite, mark applied, delete, or view matches. Favorite/applied state is stored on `job_matches` and, when `user_saved_jobs` is configured, mirrored into durable saved-job snapshots so favorites/applied jobs can survive current match-list replacement.
- Browse the full Turso job catalog on `/jobs` with keyword, location, experience level, job type, workplace type, pay range, posted-date, relevance/newest sort, and pagination.
- Use a natural-language job search assistant on `/jobs`; it parses a sentence like "senior remote frontend paying $150k+" into structured filters.
- Generate tailored resume suggestions on `/resume`. The suggestions are 2-5 concrete skills/tools/frameworks grounded in top matched job descriptions, with citation quotes, optional "why it matters" copy, and optional learning links.

### Currently limited or hidden UI

- The backend contains a two-step bullet coach: `POST /suggestions/coach/start` identifies weak resume bullets and asks targeted questions, and `POST /suggestions/coach/rewrite` can rewrite one bullet from the user's answers plus a cited job quote.
- In the current frontend, the "Coach me on bullets" button and rewrite inputs are temporarily hidden while a `/coach/rewrite` slowness issue is investigated. The visible resume suggestions UI still works for grounded skill suggestions.

## How matching works

MatchPoint uses a two-stage matcher:

1. Vector retrieval creates a candidate set from the job corpus. The resume text plus saved preferences are embedded with `text-embedding-3-small`. The backend searches a precomputed L2-normalized embedding matrix from the `data-cache` branch. If that cache cannot be loaded, it falls back to scanning Turso job embeddings and computing cosine similarity in Python.
2. LLM scoring evaluates the retrieved jobs. The scorer uses `OPENAI_SCORING_MODEL`, defaulting to `gpt-5.4-nano`, with structured output. It scores each job independently across eight 0-1 fit signals and emits exactly three non-warning match notes plus up to three warning notes.

The authenticated route retrieves 10 vector candidates and returns the top 10 after LLM scoring. The anonymous preview route retrieves and returns 3 jobs.

## Fit dimensions and score weights

The final `match_score` is a weighted sum from `backend/app/services/ranking.py`.

| Dimension | API field | Weight |
|---|---|---:|
| Skills overlap | `skills_fit` | 25% |
| Experience fit | `experience_fit` | 18% |
| Role alignment | `role_fit` | 17% |
| Seniority match | `seniority_fit` | 10% |
| Location fit | `location_fit` | 10% |
| Compensation fit | `pay_fit` | 7.5% |
| Preference fit | `preference_fit` | 7.5% |
| Interview likelihood | `interview_likelihood` | 5% |

The scorer is told not to use vector similarity as the score. Vector similarity is weak context for retrieval; final ranking comes from the structured fit signals.

## Job data and freshness

- Current portfolio metrics snapshot: 5,867 live jobs from 70 Greenhouse boards, generated 2026-07-02T19:50:00Z. Treat this as a dated snapshot, not a permanent live count.
- The ingestion workflow runs daily at 10:00 UTC through `.github/workflows/daily-pipeline.yml`.
- The scraper reads Greenhouse boards through `boards-api.greenhouse.io`, caps each company at 100 jobs, strips HTML with BeautifulSoup, and stores external job IDs, company, title, description, location, posted/updated timestamp, and apply URL.
- Existing jobs have `last_seen_at` refreshed. New jobs get cleaned text, derived browse metadata, a short browse summary, and an OpenAI embedding. Jobs not seen for 7 days are purged.
- The pipeline writes jobs to Turso and publishes a fresh embedding matrix to the `data-cache` branch. Matrix publishing is non-fatal: if it fails, the API still works through the slower Turso scan fallback.

## Data stores

### Turso

Turso owns the job catalog. It stores job rows, OpenAI embedding JSON, browse/search metadata, generated summaries, apply URLs, and `last_seen_at` freshness markers. Turso is also the read source used to hydrate job details for matches.

### Supabase

MatchPoint uses its own Supabase project for:

- Auth and JWT-backed protected routes.
- `profiles`: target role, preferences, extracted `resume_text`, and `resume_embedding`.
- Supabase Storage `resumes` bucket: uploaded PDF at `{user_id}/resume.pdf`.
- `job_matches`: the user's current ranked matches and fit signals.
- `resume_suggestions`: cached suggestion generations keyed by resume text plus top job IDs.
- `user_saved_jobs` when configured: durable favorite/applied snapshots with job and match JSON snapshots.

The old `job_matches.job_id -> jobs.id` Postgres foreign key was intentionally dropped because jobs moved out of Supabase and into Turso. Match rows keep Turso UUID strings and the API hydrates job details from Turso at read time. If a job has been purged from Turso, the matches route skips it and best-effort deletes that orphaned match row for the current user.

## Resume suggestions

Resume suggestions are not generic resume advice. They are generated from the user's current resume and top matches:

- `GET /suggestions/me` returns the latest cached row for the current resume + top-job set, or 404 when no cache exists.
- `POST /suggestions/refresh` uses the stored resume and top 20 current matches as evidence, asks the LLM for 2-5 concrete skill suggestions, validates that every citation quote appears in the cited job description, enriches citations with job title/company/apply URL, persists the result, and prunes old history above 50 rows per user.
- The validator drops unsupported or overly broad suggestions. It prefers concrete tools and frameworks over vague categories like "AI" or "machine learning."

## Notes for assistants

- Do not describe MatchPoint as only a resume matcher; it also has full catalog browsing, natural-language job search filters, profile preferences, favorites/applied tracking, resume storage, and grounded resume suggestions.
- Do not say every match note contains a verbatim citation quote. Current match notes are grounded by structured job facts and job descriptions, but the match-note API stores short note text and warning flags, not quote fields.
- Do not claim user matches automatically refresh on a schedule. The job corpus refreshes daily. User matches recalculate on resume upload or explicit `/matches/recalculate`.
- If asked for current live job count, cite the dated 2026-07-02 portfolio metric snapshot unless a live metrics source is retrieved separately.
- If asked about bullet rewrites, explain that the backend exists but the current frontend hides the coach/rewrite UI while slowness is being investigated.
