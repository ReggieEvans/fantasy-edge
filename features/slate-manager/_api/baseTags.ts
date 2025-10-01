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
  'PlayerNews',
] as const

export type SlateManagerTag = (typeof slateManagerTags)[number]
