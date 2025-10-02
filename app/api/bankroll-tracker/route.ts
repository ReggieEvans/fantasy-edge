import { parse } from 'csv-parse/sync'
import { NextRequest, NextResponse } from 'next/server'

import { ContestEntry } from '@/features/bankroll-tracker/types/contestEntry'
import { createServerSupabaseClient } from '@/libs/supabase/server'
export const runtime = 'nodejs' // ensure Node runtime for parsing

export async function GET() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const PAGE_SIZE = 1000
  const HARD_ROW_CAP = 250_000

  const all: ContestEntry[] = []
  let lastDate: string | null = null
  let lastKey: string | null = null

  // Track the most recent uploaded_at we see (ISO string)
  let lastUpdated: string | null = null
  const updateLastUpdated = (iso?: string | null) => {
    if (!iso) return
    if (!lastUpdated || iso > lastUpdated) lastUpdated = iso
  }

  try {
    while (true) {
      let q = supabase
        .from('contest_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('contest_date_est', { ascending: false })
        .order('entry_key', { ascending: true })
        .limit(PAGE_SIZE)

      if (lastDate && lastKey) {
        q = q.or(
          `contest_date_est.lt.${lastDate},and(contest_date_est.eq.${lastDate},entry_key.gt.${lastKey})`,
        )
      }

      const { data: batch, error } = await q
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (!batch || batch.length === 0) break

      // update last_updated while we have the batch in hand
      for (const row of batch as ContestEntry[]) {
        updateLastUpdated(row.uploaded_at as unknown as string)
      }

      all.push(...(batch as ContestEntry[]))

      if (all.length >= HARD_ROW_CAP) {
        return NextResponse.json(
          {
            error: `Row cap of ${HARD_ROW_CAP.toLocaleString()} reached; consider using aggregates or export.`,
            fetched: all.length,
          },
          { status: 413 },
        )
      }

      const last = batch[batch.length - 1] as ContestEntry
      lastDate = last.contest_date_est ?? '1970-01-01T00:00:00.000Z'
      lastKey = last.entry_key
    }

    return NextResponse.json({
      rows: all,
      total: all.length,
      last_updated: lastUpdated,
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const csvBuffer = Buffer.from(await file.arrayBuffer())

  // Map DK headers -> snake_case we expect
  const headerMap: Record<string, string> = {
    Sport: 'sport',
    Game_Type: 'game_type',
    Entry_Key: 'entry_key',
    Entry: 'entry',
    Contest_Key: 'contest_key',
    Contest_Date_EST: 'contest_date_est',
    Place: 'place',
    Points: 'points',
    Winnings_Non_Ticket: 'winnings_non_ticket',
    Winnings_Ticket: 'winnings_ticket',
    Contest_Entries: 'contest_entries',
    Entry_Fee: 'entry_fee',
    Prize_Pool: 'prize_pool',
    Places_Paid: 'places_paid',
  }

  // Helpers
  const toMoney = (v: string | null | undefined) => {
    if (v == null) return null
    const s = String(v).trim()
    if (!s) return null
    const n = Number(s.replace(/[\$,]/g, ''))
    return Number.isFinite(n) ? n : null
  }
  const toNum = (v: string | null | undefined) => {
    if (v == null) return null
    const s = String(v).trim()
    if (!s) return null
    const n = Number(s)
    return Number.isFinite(n) ? n : null
  }
  const toInt = (v: string | null | undefined) => {
    if (v == null) return null
    const s = String(v).trim()
    if (!s) return null
    const n = parseInt(s, 10)
    return Number.isFinite(n) ? n : null
  }
  const toDateISO = (s: string | null | undefined) => {
    if (!s) return null
    // DK strings like "09/16/2024 07:15 PM EDT"
    // Let Date parse common formats; swap to date-fns-tz if you want strict EST handling.
    const d = new Date(s)
    return isNaN(d.getTime()) ? null : d.toISOString()
  }

  // Parse CSV with header normalization
  type Rec = Record<string, string>
  let raw: Rec[]
  try {
    raw = parse(csvBuffer, {
      columns: (hdrs: string[]) => hdrs.map(h => headerMap[h.trim()] ?? h.trim()), // normalize to our keys
      skip_empty_lines: true,
      trim: true,
    })
  } catch (e) {
    return NextResponse.json({ error: 'CSV parse failed', details: String(e) }, { status: 400 })
  }

  // Map to DB rows
  const rows = raw.map(r => ({
    user_id: user.id,
    sport: r.sport || null,
    game_type: r.game_type || null,
    entry_key: r.entry_key || null,
    entry: r.entry || null,
    contest_key: r.contest_key || null,
    contest_date_est: toDateISO(r.contest_date_est),
    place: toInt(r.place),
    points: toNum(r.points),
    winnings_non_ticket: toMoney(r.winnings_non_ticket),
    winnings_ticket: toMoney(r.winnings_ticket),
    contest_entries: toInt(r.contest_entries),
    entry_fee: toMoney(r.entry_fee),
    prize_pool: toMoney(r.prize_pool),
    places_paid: toInt(r.places_paid),
    // uploaded_at defaults in DB
  }))

  // Keep only valid rows (must have entry_key)
  const filtered = rows.filter(r => !!r.entry_key)

  // Replace existing user data
  const { error: delErr } = await supabase.from('contest_entries').delete().eq('user_id', user.id)
  if (delErr) {
    return NextResponse.json(
      { error: 'Failed to clear previous rows', details: delErr.message },
      { status: 500 },
    )
  }

  // Insert in chunks
  const chunk = <T>(arr: T[], size: number) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size),
    )

  for (const batch of chunk(filtered, 1000)) {
    const { error: insErr } = await supabase.from('contest_entries').insert(batch)
    if (insErr) {
      return NextResponse.json({ error: 'Insert failed', details: insErr.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true, inserted: filtered.length, totalParsed: rows.length })
}
