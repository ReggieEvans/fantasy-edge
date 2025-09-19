/* eslint-disable @typescript-eslint/no-explicit-any */
import { Bucket } from '../types/bucket'
import { Mode } from '../types/mode'
import { Row } from '../types/row'

export const money = (v: any) => {
  const s = String(v ?? '').replace(/[$,]/g, '')
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

export const intish = (v: any) => {
  if (v == null || v === '') return null
  const n = Number(String(v).replace(/,/g, ''))
  return Number.isFinite(n) ? Math.trunc(n) : null
}

export const parseDate = (s: string) => {
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

export const ymd = (d: Date) => d.toISOString().slice(0, 10)

export const seasonFor = (d: Date) =>
  d >= new Date(d.getFullYear(), 7, 1)
    ? `${d.getFullYear()}-${String((d.getFullYear() + 1) % 100).padStart(2, '0')}`
    : `${d.getFullYear() - 1}-${String(d.getFullYear() % 100).padStart(2, '0')}`

export const modeOf = (gt: string): Mode => (/showdown|captain/i.test(gt) ? 'Showdown' : 'Classic')

export const bucketOf = (name: string, entries?: number | null): Bucket => {
  const s = (name || '').toLowerCase()
  if (
    s.includes('double up') ||
    s.includes('50/50') ||
    s.includes('50-50') ||
    s.includes('50 - 50') ||
    s.includes('vs.')
  )
    return 'Cash'
  if (s.includes('booster') || s.includes('triple up')) return 'Cash+'
  if (s.includes('harris')) return 'Harris'
  if (s.includes('winner takes all') || s.includes('winner take all')) return 'WTA'
  if (
    s.includes('single entry') ||
    s.includes('single-entry') ||
    s.includes('3 entry max') ||
    s.includes('3-entry max') ||
    s.includes('3 max')
  )
    return (entries ?? 0) >= 5000 ? 'Lg SE' : 'Sm SE'
  if (
    s.includes('20 entry max') ||
    s.includes('20-entry max') ||
    s.includes('20 max') ||
    s.includes('dime package') ||
    s.includes('quarter jukebox') ||
    s.includes('dime time') ||
    s.includes('first down')
  )
    return (entries ?? 0) >= 10000 ? 'Lg 20 Max' : 'Sm 20 Max'
  return 'Other'
}

export const cleanName = (s: string) => {
  const m = /^(.*?)(?:\s*\(\d+\/\d+\))?\s*$/.exec(s || '')
  return (m?.[1] || s).replace(/\($/, '').trim()
}

export const finishPct = (r: Row) =>
  r.place != null && r.entries != null ? r.place / r.entries : Number.POSITIVE_INFINITY

export const $ = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
