import { useMemo, useState } from 'react'

import { TargetPool } from '@/features/slate-manager/_types/targetPool'

type SortKey = 'target_type' | 'position' | 'salary' | 'projection'

const GROUP_ORDERS: Record<SortKey, string[]> = {
  // projection: highest ➜ lowest
  projection: ['20+', '10+', '0-9'],
  // salary: High ➜ Mid ➜ Low
  salary: ['High Salary', 'Mid Salary', 'Low Salary'],
  // positions in football order
  position: ['QB', 'RB', 'WR', 'TE', 'DST'],
  // custom taxonomy
  target_type: ['top', 'fade', 'bargain', 'pivot', 'cash', 'gpp', 'lock', 'injury', 'no type'],
}

const normalize = (key: SortKey, label: string) =>
  key === 'target_type' ? label.toLowerCase() : label

const rank = (key: SortKey, label: string) => {
  const order = GROUP_ORDERS[key]
  const i = order.findIndex(x => normalize(key, x) === normalize(key, label))
  return i === -1 ? Number.MAX_SAFE_INTEGER : i
}

export default function useTargetPoolControls(targets: TargetPool[]) {
  const [filterPosition, setFilterPosition] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('target_type')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // 1) filter
  const filteredTargets = useMemo(() => {
    if (!filterPosition) return targets
    return targets.filter(t => t.position === filterPosition)
  }, [filterPosition, targets])

  // 2) group (and label) by the chosen sortKey
  const groupedTargets = useMemo(() => {
    const groups: Record<string, TargetPool[]> = {}

    filteredTargets.forEach(t => {
      let groupKey = ''

      switch (sortKey) {
        case 'target_type': {
          const raw = (t.target_type ?? 'no type').toLowerCase()
          // Title-case for display, lower-case used only for ordering
          groupKey =
            raw === 'gpp'
              ? 'GPP'
              : raw === 'no type'
                ? 'No Type'
                : raw.charAt(0).toUpperCase() + raw.slice(1)
          break
        }
        case 'position':
          groupKey = t.position // e.g. QB/RB/WR/TE/DST
          break
        case 'salary':
          groupKey =
            t.salary >= 7000 ? 'High Salary' : t.salary >= 5000 ? 'Mid Salary' : 'Low Salary'
          break
        case 'projection': {
          const proj = t.projection ?? 0
          groupKey = proj >= 20 ? '20+' : proj >= 10 ? '10+' : '0-9'
          break
        }
      }

      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(t)
    })

    // 3) sort groups using explicit order (flip if desc)
    const cmp = ([a]: [string, TargetPool[]], [b]: [string, TargetPool[]]) => {
      const base = rank(sortKey, a) - rank(sortKey, b) || a.localeCompare(b)
      return sortOrder === 'asc' ? base : -base
    }

    const sortedGroups = Object.entries(groups).sort(cmp)

    return sortedGroups
  }, [filteredTargets, sortKey, sortOrder])

  return {
    filterPosition,
    setFilterPosition,
    sortKey,
    setSortKey,
    sortOrder,
    setSortOrder,
    groupedTargets,
  }
}
