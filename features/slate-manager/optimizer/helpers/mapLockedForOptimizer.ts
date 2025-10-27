type PlayerLike = {
  id?: string | number
  fe_player_id?: string
  player_id?: string | number
  draftable_id?: string | number
  fe_draftable_id?: string | number
  full_name?: string
  name?: string
  showdown_position?: string | null
}

const getRowId = (p: PlayerLike): string => {
  if (p.id != null) return String(p.id)
  if (p.fe_player_id) return String(p.fe_player_id)
  if (p.player_id != null) return String(p.player_id)
  if (p.draftable_id != null) return String(p.draftable_id)
  const name = p.full_name ?? p.name ?? 'UNK'
  return `${name}|${''}|${''}|${''}`
}

export function mapLockedForOptimizer(lockedIdsFromRedux: string[], players: PlayerLike[]) {
  const lockSet = new Set(lockedIdsFromRedux.map(String))

  const lockedPlayer: string[] = []

  for (const p of players) {
    const rid = getRowId(p)
    if (!lockSet.has(rid)) continue

    const name = p.full_name ?? p.name ?? ''

    if (name) lockedPlayer.push(name)
  }

  return { lockedPlayer }
}
