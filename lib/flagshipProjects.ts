export type FlagshipProjectLink = {
  id: string
  title: string
  shortTitle: string
  image: string
  caseStudyUrl: string
}

/** Quick-link thumbnails on the homepage hero (3 flagship projects only). */
export const flagshipProjectLinks: FlagshipProjectLink[] = [
  {
    id: 'sports-edge',
    title: 'Sports Edge: Multi-League Sports Modeling',
    shortTitle: 'Sports Edge',
    image: '/images/projects/project3-1.JPG',
    caseStudyUrl: '/projects/sports-edge',
  },
  {
    id: 'nba-hof-predictor',
    title: 'NBA Hall of Fame Predictor',
    shortTitle: 'NBA HOF',
    image: '/images/projects/nba-hof-top-20.png',
    caseStudyUrl: '/projects/nba-hof',
  },
  {
    id: 'llm-advisor',
    title: 'LLM Advisor: Agentic Trading System',
    shortTitle: 'LLM Advisor',
    image: '/images/projects/llm-advisor/spy-feature-importances.png',
    caseStudyUrl: '/projects/llm-advisor',
  },
]
