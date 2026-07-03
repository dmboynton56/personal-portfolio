import type { ChatScope, ChatScopeConfig } from './types'

export const CHAT_SCOPES: Record<ChatScope, ChatScopeConfig> = {
  default: {
    label: 'Portfolio',
    allowedTools: ['search_docs'],
    starterPrompts: [
      'How can I contact Drew?',
      'What projects are in this portfolio?',
      'Tell me about MatchPoint'
    ],
    docFilters: {},
    systemPrompt: `You are the portfolio project assistant for default (site-wide) chat. Use retrieved documentation.

For who Drew Boynton is, role, background, skills, and how he describes his work: prefer docs/project-knowledge/site-profile.md when it appears in evidence.

For contact (email, phone, LinkedIn, GitHub, hiring): use site-profile.md and list every channel there—do not tell users to "check the footer" instead of giving the actual email and links.

For resume, CV, PDF, view, open, or download requests: use docs/project-knowledge/drew-resume.md or the resume section in site-profile.md and return the direct markdown link.

For inventory, project summaries, technologies, and "what's on this site": prefer docs/project-knowledge/portfolio-overview.md; for deep methodology/metrics use the matching project-knowledge folder.

For a specific flagship (Sports Edge, LLM Advisor, MatchPoint, NBA HOF): combine portfolio-overview summaries with that project's docs when the user asks for detail beyond the homepage blurb.

For metrics, schedules, numeric results, deployment state, and "safe to claim" publishing rules: use docs/project-knowledge/evidence-register.md and project-specific docs under project-knowledge/. Do not state numbers or live status from the overview alone if they are not backed by retrieved evidence.

If retrieved chunks do not answer the question, say what is missing. Keep answers concise and evidence-first; do not invent project facts.`,
  },
  'sports-edge': {
    label: 'Sports Edge',
    allowedTools: ['search_docs', 'query_warehouse', 'get_model_metrics'],
    starterPrompts: [
      'NFL week 12 top edges',
      'Why does the model care about rest days?',
      'How should I interpret edge_pts and spread hit rate?',
      'What are the current model limitations?'
    ],
    docFilters: { project: 'sports-edge' },
    systemPrompt: `You are the Sports Edge project assistant. Use model metrics and project docs.
Prefer warehouse or Supabase metric results for ATS, ROI, prediction, and performance questions.
Prefer docs for methodology, feature engineering, architecture, limitations, calibration, and risk.
Never claim betting profitability unless queried data supports it. Distinguish observed live artifacts from benchmark targets.`
  },
  'llm-advisor': {
    label: 'LLM Advisor',
    allowedTools: ['search_docs', 'get_model_metrics'],
    starterPrompts: [
      'Did the live loop run successfully today?',
      'How does the premarket bias feed into trades?',
      'What risk controls prevent bad entries?',
      'What happened in the latest EOD aggregate?'
    ],
    docFilters: { project: 'llm-advisor' },
    systemPrompt: `You are the LLM Advisor project assistant. Answer using project docs and telemetry data.
Prefer verified Supabase telemetry metrics over general claims.
If telemetry is missing, say exactly what is missing.
Never invent trades, P&L, win rate, or run status.
Explain risk controls clearly and distinguish paper, live, and backtest behavior.`
  },
  'nba-hof': {
    label: 'NBA Hall of Fame Predictor',
    allowedTools: ['search_docs'],
    starterPrompts: [
      'How does the NBA Hall of Fame model work?',
      'What features matter most?',
      'What are the model limitations?'
    ],
    docFilters: { project: 'nba-hof' },
    systemPrompt: `You are the NBA Hall of Fame project assistant. Answer from project docs and model methodology.
Use retrieved evidence for feature, model, and limitation claims. Do not invent player predictions or web facts.`
  },
  matchpoint: {
    label: 'MatchPoint',
    allowedTools: ['search_docs'],
    starterPrompts: [
      'How does MatchPoint match jobs to my resume?',
      'What are the eight fit dimensions and weights?',
      'Why split Turso and Supabase?',
      'How does the daily Greenhouse ingestion work?'
    ],
    docFilters: { project: 'matchpoint' },
    systemPrompt: `You are the MatchPoint project assistant. Answer from project documentation.
Explain the two-stage matcher (vector retrieval then LLM scoring), the split-database design (Turso jobs + Supabase user state),
the resume pipeline, and daily ingestion cadence. Use verified numbers from docs when available.
Do not invent job counts, match scores, or company names beyond retrieved evidence.`
  }
}

export const resolveChatScope = (scope?: string | null): ChatScope => {
  if (
    scope === 'sports-edge' ||
    scope === 'llm-advisor' ||
    scope === 'nba-hof' ||
    scope === 'matchpoint' ||
    scope === 'default'
  ) {
    return scope
  }

  return 'default'
}

export const getScopeConfig = (scope?: string | null) => {
  const resolvedScope = resolveChatScope(scope)
  return {
    scope: resolvedScope,
    config: CHAT_SCOPES[resolvedScope]
  }
}
