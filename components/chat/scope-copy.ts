import type { ChatScope } from '@/lib/chatbot/types'

export type ScopeUICopy = {
  title: string
  subtitle: string
  welcomeMessage: string
  placeholder: string
}

const COPY: Record<ChatScope, ScopeUICopy> = {
  default: {
    title: 'Portfolio Chat',
    subtitle:
      'Ask about projects, evidence, and how the work on this site is framed. Answers use portfolio documentation.',
    welcomeMessage:
      'Ask who I am, what is in this portfolio, how projects connect, or what evidence backs any claim. I pull from the site docs.',
    placeholder: 'Ask about me, projects, evidence, or methodology',
  },
  'sports-edge': {
    title: 'Sports Edge Chat',
    subtitle:
      'Hybrid assistant: SQL summaries for results + documentation retrieval for methodology.',
    welcomeMessage:
      'Ask about Sports Edge results, methodology, or risk. I can combine live SQL stats with portfolio documentation.',
    placeholder: 'Ask about top edges, feature logic, metrics, or risk assumptions',
  },
  'llm-advisor': {
    title: 'LLM Advisor Chat',
    subtitle:
      'Assistant: project docs plus live telemetry for run health, risk controls, and trading loop behavior.',
    welcomeMessage:
      'Ask about the LLM Advisor workflow, telemetry, risk controls, or how signals map to actions. I use docs and Supabase metrics.',
    placeholder: 'Ask about runs, bias, risk, or latest aggregates',
  },
  'nba-hof': {
    title: 'NBA Hall of Fame Chat',
    subtitle: 'Documentation-backed answers on model design, features, and limitations.',
    welcomeMessage:
      'Ask how the Hall of Fame model works, which features matter, or what the limitations are. I answer from project docs.',
    placeholder: 'Ask about the model, features, or limitations',
  },
}

export function getScopeUICopy(scope: ChatScope): ScopeUICopy {
  return COPY[scope]
}
