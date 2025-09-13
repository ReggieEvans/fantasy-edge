'use client'
// AI generated code
import { DollarSign, Filter, Flag, Info, SquareMousePointer, Upload } from 'lucide-react'
import React, { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/**
 * DraftKings-ish Contest shape (minimized to what we use here)
 * Your JSON example looked like DK lobby export where short keys are common:
 * - a  = buy-in (entry fee)
 * - m  = max field size
 * - nt = current entries (entered)
 * - po = prize pool
 * - n  = contest name (often includes "[$XXK to 1st]")
 * - dg OR draftGroupId = slate identifier (user asked to filter by this)
 * - me or attr.MaxEntriesPerUser = max entries a user can submit
 * - attr.IsGuaranteed, attr.IsDoubleUp, attr.IsFiftyfifty, attr.IsQualifier
 */
export type RawContest = Record<string, unknown> & {
  a?: number | string // buy-in
  m?: number | string // field max
  nt?: number | string // entered
  po?: number | string // prize pool
  n?: string // name
  dg?: number | string // draft group id (if present)
  draftGroupId?: number | string // alt key
  me?: number | string // max entries per user
  attr?: Record<string, unknown>
  gameType?: string
}

export type ContestView = {
  id: string
  name: string
  dg?: string
  buyIn: number
  fieldMax: number
  entered: number
  fillPct: number // 0-1
  prizePool: number
  firstPrize?: number | null
  firstPct?: number | null // of prize pool
  maxEntriesPerUser?: number | null
  isSE: boolean // single entry
  is3Max: boolean
  is20Max: boolean
  is150Max: boolean
  isGuaranteed: boolean
  isDoubleUp: boolean
  isFifty: boolean
  isQualifier: boolean
  gameType?: string
}

// ----------------- Helpers -----------------
const toNum = (v: unknown, fallback = 0): number => {
  if (v == null) return fallback
  const n = typeof v === 'string' ? parseFloat(v.replace(/[$,]/g, '')) : Number(v)
  return Number.isFinite(n) ? n : fallback
}

const parseFirstTo1st = (name?: string): number | null => {
  if (!name) return null
  // matches [ $25K to 1st ] / [$2M to 1st ] / [$500 to 1st]
  const m = name.match(/\[\$?([\d,.]+)\s*([KkMm])?\s*to\s*1st\]/)
  if (!m) return null
  const base = toNum(m[1])
  const suf = (m[2] || '').toLowerCase()
  const mult = suf === 'k' ? 1_000 : suf === 'm' ? 1_000_000 : 1
  return base * mult
}

const truthy = (v: unknown): boolean => String(v).toLowerCase() === 'true' || v === true

const normalizeContest = (c: RawContest, idx: number): ContestView => {
  const buyIn = toNum(c.a)
  const fieldMax = toNum(c.m)
  const entered = Math.min(toNum(c.nt), fieldMax || Infinity)
  const prizePool = toNum(c.po)
  const firstPrize = parseFirstTo1st(c.n)
  const firstPct = firstPrize && prizePool > 0 ? firstPrize / prizePool : null
  const maxEntriesPerUser =
    c.me != null
      ? toNum(c.me)
      : c.attr?.MaxEntriesPerUser != null
        ? toNum(c.attr.MaxEntriesPerUser)
        : c.attr?.maxEntriesPerUser != null
          ? toNum(c.attr.maxEntriesPerUser)
          : c.attr?.UserMaxEntries != null
            ? toNum(c.attr.UserMaxEntries)
            : c.attr?.UserEntryLimit != null
              ? toNum(c.attr.UserEntryLimit)
              : null
  const lowerName = (c.n || '').toLowerCase()
  const inferSE = lowerName.includes('single entry') || lowerName.includes('single-entry')
  const infer3Max =
    lowerName.includes('3-max') ||
    lowerName.includes('3 entry max') ||
    lowerName.includes('3-entry max')
  const infer20Max =
    lowerName.includes('20-max') ||
    lowerName.includes('20 entry max') ||
    lowerName.includes('20-entry max')
  const infer150Max =
    lowerName.includes('150-max') ||
    lowerName.includes('150 entry max') ||
    lowerName.includes('150-entry max') ||
    lowerName.includes('mme') ||
    lowerName.includes('mass multi')
  const isSE = maxEntriesPerUser === 1 || (maxEntriesPerUser == null && inferSE)
  const is3Max = maxEntriesPerUser === 3 || (maxEntriesPerUser == null && infer3Max)
  const is20Max = maxEntriesPerUser === 20 || (maxEntriesPerUser == null && infer20Max)
  const is150Max = maxEntriesPerUser === 150 || (maxEntriesPerUser == null && infer150Max)

  const isGuaranteed = truthy(c.attr?.IsGuaranteed)
  const isDoubleUp = truthy(c.attr?.IsDoubleUp)
  const isFifty = truthy(c.attr?.IsFiftyfifty)
  const isQualifier = truthy(c.attr?.IsQualifier)

  const dg = c.dg ?? c.draftGroupId

  // infer if not present (defensive)
  const nameLc = (c.n || '').toLowerCase()
  const inferredType =
    nameLc.includes('showdown') || nameLc.includes('captain') ? 'Showdown Captain Mode' : 'Classic'

  return {
    id: String(c.id ?? idx),
    name: c.n || 'Contest',
    dg: dg != null ? String(dg) : undefined,
    buyIn,
    fieldMax,
    entered,
    fillPct: fieldMax > 0 ? Math.min(entered / fieldMax, 1) : 0,
    prizePool,
    firstPrize: firstPrize ?? null,
    firstPct,
    maxEntriesPerUser,
    isSE,
    is3Max,
    is20Max,
    is150Max,
    isGuaranteed,
    isDoubleUp,
    isFifty,
    isQualifier,
    gameType: c.gameType || inferredType,
  }
}

// Aggressive profile defaults
const AGGRESSIVE = {
  slateExposurePct: 0.08, // spend up to 8% of bankroll on a slate
  cashPct: 0.25,
  gppPct: 0.75,
  // selection rules
  minField: 50,
  maxField: 6000,
  maxFirstPct: 0.2, // 1st prize <= 20% of pool
  include3Max: true,
  include20Max: true,
  includeSE: true,
  avoid150Max: true,
  overlayThreshold: 0.9, // prefer contests <90% full (if guaranteed)
}

export type PickedContest = ContestView & {
  reason: string[] // bullets why it was included
  bucket: 'Cash' | 'GPP-SE' | 'GPP-3Max' | 'GPP-20Max' | 'Other'
}

export function pickAggressiveContests(
  rawContests: RawContest[],
  opts: {
    bankroll: number
    dg?: string | number
    allocation?: 'aggressive' | 'normal'
    profile?: Partial<typeof AGGRESSIVE>
  },
): {
  spendCap: number
  cashBudget: number
  gppBudget: number
  cashPct: number
  gppPct: number
  picks: PickedContest[]
} {
  const profile = { ...AGGRESSIVE, ...(opts.profile || {}) }
  const slateBudget = Math.max(0, Number(opts.bankroll) || 0) // interpret input as exact slate spend
  const allocation = opts.allocation || 'aggressive'
  const cashPct = allocation === 'normal' ? 0.6 : profile.cashPct // normal = safer 60/40
  const gppPct = 1 - cashPct

  const spendCap = Math.round(slateBudget * 100) / 100
  const cashBudget = Math.round(spendCap * cashPct * 100) / 100
  const gppBudget = Math.round(spendCap * gppPct * 100) / 100

  const normalized = rawContests.map(normalizeContest)
  const dgStr = opts.dg != null ? String(opts.dg) : undefined
  const filtered = normalized.filter(c => (dgStr ? c.dg === dgStr : true))

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

  const overlayScore = (c: ContestView) => (c.isGuaranteed ? 1 - c.fillPct : 0)
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

// ----------------- React UI -----------------
export default function ContestPickerAggressive() {
  const [jsonText, setJsonText] = useState<string>('')
  const [bankroll, setBankroll] = useState<string>('20')
  const [allocation, setAllocation] = useState<'aggressive' | 'normal'>('aggressive')
  const [dg, setDg] = useState<string>('')
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(true)
  const [gameType, setGameType] = useState<'ALL' | 'Classic' | 'Showdown Captain Mode'>('ALL')
  const [bucketFilter, setBucketFilter] = useState<
    'ALL' | 'Cash' | 'GPP-SE' | 'GPP-3Max' | 'GPP-20Max'
  >('ALL')

  const parsed = useMemo(() => {
    try {
      const raw = JSON.parse(jsonText || '{}')
      const arr: RawContest[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.Contests)
          ? raw.Contests
          : []
      return arr
    } catch {
      return []
    }
  }, [jsonText])

  const parsedFiltered = useMemo(() => {
    if (gameType === 'ALL') return parsed
    return parsed.filter(c => String(c.gameType || '').toLowerCase() === gameType.toLowerCase())
  }, [parsed, gameType])

  const result = useMemo(() => {
    return pickAggressiveContests(parsedFiltered, {
      bankroll: Number(bankroll || 0),
      dg: dg || undefined,
      allocation,
    })
  }, [parsedFiltered, bankroll, dg, allocation])

  const filteredPicks = useMemo(() => {
    const picks =
      bucketFilter === 'ALL' ? result.picks : result.picks.filter(p => p.bucket === bucketFilter)
    return showOnlyRecommended ? picks.filter(p => p.reason.length > 0) : picks
  }, [result, bucketFilter, showOnlyRecommended])

  // Split buckets for presentation - commented out as not currently used
  // const buckets = useMemo(() => {
  //   const out: Record<string, PickedContest[]> = { Cash: [], "GPP-SE": [], "GPP-3Max": [], Other: [] };
  //   for (const p of result.picks) out[p.bucket].push(p);
  //   return out;
  // }, [result]);

  return (
    <div className="p-6 space-y-6 bg-background-secondary">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span>
              <SquareMousePointer size={20} />
            </span>
            <h1 className="text-xl font-bold uppercase">Contest Selection</h1>
          </div>
          <p className="text-muted text-sm">
            The following tool will help you pick contests for your slate by building an aggressive
            profile and picking contests that fit that profile.
          </p>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Info className="w-4 h-4" />
          Paste contests JSON and set slate spend/dg
        </div>
      </div>

      <Card className="shadow-lg py-4 rounded">
        <CardContent className="space-y-4">
          <div className=" flex items-center gap-8">
            <div>
              <Label className="text-sm text-muted">Slate spend ($)</Label>
              <Input
                type="number"
                value={bankroll}
                onChange={e => setBankroll(e.target.value)}
                placeholder="20"
                className="w-24 border border-background-darker"
              />
            </div>
            <div>
              <Label className="text-sm text-muted">Slate (dg / draftGroupId)</Label>
              <Input
                value={dg}
                onChange={e => setDg(e.target.value)}
                placeholder="e.g. 78645"
                className="w-40 border border-background-darker"
              />
            </div>
            <div>
              <Label className="text-sm text-muted">Game Type</Label>
              <Select
                value={gameType}
                onValueChange={v => setGameType(v as 'ALL' | 'Classic' | 'Showdown Captain Mode')}
              >
                <SelectTrigger className="w-56 border border-background-darker">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent className="bg-background-darker">
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="Classic">Classic</SelectItem>
                  <SelectItem value="Showdown Captain Mode">Showdown Captain Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-muted">Allocation</Label>
              <Select
                value={allocation}
                onValueChange={v => setAllocation(v as 'aggressive' | 'normal')}
              >
                <SelectTrigger className="border border-background-darker">
                  <SelectValue placeholder="Aggressive" />
                </SelectTrigger>
                <SelectContent className="bg-background-darker">
                  <SelectItem value="aggressive">Aggressive (25% Cash / 75% GPP)</SelectItem>
                  <SelectItem value="normal">Normal (60% Cash / 40% GPP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-muted">Bucket Filter</Label>
              <Select
                value={bucketFilter}
                onValueChange={v =>
                  setBucketFilter(v as 'ALL' | 'Cash' | 'GPP-SE' | 'GPP-3Max' | 'GPP-20Max')
                }
              >
                <SelectTrigger className="w-40 border border-background-darker">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="bg-background-darker">
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="GPP-SE">GPP-SE</SelectItem>
                  <SelectItem value="GPP-3Max">GPP-3Max</SelectItem>
                  <SelectItem value="GPP-20Max">GPP-20Max</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={showOnlyRecommended}
                onCheckedChange={setShowOnlyRecommended}
                id="rec-only"
              />
              <Label htmlFor="rec-only">Show only recommended</Label>
            </div>
            <div className="flex gap-2 pt-6">
              <Button variant="secondary" type="button" onClick={() => setJsonText('')}>
                Clear
              </Button>
              <label className="inline-flex items-center gap-2 cursor-pointer text-primary">
                <Upload className="w-4 h-4" />
                Import file
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={async e => {
                    const f = e.target.files?.[0]
                    if (f) {
                      const txt = await f.text()
                      setJsonText(txt)
                    }
                  }}
                />
              </label>
            </div>
          </div>
          <div>
            <Label>Contests JSON</Label>
            <textarea
              className="w-full min-h-[180px] rounded-md border p-3 font-mono text-sm"
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              placeholder='{"Contests": [...]}'
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="rounded">
          <CardHeader className="bg-background-secondary py-4">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Budget ({allocation === 'aggressive' ? 'Aggressive 25/75' : 'Normal 60/40'})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm py-4">
            <div>
              Slate spend (exact): <b>${result.spendCap.toFixed(2)}</b>
            </div>
            <div>
              Cash budget ({Math.round(result.cashPct * 100)}%):{' '}
              <b>${result.cashBudget.toFixed(2)}</b>
            </div>
            <div>
              GPP budget ({Math.round(result.gppPct * 100)}%): <b>${result.gppBudget.toFixed(2)}</b>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded">
          <CardHeader className="bg-background-secondary py-4">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Rules Used
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1 py-4">
            <div>• Single-Entry, 3-Max & 20-Max only; avoid 150-Max</div>
            <div>• Field size between 50 and 5,000</div>
            <div>• 1st prize ≤ 20% of prize pool</div>
            <div>• Ignore overlay (fill %) in selection</div>
          </CardContent>
        </Card>

        <Card className="rounded">
          <CardHeader className="bg-background-secondary py-4">
            <CardTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Slate Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm py-4">
            {dg ? (
              <div>
                Filtering by <b>dg = {dg}</b>
              </div>
            ) : (
              <div>No dg filter applied</div>
            )}
            <div className="text-muted-foreground">
              (Uses <code>dg</code> or <code>draftGroupId</code> from your JSON)
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden rounded">
        <CardHeader className="bg-background-secondary py-4">
          <CardTitle>Recommended Contests</CardTitle>
        </CardHeader>
        <CardContent className="p-0 py-4 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[260px]">Name</TableHead>
                <TableHead>dg</TableHead>
                <TableHead className="text-right">Buy-in</TableHead>
                <TableHead className="text-right">Field</TableHead>
                <TableHead className="text-right">Entered</TableHead>
                <TableHead className="text-right">Fill%</TableHead>
                <TableHead className="text-right">Prize Pool</TableHead>
                <TableHead className="text-right">1st%</TableHead>
                <TableHead>Bucket</TableHead>
                <TableHead>Why</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPicks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-24">
                    No contests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPicks.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.dg ?? '—'}</TableCell>
                    <TableCell className="text-right">${p.buyIn.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{p.fieldMax.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{p.entered.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{(p.fillPct * 100).toFixed(1)}%</TableCell>
                    <TableCell className="text-right">${p.prizePool.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {p.firstPct != null ? `${(p.firstPct * 100).toFixed(1)}%` : '—'}
                    </TableCell>
                    <TableCell>{p.bucket}</TableCell>
                    <TableCell>
                      <ul className="list-disc pl-4 text-sm text-muted-foreground">
                        {p.reason.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
