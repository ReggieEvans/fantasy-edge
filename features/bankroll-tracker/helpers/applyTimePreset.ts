import { ContestRow } from '../types/contestRow'
import { seasonForDate } from './seasonForData'

export type TimePreset = 'last-3' | 'last-7' | 'last-30' | 'season' | 'all'

export const applyTimePreset = (rows: ContestRow[], preset: TimePreset) => {
  const now = new Date()
  const since = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  if (preset === 'all') return rows
  if (preset === 'season') {
    const thisSeason = seasonForDate(now)
    return rows.filter(r => r.season === thisSeason)
  }
  const map: Record<Exclude<TimePreset, 'all' | 'season'>, number> = {
    'last-3': 3,
    'last-7': 7,
    'last-30': 30,
  }
  const start = since(map[preset])
  return rows.filter(r => new Date(r.dt) >= start)
}
