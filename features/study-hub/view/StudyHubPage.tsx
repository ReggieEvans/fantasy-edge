/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import {
  ArrowBigLeftDashIcon,
  ArrowBigRightDashIcon,
  Brain,
  Flame,
  Layers,
  Loader2,
  Snowflake,
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { EnrichedStudyUpload } from '@/shared/types/study-hub/types'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import FeatureHeader from '@/shared/ui/FeatureHeader'
import { NoData } from '@/shared/ui/NoData'
import { RootState } from '@/store'
import { cn } from '@/utils/cn'

import { getTemplate } from '../lib/orderByTemplate'
import { orderByTemplate } from '../lib/orderByTemplate'

const NFL_POSITION_FILTERS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'DST']
const CFB_POSITION_FILTERS = ['ALL', 'QB', 'RB', 'WR']

export default function StudyHubPage() {
  const [data, setData] = useState<EnrichedStudyUpload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const username = useSelector((state: RootState) => state.auth.user_name)

  const [userFilter, setUserFilter] = useState('')
  const [playerFilter, setPlayerFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [slotFilter, setSlotFilter] = useState<'ALL' | 'CPT' | 'FLEX'>('ALL')
  const [posFilter, setPosFilter] = useState<'ALL' | 'QB' | 'RB' | 'WR' | 'TE' | 'DST'>('ALL')
  const [usageView, setUsageView] = useState<'full' | 'all' | 'buckets'>('full')
  const [file, setFile] = useState<File | null>(null)
  const active = usageView === 'full' ? data?.usage.full : data?.usage.all

  const [userPage, setUserPage] = useState(1)
  const [userPageSize, setUserPageSize] = useState(50)

  const [playersPage, setPlayersPage] = useState(1)
  const [playersPageSize, setPlayersPageSize] = useState(50)

  useEffect(() => {
    setUserPage(1)
  }, [userFilter, data])
  useEffect(() => {
    setPlayersPage(1)
  }, [playerFilter, data])

  const isShowdown = data?.meta.gameType === 'showdown'

  async function onUpload(
    file: File,
    opts?: {
      sport?: string
      gameType?: 'classic' | 'showdown'
      valueBaseline?: number
      username?: string
    },
  ) {
    setData(null)
    setLoading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.set('file', file)
      if (opts?.sport) fd.set('sport', opts.sport)
      if (opts?.gameType) fd.set('gameType', opts.gameType)
      if (opts?.valueBaseline) fd.set('valueBaseline', String(opts.valueBaseline))
      if (username) fd.set('username', username)
      const res = await fetch('/api/study-hub', { method: 'POST', body: fd })
      if (!res.ok) throw new Error(await res.text())
      const json = (await res.json()) as EnrichedStudyUpload
      setData(json)
      setSelectedEntryId(json.entries[0]?.entryId ?? null)
      setSelectedUser(json.entries[0]?.username ?? json.users[0]?.username ?? null)
    } catch (e: any) {
      setError(e?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  function normalizeName(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '')
  }

  const globalExposure = useMemo(() => {
    if (!data) return []
    const q = playerFilter.trim().toLowerCase()
    const arr = [...data.contestPlayerExposures]
    return q ? arr.filter(p => (p.player || '').toLowerCase().includes(q)) : arr
  }, [data, playerFilter])

  const selectedUserEntries = useMemo(() => {
    if (!data || !selectedUser) return []
    return data.entries.filter(e => e.username === selectedUser).sort((a, b) => a.rank - b.rank)
  }, [data, selectedUser])

  const userAggregate = useMemo(() => {
    if (!data || !selectedUser) return null
    const u = data.users.find(x => x.username === selectedUser)
    return u || null
  }, [data, selectedUser])

  const entriesIndex = useMemo(() => {
    if (!data) return []
    const counts = new Map<string, number>()
    for (const u of data.users) counts.set(u.username, u.entries)

    const q = userFilter.trim().toLowerCase()
    const arr = data.entries
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .map(e => ({ ...e, userEntries: counts.get(e.username) ?? 1 }))

    return q
      ? arr.filter(
          e =>
            e.username.toLowerCase().includes(q) ||
            e.entryName.toLowerCase().includes(q) ||
            String(e.rank).includes(q),
        )
      : arr
  }, [data, userFilter])

  const selectedEntry = useMemo(() => {
    if (!data) return null
    if (selectedEntryId) return data.entries.find(e => e.entryId === selectedEntryId) ?? null
    if (selectedUser) return data.entries.find(e => e.username === selectedUser) ?? null
    return null
  }, [data, selectedEntryId, selectedUser])

  const userExposure = useMemo(() => {
    if (!data || !selectedUser) return []
    const counts = new Map<string, number>()
    const eligibleBySlot = new Map<string, Set<string>>()
    const eligibleByPos = new Map<string, Set<string>>()

    for (const e of selectedUserEntries) {
      const seen = new Set<string>()
      for (const p of e.lineup) {
        const key = normalizeName(p.name)
        if (!seen.has(key)) {
          seen.add(key)
          counts.set(key, (counts.get(key) ?? 0) + 1)
        }
        if (!eligibleBySlot.has(p.slot)) eligibleBySlot.set(p.slot, new Set())
        eligibleBySlot.get(p.slot)!.add(key)
        const base = (p.position || '').toUpperCase()
        if (base) {
          if (!eligibleByPos.has(base)) eligibleByPos.set(base, new Set())
          eligibleByPos.get(base)!.add(key)
        }
      }
    }
    const total = Math.max(1, selectedUserEntries.length)
    const fieldPct = new Map<string, number>()
    for (const g of data.contestPlayerExposures) fieldPct.set(normalizeName(g.player), g.fieldPct)

    const expected = new Map<string, number>()
    const actual = new Map<string, number>()
    const icon = new Map<string, string>()
    const teamUrl = new Map<string, string>()
    for (const g of data.contestPlayerExposures) {
      expected.set(normalizeName(g.player), g.expected ?? 0)
      actual.set(normalizeName(g.player), g.actual ?? 0)
      icon.set(normalizeName(g.player), g.icon ?? '•')
      teamUrl.set(normalizeName(g.player), g.team?.logos?.[1] ?? '')
    }

    let eligible: Set<string> | null = null
    if (isShowdown && slotFilter !== 'ALL')
      eligible = new Set(eligibleBySlot.get(slotFilter)?.values() ?? [])
    if (posFilter !== 'ALL') {
      const posSet = new Set(eligibleByPos.get(posFilter)?.values() ?? [])
      eligible = eligible ? new Set([...eligible].filter(x => posSet.has(x))) : posSet
    }

    const rows = Array.from(counts.entries()).map(([key, c]) => {
      return {
        playerKey: key,
        player: key,
        user_pct: c / total,
        field_pct: fieldPct.get(key) ?? 0,
        expected: expected.get(key) ?? 0,
        actual: actual.get(key) ?? 0,
        icon: icon.get(key) ?? '•',
        teamUrl: teamUrl.get(key) ?? '',
      }
    })

    const nameLookup = new Map<string, string>()
    for (const e of selectedUserEntries)
      for (const p of e.lineup) nameLookup.set(normalizeName(p.name), p.name)
    for (const g of data.contestPlayerExposures) nameLookup.set(normalizeName(g.player), g.player)

    const filtered = rows
      .filter(r => !eligible || eligible.has(r.playerKey))
      .map(r => ({ ...r, player: nameLookup.get(r.playerKey) || r.playerKey }))
      .sort((a, b) => b.user_pct - a.user_pct)
    return filtered
  }, [data, selectedUser, selectedUserEntries, isShowdown, slotFilter, posFilter])

  const userDistinctByPos = useMemo(() => {
    const sets = {
      ALL: new Set<string>(),
      QB: new Set<string>(),
      RB: new Set<string>(),
      WR: new Set<string>(),
      TE: new Set<string>(),
      DST: new Set<string>(),
    }
    for (const e of selectedUserEntries) {
      for (const p of e.lineup) {
        const key = normalizeName(p.name)
        sets.ALL.add(key)
        const base = (p.position || '').toUpperCase() as keyof typeof sets
        if (base && sets[base]) sets[base].add(key)
      }
    }
    return {
      ALL: sets.ALL.size,
      QB: sets.QB.size,
      RB: sets.RB.size,
      WR: sets.WR.size,
      TE: sets.TE.size,
      DST: sets.DST.size,
    }
  }, [selectedUserEntries])

  const findExposure = (playerName: string) => {
    const key = normalizeName(playerName)
    const field = data
      ? (data.contestPlayerExposures.find(g => normalizeName(g.player) === key)?.fieldPct ?? 0)
      : 0
    const user = userExposure.find(x => normalizeName(x.player) === key)?.user_pct ?? 0
    return { field_pct: field, user_pct: user }
  }

  const entriesTotal = entriesIndex.length
  const entriesPages = Math.max(1, Math.ceil(entriesTotal / userPageSize))
  const entriesStart = entriesTotal ? (userPage - 1) * userPageSize + 1 : 0
  const entriesEnd = Math.min(userPage * userPageSize, entriesTotal)
  const entriesPageItems = useMemo(
    () => entriesIndex.slice((userPage - 1) * userPageSize, userPage * userPageSize),
    [entriesIndex, userPage, userPageSize],
  )

  const playersTotal = globalExposure.length
  const playersPages = Math.max(1, Math.ceil(playersTotal / playersPageSize))
  const playersStart = playersTotal ? (playersPage - 1) * playersPageSize + 1 : 0
  const playersEnd = Math.min(playersPage * playersPageSize, playersTotal)
  const playersPageItems = useMemo(
    () => globalExposure.slice((playersPage - 1) * playersPageSize, playersPage * playersPageSize),
    [globalExposure, playersPage, playersPageSize],
  )

  const getIcon = (icon: string | null) => {
    if (icon === 'EXCEEDED') return <Flame size={20} className="text-orange-600 fill-orange-600" />
    if (icon === 'FAILED') return <Snowflake size={20} className="text-sky-500 fill-sky-500" />
    return null
  }

  const template = getTemplate(data?.meta.sport ?? 'NFL', data?.meta.gameType ?? 'CLASSIC')
  const ordered =
    selectedEntry && template.length
      ? orderByTemplate(
          selectedEntry.lineup.map(p => ({
            ...p,
            position: p.position ?? undefined,
            salary: p.salary ?? undefined,
            expected: p.expected ?? undefined,
            actual: p.actual ?? undefined,
            icon: p.icon ?? undefined,
            imageUrl: p.imageUrl ?? undefined,
            is_stack: p.is_stack ?? undefined,
            is_game_stack: p.is_game_stack ?? undefined,
            team: p.team ?? undefined,
          })),
          template,
        )
      : (selectedEntry?.lineup ?? [])

  return (
    <div className="px-6 bg-background pt-8 min-h-[calc(100vh-90px)] overflow-y-auto pb-16">
      <FeatureHeader
        icon={<Brain size={20} />}
        title="Study Hub"
        description="Study Hub is a tool that allows you to study your results and your opponents results from past contests."
      />
      <div className="grid grid-cols-12 gap-4 mb-8">
        <Card className="col-span-4 bg-background-secondary border border-background-darker rounded p-0">
          <CardHeader className="flex bg-card py-4 border-b border-background-darker">
            <CardTitle className="font-bold">Upload CSV</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-start py-4">
            <div className="flex flex-col gap-1 text-muted uppercase w-full">
              <div className="flex gap-2 w-full">
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="file-upload"
                    className="text-xs font-bold text-muted-foreground pl-1"
                  >
                    Upload CSV
                  </Label>
                  <Input
                    className="md:text-xs md:leading-7 border border-card bg-background-darker"
                    type="file"
                    accept=".csv"
                    onChange={e => {
                      setFile(e.target.files?.[0] ?? null)
                    }}
                  />
                </div>
                <div className="flex items-end justify-end">
                  <button
                    className="btn-accent py-1.5 mb-1 disabled:opacity-50"
                    onClick={() => file && onUpload(file, { username: username ?? undefined })}
                    disabled={!file}
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-4 bg-background-secondary border border-background-darker rounded">
          <CardHeader className="flex bg-card py-4 border-b border-background-darker">
            <CardTitle className="font-bold">Contest Details</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <div className="flex flex-col gap-1 py-2 px-4">
              <div className="flex items-center justify-start gap-4 text-xs font-bold mb-0">
                <div className="text-center border-b border-muted text-muted px-2 py-1 w-24">
                  Contest
                </div>
                <div className="text-center border-b border-muted text-muted px-2 py-1 w-24">
                  {' '}
                  Game Type
                </div>
                <div className="text-center border-b border-muted text-muted px-2 py-1 w-24">
                  Sport
                </div>
                <div className="text-center border-b border-muted text-muted px-2 py-1 w-24">
                  Entry Fee
                </div>
                <div className="text-center border-b border-muted text-muted px-2 py-1 w-24">
                  Entries
                </div>
              </div>
              <div className="flex items-center justify-start gap-4 text-sm font-bold">
                <div className="text-center px-2 py-1 w-24">{data?.meta.contestId || '--'}</div>
                <div className="text-center px-2 py-1 w-24">
                  {data?.meta.gameType.toUpperCase() || '--'}
                </div>
                <div className="text-center px-2 py-1 w-24">{data?.meta.sport || '--'}</div>
                <div className="text-center px-2 py-1 w-24">
                  ${data?.meta.entryFeeDollars.toFixed(2) || '--'}
                </div>
                <div className="text-center px-2 py-1 w-24">
                  {data?.meta.entries.toLocaleString() || '--'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-4 bg-background-secondary border border-background-darker rounded p-0">
          <CardHeader className="flex justify-between bg-card py-4 border-b border-background-darker">
            <CardTitle className="font-bold">
              {data?.usernameSummary?.Username || 'Entry'} Details
            </CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            {data?.usernameSummary ? (
              <div className="flex items-center justify-start gap-4 text-sm font-bold">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted">Total Spent</span>
                  <Badge
                    variant="outline"
                    className="px-8 py-4 text-2xl font-black text-accent-foreground bg-accent"
                  >
                    ${(data?.usernameSummary?.Spent).toFixed(2)}
                  </Badge>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted">Winnings</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'bg-card text-foreground px-8 py-4 text-2xl font-black',
                      data?.usernameSummary.Winnings > 0
                        ? 'text-green-500 bg-green-500/20'
                        : 'text-red-500 bg-red-500/20',
                    )}
                  >
                    ${(data?.usernameSummary.Winnings).toFixed(2) || '--'}
                  </Badge>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted">Contest ROI</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'bg-card text-foreground px-8 py-4 text-2xl font-black',
                      data?.usernameSummary.ROI > 0
                        ? 'text-green-500 bg-green-500/20'
                        : 'text-red-500 bg-red-500/20',
                    )}
                  >
                    {(data?.usernameSummary.ROI * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center py-4">
                <div className="text-center text-sm opacity-50">
                  Draftkings username not provided or not found
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {!loading && !data && (
        <NoData
          title="Upload CSV Data"
          description="Upload a DraftKings contest CSV data file to get started."
        />
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center max-w-[350px] mx-auto pt-24 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin text-accent" size={20} />
            <h2 className="text-muted text-center text-lg font-bold opacity-70">Uploading...</h2>
          </div>
          <p className="text-muted text-center text-sm opacity-50">
            We are loading your data from the CSV file.
          </p>
        </div>
      )}

      {error && <ErrorMessage errorTitle="Error" errorMessage={error} />}

      {data && (
        <div className="grid grid-cols-12 gap-4 mb-8">
          {/* LEFT: Users w/ spend, won, ROI */}
          <Card className="col-span-3 bg-background-secondary border border-background-darker rounded">
            <CardHeader className="flex flex-row items-center justify-between gap-2 py-4 bg-card border-b border-background-darker">
              <CardTitle className="font-bold w-1/4">Rankings</CardTitle>
              <Input
                className="w-[200px] bg-background-secondary"
                placeholder="Search rank, or user…"
                value={userFilter}
                onChange={e => setUserFilter(e.target.value)}
              />
            </CardHeader>
            <CardContent className="py-4">
              <ScrollArea className="h-[680px] rounded">
                <div>
                  {entriesPageItems.map(e => (
                    <button
                      key={e.entryId}
                      className={cn(
                        `w-full text-left hover:bg-background-secondary hover:text-accent bg-card
                            border border-background-secondary hover:border hover:border-background-darker 
                            hover:border-l-2 hover:border-l-accent border-l-2 border-l-transparent
                            transition mb-1 rounded focus:bg-background-darker`,
                        (selectedEntryId === e.entryId || selectedUser === e.username) &&
                          'bg-background-darker border-l-2 border-l-accent',
                      )}
                      onClick={() => {
                        setSelectedUser(e.username)
                        setSelectedEntryId(e.entryId)
                      }}
                    >
                      <div className="relative flex items-center justify-between pt-2 px-4">
                        <div
                          className={cn(
                            `absolute -left-2 top-0 text-6xl font-black text-accent opacity-5 italic`,
                            selectedEntryId === e.entryId && 'opacity-15',
                          )}
                        >
                          {e.rank}
                        </div>
                        <div className="truncate font-bold text-lg">{e.username}</div>
                        <div className="text-xs text-muted">
                          Entries: <span className="font-bold">{e.userEntries}</span>
                        </div>
                      </div>
                      <div className="text-xs flex items-center justify-end px-4 pb-2">
                        <span className="text-muted">
                          Won:{' '}
                          <span
                            className={cn(
                              'font-bold',
                              e.wonCents > 0 ? 'text-green-500' : 'text-red-500',
                            )}
                          >
                            ${(e.wonCents / 100).toFixed(2)}
                          </span>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <div className="flex items-center justify-between text-xs text-muted w-full">
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="flex items-center gap-1">
                      <button
                        className="px-2 py-1 border rounded bg-card flex items-center gap-1 disabled:opacity-50"
                        disabled={userPage <= 1}
                        onClick={() => setUserPage(p => Math.max(1, p - 1))}
                      >
                        <ArrowBigLeftDashIcon size={16} />
                        Prev
                      </button>
                      <span className="text-xs text-muted px-4">
                        {userPage}/{entriesPages}
                      </span>
                      <button
                        className="px-2 py-1 border rounded bg-card flex items-center gap-1 disabled:opacity-50"
                        disabled={userPage >= entriesPages}
                        onClick={() => setUserPage(p => Math.min(entriesPages, p + 1))}
                      >
                        Next
                        <ArrowBigRightDashIcon size={16} />
                      </button>
                    </div>

                    <div>
                      <select
                        className="border rounded px-2 py-1 bg-card"
                        value={userPageSize}
                        onChange={e => {
                          setUserPageSize(Number(e.target.value))
                          setUserPage(1)
                        }}
                      >
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-xs text-muted text-center pt-4">
                    Showing {entriesStart}-{entriesEnd} of {entriesTotal.toLocaleString()} entries
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>

          <div className="col-span-5 space-y-4">
            <Card className="col-span-5 bg-background-secondary border border-background-darker rounded">
              <CardHeader className="flex flex-row items-center justify-between gap-2 py-4 bg-card border-b border-background-darker">
                <CardTitle>
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-muted">Entries</div>
                    {selectedUser ?? 'Select a user'}
                  </div>
                </CardTitle>
                {userAggregate && (
                  <div className="flex gap-4 text-xs text-muted">
                    <div className="flex flex-col gap-1 items-center">
                      <div className="text-xs text-muted">Spent</div>
                      <div className="text-xs font-bold">
                        ${userAggregate.spendDollars.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-center">
                      <div className="text-xs text-muted">Won</div>
                      <div
                        className={cn(
                          'text-xs font-bold',
                          userAggregate.wonDollars > 0 ? 'text-green-500' : 'text-red-500',
                        )}
                      >
                        ${userAggregate.wonDollars.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-center">
                      <div className="text-xs text-muted">ROI</div>
                      <div
                        className={cn(
                          'text-xs font-bold',
                          userAggregate.roi > 0 ? 'text-green-500' : 'text-red-500',
                        )}
                      >
                        {(userAggregate.roi * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-56 rounded">
                  <Table className="relative">
                    <TableHeader className="sticky top-0 z-10 bg-background-secondary text-xs text-muted">
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead>Entry</TableHead>
                        <TableHead className="text-center">Points</TableHead>
                        <TableHead className="text-center">Prize</TableHead>
                        <TableHead className="text-center">ROI</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {selectedUserEntries.map(e => {
                        const isSelected = e.entryId === selectedEntryId
                        return (
                          <TableRow
                            key={e.entryId}
                            role="row"
                            aria-selected={isSelected}
                            data-selected={isSelected}
                            onClick={() => setSelectedEntryId(e.entryId)}
                            className={[
                              'cursor-pointer text-xs',
                              'bg-card hover:bg-muted/60',
                              isSelected
                                ? 'bg-background-darker border-l-2 border-l-accent hover:bg-background-darker'
                                : '',
                            ].join(' ')}
                          >
                            <TableCell>#{e.rank}</TableCell>
                            <TableCell className="truncate">{e.entryName}</TableCell>
                            <TableCell className="text-center">{e.points.toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                              ${(e.wonCents / 100).toFixed(2)}
                            </TableCell>
                            <TableCell className="flex items-center justify-end gap-2 pr-8">
                              {(e.roi * 100).toFixed(1)}%
                              <span
                                className={cn(
                                  'w-2 h-2 rounded-full',
                                  e.roi > 0 ? 'bg-green-500' : 'bg-red-500',
                                )}
                              ></span>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            {selectedEntry && (
              <Card
                id="lineup-detail"
                className="col-span-3 bg-background-secondary border border-background-darker rounded"
              >
                <CardHeader className="flex flex-row items-center justify-between gap-2 py-4 bg-card border-b border-background-darker">
                  <CardTitle className="flex items-center justify-between font-bold w-full">
                    <span>Lineup #{selectedEntry.rank}</span>
                    <span>{selectedEntry.points.toFixed(2)} pts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col py-4">
                  <div className="flex text-xs opacity-80 text-muted font-bold w-full justify-between mb-1 px-2">
                    <div className="flex items-center">
                      <div className="w-[40px]">Slot</div>
                      <div className="w-[200px]">Name</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-[40px] text-center">Stk</div>
                      <div className="w-[60px] text-center">Pos</div>
                      <div className="w-[60px] text-center">Salary</div>
                      <div className="w-[60px] text-center">Exp</div>
                      <div className="w-[60px] text-center">Pts</div>
                      <div className="w-[40px] text-center"></div>
                      <div className="w-[60px] text-center">User%</div>
                      <div className="w-[60px] text-center">Field%</div>
                    </div>
                  </div>
                  {ordered.map((p, idx) => {
                    if (!p) {
                      const slot = template[idx]
                      return (
                        <div
                          key={`missing-${idx}`}
                          className="flex justify-between opacity-60 italic"
                        >
                          <div className="flex items-center text-muted">
                            <div className="opacity-80 w-[40px]">{slot}</div>
                            <div className="w-[200px]">—</div>
                          </div>
                          <div className="flex items-center">
                            <div className="text-sm opacity-80 text-center w-[40px]">—</div>
                            <div className="text-sm opacity-80 text-center w-[60px]">—</div>
                            <div className="text-sm opacity-80 w-[60px] text-center">—</div>
                            <div className="text-sm opacity-80 w-[60px] text-center">—</div>
                            <div className="text-sm opacity-80 w-[60px] text-center">—</div>
                            <div className="w-[40px] text-center">•</div>
                            <div className="text-sm opacity-80 w-[60px] text-center">—</div>
                            <div className="text-sm opacity-80 w-[60px] text-center">—</div>
                          </div>
                        </div>
                      )
                    }
                    const ex = findExposure(p.name)
                    const icon = p.icon ?? '•'
                    const color = `${p.team?.color}50`

                    return (
                      <div
                        key={`${p.slot}-${p.name}-${idx}`}
                        style={{ backgroundColor: color }}
                        className="flex justify-between p-2 rounded mb-1"
                      >
                        <div className="flex items-center text-sm">
                          <div className="opacity-80 w-[40px]">{p.slot}</div>
                          <div className="w-[200px] text-foreground font-bold flex items-center">
                            {p.imageUrl && (
                              <Image
                                src={p.team?.logos?.[1] ?? ''}
                                alt={p.name}
                                width={28}
                                height={28}
                                className="mr-2"
                              />
                            )}
                            {p.name}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-sm opacity-80 text-center w-[40px] flex justify-center">
                            {p.is_stack || p.is_game_stack ? (
                              <Layers size={16} className="text-sky-500" />
                            ) : null}
                          </div>
                          <div className="text-sm opacity-80 text-center w-[60px]">
                            {p.position ?? '—'}
                          </div>
                          <div className="text-sm opacity-80 w-[60px] text-center">
                            {p.salary ? `$${p.salary.toLocaleString()}` : '—'}
                          </div>
                          <div className="text-sm opacity-80 w-[60px] text-center">
                            {p.expected?.toFixed(1) ?? '—'}
                          </div>
                          <div className="text-sm opacity-80 w-[60px] text-center text-foreground font-bold">
                            {p.actual?.toFixed(1) ?? '—'}
                          </div>
                          <div className="w-[40px] text-center">{getIcon(icon)}</div>
                          <div className="text-sm opacity-80 w-[60px] text-center">
                            {(ex.user_pct * 100).toFixed(0)}%
                          </div>
                          <div className="text-sm opacity-80 w-[60px] text-center">
                            {(ex.field_pct * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="col-span-4 bg-background-secondary border border-card rounded">
            <CardHeader className="flex flex-row items-center justify-between gap-2 py-4 bg-card border-b border-background-darker">
              <CardTitle>
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-muted">Exposure</div>
                  {selectedUser ?? 'Select a user'}
                </div>
              </CardTitle>
              <div>
                {selectedUser && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="text-xs text-muted">Unique Players</div>
                    <div className="text-center">
                      <span className="font-bold">
                        {(() => {
                          const s = new Set<string>()
                          for (const e of selectedUserEntries)
                            for (const p of e.lineup) s.add(normalizeName(p.name))
                          return s.size
                        })()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {isShowdown && (
                  <div className="flex gap-1 pt-4">
                    {(['ALL', 'CPT', 'FLEX'] as const).map(v => (
                      <button
                        key={v}
                        className={cn(
                          'px-2 py-1 text-xs rounded border',
                          slotFilter === v && 'bg-muted',
                        )}
                        onClick={() => setSlotFilter(v)}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex justify-between w-full gap-2 py-2">
                  {(data?.meta.sport === 'NFL' ? NFL_POSITION_FILTERS : CFB_POSITION_FILTERS).map(
                    v => (
                      <button
                        key={v}
                        className={cn(
                          'px-2 py-1 text-xs rounded border bg-card w-full text-foreground',
                          posFilter === v &&
                            'bg-gradient-to-br from-accent-gradient-1 to-accent-gradient-2 text-accent-foreground font-bold',
                        )}
                        onClick={() => setPosFilter(v as 'ALL' | 'QB' | 'RB' | 'WR' | 'TE' | 'DST')}
                      >
                        {v}{' '}
                        <span className="ml-1 opacity-70">
                          ({userDistinctByPos[v as keyof typeof userDistinctByPos]})
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </div>
              <ScrollArea className="h-[720px] rounded">
                <Table className="relative">
                  <TableHeader className="sticky top-0 z-10 bg-background-secondary text-xs text-muted">
                    <TableRow className="border-b border-background-darker">
                      <TableHead>Player</TableHead>
                      <TableHead className="text-right">Exp</TableHead>
                      <TableHead className="text-center">Pts</TableHead>
                      <TableHead className="text-center"></TableHead>
                      <TableHead className="text-center">User%</TableHead>
                      <TableHead className="text-center">Field%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userExposure.map(x => (
                      <TableRow key={x.player} className="bg-card rounded text-muted">
                        <TableCell className="text-foreground font-bold flex items-center gap-2">
                          {x.teamUrl && (
                            <Image src={x.teamUrl} alt={x.player} width={24} height={24} />
                          )}
                          {x.player}
                        </TableCell>
                        <TableCell className="text-right">{x.expected}</TableCell>
                        <TableCell className="text-foreground font-bold text-center">
                          {x.actual}
                        </TableCell>
                        <TableCell className="text-center">{getIcon(x.icon)}</TableCell>
                        <TableCell className="text-center">
                          {(x.user_pct * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell className="text-center">
                          {(x.field_pct * 100).toFixed(0)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4 mb-8">
        {data && (
          <Card className="col-span-8 bg-background-secondary border border-background-darker rounded">
            <CardHeader className="flex flex-row items-center justify-between gap-2 py-4 bg-card border-b border-background-darker">
              <CardTitle className="font-bold w-1/4">Contest Exposures</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search player…"
                  value={playerFilter}
                  onChange={e => setPlayerFilter(e.target.value)}
                  className="w-64 bg-background-secondary"
                />
                <button
                  className="text-sm text-muted-foreground hover:underline disabled:opacity-40"
                  onClick={() => setPlayerFilter('')}
                  disabled={!playerFilter}
                >
                  Clear
                </button>
              </div>
            </CardHeader>
            <CardContent className="py-4">
              <ScrollArea className="h-96 rounded">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background-secondary text-xs text-muted">
                    <TableRow>
                      <TableHead className="w-[25px]">Rnk</TableHead>
                      <TableHead className="w-[200px]">Player</TableHead>
                      <TableHead className="text-right">Salary</TableHead>
                      <TableHead className="text-right">Exp Pts</TableHead>
                      <TableHead className="text-right">Pts</TableHead>
                      <TableHead className="text-right"></TableHead>
                      <TableHead className="text-right">Field%</TableHead>
                      {isShowdown && <TableHead className="text-right">CPT%</TableHead>}
                      {isShowdown && <TableHead className="text-right">FLEX%</TableHead>}
                      <TableHead className="text-right">Entries</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playersPageItems.map((x, idx) => (
                      <TableRow key={x.player} className="bg-card rounded text-muted">
                        <TableCell className="w-[25px] text-accent">{idx + 1}</TableCell>
                        <TableCell className="font-bold w-[200px] text-foreground flex items-center gap-2">
                          {x.team?.logos?.[1] && (
                            <Image
                              src={x.team?.logos?.[1] ?? ''}
                              alt={x.player}
                              width={24}
                              height={24}
                            />
                          )}
                          {x.player}
                        </TableCell>
                        <TableCell className="text-right">
                          {x.salary ? `$${x.salary.toLocaleString()}` : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {x.expected != null ? x.expected.toFixed(2) : '—'}
                        </TableCell>
                        <TableCell className="text-right text-foreground font-bold">
                          {x.actual != null ? x.actual.toFixed(2) : '—'}
                        </TableCell>
                        <TableCell className="text-right">{getIcon(x.icon)}</TableCell>
                        <TableCell className="text-right">
                          {(x.fieldPct * 100).toFixed(1)}%
                        </TableCell>
                        {isShowdown && (
                          <TableCell className="text-right">
                            {((x as any).cpt_pct ?? 0 * 100).toFixed(1)}%
                          </TableCell>
                        )}
                        {isShowdown && (
                          <TableCell className="text-right">
                            {((x as any).flex_pct ?? 0 * 100).toFixed(1)}%
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          {x.entriesWithPlayer.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <div className="flex items-center justify-between text-xs text-muted w-full">
                <span>
                  Showing {playersStart}-{playersEnd} of {playersTotal.toLocaleString()} players
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-8">
                    <button
                      className="flex items-center gap-2 px-2 py-1 border rounded bg-card disabled:opacity-50"
                      disabled={playersPage <= 1}
                      onClick={() => setPlayersPage(p => Math.max(1, p - 1))}
                    >
                      <ArrowBigLeftDashIcon size={16} /> Prev
                    </button>
                    <span>
                      {playersPage}/{playersPages}
                    </span>
                    <button
                      className="flex items-center gap-2 px-2 py-1 border rounded bg-card disabled:opacity-50"
                      disabled={playersPage >= playersPages}
                      onClick={() => setPlayersPage(p => Math.min(playersPages, p + 1))}
                    >
                      Next <ArrowBigRightDashIcon size={16} />
                    </button>
                  </div>
                </div>
                <select
                  className="border rounded px-2 py-1 bg-card"
                  value={playersPageSize}
                  onChange={e => {
                    setPlayersPageSize(Number(e.target.value))
                    setPlayersPage(1)
                  }}
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </CardFooter>
          </Card>
        )}

        {data?.usage && (
          <Card className="col-span-4 bg-background-secondary border border-background-darker rounded">
            <CardHeader className="flex flex-row items-center justify-between gap-2 py-4 bg-card border-b border-background-darker">
              <div className="flex justify-between w-full gap-1">
                <div className="flex flex-col gap-2">
                  <CardTitle>Contest Usage</CardTitle>
                  <CardDescription className="text-xs text-muted">
                    Distinct players per user
                  </CardDescription>
                </div>
                <div className="flex flex-col">
                  <p className="text-xs text-foreground">Max Entries</p>
                  <p className="text-muted font-bold text-center text-lg">
                    {data.usage.contestMaxEntries}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-2 py-3">
                <button
                  className={cn(
                    'px-2 py-1 text-xs rounded uppercase bg-card text-foreground border w-32',
                    usageView === 'full' && 'btn-accent font-bold text-accent-foreground',
                  )}
                  onClick={() => setUsageView('full')}
                >
                  Full entrants
                </button>
                <button
                  className={cn(
                    'px-2 py-1 text-xs rounded uppercase bg-card text-foreground border w-32',
                    usageView === 'all' && 'btn-accent font-bold text-accent-foreground',
                  )}
                  onClick={() => setUsageView('all')}
                >
                  All users
                </button>
                <button
                  className={cn(
                    'px-2 py-1 text-xs rounded uppercase bg-card text-foreground border w-32',
                    usageView === 'buckets' && 'btn-accent font-bold text-accent-foreground',
                  )}
                  onClick={() => setUsageView('buckets')}
                >
                  By entries
                </button>
              </div>

              {usageView !== 'buckets' && active && (
                <div className="flex flex-wrap gap-4 text-sm py-4 justify-center">
                  {(
                    [
                      ['Total', active.totalDistinct],
                      ['Quarterbacks', active.QB],
                      ['Running Backs', active.RB],
                      ['Wide Receivers', active.WR],
                      ['Tight Ends', active.TE],
                      ['Defense', active.DST],
                    ] as const
                  ).map(([label, stats]) => (
                    <div key={label} className="rounded-md border bg-card w-60">
                      <div className="font-bold mb-1 uppercase text-xs bg-background px-2 py-1">
                        {label}
                      </div>
                      <div className="flex justify-around items-center gap-2 p-2">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-muted uppercase font-bold text-center">Low</span>
                          <span className="text-lg font-black">{stats.low}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-muted uppercase font-bold text-center">Avg</span>
                          <span className="text-lg font-black">{stats.avg.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-muted uppercase font-bold text-center">High</span>
                          <span className="text-lg font-black">{stats.high}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {usageView === 'buckets' && data?.usage.buckets && (
                <div className="rounded overflow-hidden">
                  <ScrollArea className="h-96 rounded">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-background-secondary text-xs text-muted">
                        <TableRow>
                          <TableHead>Entries</TableHead>
                          <TableHead className="text-right">Users</TableHead>
                          <TableHead className="text-right">TTL</TableHead>
                          <TableHead className="text-right">QB</TableHead>
                          <TableHead className="text-right">RB</TableHead>
                          <TableHead className="text-right">WR</TableHead>
                          <TableHead className="text-right">TE</TableHead>
                          <TableHead className="text-right">DST</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(data.usage.buckets)
                          .sort((a, b) => Number(a[0]) - Number(b[0]))
                          .map(([k, v]) => (
                            <TableRow key={k} className="bg-card rounded">
                              <TableCell>{k}</TableCell>
                              <TableCell className="text-right">
                                {v.usersCount.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                {v.totalDistinct.avg.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">{v.QB.avg.toFixed(2)}</TableCell>
                              <TableCell className="text-right">{v.RB.avg.toFixed(2)}</TableCell>
                              <TableCell className="text-right">{v.WR.avg.toFixed(2)}</TableCell>
                              <TableCell className="text-right">{v.TE.avg.toFixed(2)}</TableCell>
                              <TableCell className="text-right">{v.DST.avg.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
