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
  'ContestEntries',
] as const

export type SlateManagerTag = (typeof slateManagerTags)[number]
