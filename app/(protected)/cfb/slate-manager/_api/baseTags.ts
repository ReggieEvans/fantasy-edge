export const slateManagerTags = [
  'Slates',
  'Slate',
  'DkSlates',
  'Matchups',
  'Targets',
  'Rosters',
  'QuickTargets',
] as const

export type SlateManagerTag = (typeof slateManagerTags)[number]
