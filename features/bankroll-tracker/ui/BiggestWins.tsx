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

export default function BiggestWins({ biggestWins }: { biggestWins: Row[] }) {
  const winsPg = usePagination(biggestWins, 10)

  return (
    <Card className="col-span-1 bg-background-secondary border border-muted-bg rounded p-0">
      <CardHeader className="flex justify-between bg-card py-4 border-b border-accent">
        <CardTitle className="font-bold">Biggest Wins</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col justify-between h-[500px]">
          <Table className="text-xs">
            <TableHeader className="sticky top-0 bg-background-secondary z-10 text-muted">
              <TableRow className="border-b border-muted">
                <TableHead>Date</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead className="text-right">Winnings</TableHead>
                <TableHead className="text-right">Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winsPg.pageItems.map((r, i) => (
                <TableRow
                  key={`big-${r.contest_key}-${i}`}
                  className="h-10 border-b border-muted-bg"
                >
                  <TableCell>{r.date}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={r.entry_name}>
                    {r.entry_name}
                  </TableCell>
                  <TableCell className="text-right">{$(r.winnings)}</TableCell>
                  <TableCell
                    className={`text-right ${r.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                  >
                    {$(r.profit)}
                  </TableCell>
                </TableRow>
              ))}
              {biggestWins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <PaginationBar
            page={winsPg.page}
            setPage={winsPg.setPage}
            pageCount={winsPg.pageCount}
            pageSize={winsPg.pageSize}
            rangeLabel={winsPg.rangeLabel}
          />
        </div>
      </CardContent>
    </Card>
  )
}
