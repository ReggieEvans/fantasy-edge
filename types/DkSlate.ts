export interface DkSlate {
  _id: string;
  user: string;
  draftGroup: {
    draftGroupId: number;
    contestType: {
      contestTypeId: number;
      sport: string;
      gameType: string;
      allowLateSwap: boolean;
    };
    minStartTime: string;
    startTimeSuffix?: string;
  };
  games: Array<{
    competitionId: string;
    sport: string;
    sportId: number;
    homeTeam: {
      teamId: number;
      teamName: string;
      abbreviation: string;
      city: string;
      logo: string;
    };
    awayTeam: {
      teamId: number;
      teamName: string;
      abbreviation: string;
      city: string;
      logo: string;
    };
  }>;
  players: Array<{
    draftableId: number;
    firstName: string;
    lastName: string;
    displayName: string;
    position: string;
    salary: number;
    teamId: number;
    _projection?: number;
    _ownership?: number;
  }>;
  gameType: string;
  projectionsSubmitted: boolean;
  createdAt: string;
  updatedAt: string;
}
