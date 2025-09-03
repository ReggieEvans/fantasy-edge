'use client'

import { Pickaxe } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Aggression = 'Low' | 'Balanced' | 'Aggressive'

// --- server payload types ---
type TeamMeta = {
  abbrev: string
  colorHexDex?: string
  colorPrimaryHex?: string
  colorSecondaryHex?: string
  mediumName?: string
  nickName?: string
  shortName?: string
  marketPickPercent?: number // 0-100
}

type ApiPick = {
  // from backend `picks` rows
  team: string
  opp: string
  isHome: boolean
  gameKey: string
  confidence: number
  rank?: number
  p: number // 0-1 win prob
  pop: number // 0-1 market pick rate
  popPct?: number // 0-100 for UI
  marketPickPercent?: number // 0-100 alias
  value: number
  weekly_edge: number
  season_risk: number
  sharpe_like?: number
}

type ApiResponse = {
  picks: ApiPick[]
  teams: Record<string, TeamMeta>
  message?: string
}

export const PickemOptimizer = () => {
  const [rawJson, setRawJson] = useState<any[] | null>(null)
  const [aggression, setAggression] = useState<Aggression>('Balanced')
  const [picks, setPicks] = useState<ApiPick[]>([])
  const [teams, setTeams] = useState<Record<string, TeamMeta>>({})
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFile(file)

    const reader = new FileReader()
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        setRawJson(parsed)
        setError(null)
      } catch (err) {
        setError('Invalid JSON file.')
      }
    }
    reader.readAsText(file)
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('http://localhost:8006/generate-picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_json: rawJson, aggression }),
      })

      if (!res.ok) throw new Error('Failed to fetch picks')

      const data: ApiResponse = await res.json()
      setPicks(data.picks || [])
      setTeams(data.teams || {})
    } catch (err: any) {
      setError(err.message || 'Error occurred')
    } finally {
      setLoading(false)
    }
  }

  const rows = useMemo(
    () =>
      (picks || []).map(p => ({
        ...p,
        teamMeta: teams?.[p.team],
        oppMeta: teams?.[p.opp],
      })),
    [picks, teams],
  )

  const pct = (x: number) => `${(x * 100).toFixed(1)}%`
  const edge = (x: number) => `${(x * 100).toFixed(2)}`

  return (
    <div className="px-6 bg-background pt-8 min-h-[calc(100vh-90px)] overflow-y-auto pb-16">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span>
              <Pickaxe size={20} />
            </span>
            <h1 className="text-xl font-bold uppercase">Pick&apos;em Optimizer</h1>
          </div>
          <p className="text-muted text-sm">
            The Pick&apos;em feature converts moneylines to no-vig win probabilities, combines with public pick rates,
            then uses an integer optimizer to pick one side per game and assign unique confidence points to maximize
            expected points and edge vs. the field, with a mode-dependent variance penalty.
          </p>
        </div>
      </div>
      <div className="flex gap-4 justify-between items-center">
        <div className="grid w-full max-w-sm items-center gap-3">
          <Label className="text-xs text-muted px-2" htmlFor="picks">
            Upload JSON File
          </Label>
          <Input id="picks" type="file" accept="application/json" onChange={handleFileUpload} />
        </div>
        <div className="flex items-end gap-4">
          <div className="flex flex-col items-start gap-2">
            <Label className="text-xs text-muted px-2" htmlFor="aggression">
              Aggression
            </Label>
            <Select value={aggression} onValueChange={v => setAggression(v as Aggression)}>
              <SelectTrigger className="w-56 border border-background-darker">
                <SelectValue placeholder="Balanced" />
              </SelectTrigger>
              <SelectContent className="bg-background-darker">
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Balanced">Balanced</SelectItem>
                <SelectItem value="Aggressive">Aggressive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <button onClick={handleGenerate} className="btn-accent disabled:opacity-50" disabled={isLoading || !file}>
            {isLoading ? 'Generating...' : 'Generate Picks'}
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div className="space-y-4 mt-4 px-1">
        {isLoading ? (
          [...Array(20)].map((_, i) => <Skeleton key={i} className="h-16 w-full bg-card rounded animate-pulse" />)
        ) : rows?.length === 0 ? (
          <div className="flex flex-col items-center justify-center max-w-[350px] mx-auto pt-24 space-y-2">
            <h2 className="text-muted text-center text-lg font-bold opacity-70">Upload Data File</h2>
            <p className="text-muted text-center text-sm opacity-50">
              Upload CBS Data file to generate picks for the week.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-card rounded p-4">
            <Table>
              <TableHeader>
                <TableRow className="text-xs text-muted">
                  <TableHead className="text-center">Rank</TableHead>
                  <TableHead className="text-center">Conf</TableHead>
                  <TableHead>Matchup</TableHead>
                  <TableHead>Pick</TableHead>
                  <TableHead className="text-center">Win %</TableHead>
                  <TableHead className="text-center">Market %</TableHead>
                  <TableHead className="text-center">Edge</TableHead>
                  <TableHead className="text-center">Weekly Edge</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(r => {
                  const primaryHex = r.teamMeta?.colorPrimaryHex
                  const secondaryHex = r.teamMeta?.colorSecondaryHex
                  const primaryBg = primaryHex ? `#${String(primaryHex).replace('#', '')}90` : undefined
                  const secondary = secondaryHex ? `#${String(secondaryHex).replace('#', '')}` : undefined
                  return (
                    <TableRow key={r.gameKey} className="text-muted maxh-12">
                      <TableCell className="text-center">{r.rank ?? ''}</TableCell>
                      <TableCell className="text-center">{r.confidence}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <span className="font-semibold">{r.teamMeta?.abbrev || r.team}</span>
                          <span>{r.isHome ? 'vs' : '@'}</span>
                          <span>{r.oppMeta?.abbrev || r.opp}</span>
                        </div>
                      </TableCell>
                      <TableCell
                        style={primaryBg ? { backgroundColor: primaryBg, color: secondary } : undefined}
                        className="overflow-hidden  text-xl font-black"
                      >
                        {r.teamMeta?.mediumName || r.team} {r.teamMeta?.nickName ? r.teamMeta.nickName : ''}
                      </TableCell>
                      <TableCell className="text-center">{pct(r.p)}</TableCell>
                      <TableCell className="text-center">{pct(r.pop)}</TableCell>
                      <TableCell className="text-center">{edge(r.value)}</TableCell>
                      <TableCell className="text-center">{edge(r.weekly_edge)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
