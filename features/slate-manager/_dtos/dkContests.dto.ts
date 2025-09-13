export interface DkContestsResponseDTO {
    SelectedSport: string,
    SelectedSportId: number,
    Contests: DkContestDTO[]
    Tournaments: [],
    UserPrizes: {
      ActiveTickets: [],
      Crowns: number
    },
    DraftGroups: [
        {
            DraftGroupId: number,
            ContestTypeId: number,
            StartDate: string,
            StartDateEst: string,
            SortOrder: number,
            DraftGroupTag: string,
            GameTypeId: number,
            GameType: string,
            SportSortOrder: number,
            Sport: string,
            SportId: number,
            GameCount: number,
            ContestStartTimeSuffix: string,
            ContestStartTimeType: number,
            Games: string,
            DraftGroupSeriesId: number,
            GameSetKey: string,
            AllowUGC: boolean
          },
    ]
    GameSets: [
      {
        GameSetKey: string,
        ContestStartTimeSuffix: string,
        Competitions: [
          {
            GameId: number,
            AwayTeamId: number,
            HomeTeamId: number,
            HomeTeamScore: number,
            AwayTeamScore: number,
            HomeTeamCity: string,
            AwayTeamCity: string,
            HomeTeamName: string,
            AwayTeamName: string,
            StartDate: string,
            Location: string,
            LastPlay: string,
            TeamWithPossession: number,
            TimeRemainingStatus: string,
            Sport: string,
            Status: string,
            Description: string,
            FullDescription: string,
            ExceptionalMessages: string[],
            SeriesType: number,
            NumberOfGamesInSeries: number,
            SeriesInfo: string,
            HomeTeamCompetitionOrdinal: number,
            AwayTeamCompetitionOrdinal: number,
            HomeTeamCompetitionCount: number,
            AwayTeamCompetitionCount: number
          }
        ],
        GameStyles: [
          {
            GameStyleId: number,
            SportId: number,
            SortOrder: number,
            Name: string,
            Abbreviation: string,
            Description: string,
            IsEnabled: boolean,
            Attributes: string[],
          }
        ],
        SortOrder: number,
        MinStartTime: string,
        Tag: string
      }
    ],
    GameTypes: [
      {
        GameTypeId: number,
        Name: string,
        Description: string,
        Tag: string,
        SportId: number,
        DraftType: string,
        GameStyle: {
          GameStyleId: number,
          SportId: number,
          SortOrder: number,
          Name: string,
          Abbreviation: string,
          Description: string,
          IsEnabled: boolean,
          Attributes: string[]
        },
        IsSeasonLong: boolean
      },
    ],
    DirectChallengeModal: null,
    DepositTransaction: null,
    ShowRafLink: boolean,
    PrizeRedemptionModel: null,
    PrizeRedemptionPop: boolean,
    UseRaptorHeadToHead: boolean,
    UseJSWebLobbyModals: boolean,
    SportMenuItems: null,
    UserGeoLocation: null,
    ShowAds: boolean,
    IsVip: null,
    AdsEnabled: boolean
  }

  export interface DkContestDTO {
    uc: number,
    ec: number,
    mec: number,
    fpp: number,
    s: number,
    n: string,
    attr: {
        IsGuaranteed: string,
        IsStarred: string
    },
    nt: number,
    m: number,
    a: number,
    po: number,
    pd: {
        Cash: string
    },
    tix: boolean,
    sdstring: string,
    sd: string,
    id: number,
    tmpl: number,
    pt: number,
    so: number,
    fwt: boolean,
    isOwner: boolean,
    startTimeType: number,
    dg: number,
    ulc: number,
    cs: number,
    gameType: string,
    ssd: string,
    dgpo: number,
    cso: number,
    ir: number,
    rl: boolean,
    rlc: number,
    rll: number,
    sa: boolean,
    freeWithCrowns: boolean,
    crownAmount: number,
    isBonusFinalized: boolean,
    isSnakeDraft: boolean,
    payoutDescriptionMetadata: [
        {
        PayoutDescriptionType: number,
        Order: number,
        PayoutDescription: string,
        Quantity: number,
        Value: number
        }
    ],
    crownsAwarded: number
}