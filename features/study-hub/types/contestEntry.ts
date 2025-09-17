import { LineupPlayer } from './lineupPlayer'

export type ContestEntry = {
  rank: number
  entryId: string
  entryName: string
  username: string
  entriesPlayedHint?: number | null
  points: number
  // names only (many places use this already)
  players: string[]
  // add slots for features like position filters
  playersWithPos: LineupPlayer[]
}
