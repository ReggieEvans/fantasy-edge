/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CsvParsed, CsvRow, GameType, PlayerFptsRow } from '@/shared/types/study-hub/types'

const LOWER = (s: string) => (s ?? '').trim().toLowerCase()

const isHeader = (cols: string[], keys: string[]) => keys.every(k => cols.some(c => LOWER(c) === k))

function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = '',
    inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"'
        i++
        continue
      }
      inQ = !inQ
      continue
    }
    if (ch === ',' && !inQ) {
      out.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur)
  return out
}

const num = (s?: string | null) => (s == null ? null : Number(String(s).replace(/[^0-9.\-]/g, '')))

export function parseCsvStandings(csv: string): CsvParsed {
  const lines = csv
    .replace(/\r/g, '')
    .split('\n')
    .filter(l => l.length > 0)
  if (!lines.length) return { rows: [], meta: {}, players: [] }

  let h1 = lines.findIndex(l => {
    const c = splitCsvLine(l)
    return (
      isHeader(c, ['rank', 'lineup']) &&
      (c.some(x => LOWER(x) === 'entry id') || c.some(x => LOWER(x) === 'entryid'))
    )
  })
  if (h1 < 0) h1 = 0

  const head1 = splitCsvLine(lines[h1])
  const idx1 = (h: string) => head1.findIndex(x => LOWER(x) === LOWER(h))
  const iRank = idx1('Rank')
  const iEntryId = idx1('Entry Id') >= 0 ? idx1('Entry Id') : idx1('EntryId')
  const iEntryNm = idx1('Entry Name') >= 0 ? idx1('Entry Name') : idx1('EntryName')
  const iUser = idx1('Username')
  const iPoints = idx1('Points')
  const iLineup = idx1('Lineup')

  const rows: CsvRow[] = []
  let i = h1 + 1
  for (; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i])
    if (isHeader(cols, ['player', 'fpts'])) break
    if (cols.length < 3) continue
    const entryId = cols[iEntryId]
    const lineup = cols[iLineup]
    if (!entryId || !lineup) continue
    rows.push({
      rank: Number(cols[iRank]),
      entryId,
      entryName: cols[iEntryNm],
      username: iUser >= 0 ? cols[iUser] || '' : '',
      points: Number(cols[iPoints]),
      lineup,
    })
  }

  const players: PlayerFptsRow[] = []
  if (i < lines.length) {
    const head2 = splitCsvLine(lines[i])
    const idx2 = (h: string) => head2.findIndex(x => LOWER(x) === LOWER(h))
    const iPlayer = idx2('Player')
    const iRoster = (() => {
      const j1 = idx2('Roster')
      const j2 = idx2('Roster Position')
      return j1 >= 0 ? j1 : j2
    })()
    const iPos = idx2('Position')
    const iPct = idx2('%Drafted')
    const iFpts = idx2('FPTS')

    for (let j = i + 1; j < lines.length; j++) {
      const cols = splitCsvLine(lines[j])
      if (!cols.length) continue
      if (isHeader(cols, ['rank', 'lineup']) || isHeader(cols, ['player', 'fpts'])) break
      const name = (cols[iPlayer] || '').trim()
      if (!name) continue
      players.push({
        name,
        roster: iRoster >= 0 ? (cols[iRoster] || '').trim() : null,
        position: iPos >= 0 ? (cols[iPos] || '').trim() : null,
        draftedPct: iPct >= 0 ? (num(cols[iPct]) ?? null) : null,
        fpts: iFpts >= 0 ? (num(cols[iFpts]) ?? 0) : 0,
      })
    }
  }

  return { rows, meta: {}, players }
}

export function parseLineupWithSlots(
  lineup: string,
): Array<{ name: string; slot: 'QB' | 'RB' | 'WR' | 'TE' | 'DST' | 'FLEX' | 'CPT' | 'S-FLEX' }> {
  const TOKENS = new Set(['QB', 'RB', 'WR', 'TE', 'FLEX', 'DST', 'CPT', 'S-FLEX'])
  const parts = (lineup || '').trim().split(/\s+/)
  const out: Array<{ name: string; slot: any }> = []
  let curSlot: any = null
  let curName: string[] = []
  for (const tok of parts) {
    if (TOKENS.has(tok)) {
      if (curSlot && curName.length) out.push({ name: curName.join(' ').trim(), slot: curSlot })
      curSlot = tok
      curName = []
    } else curName.push(tok)
  }
  if (curSlot && curName.length) out.push({ name: curName.join(' ').trim(), slot: curSlot })
  return out as any
}

export function pickGameTypeFromCsv(rows: CsvRow[]): GameType {
  return rows.some(r => /\bCPT\b/.test(r.lineup || '')) ? 'showdown' : 'classic'
}
