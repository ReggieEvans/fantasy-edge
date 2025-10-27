export type Roster = {
  slateId: string
  name: string
  type: string
  totalSalary: number
  roster: Record<string, RosterSlot>
}

export type RosterSlot = {
  id?: string
  roster_id?: string
  player_id: string
  draftable_id: string
  player_name: string
  slate_player_id: string
  slot_key: string
  position: string
  salary: number
  target_type: string
  stack_candidate: boolean
  projection?: number
  team_name: string
  slot_position: string
}

export type RosterView = {
  id: string
  name: string
  roster_players: RosterSlot[]
  slate_id: string
  total_salary: number
  type: string
}
