export type Slot =
  | 'QB'
  | 'RB'
  | 'WR'
  | 'TE'
  | 'FLEX'
  | 'SFLX'
  | 'DST'
  | 'CPT'
  | 'UTIL' // Showdown
  | string

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
  slotOrder: readonly Slot[] // e.g. ['QB','RB','RB','WR','WR','WR','FLEX','SFLX']
  filename?: string // default: lineups.csv
  valueFormatter?: (p?: ExportPlayer) => string // default: "Name (ID)"
}
