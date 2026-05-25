export type NbaTeamMeta = {
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

export const NBA_TEAMS: NbaTeamMeta[] = [
  { code: 'ATL', city: 'Atlanta', name: 'Hawks', shortName: 'Hawks' },
  { code: 'BKN', city: 'Brooklyn', name: 'Nets', shortName: 'Nets', aliases: ['BRK', 'BK'] },
  { code: 'BOS', city: 'Boston', name: 'Celtics', shortName: 'Celtics' },
  { code: 'CHA', city: 'Charlotte', name: 'Hornets', shortName: 'Hornets' },
  { code: 'CHI', city: 'Chicago', name: 'Bulls', shortName: 'Bulls' },
  { code: 'CLE', city: 'Cleveland', name: 'Cavaliers', shortName: 'Cavs', aliases: ['Cavs'] },
  { code: 'DAL', city: 'Dallas', name: 'Mavericks', shortName: 'Mavs', aliases: ['Mavs'] },
  { code: 'DEN', city: 'Denver', name: 'Nuggets', shortName: 'Nuggets' },
  { code: 'DET', city: 'Detroit', name: 'Pistons', shortName: 'Pistons' },
  { code: 'GSW', city: 'Golden State', name: 'Warriors', shortName: 'Warriors', aliases: ['GS', 'Golden State Warriors'] },
  { code: 'HOU', city: 'Houston', name: 'Rockets', shortName: 'Rockets' },
  { code: 'IND', city: 'Indiana', name: 'Pacers', shortName: 'Pacers' },
  { code: 'LAC', city: 'LA', name: 'Clippers', shortName: 'Clippers', aliases: ['Los Angeles Clippers', 'LA Clippers'] },
  { code: 'LAL', city: 'Los Angeles', name: 'Lakers', shortName: 'Lakers', aliases: ['LA Lakers'] },
  { code: 'MEM', city: 'Memphis', name: 'Grizzlies', shortName: 'Grizzlies' },
  { code: 'MIA', city: 'Miami', name: 'Heat', shortName: 'Heat' },
  { code: 'MIL', city: 'Milwaukee', name: 'Bucks', shortName: 'Bucks' },
  { code: 'MIN', city: 'Minnesota', name: 'Timberwolves', shortName: 'Wolves', aliases: ['Timberwolves', 'Wolves'] },
  { code: 'NOP', city: 'New Orleans', name: 'Pelicans', shortName: 'Pelicans', aliases: ['NO', 'New Orleans Pelicans'] },
  { code: 'NYK', city: 'New York', name: 'Knicks', shortName: 'Knicks', aliases: ['NY', 'New York Knicks'] },
  { code: 'OKC', city: 'Oklahoma City', name: 'Thunder', shortName: 'Thunder' },
  { code: 'ORL', city: 'Orlando', name: 'Magic', shortName: 'Magic' },
  { code: 'PHI', city: 'Philadelphia', name: '76ers', shortName: '76ers', aliases: ['Sixers', 'Philadelphia 76ers'] },
  { code: 'PHX', city: 'Phoenix', name: 'Suns', shortName: 'Suns', aliases: ['PHO'] },
  { code: 'POR', city: 'Portland', name: 'Trail Blazers', shortName: 'Blazers', aliases: ['Trail Blazers', 'Blazers'] },
  { code: 'SAC', city: 'Sacramento', name: 'Kings', shortName: 'Kings' },
  { code: 'SAS', city: 'San Antonio', name: 'Spurs', shortName: 'Spurs', aliases: ['SA'] },
  { code: 'TOR', city: 'Toronto', name: 'Raptors', shortName: 'Raptors' },
  { code: 'UTA', city: 'Utah', name: 'Jazz', shortName: 'Jazz' },
  { code: 'WAS', city: 'Washington', name: 'Wizards', shortName: 'Wizards', aliases: ['WSH'] }
]

const CODE_LOOKUP = new Map<string, NbaTeamMeta>()
const NAME_LOOKUP = new Map<string, NbaTeamMeta>()

for (const team of NBA_TEAMS) {
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

export const getNbaTeamMeta = (value?: string | null) => {
  if (!value) return null
  const code = value.toUpperCase()
  return CODE_LOOKUP.get(code) ?? NAME_LOOKUP.get(normalize(value)) ?? null
}

export const getNbaTeamShortName = (value?: string | null) =>
  getNbaTeamMeta(value)?.shortName ?? value ?? ''
