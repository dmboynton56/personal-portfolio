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
    image: '/images/projects/sports-edge/dashboard-screenshot.png',
    caseStudyUrl: '/projects/sports-edge',
  },
  {
    id: 'llm-advisor',
    title: 'LLM Advisor: Agentic Trading System',
    shortTitle: 'LLM Advisor',
    image: '/images/projects/llm-advisor/dashboard-screenshot.png',
    caseStudyUrl: '/projects/llm-advisor',
  },
  {
    id: 'matchpoint',
    title: 'MatchPoint: AI Job Matcher',
    shortTitle: 'MatchPoint',
    image: '/images/projects/matchpoint/dashboard-screenshot.png',
    caseStudyUrl: '/projects/matchpoint',
  },
]
