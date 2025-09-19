import { useMemo } from 'react'

import {
  biggestWins,
  buildChartData,
  filterRows,
  FilterState,
  groupContests,
  topOnePercent,
} from '../selectors/selectors'
import { GroupRow } from '../types/groupRow'
import { Row } from '../types/row'

export function useBankrollFilters(baseRows: Row[], f: FilterState) {
  return useMemo(() => filterRows(baseRows, f), [f, baseRows])
}

export function useGroupedContests(filtered: Row[]) {
  return useMemo<GroupRow[]>(() => groupContests(filtered), [filtered])
}

export function useChartData(filtered: Row[], by: 'mode' | 'bucket' = 'mode') {
  return useMemo(() => buildChartData(filtered, by), [filtered, by])
}

export function useHeadline(filtered: Row[]) {
  return useMemo(() => {
    const spent = filtered.reduce((s, r) => s + r.entry_fee, 0)
    const won = filtered.reduce((s, r) => s + r.winnings, 0)
    const roi = spent > 0 ? (won - spent) / spent : NaN
    return { spent, won, roi }
  }, [filtered])
}

export const useTopFinishes = (filtered: Row[]) =>
  useMemo(() => topOnePercent(filtered), [filtered])

export const useBiggestWins = (filtered: Row[]) => useMemo(() => biggestWins(filtered), [filtered])
