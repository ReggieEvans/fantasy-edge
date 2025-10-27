import { Bucket } from './bucket'
import { Mode } from './mode'

export type Row = {
  sport: string
  game_type: string
  entry_name: string
  contest_key: string
  dt: string
  date: string
  place: number | null
  points: number | null
  winnings: number
  winnings_ticket: number
  entries: number | null
  entry_fee: number
  prize_pool: number | null
  places_paid: number | null
  season: string
  mode: Mode
  contest_bucket: Bucket
  profit: number
}
