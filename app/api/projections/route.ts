import { parse } from 'csv-parse/sync'
import { NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/libs/supabase/server'
import { normalizeName } from '@/utils/normalizeName'

/* =========================
   Types
========================= */
type AnyCsvRow = Record<string, string | number | undefined>

type CfbRow = {
  'Player Name'?: string
  player_name?: string
  Pnts?: string | number
  Points?: string | number
  Proj?: string | number
} & AnyCsvRow

type NflOwsRow = {
  name?: string
  dk?: string | number
  position?: string
  team?: string
} & AnyCsvRow

type DetectedFormat = 'CFB_GENERIC' | 'NFL_OWS'

/* =========================
   Helpers
========================= */
const toNum = (v: unknown): number | null => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const up = (s?: string) => (s ?? '').trim().toUpperCase()
const isDst = (pos?: string) => {
  const p = up(pos)
  return p === 'DST' || p === 'D/ST' || p === 'DEF'
}

const nicknameFromTeam = (teamRaw: string): string => {
  const parts = teamRaw.trim().split(/\s+/)
  return parts.length ? parts[parts.length - 1] : teamRaw.trim()
}

const dstVariantsFromTeam = (teamRaw: string): string[] => {
  const full = teamRaw.trim()
  const nick = nicknameFromTeam(full)
  return Array.from(
    new Set([
      // common DB naming variants
      full,
      nick,
      `${nick} DST`,
      `${nick} D/ST`,
      `${nick} Defense`,
      `${full} DST`,
      `${full} D/ST`,
      `${full} Defense`,
    ]),
  )
}

function detectFormat(rows: AnyCsvRow[]): DetectedFormat {
  if (!rows.length) return 'CFB_GENERIC'
  const keys = new Set(Object.keys(rows[0]).map(k => k.toLowerCase()))
  // NFL OWS-style (your attached file): has "name" and "dk"
  if (keys.has('name') && keys.has('dk')) return 'NFL_OWS'
  return 'CFB_GENERIC'
}

/** Build a map from normalized name -> projection points (rounded 1 dec). */
function buildCsvMap(csvText: string): Map<string, number> {
  const rows: AnyCsvRow[] = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  const fmt = detectFormat(rows)
  const map = new Map<string, number>()

  if (fmt === 'NFL_OWS') {
    for (const r of rows as NflOwsRow[]) {
      const pts0 = toNum(r.dk)
      if (pts0 == null) continue
      const pts = Number(pts0.toFixed(1))

      if (isDst(r.position)) {
        const teamStr = (r.team ?? r.name ?? '').toString().trim()
        if (!teamStr) continue
        for (const variant of dstVariantsFromTeam(teamStr)) {
          const key = normalizeName(variant)
          if (key) map.set(key, pts)
        }
      } else {
        const name = (r.name ?? '').toString().trim()
        if (!name) continue
        const key = normalizeName(name)
        if (key) map.set(key, pts)
      }
    }
    return map
  }

  // CFB generic (supports several common columns)
  for (const r of rows as CfbRow[]) {
    const rawName = r['Player Name'] ?? r.player_name
    const rawPts = r.Pnts ?? r.Points ?? r.Proj
    if (!rawName) continue
    const pts0 = toNum(rawPts)
    if (pts0 == null) continue
    const key = normalizeName(String(rawName))
    if (!key) continue
    map.set(key, Number(pts0.toFixed(1)))
  }

  return map
}

/* =========================
   Route
========================= */
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slateId, csvText }: { slateId: string; csvText: string } = await req.json()

    if (!slateId || !csvText) {
      return NextResponse.json({ error: 'Missing slateId or csvText' }, { status: 400 })
    }

    // 1) Parse & map CSV → name->points
    const csvMap = buildCsvMap(csvText)

    // 2) Fetch slate players (only fields we truly need)
    const { data: players, error: fetchErr } = await supabase
      .from('slate_players')
      .select('id, full_name')
      .eq('slate_id', slateId)

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 })
    }

    // 3) Build index by normalized full_name
    const playerIndex = new Map<string, { id: string; full_name: string }>()
    for (const p of players ?? []) {
      const key = normalizeName(p.full_name)
      if (key) playerIndex.set(key, { id: p.id, full_name: p.full_name })
    }

    // 4) Match + collect updates
    const updates: Array<{ id: string; projection: number }> = []
    const matched: Array<{ name: string; points: number }> = []
    const unmatchedCsv: string[] = []

    for (const [key, val] of csvMap.entries()) {
      const hit = playerIndex.get(key)
      if (hit) {
        const projection = Number(val.toFixed(1))
        updates.push({ id: hit.id, projection })
        matched.push({ name: hit.full_name, points: projection })
      } else {
        unmatchedCsv.push(key)
      }
    }

    // 5) Nothing to update?
    if (updates.length === 0) {
      return NextResponse.json({
        updated: 0,
        matched: [],
        unmatchedCsv,
        message: 'No matches found between CSV and slate_players.',
      })
    }

    // 6) Upsert projections
    const { error: upsertErr } = await supabase
      .from('slate_players')
      .upsert(updates, { onConflict: 'id', ignoreDuplicates: false })

    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message }, { status: 500 })
    }

    // 7) Flag slate as having projections (non-fatal if this fails)
    const { error: flagErr } = await supabase
      .from('user_slates')
      .update({ has_projections: true })
      .eq('id', slateId)

    if (flagErr) {
      // Log only, do not fail the response
      console.error('Failed to set has_projections', flagErr.message)
    }

    return NextResponse.json({
      updated: updates.length,
      matched,
      unmatchedCsv,
    })
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
