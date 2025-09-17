/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DraftableMap } from '@/shared/types/study-hub/types'

export function normalizeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function mapDraftablesByPlayer(draftables: any[]): DraftableMap {
  const byName = new Map<
    string,
    { displayName: string; salary: number; position: string; teamAbbreviation?: string | null }
  >()
  for (const d of draftables) {
    const displayName = d.displayName || `${d.firstName} ${d.lastName}`
    const key = normalizeName(displayName)
    const salary = Number(d.salary ?? 0)
    const position = d.position || null
    const teamAbbreviation = d.teamAbbreviation ?? null
    // prefer highest salary if duplicates appear for multiple roster slots
    const existing = byName.get(key)
    if (!existing || salary > existing.salary) {
      byName.set(key, { displayName, salary, position, teamAbbreviation })
    }
  }
  return { byName }
}

export function expectedFromSalary(salaryDollars: number, baselineDollarsPerPoint: number): number {
  if (!baselineDollarsPerPoint) return 0
  return Number((salaryDollars / baselineDollarsPerPoint).toFixed(2))
}

export function valueIcon(actual: number, expected: number): '🔥' | '❄️' | '•' {
  if (actual >= expected * 1.1) return '🔥' // beat expectation by 10%+
  if (actual <= expected * 0.9) return '❄️' // missed by 10%+
  return '•' // around expectation
}
