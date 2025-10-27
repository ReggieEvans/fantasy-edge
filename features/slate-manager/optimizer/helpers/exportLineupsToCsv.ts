import { ExportLineup, ExportOptions, ExportPlayer, Slot } from '../types'

export function exportLineupsToCsv(lineups: ExportLineup[], opts: ExportOptions) {
  const {
    slotOrder,
    filename = 'lineups.csv',
    valueFormatter = (p?: ExportPlayer) => {
      if (!p) return ''
      return p.fe_draftable_id ? `${p.name} (${p.fe_draftable_id})` : p.name
    },
  } = opts

  const lineupValueForSlot = (lu: ExportLineup, slot: Slot) => {
    if (lu.slots) {
      if (lu.slots[slot]) return lu.slots[slot]
      const numbered = Object.entries(lu.slots)
        .filter(([k]) => k.toUpperCase().startsWith(slot.toUpperCase()))
        .sort(([a], [b]) => a.localeCompare(b))
      if (numbered.length) {
        const [, p] = numbered.shift()!
        return p
      }
    }
    if (lu.players?.length) {
      const idx = lu.players.findIndex(p => p.lineup_position.toUpperCase() === slot.toUpperCase())
      if (idx >= 0) return lu.players.splice(idx, 1)[0]
      if (slot === 'UTIL') {
        const j = lu.players.findIndex(
          p => p.pos.toUpperCase() === 'UTIL' || p.pos.toUpperCase() === 'FLEX',
        )
        if (j >= 0) return lu.players.splice(j, 1)[0]
      }
    }
    return undefined
  }

  const headers = [...slotOrder]
  const escape = (v: string) => {
    if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`
    return v
  }

  const rows: string[] = []
  rows.push(headers.join(','))

  for (const lineup of lineups.map(l => ({
    ...l,
    players: l.players ? [...l.players] : undefined,
  }))) {
    const values = headers.map(slot => escape(valueFormatter(lineupValueForSlot(lineup, slot))))
    rows.push(values.join(','))
  }

  const csv = '\uFEFF' + rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
