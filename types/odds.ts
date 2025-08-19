export type OddsGame = {
    home_team: string
    away_team: string
    bookmakers: Array<{
      key: string // 'draftkings', etc
      markets: Array<{
        key: 'spreads' | 'totals'
        outcomes: Array<{ name: string; point: number; price: number }>
      }>
    }>
  }