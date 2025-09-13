export type Aggression = 'Low' | 'Balanced' | 'Aggressive'

// --- server payload types ---
export type TeamMeta = {
  abbrev: string
  colorHexDex?: string
  colorPrimaryHex?: string
  colorSecondaryHex?: string
  mediumName?: string
  nickName?: string
  shortName?: string
  marketPickPercent?: number // 0-100
}

export type ApiPick = {
  // from backend `picks` rows
  team: string
  opp: string
  isHome: boolean
  gameKey: string
  confidence: number
  rank?: number
  p: number // 0-1 win prob
  pop: number // 0-1 market pick rate
  popPct?: number // 0-100 for UI
  marketPickPercent?: number // 0-100 alias
  value: number
  weekly_edge: number
  season_risk: number
  sharpe_like?: number
}

export type ApiResponse = {
  picks: ApiPick[]
  teams: Record<string, TeamMeta>
  message?: string
}
