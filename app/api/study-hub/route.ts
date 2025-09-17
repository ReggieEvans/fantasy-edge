/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/study-hub/upload/route.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// You already use this util in your project
import { parseLineupWithSlots } from '@/libs/dk/parse'

export const runtime = 'nodejs'

export type ValueVerdict = 'EXCEEDED' | 'FAILED' | 'NEUTRAL'

type RosterSlot = 'QB' | 'RB' | 'WR' | 'TE' | 'DST' | 'FLEX' | 'S-FLEX' | 'UTIL' | 'CPT'

/**
 * Upload the EXACT DraftKings standings CSV (the one whose header contains BOTH
 * entry columns and player columns, e.g.:
 *   Rank,EntryId,EntryName,TimeRemaining,Points,Lineup,Player,Roster Position,%Drafted,FPTS
 *
 * This route:
 *  - Parses entry rows (Rank/EntryId/EntryName/Points/Lineup)
 *  - Parses player rows from the SAME header (Player/Roster Position/%Drafted/FPTS)
 *  - Detects Showdown via CPT token in any lineup (or via provided hint)
 *  - Fetches contest + draftables to enrich with entry fee, payouts, salaries, images, teams
 *  - Loads team meta (color, alt color, logos) from Supabase by DK abbrev -> team_id -> teams_meta
 *  - Computes per-entry ROI, user totals, global player exposures
 *  - Adds expected points from salary (baseline $/pt), and value verdict icon
 *  - Tags lineup rows with is_stack / is_game_stack
 *  - Optionally appends usernameSummary (Spent/Winnings/ROI) if a username was provided
 */
