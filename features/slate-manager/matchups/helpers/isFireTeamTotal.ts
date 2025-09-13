import { Sport } from '@/types/sport'

export function isFireTeamTotal(sport: Sport, teamTotal?: number | null) {
  if (!teamTotal) return false
  return sport === 'NFL' ? teamTotal > 24 : sport === 'CFB' ? teamTotal > 27 : false
}
