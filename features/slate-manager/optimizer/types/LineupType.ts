export type LineupPlayer = {
  name: string
  team?: string
  salary: number
  lineup_position?: string
  positions?: string[]
  fe_player_id: string
  fe: {
    team_image: string
    projection?: number
  }
}

export type Lineup = {
  players: LineupPlayer[]
  salary: number
  projection: number
}
