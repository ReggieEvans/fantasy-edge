export const slateManagerTags = [
  'Slate',
  'Player',
  'Matchup',
  'Target',
  'Rosters',
  'Projection',
  'Contest',
  'SlatePack',
] as const

export type SlateManagerTag = (typeof slateManagerTags)[number]
