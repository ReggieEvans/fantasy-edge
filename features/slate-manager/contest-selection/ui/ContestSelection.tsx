'use client'

import { DollarSign, Filter, SquareMousePointer } from 'lucide-react'
import React, { useMemo, useState } from 'react'

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
import { getErrorMessage } from '@/utils/getErrorMessage'

import { useGetContestsQuery } from '../api/contest-selection.api'
import { pickContests } from '../libs/pickContests'
import { DkContest } from '../types/ContestTypes'
import { columns, DataTable } from './DataTable'

type Props = {
  sport: string
  draftGroupId: number
}

export default function ContestSelection({ sport, draftGroupId }: Props) {
  const [bankroll, setBankroll] = useState<number>(20)
  const [allocation, setAllocation] = useState<'aggressive' | 'normal'>('aggressive')
  const [maxEntryFee, setMaxEntryFee] = useState<'ALL' | '1' | '3' | '5' | '10'>('ALL')
  const [bucketFilter, setBucketFilter] = useState<
    'ALL' | 'Cash' | 'GPP-SE' | 'GPP-3Max' | 'GPP-20Max'
  >('ALL')
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(true)

  const {
    data: rawContests = [],
    isFetching,
    isLoading,
    isError,
    error,
  } = useGetContestsQuery(
    { sport, draftGroupId },
    {
      selectFromResult: ({ data, ...rest }) => {
        const contests = data ?? []
        return { data: contests as DkContest[], ...rest }
      },
    },
  )

  const result = useMemo(
    () =>
      pickContests(rawContests as DkContest[], {
        bankroll: Number(bankroll || 0),
        dg: draftGroupId || undefined,
        allocation,
      }),
    [rawContests, bankroll, draftGroupId, allocation],
  )

  const filteredPicks = useMemo(() => {
    let picks = result.picks
    if (bucketFilter !== 'ALL') picks = picks.filter(p => p.bucket === bucketFilter)
    if (maxEntryFee !== 'ALL') picks = picks.filter(p => p.buyIn <= Number(maxEntryFee))
    return showOnlyRecommended ? picks.filter(p => p.reason.length > 0) : picks
  }, [result, bucketFilter, maxEntryFee, showOnlyRecommended])

  const loading = isLoading || isFetching

  if (isError) return <div className="p-6 text-red-500">Error: {getErrorMessage(error)}</div>

  return (
    <div className="p-6 space-y-6 bg-background-secondary rounded-tl-[40px] min-h-[calc(100vh-90px)]">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span>
              <SquareMousePointer size={20} />
            </span>
            <h1 className="text-xl font-bold uppercase">Contest Selection</h1>
          </div>
          <p className="text-muted text-sm">
            Picks contests for your active slate&apos;s Draft Group automatically.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        <Card className="shadow-lg py-4 rounded bg-card">
          <CardContent className="space-y-4">
            <div className="flex items-center gap-8 flex-wrap">
              <div>
                <Label className="text-sm text-muted">Slate spend ($)</Label>
                <Input
                  type="number"
                  value={bankroll}
                  onChange={e => setBankroll(Number(e.target.value))}
                  placeholder="20"
                  className="w-24 border border-background-darker"
                />
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

              <div>
                <Label className="text-sm text-muted">Max Entry Fee ($)</Label>
                <Select
                  value={maxEntryFee}
                  onValueChange={v => setMaxEntryFee(v as 'ALL' | '1' | '3' | '5' | '10')}
                >
                  <SelectTrigger className="w-40 border border-background-darker">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent className="bg-background-darker">
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="1">$1.00</SelectItem>
                    <SelectItem value="3">$3.00</SelectItem>
                    <SelectItem value="5">$5.00</SelectItem>
                    <SelectItem value="10">$10.00</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <Switch
                  className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-[#525361]"
                  checked={showOnlyRecommended}
                  onCheckedChange={setShowOnlyRecommended}
                  id="rec-only"
                />
                <Label htmlFor="rec-only">Show only recommended</Label>
              </div>

              {loading && <div className="pt-6 text-sm">Loading contests…</div>}
              {error && (
                <div className="pt-6 text-sm text-red-500">Error: {getErrorMessage(error)}</div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="rounded col-span-1 bg-background-secondary">
            <CardHeader className="bg-card py-4 border-b border-accent">
              <CardTitle className="flex items-center gap-2">
                <DollarSign size={14} className="mb-[1px]" />
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
                GPP budget ({Math.round(result.gppPct * 100)}%):{' '}
                <b>${result.gppBudget.toFixed(2)}</b>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded col-span-2 bg-background-secondary">
            <CardHeader className="bg-card py-4 border-b border-accent">
              <CardTitle className="flex items-center gap-2">
                <Filter size={14} className="mb-[1px]" />
                Rules Used
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-start gap-16 text-sm py-4">
              <div>
                <ul className="list-disc pl-4">
                  <li>Prioritize Single-Entry, 3-Max & 20-Max only; avoid 150-Max</li>
                  <li>Avoid contests with 150-Max</li>
                  <li>Field size between 50 and 5,000</li>
                </ul>
              </div>
              <div>
                <ul className="list-disc pl-4">
                  <li>1st prize ≤ 20% of prize pool</li>
                  <li>Ignore overlay (fill %) in selection</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded bg-background-secondary">
          <CardHeader className="bg-card py-4 border-b border-accent">
            <CardTitle>Recommended Contests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={filteredPicks}
              initialPageSize={10}
              pageSizeOptions={[10, 25]}
              className="px-6 py-4"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
