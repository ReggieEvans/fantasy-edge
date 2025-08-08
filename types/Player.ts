import { PassingStats } from './PassingStats'
import { ReceivingStats } from './ReceivingStats'
import { RushingStats } from './RushingStats'

export interface Player {
  altPlayerImage50: string
  altPlayerImage160: string
  competition: Competition
  competitions: Competition[]
  displayName: string
  draftAlerts: DraftAlert[]
  draftStatAttributes: DraftStatAttribute[]
  draftableId: number
  firstName: string
  isDisabled: boolean
  isSwappable: boolean
  lastName: string
  newsStatus: string
  playerAttributes: PlayerAttribute[]
  playerDkId: number
  playerGameAttributes: PlayerGameAttribute[]
  playerGameHash: string
  playerId: number
  playerImage50: string
  playerImage160: string
  position: string
  rosterSlotId: number
  salary: number
  shortName: string
  stats: StatPositions
  status: string
  teamAbbreviation: string
  teamId: number
  teamLeagueSeasonAttributes: TeamLeagueSeasonAttribute[]
  marketShare: {
    target_share: number
    rush_share: number
  }
  _id: string
  _ownership: number
  _projection: number
  _targetNotes: string
  _targetSlateId: string
  _targetTier: string
  _targetType: string
  _userId: string
}

export interface Competition {
  competitionId: number
  name: string
}

export interface DraftAlert {
  id: number
  value: string
}

export interface DraftStatAttribute {
  id: number
  value: string
  sortValue: string
}

export interface PlayerAttribute {
  id: number
  value: string
}

export interface PlayerGameAttribute {
  id: number
  value: string
}

export interface TeamLeagueSeasonAttribute {
  id: number
  value: string
}

export interface StatPositions {
  passing: PassingStats
  rushing: RushingStats
  receiving: ReceivingStats
}
