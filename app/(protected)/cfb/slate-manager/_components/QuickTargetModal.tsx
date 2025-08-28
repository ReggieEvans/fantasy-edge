import { Plus } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { FixedSizeList as List } from 'react-window'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSlatePlayers } from '@/hooks/use-infinite-query'

export default function QuickTargetsModal({
  slateId,
  remainingSalary, // pass from parent
  initialPosition = '',
  onTargetPlayer, // (p) => Promise<void>
  open,
  onClose,
}: {
  slateId: string
  remainingSalary: number
  initialPosition?: string
  onTargetPlayer: (p: any) => Promise<void>
  open: boolean
  onClose: () => void
}) {
  const [q, setQ] = useState('')
  const [position, setPosition] = useState(initialPosition)
  const [includeAllSalaries, setIncludeAllSalaries] = useState(true)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useSlatePlayers({
    slateId,
    q,
    position,
    includeAllSalaries,
    maxSalary: includeAllSalaries ? null : remainingSalary,
  })

  // flatten pages
  const items = useMemo(() => (data?.pages ?? []).flatMap(p => p.items), [data])

  // IntersectionObserver sentinel to load more
  const observerRef = useRef<IntersectionObserver | null>(null)

  const setObserverRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect()

      if (node && hasNextPage) {
        observerRef.current = new IntersectionObserver(
          entries => {
            if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
              fetchNextPage()
            }
          },
          {
            root: null,
            threshold: 0.75, // allow triggering a bit earlier
          },
        )
        observerRef.current.observe(node)
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  )

  const handleTarget = async (p: any) => {
    // optimistic removal
    // call your POST /api/targets
    await onTargetPlayer(p)
    // then refresh from server so pagination stays correct
    refetch()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0">
        <DialogDescription className="sr-only">
          Select a player to add to your roster. You can filter by position and salary
        </DialogDescription>
        <DialogHeader className="bg-background-secondary p-4 rounded-t border-b-2 border-b-background-darker">
          <DialogTitle className="text-lg">Quick Target</DialogTitle>
        </DialogHeader>
        <div className="py-3 px-6 space-y-3">
          {/* Controls */}
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1 w-1/2">
              <p className="text-[11px] px-1 text-muted font-bold">SEARCH</p>
              <Input
                className="input input-sm"
                placeholder="Search by name..."
                value={q}
                onChange={e => setQ(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1 w-24">
              <p className="text-[11px] px-1 text-muted font-bold">POSITION</p>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="All" className="text-sm" />
                </SelectTrigger>
                <SelectContent className="bg-background-darker">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="QB">QB</SelectItem>
                  <SelectItem value="RB">RB</SelectItem>
                  <SelectItem value="WR">WR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1 space-x-2 ml-4">
              <Checkbox
                id="include-all-salaries"
                checked={includeAllSalaries}
                onCheckedChange={checked => setIncludeAllSalaries(checked === true)}
                className="h-6 w-6 text-accent rounded border-card"
              />
              <label htmlFor="include-all-salaries" className="text-sm">
                Show all salaries
              </label>
            </div>
            {/* {!includeAllSalaries && (
          <span className="text-xs opacity-80">Remaining cap filter: ≤ ${remainingSalary.toLocaleString()}</span>
        )} */}
          </div>

          {/* Virtualized list */}
          <div className="h-[520px] border rounded-md overflow-hidden">
            <List height={520} itemCount={items.length + 1} itemSize={56} width="100%">
              {({ index, style }) => {
                if (index === items.length) {
                  return <div ref={setObserverRef} style={style} />
                }

                const p = items[index]
                return (
                  <div
                    style={style}
                    className="flex justify-between items-center border-b-4 border-b-background-darker bg-background-secondary px-3 pt-4 pb-2 rounded-md text-sm text-foreground"
                  >
                    <div className="flex flex-col">
                      <div className="font-medium">{p.full_name}</div>
                      <div className="text-xs text-muted">
                        {p.position} — {p.team_name}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-right font-bold">${p.salary?.toLocaleString('en-US')}</span>

                      <Button
                        variant="outline"
                        size="sm"
                        className="px-2 border-card text-accent"
                        onClick={() => handleTarget(p)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              }}
            </List>
          </div>
          <div className="flex justify-center items-center py-2 h-4">
            {isFetchingNextPage && <p className="text-center py-2 text-sm">Loading more…</p>}
          </div>
        </div>
        <DialogFooter className="bg-background-secondary p-4 rounded-b border-t-2 border-t-background-darker"></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
