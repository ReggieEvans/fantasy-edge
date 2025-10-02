import { Row } from '../types/row'
import { bucketOf, modeOf, seasonFor, ymd } from '../utils'

export type DbRow = {
  sport: string | null
  game_type: string | null
  entry: string | null
  contest_key: string | null
  contest_date_est: string | null // ISO string
  place: number | null
  points: number | null
  winnings_non_ticket: number | null
  winnings_ticket: number | null
  contest_entries: number | null
  entry_fee: number | null
  prize_pool: number | null
  places_paid: number | null
}

export function organizeContestEntries(dbRows: DbRow[]): Row[] {
  return (dbRows || []).map(r => {
    const dIso = r.contest_date_est ?? null
    const d = dIso ? new Date(dIso) : null

    const sport = String(r.sport || '')
      .toUpperCase()
      .trim()
    const entryFee = r.entry_fee ?? 0
    const winnings = r.winnings_non_ticket ?? 0

    return {
      sport,
      game_type: String(r.game_type || ''),
      entry_name: String(r.entry || ''),
      contest_key: String(r.contest_key || ''),
      dt: dIso || '', // ISO datetime
      date: d ? ymd(d) : '', // your ymd(Date) util
      place: r.place ?? null,
      points: r.points ?? null,
      winnings, // numeric
      winnings_ticket: r.winnings_ticket ?? 0,
      entries: r.contest_entries ?? null,
      entry_fee: entryFee,
      prize_pool: r.prize_pool ?? null,
      places_paid: r.places_paid ?? null,

      season: d ? seasonFor(d) : '',
      mode: modeOf(String(r.game_type || '')),
      contest_bucket: bucketOf(String(r.entry || ''), r.contest_entries ?? undefined),
      profit: winnings - entryFee,
    }
  })
}