export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get('content-type') || ''
    if (!ct.includes('multipart/form-data')) {
      return jsonError('Expected multipart/form-data with a `file` field.', 400)
    }

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return jsonError('Missing `file`.', 400)

    const hints = {
      sport: asOptString(form.get('sport')),
      gameType: asOptString(form.get('gameType')) as 'classic' | 'showdown' | undefined,
      valueBaseline: asOptNumber(form.get('valueBaseline')),
    }
    const usernameFilter = asOptString(form.get('username'))?.trim()

    const filename = (file as any)?.name || 'upload.csv'
    const csvText = (await file.text()).replace(/\uFEFF/g, '') // strip BOM if present

    // ---------- Parse CSV (single HEADER with BOTH entry + player columns) ----------
    const parsed = parseCsvSingleHeader(csvText)
    if (!parsed.rows.length) {
      return jsonError('CSV appears empty or not a recognized DraftKings standings export.', 400)
    }

    // Game type (prefer hint; else detect by CPT token in any lineup)
    const gameType: 'classic' | 'showdown' =
      hints.gameType ??
      (parsed.rows.some(r => /\bCPT\b/.test(r.lineup || '')) ? 'showdown' : 'classic')

    // Contest ID from filename
    const contestId = filename.match(/(\d{6,})/)?.[1] || undefined
    if (!contestId)
      return jsonError(
        'Could not detect contest id from filename (name it like "...-1234567.csv").',
        400,
      )

    // ---------- Contest detail (entry fee, payouts, draftGroupId, sport) ----------
    const contestUrl = `https://api.draftkings.com/contests/v1/contests/${contestId}?format=json`
    const contestRes = await fetch(contestUrl, { cache: 'no-store' })
    if (!contestRes.ok) return jsonError(`Contest API failed (${contestRes.status}).`, 502)
    const contestJson: any = await contestRes.json()
    const detail = contestJson?.contestDetail || contestJson?.Contests?.[0]
    if (!detail) return jsonError('Contest API returned no contestDetail.', 502)

    const entryFeeDollars: number = numish(detail.entryFee ?? detail.EntryFee) ?? 0
    const detectedSport = strish(detail.sport ?? detail.Sport) || 'UNKNOWN'
    const draftGroupId: number =
      numish(detail.draftGroupId ?? detail.DraftGroupId ?? detail.dg) ?? 0
    const payoutResolver = buildPayoutResolver(detail.payoutSummary ?? detail.PayoutSummary ?? [])

    // ---------- Draftables (salary/position/team/image) ----------
    let draftableMap = makeDraftableMap([])
    if (draftGroupId) {
      const dgUrl = `https://api.draftkings.com/draftgroups/v1/draftgroups/${draftGroupId}/draftables`
      const dgRes = await fetch(dgUrl, { cache: 'no-store' })
      if (dgRes.ok) {
        const dgJson: any = await dgRes.json()
        draftableMap = makeDraftableMap(Array.isArray(dgJson?.draftables) ? dgJson.draftables : [])
      } else {
        console.warn('[study-hub] Draftables API failed:', dgRes.status)
      }
    }

    // ---------- Team meta (DK abbr -> teams_meta) via Supabase ----------
    const supabase = createServerSupabase()
    const teamMetaByDkAbbr = await getTeamMetaByDkAbbr(supabase)

    // ---------- Build FPTS map (Player → FPTS) and base position map ----------
    const pointsByName = new Map<string, number>()
    const playerBase = new Map<string, string>() // normalized player name -> base position (QB/RB/WR/TE/DST)

    for (const p of parsed.players) {
      const k = norm(p.name)
      const fpts = numish(p.fpts) ?? 0
      pointsByName.set(k, fpts)

      const base = ((p.position ?? p.roster) || '').toUpperCase()
      if (['QB', 'RB', 'WR', 'TE', 'DST'].includes(base)) {
        playerBase.set(k, base)
        // DST alias: allow matching "Steelers" (lineup) to "Steelers D/ST" (players table)
        if (base === 'DST') {
          const baseName = p.name.replace(/\s*(?:D\/?ST|DST)\s*$/i, '').trim()
          if (baseName) {
            pointsByName.set(norm(baseName), fpts)
            playerBase.set(norm(baseName), 'DST')
          }
        }
      }
    }

    // ---------- Value ($/pt) baseline ----------
    let baseline = Number(
      hints.valueBaseline ?? defaultBaseline({ sport: hints.sport ?? detectedSport, gameType }),
    )
    if (!Number.isFinite(baseline) || baseline <= 0) baseline = 300

    // ---------- Enrich entries ----------
    const entries = parsed.rows.map(r => {
      const prizeDollars = payoutResolver(r.rank)
      const spendCents = Math.round(entryFeeDollars * 100)
      const wonCents = Math.round((prizeDollars ?? 0) * 100)
      const roi = spendCents === 0 ? 0 : (wonCents - spendCents) / spendCents

      // derive username from EntryName: "name (x/y)"
      const deriveUsername = (entryName: string, csvUsername?: string) => {
        const primary = (csvUsername ?? '').trim()
        if (primary) return primary
        // remove a trailing " (x/y)" only (doesn’t touch other parentheses in the middle)
        return (entryName || '').replace(/\s*\(\s*\d+\s*\/\s*\d+\s*\)\s*$/, '').trim()
      }
      const username = deriveUsername(r.entryName, r.username)

      const tokens = parseLineupWithSlots(r.lineup)

      type LineupPlayer = {
        name: string
        slot: RosterSlot
        position: string | null
        salary: number | null
        expected: number | null
        actual: number | null
        icon: ValueVerdict | null
        imageUrl: string | null
        teamAbbr: string | null
        oppAbbr: string | null
        team: {
          team_id: number
          abbreviation: string | null
          color: string | null
          alternate_color: string | null
          logos: any | null
        } | null
        is_stack?: boolean
        is_game_stack?: boolean
      }

      let lineup: LineupPlayer[] = tokens.map(t => {
        const key = norm(t.name)
        const d = draftableMap.byName.get(key)
        const slot = normalizeSlot(t.slot, gameType)
        const slotMult = gameType === 'showdown' && slot === 'CPT' ? 1.5 : 1

        const salary = Number.isFinite(d?.salary) ? Number(d!.salary) : null
        const effSalary = salary != null ? Math.round(salary * slotMult) : null
        const expected = effSalary != null && baseline > 0 ? round2(effSalary / baseline) : null

        let actual: number | null = pointsByName.get(key) ?? null
        if (actual != null && slotMult !== 1) actual = round2(actual * slotMult)
        const basePos = d?.position ?? playerBase.get(key) ?? null

        const teamAbbr = d?.teamAbbreviation ? up(d.teamAbbreviation) : null
        const oppAbbr = d?.opponentTeamAbbreviation ? up(d.opponentTeamAbbreviation) : null
        const meta = teamAbbr ? (teamMetaByDkAbbr.get(teamAbbr) ?? null) : null

        return {
          name: t.name,
          slot,
          position: basePos,
          salary,
          expected,
          actual,
          icon: actual != null && expected != null ? valueVerdict(actual, expected) : null,
          imageUrl: d?.imageUrl ?? null,
          teamAbbr,
          oppAbbr,
          team: meta
            ? {
                team_id: meta.team_id,
                abbreviation: meta.abbreviation,
                color: meta.color,
                alternate_color: meta.alternate_color,
                logos: meta.logos,
              }
            : null,
        }
      })

      // ---- stack tags (based on QB team(s))
      const qbTeams = new Set(
        lineup
          .filter(p => (p.position ?? '').toUpperCase() === 'QB')
          .map(p => p.teamAbbr)
          .filter(Boolean) as string[],
      )

      const STACK_ELIGIBLE = new Set(['WR', 'TE', 'RB']) // tweak if you want RB excluded

      // Count eligible teammates by team (exclude QBs, usually exclude DST)
      const teamEligibleCounts = new Map<string, number>()
      for (const p of lineup) {
        const base = (p.position ?? '').toUpperCase()
        const t = p.teamAbbr
        if (!t) continue
        if (STACK_ELIGIBLE.has(base)) {
          teamEligibleCounts.set(t, (teamEligibleCounts.get(t) ?? 0) + 1)
        }
      }

      // Now tag every player (including QBs)
      lineup = lineup.map(p => {
        const base = (p.position ?? '').toUpperCase()
        const isQB = base === 'QB'
        const team = p.teamAbbr
        const opp = p.oppAbbr

        // Non-QB: stacked if they share a team with any QB
        // QB: stacked if there is at least one eligible teammate on his team
        const is_stack = isQB
          ? !!team && (teamEligibleCounts.get(team) ?? 0) > 0
          : !!team && qbTeams.has(team)

        // Non-QB: game-stack if their opponent is a QB team
        // QB: game-stack if there is at least one eligible opponent player on the QB's opposing team
        const is_game_stack = isQB
          ? !!opp && (teamEligibleCounts.get(opp) ?? 0) > 0
          : !!opp && qbTeams.has(opp)

        return { ...p, is_stack, is_game_stack }
      })

      return {
        entryId: r.entryId,
        entryName: r.entryName,
        username,
        rank: r.rank,
        points: r.points,
        prizeDollars: prizeDollars ?? 0,
        roi,
        spendCents,
        wonCents,
        lineup,
      }
    })

    // --- Usage stats: per-user distinct pools (overall + by base position)
    type UsageRow = {
      user: string
      entries: number
      total: number
      QB: number
      RB: number
      WR: number
      TE: number
      DST: number
    }

    const perUser = new Map<
      string,
      {
        entries: number
        total: Set<string>
        QB: Set<string>
        RB: Set<string>
        WR: Set<string>
        TE: Set<string>
        DST: Set<string>
      }
    >()
    for (const e of entries) {
      let u = perUser.get(e.username)
      if (!u) {
        u = {
          entries: 0,
          total: new Set(),
          QB: new Set(),
          RB: new Set(),
          WR: new Set(),
          TE: new Set(),
          DST: new Set(),
        }
        perUser.set(e.username, u)
      }
      u.entries += 1

      for (const p of e.lineup) {
        const k = (p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')
        u.total.add(k)

        const base = (p.position || p.slot || '').toUpperCase()
        if (base === 'QB') u.QB.add(k)
        else if (base === 'RB') u.RB.add(k)
        else if (base === 'WR') u.WR.add(k)
        else if (base === 'TE') u.TE.add(k)
        else if (base === 'DST') u.DST.add(k)
      }
    }

    const usageRows: UsageRow[] = Array.from(perUser.entries()).map(([user, u]) => ({
      user,
      entries: u.entries,
      total: u.total.size,
      QB: u.QB.size,
      RB: u.RB.size,
      WR: u.WR.size,
      TE: u.TE.size,
      DST: u.DST.size,
    }))

    const contestMaxEntries = usageRows.reduce((m, r) => Math.max(m, r.entries), 0)

    function summarize(rows: UsageRow[]) {
      const agg = (sel: (r: UsageRow) => number) => {
        const arr = rows.map(sel)
        const low = Math.min(...arr)
        const high = Math.max(...arr)
        const avg = arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length)
        return { low, avg, high }
      }
      return {
        usersCount: rows.length,
        totalDistinct: agg(r => r.total),
        QB: agg(r => r.QB),
        RB: agg(r => r.RB),
        WR: agg(r => r.WR),
        TE: agg(r => r.TE),
        DST: agg(r => r.DST),
      }
    }

    function bucketize(rows: UsageRow[]) {
      const buckets = new Map<number, UsageRow[]>()
      for (const r of rows) {
        if (!buckets.has(r.entries)) buckets.set(r.entries, [])
        buckets.get(r.entries)!.push(r)
      }
      const out: Record<string, ReturnType<typeof summarize>> = {}
      for (const [k, list] of buckets) out[String(k)] = summarize(list)
      return out
    }

    const usageAll = summarize(usageRows)
    const usageFull = summarize(usageRows.filter(r => r.entries === contestMaxEntries))
    const usageBuckets = bucketize(usageRows)

    // ---------- Aggregates & exposures ----------
    const byUser = new Map<string, { entries: number; spendCents: number; wonCents: number }>()
    const exposure = new Map<string, number>()
    const cptExp = new Map<string, number>()
    const flexExp = new Map<string, number>()

    for (const e of entries) {
      const u = byUser.get(e.username) ?? { entries: 0, spendCents: 0, wonCents: 0 }
      u.entries++
      u.spendCents += e.spendCents
      u.wonCents += e.wonCents
      byUser.set(e.username, u)

      const seen = new Set<string>(),
        seenC = new Set<string>(),
        seenF = new Set<string>()
      for (const p of e.lineup) {
        const k = norm(p.name)
        if (!seen.has(k)) {
          seen.add(k)
          exposure.set(k, (exposure.get(k) ?? 0) + 1)
        }
        if (p.slot === 'CPT') seenC.add(k)
        if (p.slot === 'FLEX' || p.slot === 'S-FLEX') seenF.add(k)
      }
      for (const k of seenC) cptExp.set(k, (cptExp.get(k) ?? 0) + 1)
      for (const k of seenF) flexExp.set(k, (flexExp.get(k) ?? 0) + 1)
    }

    const totalEntries = Math.max(1, entries.length)
    const contestPlayerExposures = Array.from(exposure.entries())
      .map(([k, count]) => {
        const d = draftableMap.byName.get(k)
        const teamAbbr = d?.teamAbbreviation ? up(d.teamAbbreviation) : null
        const meta = teamAbbr ? (teamMetaByDkAbbr.get(teamAbbr) ?? null) : null
        const display = d?.displayName ?? k
        const salary = d?.salary ?? null
        const expected = salary && baseline > 0 ? round2(salary / baseline) : null
        const actual = pointsByName.get(k) ?? null
        const icon = actual != null && expected != null ? valueVerdict(actual, expected) : null

        const rec: any = {
          player: display,
          imageUrl: d?.imageUrl ?? null,
          teamAbbr,
          team: meta
            ? {
                team_id: meta.team_id,
                abbreviation: meta.abbreviation,
                color: meta.color,
                alternate_color: meta.alternate_color,
                logos: meta.logos,
              }
            : null,
          position: d?.position ?? playerBase.get(k) ?? null,
          entriesWithPlayer: count,
          fieldPct: count / totalEntries,
          salary,
          expected,
          actual,
          icon,
          display,
        }
        if (gameType === 'showdown') {
          rec.cpt_pct = (cptExp.get(k) ?? 0) / totalEntries
          rec.flex_pct = (flexExp.get(k) ?? 0) / totalEntries
        }
        return rec
      })
      .sort((a, b) => b.entriesWithPlayer - a.entriesWithPlayer)

    const users = Array.from(byUser.entries())
      .map(([username, u]) => ({
        username,
        entries: u.entries,
        spendDollars: round2(u.spendCents / 100),
        wonDollars: round2(u.wonCents / 100),
        roi: u.spendCents === 0 ? 0 : (u.wonCents - u.spendCents) / u.spendCents,
      }))
      .sort((a, b) => b.entries - a.entries)

    // Optional per-user summary appended (case-insensitive match)
    let usernameSummary: { Username: string; Spent: number; Winnings: number; ROI: number } | null =
      null
    if (usernameFilter) {
      const match = users.find(
        u => u.username.trim().toLowerCase() === usernameFilter.toLowerCase(),
      )
      if (match) {
        usernameSummary = {
          Username: match.username,
          Spent: match.spendDollars,
          Winnings: match.wonDollars,
          ROI: match.roi,
        }
      }
    }

    return NextResponse.json({
      meta: {
        contestId,
        sport: hints.sport ?? detectedSport,
        gameType,
        entries: totalEntries,
        entryFeeDollars,
        draftGroupId,
        valueBaseline: baseline,
      },
      users,
      entries,
      contestPlayerExposures,
      usage: {
        contestMaxEntries,
        all: usageAll,
        full: usageFull,
        buckets: usageBuckets,
      },
      ...(usernameSummary ? { usernameSummary } : {}),
    })
  } catch (err: any) {
    console.error('[study-hub] upload error:', err)
    return jsonError(err?.message || 'Unexpected error', 500)
  }
}

