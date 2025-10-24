export type RawContest = Record<string, unknown> & {
  id?: number | string
  a?: number | string
  m?: number | string
  nt?: number | string
  po?: number | string
  n?: string
  dg?: number | string
  draftGroupId?: number | string
  me?: number | string
  attr?: Record<string, any>
  gameType?: string
}
export type DkContest = {
  id: string
  name: string
  dg?: number
  buyIn: number
  fieldMax: number
  entered: number
  fillPct: number
  prizePool: number
  firstPrize?: number | null
  firstPct?: number | null
  maxEntriesPerUser?: number | null
  isSE: boolean
  is3Max: boolean
  is20Max: boolean
  is150Max: boolean
  isGuaranteed: boolean
  isDoubleUp: boolean
  isFifty: boolean
  isQualifier: boolean
  gameType?: string
}
