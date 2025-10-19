import { PassingStats, ReceivingStats, RushingStats } from './stats'

export interface Player {
  id: string
  slate_id: string
  player_id: number
  draftable_id: number
  first_name: string
  last_name: string
  is_starter: boolean
  position: string
  salary: number | null
  status: string | null
  team_id: number
  team_name: string
  passing: PassingStats | null
  rushing: RushingStats | null
  receiving: ReceivingStats | null
  projection: number | null
  full_name: string
  avg_points: number | null
  isExcluded?: boolean
  isLocked?: boolean
  player_image: string
  showdown_position: string
  team_abbr: string | null
}

export interface TeamRoster {
  QB: Player[]
  RB: Player[]
  WR: Player[]
}
