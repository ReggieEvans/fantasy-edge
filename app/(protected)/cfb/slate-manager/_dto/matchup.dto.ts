import { Matchup } from "../_types/matchup"
import { TeamRoster } from "../_types/player"
import { TeamStats } from "../_types/stats"

export interface MatchupDTO {
  matchup: Matchup

  // Rosters
  homeRoster: TeamRoster
  awayRoster: TeamRoster

  // Team stats
  passingDefense: { home: TeamStats; away: TeamStats }
  rushingDefense: { home: TeamStats; away: TeamStats }
  passingRate: { home: TeamStats; away: TeamStats }
  rushingRate: { home: TeamStats; away: TeamStats }
  teamPassing: { home: TeamStats; away: TeamStats }
  teamRushing: { home: TeamStats; away: TeamStats }
}


