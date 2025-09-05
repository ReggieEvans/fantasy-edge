export type StatGroupKey =
  | 'passingRate'
  | 'rushingRate'
  | 'teamPassing'
  | 'teamRushing'
  | 'passingDefense'
  | 'rushingDefense'
export type TeamSide = 'home' | 'away'
export type NestedStatKey = readonly [StatGroupKey, TeamSide]
