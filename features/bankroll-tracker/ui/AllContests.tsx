import { Badge } from '@/components/ui/badge'
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
import { pct } from '@/shared/utils'

import { GroupRow } from '../types/groupRow'
import { $ } from '../utils'

export default function AllContests({
  grouped,
  onSetSelected,
  setOpen,
}: {
  grouped: GroupRow[]
  onSetSelected: (g: GroupRow) => void
  setOpen: (open: boolean) => void
}) {
  const groupedPg = usePagination(grouped, 10)

  return (
    <Card className="xl:col-span-2 bg-background-secondary border border-muted-bg rounded p-0">
      <CardHeader className="flex justify-between bg-card py-4 border-b border-accent">
        <CardTitle className="text-sm">All Contests (Grouped)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col justify-between h-[500px]">
          <Table className="text-xs">
            <TableHeader className="sticky top-0 bg-background-secondary z-10 text-muted">
              <TableRow className="border-b border-muted">
                <TableHead className="w-[110px]">Date</TableHead>
                <TableHead>Sport</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contest</TableHead>
                <TableHead className="text-right">My Entries</TableHead>
                <TableHead className="text-right">Field</TableHead>
                <TableHead className="text-right">Spent</TableHead>
                <TableHead className="text-right">Won</TableHead>
                <TableHead className="text-right">ROI</TableHead>
                <TableHead className="text-right">Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedPg.pageItems.map(g => (
                <TableRow
                  key={g.contest_key}
                  className="cursor-pointer hover:bg-muted-bg border-b h-10 border-muted-bg"
                  onClick={() => {
                    onSetSelected(g)
                    setOpen(true)
                  }}
                >
                  <TableCell>{g.date}</TableCell>
                  <TableCell>{g.sport}</TableCell>
                  <TableCell>{g.mode}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{g.contest_bucket}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={g.contest_name}>
                    {g.contest_name}
                  </TableCell>
                  <TableCell className="text-right">{g.my_entries.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    {g.field_size?.toLocaleString() || '—'}
                  </TableCell>
                  <TableCell className="text-right">{$(g.spent)}</TableCell>
                  <TableCell className="text-right">{$(g.won)}</TableCell>
                  <TableCell
                    className={`text-right ${g.roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                  >
                    {pct(g.roi)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${g.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                  >
                    {$(g.profit)}
                  </TableCell>
                </TableRow>
              ))}
              {grouped.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground">
                    No contests.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <PaginationBar
            page={groupedPg.page}
            setPage={groupedPg.setPage}
            pageCount={groupedPg.pageCount}
            pageSize={groupedPg.pageSize}
            rangeLabel={groupedPg.rangeLabel}
          />
        </div>
      </CardContent>
    </Card>
  )
}
