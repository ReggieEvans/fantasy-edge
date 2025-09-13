import { TeamRoster } from './player'
import { TeamStats } from './stats'

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

export type Matchup = {
  away_team_abbr: string
  away_team_city: string
  away_team_id: string | null
  away_team_logo: string
  away_team_name: string
  away_team_spread: number | null
  away_team_total: number | null
  game_total: number | null
  home_team_abbr: string
  home_team_city: string
  home_team_id: string | null
  home_team_logo: string
  home_team_name: string
  home_team_spread: number | null
  home_team_total: number | null
  id: string
  name: string
  slate_id: string
  sport: string
  sport_id: number
  start_time: string
  tv_network: string | null
  venue: string
}
