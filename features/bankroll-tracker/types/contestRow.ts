export type ContestRow = {
  sport: 'NFL' | 'CFB' | string
  game_type: string // from Game_Type
  entry_name: string // from Entry
  entries: number // from Contest_Entries
  place: number | null // from Place
  entry_fee: number // from Entry_Fee
  winnings: number // from Winnings_Non_Ticket
  prize_pool?: number
  places_paid?: number
  dt: string // ISO datetime (Contest_Date_EST)
  season: string // e.g. "2025-26"
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
