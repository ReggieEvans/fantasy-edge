import { RandomnessMode } from './RandomnessMode'

export interface OptimizerConstraints {
  n_lineups: number // how many lineups to attempt
  unique_players_per_lineup: number // “Maximum Repeating Players” inverse
  min_salary?: number | null
  max_salary?: number | null
  global_max_exposure?: number | null // 0..1
  ownership_avg_min?: number | null // %
  ownership_avg_max?: number | null // %
  randomness?: { mode: RandomnessMode; scale?: number | null }
  flex_counts?: Partial<Record<'QB' | 'RB' | 'WR' | 'TE', number>> // “Number of Specific Positions in FLEX”
  team_limits?: Record<string /* teamId */, { min?: number | null; max?: number | null }>
  game_limits?: Record<string /* matchupId */, { min?: number | null; max?: number | null }>
  limit_opposing?: Record<string /* teamId */, number | null>
}
