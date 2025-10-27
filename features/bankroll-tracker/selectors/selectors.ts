import { Bucket } from '../types/bucket'
import { GroupRow } from '../types/groupRow'
import { Mode } from '../types/mode'
import { Row } from '../types/row'
import { cleanName } from '../utils'

export type FilterState = {
  season: string | 'all'
  timePreset: 'season' | 'last-3' | 'last-7' | 'last-30' | 'all'
  modes: Mode[]
  buckets: Bucket[]
  sports: ('NFL' | 'CFB')[]
}

export function filterRows(base: Row[], f: FilterState): Row[] {
  let b = base
  const sset = new Set(f.sports)
  b = b.filter(r => sset.has(r.sport as 'NFL' | 'CFB'))
  if (f.season !== 'all') b = b.filter(r => r.season === f.season)

  const now = new Date()
  const since = (d: number) => new Date(now.getTime() - d * 86400000)
  if (f.timePreset === 'last-3') b = b.filter(r => new Date(r.dt) >= since(3))
  if (f.timePreset === 'last-7') b = b.filter(r => new Date(r.dt) >= since(7))
  if (f.timePreset === 'last-30') b = b.filter(r => new Date(r.dt) >= since(30))

  const mset = new Set(f.modes)
  b = b.filter(r => mset.has(r.mode))
  const bset = new Set(f.buckets)
  b = b.filter(r => bset.has(r.contest_bucket))
  return b.sort((a, c) => (a.dt < c.dt ? 1 : -1))
}

export function groupContests(filtered: Row[]): GroupRow[] {
  const map = new Map<string, Row[]>()
  for (const r of filtered) {
    if (!map.has(r.contest_key)) map.set(r.contest_key, [])
    map.get(r.contest_key)!.push(r)
  }
  const out: GroupRow[] = []
  for (const [k, arr] of map) {
    arr.sort((a, b) => (a.dt < b.dt ? 1 : -1))
    const f = arr[0]
    const spent = arr.reduce((s, r) => s + r.entry_fee, 0)
    const won = arr.reduce((s, r) => s + r.winnings, 0)
    const profit = won - spent
    const roi = spent > 0 ? profit / spent : 0
    const points = arr.map(r => r.points).filter((v): v is number => v != null)
    const top = points.length ? Math.max(...points) : null
    const low = points.length ? Math.min(...points) : null
    const avg = points.length
      ? Number((points.reduce((a, b) => a + b, 0) / points.length).toFixed(2))
      : null
    const top1 = arr.filter(
      r =>
        r.place != null && r.entries != null && (r.place as number) / (r.entries as number) <= 0.01,
    ).length
    const best = arr.reduce((mx, r) => Math.max(mx, r.winnings), 0)
    out.push({
      contest_key: k,
      date: f.date,
      sport: f.sport,
      mode: f.mode,
      contest_bucket: f.contest_bucket,
      contest_name: cleanName(f.entry_name),
      my_entries: arr.length,
      field_size: f.entries ?? null,
      spent,
      won,
      profit,
      roi,
      top_score: top,
      low_score: low,
      avg_score: avg,
      top1pct_count: top1,
      best_payout: best,
    })
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function buildChartData(
  filtered: Row[],
  by: 'mode' | 'bucket' = 'mode',
): { seriesKeys: string[]; chartData: Array<Record<string, number | string>> } {
  const groups = new Set<string>()
  const daily: Record<string, Record<string, number>> = {}

  for (const r of filtered) {
    const key = (by === 'mode' ? r.mode : r.contest_bucket) as string
    groups.add(key)
    daily[r.date] ??= {}
    daily[r.date][key] = (daily[r.date][key] || 0) + r.profit
  }

  const dates = Object.keys(daily).sort()
  const running: Record<string, number> = {}
  const rows: Array<Record<string, number | string>> = []

  for (const d of dates) {
    const row: Record<string, number | string> = { date: d }
    for (const g of groups) {
      running[g] = (running[g] || 0) + (daily[d][g] || 0)
      row[g] = running[g]
    }
    rows.push(row)
  }

  return { seriesKeys: Array.from(groups), chartData: rows }
}

export const topOnePercent = (rows: Row[]) =>
  rows.filter(
    r =>
      r.place != null && r.entries != null && (r.place as number) / (r.entries as number) <= 0.01,
  )

export const biggestWins = (rows: Row[]) => [...rows].sort((a, b) => b.winnings - a.winnings)