/* ------------------------------- helpers -------------------------------- */

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}
const round2 = (x: number) => Math.round(x * 100) / 100
const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
const up = (s?: string | null) => (s || '').toUpperCase()
const asOptString = (v: any) => (typeof v === 'string' ? v : v?.toString?.()) || undefined
const asOptNumber = (v: any) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}
const numish = (x: any) =>
  (x == null ? null : Number(String(x).replace(/[^0-9.\-]/g, ''))) as number | null
const strish = (x: any) => (x == null ? null : String(x))

function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) console.warn('[study-hub] Missing Supabase env (URL/KEY).')
  return createSupabaseClient(url!, key!)
}

/* ----------------------- CSV parsing (single header) --------------------- */

type CsvRow = {
  rank: number
  entryId: string
  entryName: string
  username: string
  points: number
  lineup: string
}

type PlayerFptsRow = {
  name: string
  roster?: string | null
  position?: string | null
  draftedPct?: number | null
  fpts: number
}

type CsvParsed = { rows: CsvRow[]; players: PlayerFptsRow[] }

function parseCsvSingleHeader(csv: string): CsvParsed {
  const lines = csv
    .replace(/\r/g, '')
    .split('\n')
    .filter(l => l.length > 0)
  if (!lines.length) return { rows: [], players: [] }

  const head = splitCsvLine(lines[0])
  const L = (s: string) => (s ?? '').trim().toLowerCase()
  const idx = (name: string, alt?: string) => {
    const i = head.findIndex(h => L(h) === L(name))
    if (i >= 0) return i
    if (alt) {
      const j = head.findIndex(h => L(h) === L(alt))
      if (j >= 0) return j
    }
    return -1
  }

  // Entry columns
  const iRank = idx('Rank')
  const iEntryId = idx('Entry Id', 'EntryId')
  const iEntryNm = idx('Entry Name', 'EntryName')
  const iUser = idx('Username')
  const iPoints = idx('Points')
  const iLineup = idx('Lineup')

  // Player columns
  const iPlayer = idx('Player')
  const iRoster = (() => {
    const a = idx('Roster Position')
    return a >= 0 ? a : idx('Roster')
  })()
  const iPos = idx('Position') // base position if present
  const iPct = idx('%Drafted')
  const iFpts = idx('FPTS')

  const rows: CsvRow[] = []
  const players: PlayerFptsRow[] = []

  for (let li = 1; li < lines.length; li++) {
    const cols = splitCsvLine(lines[li])
    if (!cols.length) continue

    const hasEntryFields = iEntryId >= 0 && iLineup >= 0 && cols[iEntryId] && cols[iLineup]
    const hasPlayerFields = iPlayer >= 0 && iFpts >= 0 && cols[iPlayer] && cols[iFpts]

    if (hasEntryFields) {
      rows.push({
        rank: Number(cols[iRank] ?? 0),
        entryId: cols[iEntryId],
        entryName: cols[iEntryNm] ?? '',
        username: iUser >= 0 ? (cols[iUser] ?? '') : '',
        points: Number(cols[iPoints] ?? 0),
        lineup: cols[iLineup],
      })
    }

    if (hasPlayerFields) {
      const name = (cols[iPlayer] || '').trim()
      if (name) {
        const roster = iRoster >= 0 ? (cols[iRoster] || '').trim() : null
        const position = iPos >= 0 ? (cols[iPos] || '').trim() : null
        const draftedPct = iPct >= 0 ? numish(cols[iPct]) : null
        const fpts = numish(cols[iFpts]) ?? 0
        players.push({ name, roster, position, draftedPct, fpts })
      }
    }
  }

  return { rows, players }
}

