import { OddsGame } from "@/types/odds"

export const norm = (s: string | null | undefined) => (s ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')

export function countBySlate(items: { slate_id: string }[]) {
  return items.reduce(
    (acc, item) => {
      acc[item.slate_id] = (acc[item.slate_id] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
}

export function parseAbbrs(description: string) {
  const [awayRaw, homeRaw] = description.split('@')
  if (!awayRaw || !homeRaw) return null

  return {
    away: awayRaw.trim().toUpperCase(),
    home: homeRaw.trim().toUpperCase(),
  }
}

export function impliedTotals(total: number, homeSpread: number, awaySpread: number) {
  // Use the identity: team_total = total/2 - spread/2 (spread is that team’s signed line)
  const home_total = total / 2 - homeSpread / 2
  const away_total = total - home_total
  return { home_total, away_total }
}

// Pick DraftKings if present; else first book
export function pickBook(game: OddsGame) {
  return (
    game.bookmakers?.find(b => b.key === 'draftkings') ??
    game.bookmakers?.[0] ??
    null
  )
}

export function getMarket(book: NonNullable<ReturnType<typeof pickBook>>, key: 'spreads' | 'totals') {
  return book.markets?.find(m => m.key === key) ?? null
}
