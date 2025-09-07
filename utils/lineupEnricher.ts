// utils/enrichLineups.ts
type LibPlayer = {
  lineup_position: string
  name: string
  positions?: string[]
  salary: number
  team: string // abbrev from the library (e.g. "TEX", "NCSU")
  // ...anything else the library returns; we will keep it
}

type LibLineup = {
  players: LibPlayer[]
  projection: number
  salary: number
  // ...anything else the library returns; we will keep it
}

type FullPlayer = {
  draftable_id: number
  full_name: string
  position: string
  salary: number
  team_id: number | string
  opponent_team_id: number | string
  // many other fields...
}

type Matchup = {
  away_team_id: number | string
  away_team_abbr: string
  home_team_id: number | string
  home_team_abbr: string
  // maybe: start_time?: string
  id: string
  name: string
}

type EnricherOptions = {
  /** max diff allowed when matching by salary (default 200) */
  salaryTolerance?: number
  /** provide optional name aliases: "cj bailey" -> ["christopher j bailey", "c j bailey"] */
  nameAliases?: Record<string, string[]>
  /** when true, logs match stages for debugging */
  debug?: boolean
}

/* ---------------- helpers ---------------- */

function normalizeName(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/\./g, '') // drop periods
    .replace(/'/g, '') // drop apostrophes (O'Neal -> oneal)
    .replace(/\s+/g, ' ') // collapse spaces
    .trim()
    .toLowerCase()
}

/** Build team_id -> abbrev */
function buildTeamIndex(matchups: Matchup[]) {
  const idx: Record<string | number, string> = {}
  for (const m of matchups) {
    idx[m.away_team_id] = m.away_team_abbr
    idx[m.home_team_id] = m.home_team_abbr
  }
  return idx
}

/** choose closest by salary, with tolerance */
function pickClosestBySalary<T extends { salary: number }>(
  candidates: T[],
  targetSalary: number,
  tolerance: number,
): T | undefined {
  if (!candidates.length) return undefined
  let best = candidates[0]
  let bestDiff = Math.abs(best.salary - targetSalary)
  for (let i = 1; i < candidates.length; i++) {
    const d = Math.abs(candidates[i].salary - targetSalary)
    if (d < bestDiff) {
      best = candidates[i]
      bestDiff = d
    }
  }
  return bestDiff <= tolerance ? best : undefined
}

/* ---------------- enricher factory ---------------- */

export function makeLineupEnricher(players: FullPlayer[], matchups: Matchup[], opts: EnricherOptions = {}) {
  const salaryTolerance = opts.salaryTolerance ?? 200
  const teamIndex = buildTeamIndex(matchups)

  // Precompute abbrev & normalized names for your pool
  type Indexed = FullPlayer & { _abbr: string; _n: string; _pos: string }
  const pool: Indexed[] = players.map(p => ({
    ...p,
    _abbr: teamIndex[p.team_id] ?? '',
    _n: normalizeName(p.full_name),
    _pos: p.position.toUpperCase(),
  }))

  // Multi-indexes for fast matching
  const byHardKey = new Map<string, Indexed>() // name|abbr|salary|pos
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
    byHardKey.set(hardKey(p._n, p._abbr, p.salary, p._pos), p)
    push(byNameTeamPos, `${p._n}|${p._abbr}|${p._pos}`, p)
    push(byNamePos, `${p._n}|${p._pos}`, p)
    push(byName, p._n, p)
  }

  // optional alias map
  const aliasMap = opts.nameAliases || {}

  function findMatch(lp: LibPlayer): Indexed | undefined {
    const pos = (lp.lineup_position || lp.positions?.[0] || '').toUpperCase()
    const n = normalizeName(lp.name)
    const team = lp.team

    // Stage 1: exact hard key
    const k1 = hardKey(n, team, lp.salary, pos)
    let hit = byHardKey.get(k1)
    if (hit) return hit

    // Stage 2: name+team+pos → closest salary within tolerance
    const c2 = byNameTeamPos.get(`${n}|${team}|${pos}`) || []
    hit = pickClosestBySalary(c2, lp.salary, salaryTolerance)
    if (hit) return hit

    // Stage 3: name+pos (team may differ, e.g., data source inconsistency)
    const c3 = byNamePos.get(`${n}|${pos}`) || []
    hit = pickClosestBySalary(c3, lp.salary, salaryTolerance)
    if (hit) return hit

    // Stage 4: name only → closest salary (last resort within pos-agnostic)
    const c4 = byName.get(n) || []
    hit = pickClosestBySalary(c4, lp.salary, salaryTolerance)
    if (hit) return hit

    // Stage 5: aliases (CJ -> Christopher J, etc.)
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
      ...lu, // keep all lineup-level fields from library
      players: lu.players.map(lp => {
        total++
        const match = findMatch(lp)
        if (!match) {
          misses++
          return lp
        } // keep library row as-is if no match
        // ✅ Preserve library columns; add rich data under a namespaced key
        return {
          ...lp,
          fe: match, // your full/rich player object nested here
          // Optional: quick surface some common fields without overwriting library values
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
