export type QBBaselines = {
  dropbacks: { min: number; max: number }
  ypa: { min: number; max: number }
  bttRate: { min: number; max: number }
  scrambles: { min: number; max: number }
  rushYds: { min: number; max: number }
  rushShare: { min: number; max: number }
  oppPassYdsAllowed: { min: number; max: number }
  oppRushYdsAllowed: { min: number; max: number }
}

const clamp = (x: number, min = 0, max = 1) => Math.max(min, Math.min(max, x))
const safe = (v: unknown, fallback = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)
const norm = (x: number, min: number, max: number) => (min === max ? 0.5 : clamp((x - min) / (max - min)))

export function computeQbMatchupScore(
  qb: {
    dropbacks?: number
    ypa?: number
    big_time_throws?: number
    attempts?: number
    scrambles?: number
    rushYds?: number
    rushShare?: number
  },
  opp: { passYdsAllowedPerGame?: number; rushYdsAllowedPerGame?: number },
  base: QBBaselines,
) {
  const dropbacksN = norm(safe(qb.dropbacks), base.dropbacks.min, base.dropbacks.max)
  const ypaN = norm(safe(qb.ypa), base.ypa.min, base.ypa.max)

  const attempts = Math.max(1, safe(qb.attempts, 1))
  const bttRate = safe(qb.big_time_throws, 0) / attempts
  const bttRateN = norm(bttRate, base.bttRate.min, base.bttRate.max)

  const scramblesN = norm(safe(qb.scrambles), base.scrambles.min, base.scrambles.max)
  const rushYdsN = norm(safe(qb.rushYds), base.rushYds.min, base.rushYds.max)
  const rushShareN = norm(clamp(safe(qb.rushShare)), base.rushShare.min, base.rushShare.max)

  const defPassN = norm(safe(opp.passYdsAllowedPerGame), base.oppPassYdsAllowed.min, base.oppPassYdsAllowed.max)
  const defRushN = norm(safe(opp.rushYdsAllowedPerGame), base.oppRushYdsAllowed.min, base.oppRushYdsAllowed.max)

  const qbPass = 0.45 * dropbacksN + 0.4 * ypaN + 0.15 * bttRateN
  const qbRush = 0.5 * rushShareN + 0.3 * rushYdsN + 0.2 * scramblesN

  const rushWeight = clamp(0.2 + 0.8 * rushShareN, 0.2, 0.9)
  const passWeight = 1 - rushWeight

  const offense = passWeight * qbPass + rushWeight * qbRush
  const defense = passWeight * defPassN + rushWeight * defRushN

  const score01 = clamp(0.55 * offense + 0.45 * defense)
  const score = Math.round(score01 * 100)

  return { score, parts: { qbPass, qbRush, rushWeight, passWeight, defense, offense } }
}
