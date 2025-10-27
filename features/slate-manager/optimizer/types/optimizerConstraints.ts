import { RandomnessMode } from './RandomnessMode'

export interface OptimizerConstraints {
  n_lineups: number
  unique_players_per_lineup: number
  min_salary?: number | null
  max_salary?: number | null
  global_max_exposure?: number | null
  ownership_avg_min?: number | null
  ownership_avg_max?: number | null
  randomness?: { mode: RandomnessMode; scale?: number | null }
  flex_counts?: Partial<Record<'QB' | 'RB' | 'WR' | 'TE', number>>
  team_limits?: Record<string, { min?: number | null; max?: number | null }>
  game_limits?: Record<string, { min?: number | null; max?: number | null }>
  limit_opposing?: Record<string, number | null>
}
