import { Sport } from '@/types/sport'

export function isFireGameTotal(sport: Sport, gameTotal?: number | null) {
  if (!gameTotal) return false
  return sport === 'NFL' ? gameTotal > 48 : sport === 'CFB' ? gameTotal > 55 : false
}
