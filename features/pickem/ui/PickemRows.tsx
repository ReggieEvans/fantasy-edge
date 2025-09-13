import { TableCell } from '@/components/ui/table'
import { TableRow } from '@/components/ui/table'

import { ApiPick, TeamMeta } from '../types/pickem'
import { edge, pct } from '../utils/utils'

type PickemRowData = ApiPick & {
  teamMeta?: TeamMeta
  oppMeta?: TeamMeta
}

export const PickemRows = (r: PickemRowData) => {
  const primaryHex = r.teamMeta?.colorPrimaryHex
  const primaryBg = primaryHex ? `#${String(primaryHex).replace('#', '')}90` : undefined

  return (
    <TableRow
      key={r.gameKey}
      style={primaryBg ? { borderBottom: `2px solid var(--background)` } : undefined}
      className="text-muted maxh-12"
    >
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
        style={primaryBg ? { backgroundColor: `#${String(primaryHex).replace('#', '')}90` } : undefined}
        className="overflow-hidden text-white uppercase font-black h-4 border-4 border-white"
      >
        {r.teamMeta?.mediumName || r.team} {r.teamMeta?.nickName ? r.teamMeta.nickName : ''}
      </TableCell>
      <TableCell className="text-center">{pct(r.p)}</TableCell>
      <TableCell className="text-center">{pct(r.pop)}</TableCell>
      <TableCell className="text-center">{edge(r.value)}</TableCell>
      <TableCell className="text-center">{edge(r.weekly_edge)}</TableCell>
    </TableRow>
  )
}
