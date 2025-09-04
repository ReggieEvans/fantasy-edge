'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react'

// Simple, single-file UI that works in a Next.js page or a CRA app.
// Drop this into: app/optimizer/page.tsx (Next.js 13+) or pages/optimizer.tsx (Next.js <=12)
// Requires Tailwind (optional). You can adapt styles easily.

export default function OptimizerUI() {
  const [sport, setSport] = useState<'NFL' | 'CFB'>('NFL')
  const [mode, setMode] = useState<'classic' | 'showdown'>('classic')
  const [nLineups, setNLineups] = useState(20)
  const [file, setFile] = useState<File | null>(null)

  // Basic constraints
  const [minSalaryPct, setMinSalaryPct] = useState<string>('')
  const [maxRepeating, setMaxRepeating] = useState<string>('')
  const [globalMaxExposure, setGlobalMaxExposure] = useState<string>('')
  const [locks, setLocks] = useState<string>('') // comma separated names
  const [excludes, setExcludes] = useState<string>('') // comma separated names
  const [teamMaxRaw, setTeamMaxRaw] = useState<string>('') // e.g. DAL:3,PHI:2

  // Stacks
  const [teamStacks, setTeamStacks] = useState<string>('')
  // example line per stack: size=3 for_teams=KC|BAL for_positions=QB|WR|TE spacing=2 max_exposure=0.5
  const [posStacks, setPosStacks] = useState<string>('')
  // example line per stack: positions=QB|WR for_teams=KC|NO max_exposure=0.5
  const [gameStacks, setGameStacks] = useState<string>('')
  // example line per stack: size=3 min_from_team=1

  const [busy, setBusy] = useState(false)
  const [server, setServer] = useState('http://localhost:8006')

  const [response, setResponse] = useState<null | {
    requested: number
    generated: number
    mode: string
    sport: string
    lineups: any[]
    message?: string
  }>(null)
  const [error, setError] = useState<string | null>(null)

  function parseCSVTeams(raw: string): Record<string, number> | undefined {
    if (!raw.trim()) return undefined
    const out: Record<string, number> = {}
    for (const pair of raw.split(',')) {
      const [team, count] = pair.split(':').map(s => s.trim())
      if (!team || !count) continue
      const n = Number(count)
      if (!Number.isFinite(n)) continue
      out[team] = n
    }
    return Object.keys(out).length ? out : undefined
  }

  function parseList(raw: string): string[] | undefined {
    const arr = raw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    return arr.length ? arr : undefined
  }

  function parseTeamStacks(raw: string) {
    // Parse each line into a TeamStack config
    const lines = raw
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
    if (!lines.length) return undefined
    const out: any[] = []
    for (const line of lines) {
      const kv = Object.fromEntries(
        line.split(/\s+/).map(part => {
          const [k, v] = part.split('=')
          return [k, v]
        }),
      )
      if (!kv.size) continue
      const size = Number(kv.size)
      if (!Number.isFinite(size)) continue
      out.push({
        size,
        for_teams: kv.for_teams ? kv.for_teams.split('|') : undefined,
        for_positions: kv.for_positions ? kv.for_positions.split('|') : undefined,
        spacing: kv.spacing ? Number(kv.spacing) : undefined,
        max_exposure: kv.max_exposure ? Number(kv.max_exposure) : undefined,
        max_exposure_per_team: undefined, // advanced: add as needed
      })
    }
    return out.length ? out : undefined
  }

  function parsePosStacks(raw: string) {
    const lines = raw
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
    if (!lines.length) return undefined
    const out: any[] = []
    for (const line of lines) {
      const kv = Object.fromEntries(
        line.split(/\s+/).map(part => {
          const [k, v] = part.split('=')
          return [k, v]
        }),
      )
      if (!kv.positions) continue
      const positions = kv.positions.split('|').map((p: string) => (p.includes(',') ? p.split(',') : p))
      out.push({
        positions,
        for_teams: kv.for_teams ? kv.for_teams.split('|') : undefined,
        max_exposure: kv.max_exposure ? Number(kv.max_exposure) : undefined,
        max_exposure_per_team: undefined,
      })
    }
    return out.length ? out : undefined
  }

  function parseGameStacks(raw: string) {
    const lines = raw
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
    if (!lines.length) return undefined
    const out: any[] = []
    for (const line of lines) {
      const kv = Object.fromEntries(
        line.split(/\s+/).map(part => {
          const [k, v] = part.split('=')
          return [k, v]
        }),
      )
      if (!kv.size) continue
      const size = Number(kv.size)
      if (!Number.isFinite(size)) continue
      out.push({ size, min_from_team: kv.min_from_team ? Number(kv.min_from_team) : 1 })
    }
    return out.length ? out : undefined
  }

  const constraintsObject = useMemo(() => {
    const obj: any = {}
    const msp = Number(minSalaryPct)
    if (minSalaryPct !== '' && Number.isFinite(msp)) obj.min_salary_pct = msp
    const mrp = Number(maxRepeating)
    if (maxRepeating !== '' && Number.isFinite(mrp)) obj.max_repeating_players = mrp
    const gme = Number(globalMaxExposure)
    if (globalMaxExposure !== '' && Number.isFinite(gme)) obj.global_max_exposure = gme

    const l = parseList(locks)
    if (l) obj.locks = l
    const ex = parseList(excludes)
    if (ex) obj.excludes = ex

    const tm = parseCSVTeams(teamMaxRaw)
    if (tm) obj.team_max = tm

    const team = parseTeamStacks(teamStacks)
    const positions = parsePosStacks(posStacks)
    const game = parseGameStacks(gameStacks)
    if (team || positions || game) obj.stacks = { team, positions, game }

    return obj
  }, [minSalaryPct, maxRepeating, globalMaxExposure, locks, excludes, teamMaxRaw, teamStacks, posStacks, gameStacks])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResponse(null)

    if (!file) {
      setError('Please choose a DraftKings CSV file.')
      return
    }

    try {
      setBusy(true)
      const form = new FormData()
      form.append('sport', sport)
      form.append('mode', mode)
      form.append('n_lineups', String(nLineups))
      form.append('constraints_json', JSON.stringify(constraintsObject))
      form.append('file', file)

      const res = await fetch(`${server}/optimize_upload`, {
        method: 'POST',
        body: form,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.detail || 'Request failed')
      } else {
        setResponse(data)
      }
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setBusy(false)
    }
  }

  function downloadJSON() {
    if (!response) return
    const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lineups_${sport}_${mode}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // =========================
  // Exposure calculations
  // =========================
  type PlayerKey = string
  type PlayerExposure = {
    key: PlayerKey
    name: string
    team?: string
    pos?: string
    count: number
    exposurePct: number
    avgSalary?: number
  }

  const { playerExposures, teamExposures, totalLineups } = useMemo(() => {
    const map = new Map<PlayerKey, { name: string; team?: string; pos?: string; count: number; salarySum: number }>()
    const teamMap = new Map<string, number>()

    const n = response?.generated ?? 0
    const lineups = response?.lineups ?? []

    for (const lu of lineups) {
      const seenTeams = new Set<string>()
      for (const p of lu.players ?? []) {
        const name: string = p.name || 'Unknown'
        const team: string | undefined = p.team || undefined
        const pos: string | undefined =
          p.lineup_position || (Array.isArray(p.positions) ? p.positions.join('/') : undefined)
        const key = `${name}|${team ?? ''}|${pos ?? ''}`

        const rec = map.get(key) ?? { name, team, pos, count: 0, salarySum: 0 }
        rec.count += 1
        if (typeof p.salary === 'number') rec.salarySum += p.salary
        map.set(key, rec)

        if (team && !seenTeams.has(team)) {
          teamMap.set(team, (teamMap.get(team) ?? 0) + 1)
          seenTeams.add(team)
        }
      }
    }

    const playerExposures: PlayerExposure[] = Array.from(map.entries()).map(([key, v]) => ({
      key,
      name: v.name,
      team: v.team,
      pos: v.pos,
      count: v.count,
      exposurePct: n ? (v.count / n) * 100 : 0,
      avgSalary: v.count ? Math.round(v.salarySum / v.count) : undefined,
    }))

    playerExposures.sort((a, b) => b.exposurePct - a.exposurePct || b.count - a.count || a.name.localeCompare(b.name))

    const teamExposures = Array.from(teamMap.entries())
      .map(([team, c]) => ({ team, count: c, exposurePct: n ? (c / n) * 100 : 0 }))
      .sort((a, b) => b.exposurePct - a.exposurePct || a.team.localeCompare(b.team))

    return { playerExposures, teamExposures, totalLineups: n }
  }, [response])

  function downloadCSV(rows: any[], filename: string) {
    const headers = Object.keys(rows[0] ?? {})
    const lines = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const [expSearch, setExpSearch] = useState('')

  const filteredPlayerExposures = useMemo(() => {
    if (!expSearch) return playerExposures
    const q = expSearch.toLowerCase()
    return playerExposures.filter(pe => [pe.name, pe.team ?? '', pe.pos ?? ''].some(x => x.toLowerCase().includes(q)))
  }, [playerExposures, expSearch])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div>
            <label className="block text-sm font-medium">Server URL</label>
            <input
              className="mt-1 w-full border rounded p-2"
              value={server}
              onChange={e => setServer(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Sport</label>
              <select
                className="mt-1 w-full border rounded p-2"
                value={sport}
                onChange={e => setSport(e.target.value as any)}
              >
                <option value="NFL">NFL</option>
                <option value="CFB">CFB</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Mode</label>
              <select
                className="mt-1 w-full border rounded p-2"
                value={mode}
                onChange={e => setMode(e.target.value as any)}
              >
                <option value="classic">classic</option>
                <option value="showdown">showdown</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium"># Lineups</label>
            <input
              type="number"
              min={1}
              max={150}
              className="mt-1 w-full border rounded p-2"
              value={nLineups}
              onChange={e => setNLineups(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">DraftKings CSV</label>
            <input
              type="file"
              accept=".csv"
              className="mt-1 w-full"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Constraints</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Min Salary % (0-1)</label>
              <input
                className="mt-1 w-full border rounded p-2"
                placeholder="0.95"
                value={minSalaryPct}
                onChange={e => setMinSalaryPct(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm">Max Repeating Players</label>
              <input
                className="mt-1 w-full border rounded p-2"
                placeholder="e.g. 2"
                value={maxRepeating}
                onChange={e => setMaxRepeating(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm">Global Max Exposure (0-1)</label>
              <input
                className="mt-1 w-full border rounded p-2"
                placeholder="0.5"
                value={globalMaxExposure}
                onChange={e => setGlobalMaxExposure(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm">Team Max (CSV: TEAM:count)</label>
              <input
                className="mt-1 w-full border rounded p-2"
                placeholder="DAL:3,PHI:2"
                value={teamMaxRaw}
                onChange={e => setTeamMaxRaw(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm">Locks (comma separated)</label>
            <input
              className="mt-1 w-full border rounded p-2"
              placeholder="Jalen Hurts,A.J. Brown"
              value={locks}
              onChange={e => setLocks(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm">Excludes (comma separated)</label>
            <input
              className="mt-1 w-full border rounded p-2"
              placeholder="Player A,Player B"
              value={excludes}
              onChange={e => setExcludes(e.target.value)}
            />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Stacks</h2>
          <div>
            <label className="block text-sm font-medium">Team Stacks</label>
            <textarea
              className="mt-1 w-full border rounded p-2 h-24"
              placeholder={`size=3 for_teams=KC|BAL for_positions=QB|WR|TE spacing=2 max_exposure=0.5`}
              value={teamStacks}
              onChange={e => setTeamStacks(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Positions Stacks</label>
            <textarea
              className="mt-1 w-full border rounded p-2 h-24"
              placeholder={`positions=QB|WR for_teams=KC|NO max_exposure=0.5`}
              value={posStacks}
              onChange={e => setPosStacks(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Game Stacks</label>
            <textarea
              className="mt-1 w-full border rounded p-2 h-20"
              placeholder={`size=3 min_from_team=1`}
              value={gameStacks}
              onChange={e => setGameStacks(e.target.value)}
            />
          </div>
        </div>

        <div className="lg:col-span-3 flex items-center gap-3">
          <button disabled={busy} type="submit" className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
            {busy ? 'Optimizing…' : 'Build Lineups'}
          </button>
          <span className="text-sm opacity-70">
            We send multipart/form-data to /optimize_upload with constraints_json reflecting your inputs.
          </span>
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Preview constraints JSON</h2>
        <pre className="bg-gray-50 border rounded p-3 overflow-auto text-xs">
          {JSON.stringify(constraintsObject, null, 2)}
        </pre>
      </section>

      {error && <div className="p-3 border rounded bg-red-50 text-red-800">{error}</div>}

      {response && (
        <div className="space-y-6">
          {response.message && (
            <div className="p-3 border rounded bg-yellow-50 text-yellow-800">{response.message}</div>
          )}
          <div className="flex items-center justify-between">
            <div className="text-sm opacity-70">
              Requested <b>{response.requested}</b>, generated <b>{response.generated}</b> — {response.sport}/
              {response.mode}
            </div>
            <div className="flex gap-2">
              <button onClick={downloadJSON} className="px-3 py-2 text-sm rounded border">
                Download JSON
              </button>
            </div>
          </div>

          {/* Lineups table */}
          <div className="overflow-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Projection</th>
                  <th className="p-2 text-left">Salary</th>
                  <th className="p-2 text-left">Players</th>
                </tr>
              </thead>
              <tbody>
                {response.lineups?.map((lu, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2">{lu.projection ?? '-'}</td>
                    <td className="p-2">{lu.salary ?? '-'}</td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {lu.players?.map((p: any, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-50 border">
                            <span className="font-medium">{p.name}</span>
                            <span className="opacity-60">
                              ({p.lineup_position || p.positions?.join('/') || '-'}
                              {p.team ? ` · ${p.team}` : ''})
                            </span>
                            <span className="opacity-70">${p.salary ?? '-'}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Exposures */}
          <section className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-xl font-semibold">Player Exposures</h2>
              <div className="flex items-center gap-2">
                <input
                  className="border rounded p-2 text-sm"
                  placeholder="Search name/team/pos"
                  value={expSearch}
                  onChange={e => setExpSearch(e.target.value)}
                />
                <button
                  onClick={() =>
                    filteredPlayerExposures.length &&
                    downloadCSV(filteredPlayerExposures, `player_exposures_${sport}_${mode}.csv`)
                  }
                  className="px-3 py-2 text-sm rounded border"
                >
                  Download CSV
                </button>
              </div>
            </div>
            <div className="text-sm opacity-70">Based on {totalLineups} lineups.</div>
            <div className="overflow-auto border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Player</th>
                    <th className="p-2 text-left">Pos</th>
                    <th className="p-2 text-left">Team</th>
                    <th className="p-2 text-right">Count</th>
                    <th className="p-2 text-right">Exposure %</th>
                    <th className="p-2 text-right">Avg $</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayerExposures.map((pe, i) => (
                    <tr key={pe.key} className="border-t">
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2 font-medium">{pe.name}</td>
                      <td className="p-2">{pe.pos ?? '-'}</td>
                      <td className="p-2">{pe.team ?? '-'}</td>
                      <td className="p-2 text-right">{pe.count}</td>
                      <td className="p-2 text-right">{pe.exposurePct.toFixed(1)}%</td>
                      <td className="p-2 text-right">{pe.avgSalary ? `$${pe.avgSalary}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-xl font-semibold">Team Exposures</h2>
              <button
                onClick={() =>
                  teamExposures.length && downloadCSV(teamExposures, `team_exposures_${sport}_${mode}.csv`)
                }
                className="px-3 py-2 text-sm rounded border"
              >
                Download CSV
              </button>
            </div>
            <div className="overflow-auto border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Team</th>
                    <th className="p-2 text-right">Count</th>
                    <th className="p-2 text-right">Exposure %</th>
                  </tr>
                </thead>
                <tbody>
                  {teamExposures.map((te, i) => (
                    <tr key={te.team} className="border-t">
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2 font-medium">{te.team}</td>
                      <td className="p-2 text-right">{te.count}</td>
                      <td className="p-2 text-right">{te.exposurePct.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
