import { useEffect, useReducer } from 'react'

import type { OptimizerConstraints, RandomnessMode } from '../types'

type FormState = {
  nLineups: number
  uniquePlayersPerLineup: number
  minSalary?: number | null
  maxSalary?: number | null
  globalMaxExposure?: number | null
  ownershipMin?: number | null
  ownershipMax?: number | null
  randomnessMode: RandomnessMode
  randomnessScale?: number | null
  flexQB?: number | null
  flexRB?: number | null
  flexWR?: number | null
  flexTE?: number | null
  teamLimits: Record<string, { min?: number | null; max?: number | null }>
  gameLimits: Record<string, { min?: number | null; max?: number | null }>
  limitOpposing: Record<string, number | null>
}

type Action =
  | { type: 'SET_NUMBER'; key: keyof FormState; value: number | null }
  | { type: 'SET_STRING_NUMBER'; key: keyof FormState; value: string } // for <Input type="number">
  | { type: 'SET_RANDOMNESS_MODE'; value: RandomnessMode }
  | { type: 'SET_TEAM_LIMIT'; teamId: string; field: 'min' | 'max'; value: number | null }
  | { type: 'SET_GAME_LIMIT'; matchupId: string; field: 'min' | 'max'; value: number | null }
  | { type: 'SET_LIMIT_OPPOSING'; teamId: string; value: number | null }
  | { type: 'HYDRATE'; payload: Partial<FormState> }

export function parseNum(v: string): number | null {
  if (v === '' || v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function reducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'SET_NUMBER':
      return { ...state, [action.key]: action.value ?? null }
    case 'SET_STRING_NUMBER':
      return { ...state, [action.key]: parseNum(action.value) }
    case 'SET_RANDOMNESS_MODE':
      return {
        ...state,
        randomnessMode: action.value,
        randomnessScale: action.value === 'progressive' ? (state.randomnessScale ?? 1) : null,
      }
    case 'SET_TEAM_LIMIT': {
      const next = { ...(state.teamLimits[action.teamId] ?? {}) }
      next[action.field] = action.value
      return { ...state, teamLimits: { ...state.teamLimits, [action.teamId]: next } }
    }
    case 'SET_GAME_LIMIT': {
      const next = { ...(state.gameLimits[action.matchupId] ?? {}) }
      next[action.field] = action.value
      return { ...state, gameLimits: { ...state.gameLimits, [action.matchupId]: next } }
    }
    case 'SET_LIMIT_OPPOSING':
      return {
        ...state,
        limitOpposing: { ...state.limitOpposing, [action.teamId]: action.value },
      }
    case 'HYDRATE':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

export function formFromConstraints(c: OptimizerConstraints | undefined): FormState {
  return {
    nLineups: c?.n_lineups ?? 20,
    uniquePlayersPerLineup: c?.unique_players_per_lineup ?? 1,
    minSalary: c?.min_salary ?? null,
    maxSalary: c?.max_salary ?? null,
    globalMaxExposure:
      c?.global_max_exposure != null ? Math.round(c.global_max_exposure * 100) : null,
    ownershipMin: c?.ownership_avg_min ?? null,
    ownershipMax: c?.ownership_avg_max ?? null,
    randomnessMode: c?.randomness?.mode ?? 'none',
    randomnessScale: c?.randomness?.scale ?? null,
    flexQB: c?.flex_counts?.QB ?? null,
    flexRB: c?.flex_counts?.RB ?? null,
    flexWR: c?.flex_counts?.WR ?? null,
    flexTE: c?.flex_counts?.TE ?? null,
    teamLimits: c?.team_limits ?? {},
    gameLimits: c?.game_limits ?? {},
    limitOpposing: c?.limit_opposing ?? {},
  }
}

export function constraintsFromForm(s: FormState): OptimizerConstraints {
  return {
    n_lineups: s.nLineups,
    unique_players_per_lineup: s.uniquePlayersPerLineup,
    min_salary: s.minSalary ?? null,
    max_salary: s.maxSalary ?? null,
    global_max_exposure:
      s.globalMaxExposure == null ? null : clamp(Number(s.globalMaxExposure), 0, 100) / 100,
    ownership_avg_min: s.ownershipMin ?? null,
    ownership_avg_max: s.ownershipMax ?? null,
    randomness: {
      mode: s.randomnessMode,
      scale: s.randomnessMode === 'progressive' ? (s.randomnessScale ?? 1) : null,
    },
    flex_counts: {
      QB: s.flexQB ?? undefined,
      RB: s.flexRB ?? undefined,
      WR: s.flexWR ?? undefined,
      TE: s.flexTE ?? undefined,
    },
    team_limits: s.teamLimits,
    game_limits: s.gameLimits,
    limit_opposing: s.limitOpposing,
  }
}

export function useOptimizerForm(initial?: OptimizerConstraints) {
  const [state, dispatch] = useReducer(reducer, formFromConstraints(initial))
  useEffect(() => {
    if (initial) dispatch({ type: 'HYDRATE', payload: formFromConstraints(initial) })
  }, [initial])
  return { state, dispatch }
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
