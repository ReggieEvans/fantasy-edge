export interface DkSlateDTO {
    draftGroup: {
      allTags: string[]
      draftGroupId: number
      gameTypeId: number
      contestType: {
        contestTypeId: number
        sport: string
        gameType: string
        allowLateSwap: boolean
      }
      sportId: number
      startTimeType: string
      minStartTime: string
      maxStartTime: string
      startTimeSuffix: string
      draftGroupState: string
      allowUgc: boolean
      leagues: {
        leagueId: number
        leagueName: string
        leagueAbbreviation: string
      }[]
      games: {
        gameId: number
        awayTeamId: number
        homeTeamId: number
        startDate: string
        location: string
        timeRemainingStatus: string
        sport: string
        status: string
        description: string
        sportSpecificData: {
          timeRemaining: string
          homeTeamScore: string
          awayTeamScore: string
          quarter: string
        }
        league: string
        competitionStatus: string
        competitionStatusDetail: string
        gameAttributes: {
          typeId: number
          value: string
        }[]
      }[]
    }
    errorStatus: object
    responseStatus: object
  }
  
  export interface DkDraftableDTO {
    draftableId: number
    firstName: string
    lastName: string
    displayName: string
    shortName: string
    playerId: number
    playerDkId: number
    position: string
    rosterSlotId: number
    salary: number
    status: string
    isSwappable: boolean
    isDisabled: boolean
    newsStatus: string
    playerImage50: string
    playerImage160: string
    altPlayerImage50: string
    altPlayerImage160: string
    competition: {
      competitionId: number
      name: string
      nameDisplay: {
        value: string
        isEmphasized: boolean
      }[]
      startTime: string
    }
    competitions: {
      competitionId: number
      name: string
      nameDisplay: {
        value: string
        isEmphasized: boolean
      }[]
      startTime: string
    }[]
  
    draftStatAttributes: {
      id: number
      value: string
      sortValue: string
      quality: string
    }[]
  
    playerAttributes: []
    teamLeagueSeasonAttributes: []
    playerGameAttributes: []
    teamId: number
    teamAbbreviation: string
    draftAlerts: []
    playerGameHash: string
    externalRequirements: object
  }
  