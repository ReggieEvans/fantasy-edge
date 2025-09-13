export const slateManagerTags = [
  'Slates',
  'Players',
  'Matchups',
  'Targets',
  'Rosters',
  'Projections',
  'Contests',
  'SlatePack',
  'SlatePlayers',
] as const

export type SlateManagerTag = (typeof slateManagerTags)[number]
