import { parse } from 'csv-parse/sync'
import { NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/libs/supabase/server'
import { normalizeName } from '@/utils/normalizeName'

type CsvRow = {
  'Player Name'?: string // exact column in CSV
  player_name?: string
  Pnts?: string | number
  Points?: string | number
  Proj?: string | number
  [key: string]: string | number | undefined
}

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

    const { slateId, csvText } = await req.json()
    if (!slateId || !csvText) {
      return NextResponse.json({ error: 'Missing slateId or csvText' }, { status: 400 })
    }

    // parse CSV
    const records: CsvRow[] = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    // build CSV name -> points map
    const csvMap = new Map<string, number>()
    for (const row of records) {
      const rawName = row['Player Name'] ?? row['player_name']
      const rawPnts = row['Pnts'] ?? row['Points'] ?? row['Proj']
      if (!rawName) continue
      const key = normalizeName(String(rawName))
      const val = Number(rawPnts)
      if (!Number.isFinite(val)) continue
      csvMap.set(key, val)
    }

    // fetch target slate players for this user + slate
    const { data: players, error: fetchErr } = await supabase
      .from('slate_players')
      .select('id, full_name')
      //   .eq('user_id', user.id)
      .eq('slate_id', slateId)

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 })
    }

    // match and prepare upserts
    const updates: Array<{ id: string; projection: number }> = []
    const unmatchedCsv: string[] = []
    const matched: Array<{ name: string; points: number }> = []

    // index slate players by normalized full_name
    const playerIndex = new Map<string, { id: string; full_name: string }>()
    for (const p of players ?? []) {
      playerIndex.set(normalizeName(p.full_name), { id: p.id, full_name: p.full_name })
    }

    // walk CSV rows and match
    for (const [key, val] of csvMap.entries()) {
      const hit = playerIndex.get(key)
      if (hit) {
        updates.push({ id: hit.id, projection: Number(val.toFixed(1)) })
        matched.push({ name: hit.full_name, points: Number(val.toFixed(1)) })
      } else {
        unmatchedCsv.push(key)
      }
    }

    // nothing to update?
    if (updates.length === 0) {
      return NextResponse.json({
        updated: 0,
        matched: [],
        unmatchedCsv,
        message: 'No matches found between CSV and slate_players.',
      })
    }

    // batch upsert by primary key id (sets projection per row)
    const { error: upsertErr } = await supabase
      .from('slate_players')
      .upsert(updates, { onConflict: 'id', ignoreDuplicates: false })

    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message }, { status: 500 })
    }

    const { error: flagErr } = await supabase.from('user_slates').update({ has_projections: true }).eq('id', slateId)

    if (flagErr) {
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
