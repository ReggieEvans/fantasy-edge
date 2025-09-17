/* eslint-disable @typescript-eslint/no-explicit-any */
export function buildPayoutResolver(payoutSummary: any[]) {
  type Tier = { min: number; max: number; value: number }
  const tiers: Tier[] = []
  for (const t of payoutSummary || []) {
    const value = Number(
      (t?.payoutDescriptions?.[0]?.value ?? t?.tierPayoutDescriptions?.Cash)
        ? centsFromMoney(t.tierPayoutDescriptions.Cash) / 100
        : 0,
    )
    tiers.push({ min: Number(t.minPosition), max: Number(t.maxPosition), value })
  }
  tiers.sort((a, b) => a.min - b.min)

  return (rank: number): number => {
    for (const t of tiers) {
      if (rank >= t.min && rank <= t.max) return t.value
    }
    return 0
  }
}

export function centsFromMoney(s: string): number {
  return Math.round(Number(s.replace(/[^0-9.\-]/g, '')) * 100)
}

export function moneyFromCents(cents: number): string {
  return (cents < 0 ? '-' : '') + '$' + (Math.abs(cents) / 100).toFixed(2)
}
