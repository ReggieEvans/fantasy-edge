type PlayTag = 'TopPlay' | 'GPP Play' | 'Cash Play' | 'Value Play' | 'Pivot Play' | 'Fade'

interface QB {
  salary: number
  projPoints?: number
  matchupScore: number
  rushShare: number // 0.0 to 1.0
  rushYds: number
  dropbacks: number
  ypa: number
  btt: number // big time throws
  interceptions: number
  turnoverWorthyPlays: number
}

export function getPlayTags(qb: QB): PlayTag[] {
  const tags: PlayTag[] = []

  const hasProjection = qb.projPoints != null
  const pps = hasProjection ? qb.projPoints! / qb.salary : 0

  const rushCeiling = qb.rushShare > 0.2 && qb.rushYds > 40
  const passCeiling = qb.btt >= 4 && qb.ypa >= 8
  const volume = qb.dropbacks >= 35
  const value = qb.salary < 6000 && qb.projPoints && qb.projPoints > 16
  const highProjection = qb.projPoints && qb.projPoints >= 24
  const goodMatchup = qb.matchupScore >= 75
  const badMatchup = qb.matchupScore < 50
  const turnoverRisk = qb.turnoverWorthyPlays >= 3 || qb.interceptions >= 2

  // 🎯 TopPlay
  if (highProjection && goodMatchup && (rushCeiling || passCeiling)) {
    tags.push('TopPlay')
  }

  // 💣 GPP Play
  if ((rushCeiling || passCeiling) && !turnoverRisk && qb.ypa > 7.5) {
    tags.push('GPP Play')
  }

  // 🛡️ Cash Play
  if (volume && qb.ypa >= 7 && qb.projPoints && qb.projPoints >= 18) {
    tags.push('Cash Play')
  }

  // 💸 Value Play
  if (value && qb.matchupScore >= 60) {
    tags.push('Value Play')
  }

  // 🧪 Pivot Play
  if ((rushCeiling || passCeiling) && badMatchup && !turnoverRisk) {
    tags.push('Pivot Play')
  }

  // ❌ If no tags assigned, fade
  if (tags.length === 0) {
    tags.push('Fade')
  }

  return tags
}
