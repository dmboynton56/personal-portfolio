export type NflTeamMeta = {
  code: string
  city: string
  name: string
  shortName: string
  aliases?: string[]
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

export const NFL_TEAMS: NflTeamMeta[] = [
  {
    code: 'ARI',
    city: 'Arizona',
    name: 'Cardinals',
    shortName: 'Cardinals',
    aliases: ['Arizona Cardinals', 'Cardinals', 'ARZ']
  },
  {
    code: 'ATL',
    city: 'Atlanta',
    name: 'Falcons',
    shortName: 'Falcons',
    aliases: ['Atlanta Falcons']
  },
  {
    code: 'BAL',
    city: 'Baltimore',
    name: 'Ravens',
    shortName: 'Ravens',
    aliases: ['Baltimore Ravens']
  },
  {
    code: 'BUF',
    city: 'Buffalo',
    name: 'Bills',
    shortName: 'Bills',
    aliases: ['Buffalo Bills']
  },
  {
    code: 'CAR',
    city: 'Carolina',
    name: 'Panthers',
    shortName: 'Panthers',
    aliases: ['Carolina Panthers']
  },
  {
    code: 'CHI',
    city: 'Chicago',
    name: 'Bears',
    shortName: 'Bears',
    aliases: ['Chicago Bears']
  },
  {
    code: 'CIN',
    city: 'Cincinnati',
    name: 'Bengals',
    shortName: 'Bengals',
    aliases: ['Cincinnati Bengals']
  },
  {
    code: 'CLE',
    city: 'Cleveland',
    name: 'Browns',
    shortName: 'Browns',
    aliases: ['Cleveland Browns']
  },
  {
    code: 'DAL',
    city: 'Dallas',
    name: 'Cowboys',
    shortName: 'Cowboys',
    aliases: ['Dallas Cowboys']
  },
  {
    code: 'DEN',
    city: 'Denver',
    name: 'Broncos',
    shortName: 'Broncos',
    aliases: ['Denver Broncos']
  },
  {
    code: 'DET',
    city: 'Detroit',
    name: 'Lions',
    shortName: 'Lions',
    aliases: ['Detroit Lions']
  },
  {
    code: 'GB',
    city: 'Green Bay',
    name: 'Packers',
    shortName: 'Packers',
    aliases: ['Green Bay Packers']
  },
  {
    code: 'HOU',
    city: 'Houston',
    name: 'Texans',
    shortName: 'Texans',
    aliases: ['Houston Texans']
  },
  {
    code: 'IND',
    city: 'Indianapolis',
    name: 'Colts',
    shortName: 'Colts',
    aliases: ['Indianapolis Colts']
  },
  {
    code: 'JAX',
    city: 'Jacksonville',
    name: 'Jaguars',
    shortName: 'Jaguars',
    aliases: ['Jacksonville Jaguars', 'Jags']
  },
  {
    code: 'KC',
    city: 'Kansas City',
    name: 'Chiefs',
    shortName: 'Chiefs',
    aliases: ['Kansas City Chiefs', 'KC Chiefs']
  },
  {
    code: 'LAC',
    city: 'Los Angeles',
    name: 'Chargers',
    shortName: 'Chargers',
    aliases: ['Los Angeles Chargers', 'LA Chargers']
  },
  {
    code: 'LAR',
    city: 'Los Angeles',
    name: 'Rams',
    shortName: 'Rams',
    aliases: ['Los Angeles Rams', 'LA Rams']
  },
  {
    code: 'LV',
    city: 'Las Vegas',
    name: 'Raiders',
    shortName: 'Raiders',
    aliases: ['Las Vegas Raiders', 'Oakland Raiders', 'LA Raiders']
  },
  {
    code: 'MIA',
    city: 'Miami',
    name: 'Dolphins',
    shortName: 'Dolphins',
    aliases: ['Miami Dolphins']
  },
  {
    code: 'MIN',
    city: 'Minnesota',
    name: 'Vikings',
    shortName: 'Vikings',
    aliases: ['Minnesota Vikings']
  },
  {
    code: 'NE',
    city: 'New England',
    name: 'Patriots',
    shortName: 'Patriots',
    aliases: ['New England Patriots', 'NE Patriots']
  },
  {
    code: 'NO',
    city: 'New Orleans',
    name: 'Saints',
    shortName: 'Saints',
    aliases: ['New Orleans Saints']
  },
  {
    code: 'NYG',
    city: 'New York',
    name: 'Giants',
    shortName: 'Giants',
    aliases: ['New York Giants', 'NY Giants']
  },
  {
    code: 'NYJ',
    city: 'New York',
    name: 'Jets',
    shortName: 'Jets',
    aliases: ['New York Jets', 'NY Jets']
  },
  {
    code: 'PHI',
    city: 'Philadelphia',
    name: 'Eagles',
    shortName: 'Eagles',
    aliases: ['Philadelphia Eagles']
  },
  {
    code: 'PIT',
    city: 'Pittsburgh',
    name: 'Steelers',
    shortName: 'Steelers',
    aliases: ['Pittsburgh Steelers']
  },
  {
    code: 'SEA',
    city: 'Seattle',
    name: 'Seahawks',
    shortName: 'Seahawks',
    aliases: ['Seattle Seahawks']
  },
  {
    code: 'SF',
    city: 'San Francisco',
    name: '49ers',
    shortName: '49ers',
    aliases: ['San Francisco 49ers', 'SF 49ers', 'Niners']
  },
  {
    code: 'TB',
    city: 'Tampa Bay',
    name: 'Buccaneers',
    shortName: 'Bucs',
    aliases: ['Tampa Bay Buccaneers', 'Buccaneers']
  },
  {
    code: 'TEN',
    city: 'Tennessee',
    name: 'Titans',
    shortName: 'Titans',
    aliases: ['Tennessee Titans']
  },
  {
    code: 'WAS',
    city: 'Washington',
    name: 'Commanders',
    shortName: 'Commanders',
    aliases: ['Washington Commanders', 'Washington Football Team', 'Redskins']
  }
]

const CODE_LOOKUP = new Map<string, NflTeamMeta>()
const NAME_LOOKUP = new Map<string, NflTeamMeta>()

for (const team of NFL_TEAMS) {
  CODE_LOOKUP.set(team.code, team)
  const fullName = `${team.city} ${team.name}`
  const keys = new Set<string>([
    team.code,
    team.city,
    team.name,
    team.shortName,
    fullName,
    ...(team.aliases ?? [])
  ])
  keys.forEach((key) => NAME_LOOKUP.set(normalize(key), team))
}

export const getTeamMeta = (value?: string | null) => {
  if (!value) return null
  const code = value.toUpperCase()
  return CODE_LOOKUP.get(code) ?? NAME_LOOKUP.get(normalize(value)) ?? null
}

export const getTeamCodeFromAlias = (value?: string | null) =>
  getTeamMeta(value)?.code ?? null

export const getTeamShortName = (value?: string | null) =>
  getTeamMeta(value)?.shortName ?? value ?? ''

export const normalizeTeamKey = (home: string, away: string) =>
  `${(getTeamCodeFromAlias(away) ?? away ?? '').toUpperCase()}_${(getTeamCodeFromAlias(
    home
  ) ?? home ?? '')
    .toUpperCase()}`

export const listTeamAliases = () => Array.from(NAME_LOOKUP.keys())
