import { DkContest } from '../types/ContestTypes'

const AGGRESSIVE = {
  slateExposurePct: 0.08,
  cashPct: 0.25,
  gppPct: 0.75,
  minField: 50,
  maxField: 6000,
  maxFirstPct: 0.2,
  include3Max: true,
  include20Max: true,
  includeSE: true,
  avoid150Max: true,
  overlayThreshold: 0.9,
}

export type PickedContest = DkContest & {
  reason: string[]
  bucket: 'Cash' | 'GPP-SE' | 'GPP-3Max' | 'GPP-20Max' | 'Other'
}

export function pickContests(
  rawContests: DkContest[],
  opts: {
    bankroll: number
    dg?: string | number
    allocation?: 'aggressive' | 'normal'
    profile?: Partial<typeof AGGRESSIVE>
  },
) {
  const profile = { ...AGGRESSIVE, ...(opts.profile || {}) }
  const slateBudget = Math.max(0, Number(opts.bankroll) || 0)
  const allocation = opts.allocation || 'aggressive'
  const cashPct = allocation === 'normal' ? 0.6 : profile.cashPct
  const gppPct = 1 - cashPct

  const spendCap = Math.round(slateBudget * 100) / 100
  const cashBudget = Math.round(spendCap * cashPct * 100) / 100
  const gppBudget = Math.round(spendCap * gppPct * 100) / 100

  const filtered = rawContests.filter(c => (opts.dg ? c.dg === opts.dg : true))

  const picks: PickedContest[] = []
  for (const c of filtered) {
    const reasons: string[] = []
    if (AGGRESSIVE.avoid150Max && c.is150Max) continue
    if (c.isQualifier) continue

    let bucket: PickedContest['bucket'] = 'Other'
    const isCash = c.isDoubleUp || c.isFifty
    const passesField = c.fieldMax >= profile.minField && c.fieldMax <= profile.maxField
    const passesFirstPct = c.firstPct == null || c.firstPct <= profile.maxFirstPct
    const overlayEdge = c.isGuaranteed && c.fillPct < profile.overlayThreshold

    if (isCash) {
      bucket = 'Cash'
      reasons.push('Cash-friendly (DU/50-50)')
      if (overlayEdge) reasons.push('Likely overlay (<90% filled, GPP)')
    } else if (c.isSE && profile.includeSE) {
      if (passesField && passesFirstPct) {
        bucket = 'GPP-SE'
        reasons.push('Single-Entry')
        if (passesField) reasons.push(`Field ${c.fieldMax.toLocaleString()} in sweet spot`)
        if (passesFirstPct && c.firstPct != null)
          reasons.push(`1st% ${(c.firstPct * 100).toFixed(1)}% ≤ 20%`)
        if (overlayEdge) reasons.push('Overlay risk (under-filled)')
      }
    } else if (c.is3Max && profile.include3Max) {
      if (passesField && passesFirstPct) {
        bucket = 'GPP-3Max'
        reasons.push('3-Max')
        if (passesField) reasons.push(`Field ${c.fieldMax.toLocaleString()} in sweet spot`)
        if (passesFirstPct && c.firstPct != null)
          reasons.push(`1st% ${(c.firstPct * 100).toFixed(1)}% ≤ 20%`)
        if (overlayEdge) reasons.push('Overlay risk (under-filled)')
      }
    } else if (c.is20Max && profile.include20Max) {
      if (passesField && passesFirstPct) {
        bucket = 'GPP-20Max'
        reasons.push('20-Max')
        if (passesField) reasons.push(`Field ${c.fieldMax.toLocaleString()} in sweet spot`)
        if (passesFirstPct && c.firstPct != null)
          reasons.push(`1st% ${(c.firstPct * 100).toFixed(1)}% ≤ 20%`)
        if (overlayEdge) reasons.push('Overlay risk (under-filled)')
      }
    } else {
      if (overlayEdge && (c.isSE || c.is3Max || c.is20Max)) {
        bucket = c.isSE ? 'GPP-SE' : c.is3Max ? 'GPP-3Max' : 'GPP-20Max'
        reasons.push('Massive overlay exception')
      }
    }

    if (bucket !== 'Other' && reasons.length) {
      picks.push({ ...c, reason: reasons, bucket })
    }
  }

  const overlayScore = (c: DkContest) => (c.isGuaranteed ? 1 - c.fillPct : 0)
  picks.sort((a, b) => {
    const o = overlayScore(b) - overlayScore(a)
    if (o !== 0) return o
    const f = (a.firstPct ?? 1) - (b.firstPct ?? 1)
    if (f !== 0) return f
    if (a.fieldMax !== b.fieldMax) return a.fieldMax - b.fieldMax
    return a.buyIn - b.buyIn
  })

  return { spendCap, cashBudget, gppBudget, cashPct, gppPct, picks }
}
