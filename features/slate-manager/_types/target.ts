export interface Target {
  id: string
  slate_id: string
  slate_player_id: string
  player_id: number
  stack_candidate: boolean
  target_notes: string
  target_type: TargetType | null
}

export const TARGET_TYPE_VALUES = ['top', 'bargain', 'fade', 'pivot', 'cash', 'gpp', 'lock', 'injury'] as const

export type TargetType = (typeof TARGET_TYPE_VALUES)[number]
