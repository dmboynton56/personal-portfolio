import type { ChatScope, ChatScopeConfig } from './types'

export const CHAT_SCOPES: Record<ChatScope, ChatScopeConfig> = {
  default: {
    label: 'Portfolio',
    allowedTools: ['search_docs'],
    starterPrompts: [
      'What projects are in this portfolio?',
      'What evidence backs these project claims?'
    ],
    docFilters: {},
    systemPrompt: `You are the portfolio project assistant for default (site-wide) chat. Use retrieved documentation.

For inventory and navigation ("what projects", "what's on this site", showcase list): prefer docs/project-knowledge/portfolio-overview.md when it appears in evidence; cite it and summarize flagship deep dives plus additional carousel projects as listed there.

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
  }
}

export const resolveChatScope = (scope?: string | null): ChatScope => {
  if (
    scope === 'sports-edge' ||
    scope === 'llm-advisor' ||
    scope === 'nba-hof' ||
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
