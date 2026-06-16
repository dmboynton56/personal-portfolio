export type NflGameEdge = {
  gameId: string
  homeTeam: string
  awayTeam: string
  kickoffUtc: string
  bookSpread: number | null
  modelSpread: number
  homeWinProb: number
  modelVersion: string
  predictionUpdated: string
  note: string
  actualHomeScore?: number | null
  actualAwayScore?: number | null
  spreadHit?: boolean | null
}

export type NbaGameEdge = {
  gameId: string
  homeTeam: string
  awayTeam: string
  tipoffUtc: string
  bookSpread: number | null
  modelSpread: number
  homeWinProb: number
  modelVersion: string
  predictionUpdated: string
  note: string
  actualHomeScore?: number | null
  actualAwayScore?: number | null
  spreadHit?: boolean | null
}

export type MlbGameEdge = {
  gameId: string
  homeTeam: string
  awayTeam: string
  firstPitchUtc: string
  homeWinProb: number
  modelVersion: string
  predictionUpdated: string
  note: string
  homeProbablePitcher?: string | null
  awayProbablePitcher?: string | null
  actualHomeScore?: number | null
  actualAwayScore?: number | null
  winnerHit?: boolean | null
}

export type WorldCupMatchEdge = {
  matchId: string
  stage: string
  groupName?: string | null
  kickoffUtc?: string | null
  homeTeam: string
  awayTeam: string
  homeWinProb: number
  drawProb: number
  awayWinProb: number
  homeKnockoutWinProb?: number | null
  awayKnockoutWinProb?: number | null
  projectedHomeGoals?: number | null
  projectedAwayGoals?: number | null
  modelVersion: string
  predictionUpdated: string
  status?: string | null
  actualHomeScore?: number | null
  actualAwayScore?: number | null
}

export type WorldCupTeamProbability = {
  team: string
  groupName?: string | null
  rating?: number | null
  roundOf32Prob: number
  roundOf16Prob: number
  quarterfinalProb: number
  semifinalProb: number
  finalProb: number
  championProb: number
  groupRankProbs?: {
    rank1?: number | null
    rank2?: number | null
    rank3?: number | null
    rank4?: number | null
  }
}

export type WorldCupGroupRankRow = {
  team: string
  rating?: number | null
  rank1: number
  rank2: number
  rank3: number
  rank4: number
}

export type SportsEdgePayload = {
  nfl: {
    season: number
    week: number
    label: string
    updatedAt: string
    games: NflGameEdge[]
    availableWeeks: number[]
  }
  nba: {
    season: number
    date: string
    label: string
    updatedAt: string
    games: NbaGameEdge[]
    availableDates: string[]
  }
  mlb: {
    season: number
    date: string
    label: string
    updatedAt: string
    games: MlbGameEdge[]
    availableDates: string[]
  }
  worldCup: {
    season: number
    label: string
    updatedAt: string
    simulations: number
    bracketSource: string
    matches: WorldCupMatchEdge[]
    teamProbabilities: WorldCupTeamProbability[]
    groupRankProbabilities: Record<string, WorldCupGroupRankRow[]>
  }
}

