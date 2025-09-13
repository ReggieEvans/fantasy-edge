import { NestedStatKey, StatGroupKey, TeamSide } from '../types/statKeyGroup'

export function createStatKey<K extends StatGroupKey>(key: K, side: TeamSide): NestedStatKey {
  return [key, side]
}
