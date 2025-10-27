export type LineupPlayer = {
  name: string
  pos: 'QB' | 'RB' | 'WR' | 'TE' | 'FLEX' | 'DST' | 'CPT'
  position: string | null
  salary: number | null
  expected: number | null
  actual: number | null
  icon: string | null
}