function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = '',
    inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"'
        i++
        continue
      }
      inQ = !inQ
      continue
    }
    if (ch === ',' && !inQ) {
      out.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur)
  return out
}

/* ----------------------- payouts + draftables + value -------------------- */

function buildPayoutResolver(payoutSummary: any[]) {
  type Tier = { min: number; max: number; value: number }
  const tiers: Tier[] = []
  for (const t of payoutSummary || []) {
    const value =
      numish(t?.payoutDescriptions?.[0]?.value) ??
      numish((t as any)?.tierPayoutDescriptions?.Cash) ??
      numish(t?.value) ??
      0
    tiers.push({
      min: Number(t.minPosition ?? t.MinPosition ?? 0),
      max: Number(t.maxPosition ?? t.MaxPosition ?? 0),
      value,
    })
  }
  tiers.sort((a, b) => a.min - b.min)
  return (rank: number): number => {
    for (const t of tiers) if (rank >= t.min && rank <= t.max) return t.value
    return 0
  }
}

function extractOppAbbrFromName(name: string | undefined, teamAbbr: string | null): string | null {
  const n = (name || '').toUpperCase()
  // pull tokens like CLE, BAL, NYJ, LAR, etc.
  const tokens: string[] = n.match(/[A-Z]{2,4}/g) || []
  if (tokens.length < 2) return null
  const me = teamAbbr ? teamAbbr.toUpperCase() : null
  if (me && tokens.includes(me)) {
    const other = tokens.find(t => t !== me)
    return other || null
  }
  // Fallback: assume "AWAY @ HOME"
  return tokens[1] || null
}