export const sportsEdgeMockData: SportsEdgePayload = {
  nfl: {
    season: 2024,
    week: 11,
    label: 'Week 11 outlook',
    updatedAt: '2024-11-12T15:30:00Z',
    availableWeeks: [11],
    games: [
      {
        gameId: '2024-W11-BUF-MIA',
        homeTeam: 'Bills',
        awayTeam: 'Dolphins',
        kickoffUtc: '2024-11-17T18:00:00Z',
        bookSpread: -4.5,
        modelSpread: -2.1,
        homeWinProb: 0.58,
        modelVersion: 'nfl-v2.3.4',
        predictionUpdated: '2024-11-12T14:10:00Z',
        note: 'Value on Miami if number stays above a field goal.'
      },
      {
        gameId: '2024-W11-HOU-BAL',
        homeTeam: 'Ravens',
        awayTeam: 'Texans',
        kickoffUtc: '2024-11-17T18:00:00Z',
        bookSpread: -6.5,
        modelSpread: -8.1,
        homeWinProb: 0.72,
        modelVersion: 'nfl-v2.3.4',
        predictionUpdated: '2024-11-12T13:40:00Z',
        note: 'Baltimore power-rated 2.5 pts above market.'
      },
      {
        gameId: '2024-W11-CIN-PIT',
        homeTeam: 'Steelers',
        awayTeam: 'Bengals',
        kickoffUtc: '2024-11-17T21:25:00Z',
        bookSpread: -2.5,
        modelSpread: -0.9,
        homeWinProb: 0.55,
        modelVersion: 'nfl-v2.3.4',
        predictionUpdated: '2024-11-12T12:55:00Z',
        note: 'Market heavy on PIT defense, model leans Bengals + points.'
      },
      {
        gameId: '2024-W11-SF-SEA',
        homeTeam: 'Seahawks',
        awayTeam: '49ers',
        kickoffUtc: '2024-11-17T21:25:00Z',
        bookSpread: 3.0,
        modelSpread: 5.2,
        homeWinProb: 0.41,
        modelVersion: 'nfl-v2.3.4',
        predictionUpdated: '2024-11-12T16:02:00Z',
        note: 'Model makes SF -5, so anything under -4 is playable.'
      },
      {
        gameId: '2024-W11-DAL-PHI',
        homeTeam: 'Eagles',
        awayTeam: 'Cowboys',
        kickoffUtc: '2024-11-18T01:20:00Z',
        bookSpread: -1.5,
        modelSpread: -0.2,
        homeWinProb: 0.51,
        modelVersion: 'nfl-v2.3.4',
        predictionUpdated: '2024-11-12T15:15:00Z',
        note: 'Toss-up. Monitor injury reports before firing.'
      },
      {
        gameId: '2024-W11-NO-ATL',
        homeTeam: 'Falcons',
        awayTeam: 'Saints',
        kickoffUtc: '2024-11-17T18:00:00Z',
        bookSpread: -3.0,
        modelSpread: -1.1,
        homeWinProb: 0.57,
        modelVersion: 'nfl-v2.3.4',
        predictionUpdated: '2024-11-12T11:30:00Z',
        note: 'Lean Saints +3 if you can grab juice.'
      },
      {
        gameId: '2024-W11-KC-LV',
        homeTeam: 'Raiders',
        awayTeam: 'Chiefs',
        kickoffUtc: '2024-11-17T21:05:00Z',
        bookSpread: 7.5,
        modelSpread: 10.9,
        homeWinProb: 0.23,
        modelVersion: 'nfl-v2.3.4',
        predictionUpdated: '2024-11-12T09:50:00Z',
        note: 'Chiefs off a bye gives added edge to the road favorite.'
      },
      {
        gameId: '2024-W11-DET-CHI',
        homeTeam: 'Bears',
        awayTeam: 'Lions',
        kickoffUtc: '2024-11-17T18:00:00Z',
        bookSpread: 4.0,
        modelSpread: 1.9,
        homeWinProb: 0.48,
        modelVersion: 'nfl-v2.3.4',
        predictionUpdated: '2024-11-12T12:15:00Z',
        note: 'Model expects cold weather to slow Detroit offense.'
      }
    ]
  },
  nba: {
    season: 2024,
    date: '2024-11-26',
    label: 'Nov 26, 2024',
    updatedAt: '2024-11-12T15:30:00Z',
    availableDates: ['2024-11-26'],
    games: []
  },
  mlb: {
    season: 2026,
    date: '2026-05-24',
    label: 'May 24, 2026',
    updatedAt: '2026-05-24T15:30:00Z',
    availableDates: [],
    games: []
  },
  worldCup: {
    season: 2026,
    label: '2026 tournament forecast',
    updatedAt: '2026-06-12T15:30:00Z',
    simulations: 0,
    bracketSource: 'awaiting-world-cup-sync',
    matches: [],
    teamProbabilities: [],
    groupRankProbabilities: {}
  }
}

export const calculateEdge = (game: NflGameEdge | NbaGameEdge) =>
  game.bookSpread == null
    ? null
    : Number((game.modelSpread - game.bookSpread).toFixed(1))

export const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`
