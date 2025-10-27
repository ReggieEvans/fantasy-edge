import { OptimizerConstraints } from '../types'

type ValidateOpts = {
  salaryCap?: number
  salaryStep?: number
  maxLineups?: number
  flexSlots?: number
}

export function validateConstraints(c: OptimizerConstraints, opts: ValidateOpts = {}): string[] {
  const { salaryCap = 50000, salaryStep = 100, maxLineups = 150, flexSlots } = opts

  const errors: string[] = []

  const isInt = (n: unknown) => Number.isInteger(n as number)
  const isNullish = (v: unknown) => v === null || v === undefined

  if (!isInt(c.n_lineups) || c.n_lineups < 1)
    errors.push('Number of lineups must be an integer ≥ 1.')
  if (c.n_lineups > maxLineups) errors.push(`Number of lineups cannot exceed ${maxLineups}.`)

  if (!isInt(c.unique_players_per_lineup) || c.unique_players_per_lineup < 1)
    errors.push('Unique players per lineup must be an integer ≥ 1.')

  if (!isNullish(c.min_salary)) {
    if (typeof c.min_salary !== 'number' || c.min_salary < 0)
      errors.push('Min salary must be a number ≥ 0.')
    if (typeof c.min_salary === 'number' && c.min_salary % salaryStep !== 0)
      errors.push(`Min salary must be a multiple of ${salaryStep}.`)
  }
  if (!isNullish(c.max_salary)) {
    if (typeof c.max_salary !== 'number' || c.max_salary < 0)
      errors.push('Max salary must be a number ≥ 0.')
    if (typeof c.max_salary === 'number' && c.max_salary % salaryStep !== 0)
      errors.push(`Max salary must be a multiple of ${salaryStep}.`)
    if (typeof c.max_salary === 'number' && c.max_salary > salaryCap)
      errors.push(`Max salary cannot exceed the cap (${salaryCap}).`)
  }
  if (
    typeof c.min_salary === 'number' &&
    typeof c.max_salary === 'number' &&
    c.min_salary > c.max_salary
  ) {
    errors.push('Min salary cannot be greater than Max salary.')
  }

  if (!isNullish(c.global_max_exposure)) {
    if (
      typeof c.global_max_exposure !== 'number' ||
      c.global_max_exposure < 0 ||
      c.global_max_exposure > 1
    ) {
      errors.push('Global max exposure must be between 0 and 1.')
    }
    if (c.global_max_exposure === 0) {
      errors.push('Global max exposure of 0% is invalid (would exclude all players).')
    }
  }

  if (!isNullish(c.ownership_avg_min)) {
    if (
      typeof c.ownership_avg_min !== 'number' ||
      c.ownership_avg_min < 0 ||
      c.ownership_avg_min > 100
    )
      errors.push('Ownership Min must be between 0 and 100.')
  }
  if (!isNullish(c.ownership_avg_max)) {
    if (
      typeof c.ownership_avg_max !== 'number' ||
      c.ownership_avg_max < 0 ||
      c.ownership_avg_max > 100
    )
      errors.push('Ownership Max must be between 0 and 100.')
  }
  if (
    typeof c.ownership_avg_min === 'number' &&
    typeof c.ownership_avg_max === 'number' &&
    c.ownership_avg_min > c.ownership_avg_max
  ) {
    errors.push('Ownership Min cannot be greater than Ownership Max.')
  }

  if (!c.randomness || !['none', 'random', 'progressive'].includes(c.randomness.mode as string)) {
    errors.push('Randomness mode must be one of: none, random, progressive.')
  } else if (c.randomness.mode === 'progressive') {
    if (
      isNullish(c.randomness.scale) ||
      typeof c.randomness.scale !== 'number' ||
      c.randomness.scale <= 0
    ) {
      errors.push('Progressive randomness requires a positive scale.')
    }
  } else {
    if (!isNullish(c.randomness.scale)) {
      errors.push('Randomness scale must be empty unless mode is progressive.')
    }
  }

  if (c.flex_counts) {
    for (const [pos, v] of Object.entries(c.flex_counts)) {
      if (!isNullish(v)) {
        if (!isInt(v) || (v as number) < 0) {
          errors.push(`FLEX count for ${pos} must be a non-negative integer.`)
        }
      }
    }
    if (typeof flexSlots === 'number') {
      const sum = (['QB', 'RB', 'WR', 'TE'] as const)
        .map(p => c.flex_counts?.[p] ?? 0)
        .reduce((a, b) => a + (b || 0), 0)
      if (sum > flexSlots) {
        errors.push(
          `Sum of FLEX counts (${sum}) cannot exceed available FLEX slots (${flexSlots}).`,
        )
      }
    }
  }

  if (c.team_limits) {
    for (const [teamId, lim] of Object.entries(c.team_limits)) {
      const { min, max } = lim || {}
      if (!isNullish(min) && (typeof min !== 'number' || min < 0)) {
        errors.push(`Team ${teamId}: Min must be a number ≥ 0.`)
      }
      if (!isNullish(max) && (typeof max !== 'number' || max < 0)) {
        errors.push(`Team ${teamId}: Max must be a number ≥ 0.`)
      }
      if (typeof min === 'number' && typeof max === 'number' && min > max) {
        errors.push(`Team ${teamId}: Min cannot be greater than Max.`)
      }
    }
  }

  if (c.game_limits) {
    for (const [matchupId, lim] of Object.entries(c.game_limits)) {
      const { min, max } = lim || {}
      if (!isNullish(min) && (typeof min !== 'number' || min < 0)) {
        errors.push(`Game ${matchupId}: Min must be a number ≥ 0.`)
      }
      if (!isNullish(max) && (typeof max !== 'number' || max < 0)) {
        errors.push(`Game ${matchupId}: Max must be a number ≥ 0.`)
      }
      if (typeof min === 'number' && typeof max === 'number' && min > max) {
        errors.push(`Game ${matchupId}: Min cannot be greater than Max.`)
      }
    }
  }

  if (c.limit_opposing) {
    for (const [key, val] of Object.entries(c.limit_opposing)) {
      if (!isNullish(val) && (typeof val !== 'number' || val < 0)) {
        errors.push(`Limit opposing (${key}) must be a number ≥ 0.`)
      }
    }
  }

  return errors
}
