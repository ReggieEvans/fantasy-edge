export type MatchupResponse = {
  awayRoster: Record<string, any[]>
  homeRoster: Record<string, any[]>
  matchup: Matchup
  passingRate: {
    home: Record<string, any>
    away: Record<string, any>
  }
  rushingRate: {
    home: Record<string, any>
    away: Record<string, any>
  }
  teamPassing: {
    home: Record<string, any>
    away: Record<string, any>
  }
  teamRushing: {
    home: Record<string, any>
    away: Record<string, any>
  }
  passingDefense: {
    home: Record<string, any>
    away: Record<string, any>
  }
  rushingDefense: {
    home: Record<string, any>
    away: Record<string, any>
  }
}

export type Matchup = {
  away_team_abbr: string
  away_team_city: string
  away_team_id: string | null
  away_team_logo: string
  away_team_name: string
  away_team_spread: number
  away_team_total: number
  competition_started_early: boolean
  competition_state: string
  competition_state_detail: string
  competitionAttributes: CompetitionAttributes[]
  depth_charts_available: boolean
  game_total: number
  home_team_abbr: string
  home_team_city: string
  home_team_id: string | null
  home_team_logo: string
  home_team_name: string
  home_team_spread: number
  home_team_total: number
  id: string
  name: string
  slate_id: string
  sport: string
  sport_id: number
  start_time: string
  starting_lineups_available: boolean
  tv_network: string | null
  venue: string
}

export type CompetitionAttributes = {
  typeId: number
  value: string
}
