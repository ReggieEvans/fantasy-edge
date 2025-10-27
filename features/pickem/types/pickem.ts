export type Aggression = 'Low' | 'Balanced' | 'Aggressive'

export type TeamMeta = {
  abbrev: string
  colorHexDex?: string
  colorPrimaryHex?: string
  colorSecondaryHex?: string
  mediumName?: string
  nickName?: string
  shortName?: string
  marketPickPercent?: number
}

export type ApiPick = {
  team: string
  opp: string
  isHome: boolean
  gameKey: string
  confidence: number
  rank?: number
  p: number
  pop: number
  popPct?: number
  marketPickPercent?: number
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
