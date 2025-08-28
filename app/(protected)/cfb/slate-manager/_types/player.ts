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
}

export interface TeamRoster {
  QB: Player[]
  RB: Player[]
  WR: Player[]
}
