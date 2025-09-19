import { Bucket } from './bucket'
import { Mode } from './mode'
import { Row } from './row'

export type GroupRow = {
  contest_key: string
  date: string
  sport: string
  mode: Mode
  contest_bucket: Bucket
  contest_name: string
  my_entries: number
  field_size: number | null
  spent: number
  won: number
  profit: number
  roi: number
  top_score: number | null
  low_score: number | null
  avg_score: number | null
  top1pct_count: number
  best_payout: number
}

export type GroupRowWithContests = {
  contest_key: string
  date: string
  sport: string
  mode: Mode
  contest_bucket: Bucket
  contest_name: string
  my_entries: number
  field_size: number | null
  spent: number
  won: number
  profit: number
  roi: number
  top_score: number | null
  low_score: number | null
  avg_score: number | null
  top1pct_count: number
  best_payout: number
  contests: Row[]
}
