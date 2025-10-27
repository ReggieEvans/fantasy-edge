export interface DkSlate {
  draftGroupId: number
  contestTypeId: number
  sport: string
  gameType: string
  minStartTime: string
  maxStartTime: string
  startTimeSuffix?: string
}

export interface DkSlateSelection {
  allTags: string[]
  draftGroupId: number
  contestTypeId: number
  sport: string
  gameType: string
  minStartTime: string
  maxStartTime: string
  startTimeSuffix?: string
  leagues: {
    leagueName: string
  }[]
  games: {
    gameId: number
    description: string
  }[]
}
