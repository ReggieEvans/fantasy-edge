import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { pct } from '@/shared/utils'
import { cn } from '@/utils/cn'

import { GroupRowWithContests } from '../types/groupRow'
import { $ } from '../utils'

export default function ContestModal({
  open,
  setOpen,
  selected,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  selected: GroupRowWithContests
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-5xl p-0">
        <DialogHeader className="px-6 py-5 border-b border-muted-bg bg-card">
          <DialogTitle>{selected?.contest_name || 'Contest'}</DialogTitle>
          <DialogDescription className="sr-only">Contest Results</DialogDescription>
        </DialogHeader>
        {selected && (
          <div className="flex flex-col gap-1 pb-6">
            <div className="space-y-3 px-6 pb-4">
              <div className="grid grid-cols-4 gap-3">
                <Card className="bg-cyan-700/30 border border-cyan-700 rounded p-0">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs text-foreground">My Entries</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-bold">
                    {selected.my_entries.toLocaleString()}
                  </CardContent>
                </Card>
                <Card className="bg-cyan-700/30 border border-cyan-700 rounded p-0">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs text-foreground">Spent</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-bold">{$(selected.spent)}</CardContent>
                </Card>
                <Card
                  className={cn(
                    'p-0 rounded',
                    selected.roi >= 0
                      ? 'bg-emerald-700/50 border border-emerald-700'
                      : 'bg-red-700/50 border border-red-700',
                  )}
                >
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs text-foreground">Net</CardTitle>
                  </CardHeader>
                  <CardContent
                    className={cn(
                      'text-2xl font-bold',
                      selected.roi >= 0 ? 'text-emerald-400' : 'text-red-400',
                    )}
                  >
                    {$(selected.won - selected.spent)}
                  </CardContent>
                </Card>
                <Card
                  className={cn(
                    'p-0 rounded',
                    selected.roi >= 0
                      ? 'bg-emerald-700/50 border border-emerald-700'
                      : 'bg-red-700/50 border border-red-700',
                  )}
                >
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs text-foreground">ROI</CardTitle>
                  </CardHeader>
                  <CardContent
                    className={`text-2xl font-bold ${selected.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                  >
                    {pct(selected.roi)}
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <Card className="col-span-2 bg-background-secondary border border-muted-bg rounded p-0">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs"></CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-between pr-16 text-2xl font-bold">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted mb-1">Top Score</span>
                      <span className="text-2xl font-bold">{selected.top_score ?? '—'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted mb-1">Low Score</span>
                      <span className="text-2xl font-bold">{selected.low_score ?? '—'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted mb-1">Avg Score</span>
                      <span className="text-2xl font-bold">{selected.avg_score ?? '—'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background-secondary border border-muted-bg rounded p-0">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs text-muted"># Top 1% Finishes</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-bold">{selected.top1pct_count}</CardContent>
                </Card>
                <Card className="bg-background-secondary border border-muted-bg rounded p-0">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs text-muted">Best Lineup Payout</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-bold">
                    {$(selected.best_payout)}
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex flex-col justify-between h-[400px] px-6 overflow-y-auto">
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
                  {selected.contests.map((r, i) => (
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
                </TableBody>
              </Table>
            </div>
            <div className="px-6">
              <div className="h-10 w-full bg-background-secondary rounded"></div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
