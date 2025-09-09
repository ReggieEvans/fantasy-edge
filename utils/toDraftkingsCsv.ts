type Player = {
  draftable_id: number
  full_name: string
  position: string
  salary: number
  team_id: number | string
  opponent_team_id: number | string
  projection?: number | null
  showdown_position: string | null
  avg_points: number | null
}

type Matchup = {
  id: string
  away_team_id: number | string
  away_team_abbr: string
  home_team_id: number | string
  home_team_abbr: string
  // Optional fields; include if you have them
  start_time?: string // ISO like "2025-09-06T16:00:00Z"
  // ...other fields you have; they're ignored here
}

type Sport = 'NFL' | 'CFB'
type Pos = 'QB' | 'RB' | 'WR' | 'TE' | 'DST' | 'FLEX' | 'S-FLEX'

const POSITION_ELIGIBILITY: Record<Sport, Record<Pos, Pos[]>> = {
  NFL: {
    QB: ['QB'],
    RB: ['RB', 'FLEX'],
    WR: ['WR', 'FLEX'],
    TE: ['TE', 'FLEX'],
    FLEX: ['RB', 'WR', 'TE'],
    DST: ['DST'],
    'S-FLEX': ['QB', 'RB', 'WR', 'TE'], // not used in NFL Classic, here for completeness
  },
  CFB: {
    QB: ['QB', 'S-FLEX'],
    RB: ['RB', 'FLEX', 'S-FLEX'],
    WR: ['WR', 'FLEX', 'S-FLEX'],
    TE: ['TE', 'FLEX', 'S-FLEX'], // include if your CFB slates have TE; otherwise remove
    FLEX: ['RB', 'WR'], // CFB FLEX (no QB)
    DST: ['DST'], // usually not present in CFB Classic; harmless if unused
    'S-FLEX': ['QB', 'RB', 'WR', 'TE'], // superflex allows QB (and TE if present)
  },
} as const

const DK_HEADER = [
  'Position',
  'Name + ID',
  'Name',
  'ID',
  'Roster Position',
  'Salary',
  'Game Info',
  'TeamAbbrev',
  'AvgPointsPerGame',
] as const

function rosterPositionsFor(pos: string, sport: Sport, isShowdown: boolean, showdownPosition: string | null) {
  const P = pos.toUpperCase()

  // SHOWDOWN_POSITIONS
  if (isShowdown) {
    return showdownPosition
  }

  // CLASSIC_POSITIONS
  if (sport === 'CFB') {
    if (P === 'QB') return 'QB/S-FLEX'
    if (P === 'RB' || P === 'WR' || P === 'TE') return `${P}/FLEX/S-FLEX`
    return `${P}/FLEX`
  } else {
    if (P === 'RB' || P === 'WR' || P === 'TE') return `${P}/FLEX`
    return P
  }
}

function formatEtDateTime(iso: string) {
  const d = new Date(iso)
  const date = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).format(d)
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d)
  return `${date} ${time.replace(' ', '')}` // "09/06/2025 12:00PM"
}

function cell(v: unknown) {
  if (v == null) return ''
  const s = String(v)
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
}

/**
 * Build a map: team_id -> { abbrev, gameBase: "AWY@HOME", start?: iso }
 */
function buildTeamIndex(matchups: Matchup[], fallbackStartIso?: string) {
  const idx: Record<string | number, { abbrev: string; gameBase: string; start?: string }> = {}

  for (const m of matchups) {
    const base = `${m.away_team_abbr}@${m.home_team_abbr}`
    const start = m.start_time || fallbackStartIso // use matchup start if present, else slate start if provided
    idx[m.away_team_id] = { abbrev: m.away_team_abbr, gameBase: base, start }
    idx[m.home_team_id] = { abbrev: m.home_team_abbr, gameBase: base, start }
  }
  return idx
}

/**
 * Create a DraftKings-compatible CSV from your players + matchups.
 * If your matchups don't include a per-game start time, pass a fallback (e.g., `slate.min_start_time`).
 */
export function toDraftKingsCsvFromMatchups(
  players: Player[],
  matchups: Matchup[],
  sport: Sport,
  isShowdown: boolean,
  opts?: { fallbackStartIso?: string; avgPointsKey?: keyof Player },
): string {
  const teamIndex = buildTeamIndex(matchups, opts?.fallbackStartIso)
  const header = DK_HEADER.join(',')

  const rows = players.map(p => {
    const pos = p.position.toUpperCase()
    const name = p.full_name
    const id = p.draftable_id
    const namePlusId = `${name} (${id})`
    const rosterPos = rosterPositionsFor(pos, sport, isShowdown, p.showdown_position)

    const teamInfo = teamIndex[p.team_id] // player’s own team
    const teamAbbrev = teamInfo?.abbrev ?? ''
    const startIso = teamInfo?.start
    const gameBase = teamInfo?.gameBase ?? '' // "SJSU@TEX"
    const gameInfo = startIso ? `${gameBase} ${formatEtDateTime(startIso)} ET` : gameBase

    // TODO: Remove this once we have projections
    // If theres no projection, use a random number between 0 and 25 for testing
    const avg = p.projection ?? (Number.isFinite(Number(p.avg_points)) ? Number(p.avg_points) : 0)

    return [
      cell(pos),
      cell(namePlusId),
      cell(name),
      cell(id),
      cell(rosterPos),
      cell(p.salary),
      cell(gameInfo),
      cell(teamAbbrev),
      cell(avg),
    ].join(',')
  })
  console.log('rows', rows)
  return [header, ...rows].join('\r\n')
}
