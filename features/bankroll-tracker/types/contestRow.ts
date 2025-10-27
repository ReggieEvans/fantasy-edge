export type ContestRow = {
  sport: 'NFL' | 'CFB' | string
  game_type: string
  entry_name: string
  entries: number
  place: number | null
  entry_fee: number
  winnings: number
  prize_pool?: number
  places_paid?: number
  dt: string
  season: string
  mode: 'Classic' | 'Showdown'
  contest_bucket:
    | 'Cash'
    | 'Single-Entry'
    | 'Large Field 20 Max'
    | 'Small Field 20 Max'
    | 'MME Small Field'
    | 'MME'
    | 'Other'
  profit: number
}
