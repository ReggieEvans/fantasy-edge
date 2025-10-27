/* eslint-disable @typescript-eslint/no-explicit-any */
import { Matchup } from '@/features/slate-manager/matchups/types/matchup'

type LibPlayer = {
  lineup_position: string
  name: string
  positions?: string[]
  salary: number
  team: string
}

type LibLineup = {
  players: LibPlayer[]
  projection: number
  salary: number
}

type EnricherOptions = {
  salaryTolerance?: number
  nameAliases?: Record<string, string[]>
  debug?: boolean
}

function normalizeName(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\./g, '')
    .replace(/'/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function buildTeamIndex(matchups: Matchup[]) {
  const idx: Record<string | number, string> = {}
  for (const m of matchups) {
    if (m.away_team_id != null) idx[m.away_team_id] = m.away_team_abbr
    if (m.home_team_id != null) idx[m.home_team_id] = m.home_team_abbr
  }
  return idx
}

function pickClosestBySalary<T extends { salary: number | null }>(
  candidates: T[],
  targetSalary: number,
  tolerance: number,
): T | undefined {
  const validCandidates = candidates.filter(c => c.salary != null) as (T & { salary: number })[]
  if (!validCandidates.length) return undefined
  let best = validCandidates[0]
  let bestDiff = Math.abs(best.salary - targetSalary)
  for (let i = 1; i < validCandidates.length; i++) {
    const d = Math.abs(validCandidates[i].salary - targetSalary)
    if (d < bestDiff) {
      best = validCandidates[i]
      bestDiff = d
    }
  }
  return bestDiff <= tolerance ? best : undefined
}

export function makeLineupEnricher(
  players: any[],
  matchups: Matchup[],
  opts: EnricherOptions = {},
) {
  const salaryTolerance = opts.salaryTolerance ?? 200
  const teamIndex = buildTeamIndex(matchups)

  type Indexed = any & { _abbr: string; _n: string; _pos: string }
  const pool: Indexed[] = players.map(p => ({
    ...p,
    _abbr: teamIndex[p.team_id] ?? '',
    _n: normalizeName(p.full_name),
    _pos: p.position.toUpperCase(),
  }))

  const byHardKey = new Map<string, Indexed>()
  const byNameTeamPos = new Map<string, Indexed[]>()
  const byNamePos = new Map<string, Indexed[]>()
  const byName = new Map<string, Indexed[]>()

  function hardKey(n: string, abbr: string, sal: number, pos: string) {
    return `${n}|${abbr}|${sal}|${pos}`
  }
  function push(map: Map<string, Indexed[]>, k: string, v: Indexed) {
    const arr = map.get(k)
    if (arr) arr.push(v)
    else map.set(k, [v])
  }

  for (const p of pool) {
    byHardKey.set(hardKey(p._n, p._abbr, p.salary ?? 0, p._pos), p)
    push(byNameTeamPos, `${p._n}|${p._abbr}|${p._pos}`, p)
    push(byNamePos, `${p._n}|${p._pos}`, p)
    push(byName, p._n, p)
  }

  const aliasMap = opts.nameAliases || {}

  function findMatch(lp: LibPlayer): Indexed | undefined {
    const pos = (lp.lineup_position || lp.positions?.[0] || '').toUpperCase()
    const n = normalizeName(lp.name)
    const team = lp.team

    const k1 = hardKey(n, team, lp.salary, pos)
    let hit = byHardKey.get(k1)
    if (hit) return hit

    const c2 = byNameTeamPos.get(`${n}|${team}|${pos}`) || []
    hit = pickClosestBySalary(c2, lp.salary, salaryTolerance)
    if (hit) return hit

    const c3 = byNamePos.get(`${n}|${pos}`) || []
    hit = pickClosestBySalary(c3, lp.salary, salaryTolerance)
    if (hit) return hit

    const c4 = byName.get(n) || []
    hit = pickClosestBySalary(c4, lp.salary, salaryTolerance)
    if (hit) return hit
    const aliases = aliasMap[n] || []
    for (const alt of aliases) {
      const n2 = normalizeName(alt)
      const c5 = byNameTeamPos.get(`${n2}|${team}|${pos}`) || []
      hit =
        pickClosestBySalary(c5, lp.salary, salaryTolerance) ||
        pickClosestBySalary(byNamePos.get(`${n2}|${pos}`) || [], lp.salary, salaryTolerance) ||
        pickClosestBySalary(byName.get(n2) || [], lp.salary, salaryTolerance)
      if (hit) return hit
    }

    return undefined
  }

  return function enrichLineups(lineups: LibLineup[]) {
    let misses = 0,
      total = 0
    const enriched = lineups.map(lu => ({
      ...lu,
      players: lu.players.map(lp => {
        total++
        const match = findMatch(lp)
        if (!match) {
          misses++
          return lp
        }
        return {
          ...lp,
          fe: match,
          fe_draftable_id: match.draftable_id,
          fe_team_id: match.team_id,
          fe_player_id: match.player_id,
          fe_image: (match as any).player_image,
        }
      }),
    }))

    if (opts.debug) {
      console.log(
        `[enrichLineups] matched ${total - misses}/${total} players (${(((total - misses) / Math.max(total, 1)) * 100).toFixed(1)}%); misses=${misses}`,
      )
    }

    return enriched
  }
}
