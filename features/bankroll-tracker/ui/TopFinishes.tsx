import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PaginationBar, usePagination } from '@/shared/ui/usePagination'

import { Row } from '../types/row'
import { $ } from '../utils'
import { finishPct } from '../utils'

export default function TopFinishes({ topFinishes }: { topFinishes: Row[] }) {
  const topFinishesPg = usePagination(topFinishes, 5)

  return (
    <Card className="col-span-1 bg-background-secondary border border-muted-bg rounded p-0">
      <CardHeader className="bg-card py-3 border-b border-accent">
        <div className="flex items-center justify-between">
          <CardTitle className="font-bold">Top 1% Finishes</CardTitle>
          <div className="text-foreground font-black">
            <span className="uppercase text-[11px] text-muted">Count:</span> {topFinishes.length}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col justify-between h-[300px]">
          <Table className="text-xs">
            <TableHeader className="sticky top-0 bg-background-secondary z-10 text-muted">
              <TableRow className="border-b border-muted">
                <TableHead>Date</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead className="text-right">Field</TableHead>
                <TableHead className="text-right">Place</TableHead>
                <TableHead className="text-right">Pct</TableHead>
                <TableHead className="text-right">Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...topFinishesPg.pageItems]
                .sort((a, b) => {
                  const ap = finishPct(a)
                  const bp = finishPct(b)
                  return ap === bp ? b.profit - a.profit : ap - bp
                })
                .map((r, i) => (
                  <TableRow
                    key={`top-${r.contest_key}-${i}`}
                    className="border-b h-10 border-muted-bg"
                  >
                    <TableCell>{r.date}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={r.entry_name}>
                      {r.entry_name}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.entries?.toLocaleString() || '—'}
                    </TableCell>
                    <TableCell className="text-right">{r.place?.toLocaleString() || '—'}</TableCell>
                    <TableCell className="text-right">
                      {r.place && r.entries ? `${(finishPct(r) * 100).toFixed(2)}%` : '—'}
                    </TableCell>
                    <TableCell
                      className={`text-right ${r.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                    >
                      {$(r.profit)}
                    </TableCell>
                  </TableRow>
                ))}
              {topFinishes.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-12 text-muted font-bold text-lg"
                  >
                    Do Better.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <PaginationBar
            page={topFinishesPg.page}
            setPage={topFinishesPg.setPage}
            pageCount={topFinishesPg.pageCount}
            pageSize={topFinishesPg.pageSize}
            rangeLabel={topFinishesPg.rangeLabel}
          />
        </div>
      </CardContent>
    </Card>
  )
}
