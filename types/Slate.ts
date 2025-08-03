export interface Slate {
  id: string
  user: string
  draftGroup: {
    draftGroupId: number
    contestType: {
      contestTypeId: number
      sport: string
      gameType: string
      allowLateSwap: boolean
    }
    minStartTime: string
    startTimeSuffix?: string
  }
  games: Array<{
    competitionId: string
    sport: string
    sportId: number
    homeTeam: {
      teamId: number
      teamName: string
      abbreviation: string
      city: string
      logo: string
    }
    awayTeam: {
      teamId: number
      teamName: string
      abbreviation: string
      city: string
      logo: string
    }
    awayTeamTargets: number
    homeTeamTargets: number
  }>
  players: Array<{
    draftableId: number
    firstName: string
    lastName: string
    displayName: string
    position: string
    salary: number
    teamId: number
    _projection?: number
    _ownership?: number
  }>
  projectionsSubmitted: boolean
  min_start_time: string
  createdAt: string
  updatedAt: string
}

export interface SlateMatchups {
  _id: string
  draftGroup: {
    minStartTime: string
    startTimeSuffix?: string
  }
  games: Array<{
    _id: string
    competitionId: string
    sport: string
    sportId: number
    startTime: string
    name: string
    venue: string
    startingLineupsAvailable: boolean
    depthChartsAvailable: boolean
    competitionState: string
    competitionStateDetail: string
    competitionStartedEarly: boolean
    competitionAttributes: Array<{
      typeId: number
      value: string
    }>
    homeTeamSpread: number
    awayTeamSpread: number
    homeTeamTotal: number
    awayTeamTotal: number
    gameTotal: number
    homeTeam: {
      teamId: number
      teamName: string
      abbreviation: string
      city: string
      logo: string
    }
    awayTeam: {
      teamId: number
      teamName: string
      abbreviation: string
      city: string
      logo: string
    }
    awayTeamTargets: number
    homeTeamTargets: number
  }>
}
