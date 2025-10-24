import { ExportLineup, ExportOptions, ExportPlayer, Slot } from '../../shared/types/exportTypes'

export function exportLineupsToCsv(lineups: ExportLineup[], opts: ExportOptions) {
  const {
    slotOrder,
    filename = 'lineups.csv',
    valueFormatter = (p?: ExportPlayer) => {
      if (!p) return ''
      return p.fe_draftable_id ? `${p.name} (${p.fe_draftable_id})` : p.name
    },
  } = opts

  // Build a lookup for each lineup: for duplicate slots we consume in order (RB, RB, etc.)
  const lineupValueForSlot = (lu: ExportLineup, slot: Slot) => {
    if (lu.slots) {
      // Prefer explicit keys first (e.g. WR1/WR2) then fall back to matching pos
      if (lu.slots[slot]) return lu.slots[slot]
      // Try WR1/WR2 style
      const numbered = Object.entries(lu.slots)
        .filter(([k]) => k.toUpperCase().startsWith(slot.toUpperCase()))
        .sort(([a], [b]) => a.localeCompare(b))
      if (numbered.length) {
        const [, p] = numbered.shift()!
        return p
      }
    }
    if (lu.players?.length) {
      // Consume players by matching position in encounter order
      const idx = lu.players.findIndex(p => p.lineup_position.toUpperCase() === slot.toUpperCase())
      if (idx >= 0) return lu.players.splice(idx, 1)[0] // consume once
      // Showdown: many sources use UTIL for all non-captain slots
      if (slot === 'UTIL') {
        const j = lu.players.findIndex(
          p => p.pos.toUpperCase() === 'UTIL' || p.pos.toUpperCase() === 'FLEX',
        )
        if (j >= 0) return lu.players.splice(j, 1)[0]
      }
    }
    return undefined
  }

  const headers = [...slotOrder] // allow duplicate headers (e.g., RB, RB)
  const escape = (v: string) => {
    // Quote if comma, quote, or newline; double internal quotes
    if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`
    return v
  }

  const rows: string[] = []
  rows.push(headers.join(',')) // header row

  for (const lineup of lineups.map(l => ({
    // Work on a shallow copy so we can "consume" players
    ...l,
    players: l.players ? [...l.players] : undefined,
  }))) {
    const values = headers.map(slot => escape(valueFormatter(lineupValueForSlot(lineup, slot))))
    rows.push(values.join(','))
  }

  const csv = '\uFEFF' + rows.join('\n') // BOM for Excel/Sheets
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
