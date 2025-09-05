export type Roster = {
  slateId: string
  name: string
  type: string
  totalSalary: number
  roster: Record<string, RosterSlot>
}

export type RosterSlot = {
  player_id: string
  draftable_id: string
  player_name: string
  slate_player_id: string
  slot_key: string
  position: string
  salary: number
  target_type: string
  stack_candidate: boolean
}
