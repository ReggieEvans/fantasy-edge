/* eslint-disable @typescript-eslint/no-explicit-any */
const POS = new Set(['QB', 'RB', 'WR', 'TE', 'FLEX', 'DST'])

export function normalizeName(s: string) {
  return (s ?? '').replace(/[’]/g, "'").replace(/\s+/g, ' ').trim()
}

export function parseEntryName(s: string) {
  const m = /^(.*)\s+\((\d+)\/(\d+)\)\s*$/.exec(s ?? '')
  return {
    username: (m?.[1] ?? s ?? '').trim(),
    entriesPlayedHint: m ? Number(m[2]) : null,
    maxEntries: m ? Number(m[3]) : null,
  }
}

export function parseLineupWithPos(line: string) {
  const tokens = (line ?? '').trim().split(/\s+/)
  const out: { name: string; pos: any }[] = []
  let curPos: any = null
  let curName: string[] = []
  for (const tok of tokens) {
    if (POS.has(tok)) {
      if (curPos && curName.length)
        out.push({ name: normalizeName(curName.join(' ')), pos: curPos })
      curPos = tok
      curName = []
    } else curName.push(tok)
  }
  if (curPos && curName.length) out.push({ name: normalizeName(curName.join(' ')), pos: curPos })
  return out as { name: string; pos: 'QB' | 'RB' | 'WR' | 'TE' | 'FLEX' | 'DST' }[]
}
