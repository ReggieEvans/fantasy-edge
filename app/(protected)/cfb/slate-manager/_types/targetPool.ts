export interface TargetPool {
    created_at: string
    draftable_id: number
    first_name: string
    id: string
    last_name: string
    player_id: number
    position: string
    salary: number
    slate_id: string
    slate_player_id: string
    stack_candidate: boolean
    target_notes: string
    target_type: TargetType | null
    team_id: number
    updated_at: string
    user_id: string
    player_image: string
    projection: number
    ownership: number
    grade: number
    team_name: string
    team_abbreviation: string
}

export const TARGET_TYPE_VALUES = ['top', 'bargain', 'fade', 'pivot', 'cash', 'gpp', 'lock', 'injury'] as const

export type TargetType = (typeof TARGET_TYPE_VALUES)[number]
