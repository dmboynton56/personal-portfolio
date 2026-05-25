export type MlbTeamMeta = {
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

export const MLB_TEAMS: MlbTeamMeta[] = [
  { code: 'ARI', city: 'Arizona', name: 'Diamondbacks', shortName: 'D-backs', aliases: ['D-backs', 'Diamondbacks'] },
  { code: 'ATL', city: 'Atlanta', name: 'Braves', shortName: 'Braves' },
  { code: 'BAL', city: 'Baltimore', name: 'Orioles', shortName: 'Orioles' },
  { code: 'BOS', city: 'Boston', name: 'Red Sox', shortName: 'Red Sox' },
  { code: 'CHC', city: 'Chicago', name: 'Cubs', shortName: 'Cubs' },
  { code: 'CHW', city: 'Chicago', name: 'White Sox', shortName: 'White Sox', aliases: ['CWS', 'White Sox'] },
  { code: 'CIN', city: 'Cincinnati', name: 'Reds', shortName: 'Reds' },
  { code: 'CLE', city: 'Cleveland', name: 'Guardians', shortName: 'Guardians', aliases: ['Indians'] },
  { code: 'COL', city: 'Colorado', name: 'Rockies', shortName: 'Rockies' },
  { code: 'DET', city: 'Detroit', name: 'Tigers', shortName: 'Tigers' },
  { code: 'HOU', city: 'Houston', name: 'Astros', shortName: 'Astros' },
  { code: 'KAN', city: 'Kansas City', name: 'Royals', shortName: 'Royals', aliases: ['KC', 'KCR', 'Kansas City Royals'] },
  { code: 'LAA', city: 'Los Angeles', name: 'Angels', shortName: 'Angels', aliases: ['LA Angels', 'Los Angeles Angels'] },
  { code: 'LAD', city: 'Los Angeles', name: 'Dodgers', shortName: 'Dodgers', aliases: ['LA Dodgers'] },
  { code: 'MIA', city: 'Miami', name: 'Marlins', shortName: 'Marlins' },
  { code: 'MIL', city: 'Milwaukee', name: 'Brewers', shortName: 'Brewers' },
  { code: 'MIN', city: 'Minnesota', name: 'Twins', shortName: 'Twins' },
  { code: 'NYM', city: 'New York', name: 'Mets', shortName: 'Mets' },
  { code: 'NYY', city: 'New York', name: 'Yankees', shortName: 'Yankees' },
  { code: 'OAK', city: 'Athletics', name: 'Athletics', shortName: 'Athletics', aliases: ['Oakland Athletics', 'As'] },
  { code: 'PHI', city: 'Philadelphia', name: 'Phillies', shortName: 'Phillies' },
  { code: 'PIT', city: 'Pittsburgh', name: 'Pirates', shortName: 'Pirates' },
  { code: 'SD', city: 'San Diego', name: 'Padres', shortName: 'Padres', aliases: ['SDP'] },
  { code: 'SF', city: 'San Francisco', name: 'Giants', shortName: 'Giants', aliases: ['SFG'] },
  { code: 'SEA', city: 'Seattle', name: 'Mariners', shortName: 'Mariners' },
  { code: 'STL', city: 'St. Louis', name: 'Cardinals', shortName: 'Cardinals', aliases: ['St Louis Cardinals'] },
  { code: 'TB', city: 'Tampa Bay', name: 'Rays', shortName: 'Rays', aliases: ['TBR'] },
  { code: 'TEX', city: 'Texas', name: 'Rangers', shortName: 'Rangers' },
  { code: 'TOR', city: 'Toronto', name: 'Blue Jays', shortName: 'Blue Jays' },
  { code: 'WAS', city: 'Washington', name: 'Nationals', shortName: 'Nationals', aliases: ['WSH'] }
]

const CODE_LOOKUP = new Map<string, MlbTeamMeta>()
const NAME_LOOKUP = new Map<string, MlbTeamMeta>()

for (const team of MLB_TEAMS) {
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

export const getMlbTeamMeta = (value?: string | null) => {
  if (!value) return null
  const code = value.toUpperCase()
  return CODE_LOOKUP.get(code) ?? NAME_LOOKUP.get(normalize(value)) ?? null
}

export const getMlbTeamShortName = (value?: string | null) =>
  getMlbTeamMeta(value)?.shortName ?? value ?? ''
