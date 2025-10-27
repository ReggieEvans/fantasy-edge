export type Slot = 'QB' | 'RB' | 'WR' | 'TE' | 'FLEX' | 'SFLX' | 'DST' | 'CPT' | 'UTIL' | string

export type ExportPlayer = {
  id?: string | number
  name: string
  pos: Slot
  lineup_position: string
  fe_draftable_id: string
}

export type ExportLineup = {
  slots?: Record<string, ExportPlayer | undefined>
  players?: ExportPlayer[]
}

export type ExportOptions = {
  slotOrder: readonly Slot[]
  filename?: string
  valueFormatter?: (p?: ExportPlayer) => string
}
