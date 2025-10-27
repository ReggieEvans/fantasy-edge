import { LineupPlayer } from './lineupPlayer'

export type ContestEntry = {
  rank: number
  entryId: string
  entryName: string
  username: string
  entriesPlayedHint?: number | null
  points: number
  players: string[]
  playersWithPos: LineupPlayer[]
}
