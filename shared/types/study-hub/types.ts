import { ContestUsageSummary } from '@/features/study-hub/types'

export type GameType = 'classic' | 'showdown'

export type CsvRow = {
  rank: number
  entryId: string
  entryName: string
  username: string
  points: number
  prize?: number | null // parsed if present, but authoritative prize from payoutResolver(rank)
  lineup: string
}

export type CsvMeta = {
  contestId?: string
}

export type Draftable = {
  displayName: string
  salary: number
  position: string
  teamAbbreviation?: string | null
}

export type DraftableMap = {
  byName: Map<string, Draftable>
}

export type PlayerValueRow = {
  player: string
  position: string | null
  entriesWithPlayer: number
  fieldPct: number
  salary: number | null
  expected: number | null
  actual: number | null
  icon: string | null
  imageUrl: string | null
  teamUrl: string | null
  team: {
    team_id: number
    abbreviation: string | null
    color: string | null
    alternate_color: string | null
    logos: string[] | null
  } | null
}

export type StudyEntry = {
  entryId: string
  entryName: string
  username: string
  rank: number
  points: number
  prizeDollars: number
  roi: number // (won - spend)/spend for this single entry
  spendCents: number
  wonCents: number
  lineup: Array<{
    name: string
    slot: 'QB' | 'RB' | 'WR' | 'TE' | 'DST' | 'FLEX' | 'CPT' | 'S-FLEX'
    position: string | null
    salary: number | null
    expected: number | null
    actual: number | null
    icon: '🔥' | '❄️' | '•' | null
    imageUrl: string | null
    is_stack?: boolean
    is_game_stack?: boolean
    team: {
      team_id: number
      abbreviation: string | null
      color: string | null
      alternate_color: string | null
      logos: string[] | null
    } | null
    oppAbbr: string | null
  }>
}

export type EnrichedStudyUpload = {
  meta: {
    contestId: string
    sport: string
    gameType: GameType
    entries: number
    entryFeeDollars: number
    draftGroupId: number
    valueBaseline: number
  }
  users: Array<{
    username: string
    entries: number
    spendDollars: number
    wonDollars: number
    roi: number
  }>
  entries: StudyEntry[]
  contestPlayerExposures: PlayerValueRow[]
  usage: {
    contestMaxEntries: number
    all: ContestUsageSummary
    full: ContestUsageSummary
    buckets: Record<string, ContestUsageSummary>
  }
  usernameSummary?: {
    Username: string
    Spent: number
    Winnings: number
    ROI: number
  }
}

export type PlayerFptsRow = {
  name: string
  roster?: string | null // e.g., CPT/FLEX/QB/...
  position?: string | null // e.g., QB/RB/WR/TE/DST
  draftedPct?: number | null
  fpts: number
}

export type CsvParsed = {
  rows: CsvRow[]
  meta: CsvMeta
  players: PlayerFptsRow[] // <-- NEW
}

export type UserExposure = {
  playerKey: string
  player: string
  user_pct: number
  field_pct: number
  expected: number
  actual: number
  imageUrl: string | null
}
