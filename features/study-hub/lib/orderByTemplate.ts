type Slot = string
type Player = {
  slot: Slot
  name: string
  position?: string
  salary?: number
  expected?: number
  actual?: number
  icon?: string
  imageUrl?: string
  is_stack?: boolean
  is_game_stack?: boolean
  team?: {
    team_id: number
    abbreviation: string | null
    color: string | null
    alternate_color: string | null
    logos: string[] | null
  } | null
  oppAbbr?: string | null
}

const SLOT_TEMPLATES: Record<string, Slot[]> = {
  'NFL:CLASSIC': ['QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'TE', 'FLEX', 'DST'],
  'NFL:SHOWDOWN': ['CPT', 'FLEX', 'FLEX', 'FLEX', 'FLEX', 'FLEX'],
  'CFB:CLASSIC': ['QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'FLEX', 'S-FLEX'], // no DST
  'CFB:SHOWDOWN': ['CPT', 'FLEX', 'FLEX', 'FLEX', 'FLEX', 'FLEX'],
  // add more as needed...
}

export const getTemplate = (
  sport: 'NFL' | 'CFB' | string,
  gameType: 'CLASSIC' | 'SHOWDOWN' | string,
): Slot[] => {
  const t = gameType.toUpperCase()
  return SLOT_TEMPLATES[`${sport}:${t}`] ?? []
}

/**
 * Reorders a lineup to match the slot template.
 * Handles duplicates by consuming one player per slot in order.
 * If a slot is missing, returns `null` placeholder at that index.
 */
export const orderByTemplate = (lineup: Player[], template: Slot[]): Array<Player | null> => {
  // bucket players by slot, preserving original order
  const buckets = new Map<Slot, Player[]>()
  for (const p of lineup) {
    const arr = buckets.get(p.slot) ?? []
    arr.push(p)
    buckets.set(p.slot, arr)
  }

  // build ordered list by popping from the appropriate bucket
  return template.map(slot => {
    const arr = buckets.get(slot)
    if (!arr || arr.length === 0) return null
    return arr.shift() ?? null
  })
}
