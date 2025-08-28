export const slateManagerTags = [
  'Slates',
  'Slate',
  'DkSlates',
  'Matchups',
  'Targets',
  'Rosters',
  'SlatePlayers',
] as const

export type SlateManagerTag = (typeof slateManagerTags)[number]
