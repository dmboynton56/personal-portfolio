# Changelog

All notable changes to this site will be documented in this file.

The format is roughly based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New "My Personal Portfolio Website" case study page at `/projects/personal-portfolio`, treating the site itself as a documented system
- Changelog parser script (`scripts/build-changelog.mjs`) that converts this file to a static JSON for the changelog section
- Live metrics entry for the personal-portfolio project in `project_metrics_fallback.json`

## [2026-06-05] - Gemini grounding fallback

### Changed
- Chatbot now falls back to a "I don't know" response when the RAG retrieval confidence drops below 0.7, instead of letting Gemini improvise

## [2026-06-01] - Vertex AI migration

### Changed
- Chatbot generation moved from raw Gemini API calls to a Vertex AI endpoint on the same GCP project, unifying auth and quotas

## [2026-05-28] - Page weight reduction

### Changed
- Lazy-loaded the WorkSection carousel; main bundle dropped ~38% on the home route

## [2026-05-20] - BigQuery view for project metrics

### Added
- `project_metrics_v1` BigQuery view consolidates per-project KPIs into a single source-of-truth query

## [2026-05-12] - RAG index v2

### Changed
- Switched embedding model to a Vertex AI text-embedding model; re-indexed all project case studies and READMEs

## [2026-04-30] - Supabase project_metrics table

### Added
- New `project_metrics` Supabase table with a typed `useProjectMetrics(id)` hook on the client

## [2026-04-07] - Sports Edge live card

### Added
- Sports Edge live card on the home page, reading from the upstream repo's published JSON snapshot
- Case study page at `/projects/sports-edge` documenting the pipeline

## [2026-03-22] - Chatbot MVP

### Added
- Initial Gemini-backed chatbot with portfolio-doc RAG, available site-wide and on flagship project pages

## [2026-03-10] - Static export baseline

### Changed
- Adopted `output: 'export'` for the public surface; data-backed routes use ISR with a 5-minute revalidation window
