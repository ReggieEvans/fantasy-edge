import { Matchup } from '../../matchups/types/matchup'

export interface SlatePack {
  players: Player[]
  matchups: Matchup[]
  positionsArray: string[]
}

export interface Player {
  id: string
  name: string
  position: string
}