function makeDraftableMap(draftables: any[]) {
  type D = {
    displayName: string
    salary: number
    position: string | null
    teamAbbreviation?: string | null
    opponentTeamAbbreviation?: string | null
    imageUrl?: string | null
  }

  const byName = new Map<string, D>()

  for (const d of draftables || []) {
    const displayName = d.displayName || `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim()
    if (!displayName) continue

    const key = norm(displayName)
    const salary = Number(d.salary ?? 0)
    const position = d.position || d.rosterSlot || null
    const teamAbbreviation = d.teamAbbreviation ?? d.teamAbbrev ?? null

    // Opponent derived from competition/competitions name, e.g. "CLE @ BAL"
    const compName: string | undefined = d.competition?.name || d.competitions?.[0]?.name
    const opponentTeamAbbreviation = extractOppAbbrFromName(compName, teamAbbreviation)

    // Prefer larger image, then fall back
    const imageUrl =
      d.playerImage160 || d.playerImage50 || d.altPlayerImage160 || d.altPlayerImage50 || null

    const existing = byName.get(key)
    if (!existing || salary > existing.salary) {
      byName.set(key, {
        displayName,
        salary,
        position,
        teamAbbreviation,
        opponentTeamAbbreviation,
        imageUrl,
      })
    }
  }

  return { byName }
}

function defaultBaseline({ sport, gameType }: { sport: string; gameType: 'classic' | 'showdown' }) {
  if (/^nfl$/i.test(sport)) return gameType === 'showdown' ? 350 : 300
  return 300
}

function valueVerdict(actual: number, expected: number, band = 0.2): ValueVerdict {
  if (!Number.isFinite(actual) || !Number.isFinite(expected) || expected <= 0) return 'NEUTRAL'
  const hi = expected * (1 + band)
  const lo = expected * (1 - band)
  if (actual >= hi) return 'EXCEEDED'
  if (actual <= lo) return 'FAILED'
  return 'NEUTRAL'
}

function normalizeSlot(raw: string, gameType: 'classic' | 'showdown'): RosterSlot {
  const s = (raw || '').toUpperCase().trim()
  if (s === 'SFLEX' || s === 'S-FLEX' || s === 'SUPERFLEX') return 'S-FLEX'
  if (s === 'D/ST' || s === 'DST') return 'DST'
  if (s === 'CPT' || s === 'CAPTAIN') return 'CPT'
  if (s === 'UTIL' || s === 'UTILITY') return gameType === 'showdown' ? 'UTIL' : 'FLEX'
  if (s === 'FLEX') return 'FLEX'
  if (s === 'QB' || s === 'RB' || s === 'WR' || s === 'TE') return s
  return raw as RosterSlot
}

/* ----------------------- Team meta lookups (Supabase) -------------------- */

type TeamMeta = {
  team_id: number
  abbreviation: string | null
  color: string | null
  alternate_color: string | null
  logos: any | null
}

async function getTeamMetaByDkAbbr(supabase: ReturnType<typeof createServerSupabase>) {
  // Step 1: teams(id, draftkings_abbreviation)
  const { data: teamsRows, error: teamsErr } = await supabase
    .from('teams')
    .select('id, draftkings_abbreviation')
    .not('draftkings_abbreviation', 'is', null)

  if (teamsErr) {
    console.warn('[study-hub] teams query error:', teamsErr)
    return new Map<string, TeamMeta>()
  }
  const ids = (teamsRows ?? []).map(t => t.id)
  if (!ids.length) return new Map<string, TeamMeta>()

  // Step 2: teams_meta
  const { data: metaRows, error: metaErr } = await supabase
    .from('teams_meta')
    .select('team_id, abbreviation, color, alternate_color, logos')
    .in('team_id', ids)

  if (metaErr) {
    console.warn('[study-hub] teams_meta query error:', metaErr)
    return new Map<string, TeamMeta>()
  }

  const metaById = new Map<number, TeamMeta>()
  for (const m of metaRows ?? []) metaById.set(m.team_id, m as TeamMeta)

  const map = new Map<string, TeamMeta>()
  for (const t of teamsRows ?? []) {
    const dk = up(t.draftkings_abbreviation as string)
    const meta = metaById.get(t.id)
    if (dk && meta) map.set(dk, meta)
  }
  return map
}
