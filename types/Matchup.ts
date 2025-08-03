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
