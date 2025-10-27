/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import Papa from 'papaparse'
import { useCallback, useRef, useState } from 'react'

import { normalizeName, parseEntryName, parseLineupWithPos } from '../lib/dkParse'
import type { ContestEntry, ContestUsageSummary, PlayerExposureGlobal } from '../types'

type UsersIndexRow = { username: string; entries: number; bestRank: number }
type UsageRow = {
  user: string
  entries: number
  total: number
  QB: number
  RB: number
  WR: number
  TE: number
  DST: number
}

export function useLineupStudy() {
  const [entries, setEntries] = useState<ContestEntry[] | null>(null)
  const [globalExposure, setGlobalExposure] = useState<PlayerExposureGlobal[] | null>(null)
  const [usersIndex, setUsersIndex] = useState<UsersIndexRow[] | null>(null)

  const [contestMaxEntries, setContestMaxEntries] = useState<number | null>(null)
  const [contestUsageAll, setContestUsageAll] = useState<ContestUsageSummary | null>(null)
  const [contestUsageFull, setContestUsageFull] = useState<ContestUsageSummary | null>(null)
  const [contestUsageBuckets, setContestUsageBuckets] = useState<Record<
    string,
    ContestUsageSummary
  > | null>(null)

  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<{ rows: number }>({ rows: 0 })
  const [error, setError] = useState<string | null>(null)

  const entriesRef = useRef<ContestEntry[]>([])
  const byUserRef = useRef<Map<string, { count: number; bestRank: number }>>(new Map())
  const fieldCountRef = useRef<Map<string, number>>(new Map())
  const playerPositionMapRef = useRef<Map<string, string>>(new Map())

  const reset = () => {
    entriesRef.current = []
    byUserRef.current = new Map()
    fieldCountRef.current = new Map()
    playerPositionMapRef.current = new Map()
    setEntries(null)
    setUsersIndex(null)
    setGlobalExposure(null)
    setContestMaxEntries(null)
    setContestUsageAll(null)
    setContestUsageFull(null)
    setContestUsageBuckets(null)
    setProgress({ rows: 0 })
  }

  const onFile = useCallback((file: File) => {
    reset()
    setLoading(true)
    setError(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      worker: true,
      chunkSize: 1024 * 50,
      chunk: ({ data }) => {
        for (const r of data as any[]) {
          if (r?.Player && r['Roster Position']) {
            const name = normalizeName(String(r.Player))
            const pos = String(r['Roster Position']).toUpperCase().trim()
            playerPositionMapRef.current.set(name, pos)
          }

          if (!r?.Lineup || !r?.EntryId) continue

          const rank = Number(r.Rank ?? NaN)
          const entryId = String(r.EntryId ?? '')
          const entryName = String(r.EntryName ?? '')
          const points = Number(r.Points ?? 0)
          const { username, entriesPlayedHint } = parseEntryName(entryName)
          const parsedPlayers = parseLineupWithPos(String(r.Lineup))
          if (!entryId || Number.isNaN(rank) || parsedPlayers.length === 0) continue

          const playersWithPos = parsedPlayers.map(p => ({
            ...p,
            position: null,
            salary: null,
            expected: null,
            actual: null,
            icon: null,
          }))
          const players = playersWithPos.map(p => p.name)
          entriesRef.current.push({
            rank,
            entryId,
            entryName,
            username,
            entriesPlayedHint,
            points,
            players,
            playersWithPos,
          })

          const u = byUserRef.current.get(username) ?? { count: 0, bestRank: Infinity }
          u.count += 1
          u.bestRank = Math.min(u.bestRank, rank)
          byUserRef.current.set(username, u)

          const seen = new Set(players)
          for (const p of seen)
            fieldCountRef.current.set(p, (fieldCountRef.current.get(p) ?? 0) + 1)
        }
        setProgress(p => ({ rows: p.rows + (data as any[]).length }))
      },
      complete: () => {
        const all = entriesRef.current.sort((a, b) => a.rank - b.rank)
        setEntries(all)

        const idx: UsersIndexRow[] = Array.from(byUserRef.current.entries())
          .map(([username, v]) => ({ username, entries: v.count, bestRank: v.bestRank }))
          .sort((a, b) => a.bestRank - b.bestRank)
        setUsersIndex(idx)

        const totalEntries = Math.max(1, all.length)
        const global: PlayerExposureGlobal[] = Array.from(fieldCountRef.current.entries())
          .map(([player, c]) => ({ player, entries_with_player: c, field_pct: c / totalEntries }))
          .sort((a, b) => b.entries_with_player - a.entries_with_player)
        setGlobalExposure(global)

        const usageRows = buildUsageRows(all, playerPositionMapRef.current)
        const maxEntries = usageRows.reduce((m, r) => Math.max(m, r.entries), 0)
        setContestMaxEntries(maxEntries)

        setContestUsageAll(summarizeUsage(usageRows))
        setContestUsageFull(summarizeUsage(usageRows.filter(r => r.entries === maxEntries)))
        setContestUsageBuckets(bucketizeUsage(usageRows))

        setLoading(false)
      },
      error: e => {
        setError(e?.message || 'Failed to parse CSV')
        setLoading(false)
      },
    })
  }, [])

  return {
    entries,
    globalExposure,
    usersIndex,

    contestMaxEntries,
    contestUsageAll,
    contestUsageFull,
    contestUsageBuckets,

    loading,
    error,
    progress,
    onFile,
  }
}

function buildUsageRows(entries: ContestEntry[], posMap: Map<string, string>): UsageRow[] {
  const byUser = new Map<string, ContestEntry[]>()
  for (const e of entries) {
    if (!byUser.has(e.username)) byUser.set(e.username, [])
    byUser.get(e.username)!.push(e)
  }

  const rows: UsageRow[] = []
  for (const [user, list] of byUser) {
    const total = new Set<string>()
    const QB = new Set<string>(),
      RB = new Set<string>(),
      WR = new Set<string>(),
      TE = new Set<string>(),
      DST = new Set<string>()

    for (const e of list) {
      for (const { name, pos: slot } of e.playersWithPos) {
        total.add(name)
        const base = (posMap.get(name) || slot).toUpperCase()
        if (base === 'QB') QB.add(name)
        else if (base === 'RB') RB.add(name)
        else if (base === 'WR') WR.add(name)
        else if (base === 'TE') TE.add(name)
        else if (base === 'DST') DST.add(name)
      }
    }

    rows.push({
      user,
      entries: list.length,
      total: total.size,
      QB: QB.size,
      RB: RB.size,
      WR: WR.size,
      TE: TE.size,
      DST: DST.size,
    })
  }
  return rows
}

function summarizeUsage(rows: UsageRow[]): ContestUsageSummary {
  const agg = (sel: (r: UsageRow) => number) => {
    const arr = rows.map(sel)
    const low = Math.min(...arr)
    const high = Math.max(...arr)
    const avg = arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length)
    return { low, avg, high }
  }
  return {
    usersCount: rows.length,
    totalDistinct: agg(r => r.total),
    QB: agg(r => r.QB),
    RB: agg(r => r.RB),
    WR: agg(r => r.WR),
    TE: agg(r => r.TE),
    DST: agg(r => r.DST),
  }
}

function bucketizeUsage(rows: UsageRow[]) {
  const buckets = new Map<number, UsageRow[]>()
  for (const r of rows) {
    if (!buckets.has(r.entries)) buckets.set(r.entries, [])
    buckets.get(r.entries)!.push(r)
  }
  const out: Record<string, ContestUsageSummary> = {}
  for (const [k, list] of buckets) out[String(k)] = summarizeUsage(list)
  return out
}
