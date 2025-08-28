export const slateManagerTags = [
  'Slates',
  'Slate',
  'DkSlates',
  'Matchups',
  'Targets',
  'Rosters',
  'QuickTargets',
  'SlatePlayers',
] as const

export type SlateManagerTag = (typeof slateManagerTags)[number]
