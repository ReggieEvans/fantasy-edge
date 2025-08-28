'use client'

import { Loader, Loader2, Plus } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { FixedSizeList as List } from 'react-window'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
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
import { useDebouncedValue } from '@/hooks/use-debounce-value'
import { useSlatePlayers } from '@/hooks/use-infinite-query'

import { Player } from '../_types/player'

export default function QuickTargetsModal({
  slateId,
  initialPosition = '',
  onTargetPlayer,
  open,
  onClose,
  addingIds,
}: {
  slateId: string
  initialPosition?: string
  onTargetPlayer: (p: Player) => Promise<void>
  open: boolean
  onClose: () => void
  addingIds: Set<number>
}) {
  const [q, setQ] = useState('')
  const [position, setPosition] = useState(initialPosition)

  const debouncedQ = useDebouncedValue(q, 350) // tweak delay as you like
  const isTyping = q !== debouncedQ

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: rqIsLoading,
    isPending: rqIsPending,
    isError,
    error,
    isRefetching,
    refetch,
  } = useSlatePlayers({ slateId, q: debouncedQ, position })

  const isInitialLoading = Boolean(rqIsLoading ?? rqIsPending)

  // flatten pages
  const items = useMemo(() => (data?.pages ?? []).flatMap(p => p.items), [data])

  // IntersectionObserver sentinel to load more
  const observerRef = useRef<IntersectionObserver | null>(null)
  const setObserverRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect()
      if (!node || !hasNextPage) return

      observerRef.current = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        },
        { root: null, threshold: 0.75 },
      )
      observerRef.current.observe(node)
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  )

  const handleTarget = async (p: Player) => {
    await onTargetPlayer(p)
    refetch()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0">
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
              <div className="relative">
                <Input
                  placeholder="Search by name..."
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  aria-busy={isTyping}
                  className="input input-sm"
                />
                {isTyping && (
                  <Loader
                    className="absolute right-2 top-[10px] h-4 w-4 animate-spin text-muted-foreground pointer-events-none"
                    aria-hidden="true"
                  />
                )}
              </div>
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
          </div>

          {/* Content area with states */}
          <div className="h-[520px] border rounded-md overflow-hidden">
            {isError ? (
              <div className="h-full flex flex-col items-center justify-center p-6">
                <Alert variant="destructive" className="max-w-md">
                  <AlertTitle>Couldn’t load players</AlertTitle>
                  <AlertDescription className="mt-2">{(error as Error)?.message ?? 'Unknown error.'}</AlertDescription>
                </Alert>
                <Button onClick={() => refetch()} className="mt-4">
                  Retry
                </Button>
              </div>
            ) : isInitialLoading ? (
              // Initial loading
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading players…</p>
              </div>
            ) : items.length === 0 ? (
              // Empty state
              <div className="h-full flex flex-col items-center justify-center gap-1">
                <p className="text-sm font-medium">No players found</p>
                <p className="text-xs text-muted-foreground">Try a different search or position.</p>
              </div>
            ) : (
              // Virtualized list
              <>
                {isRefetching && (
                  <div className="flex items-center justify-center gap-3 py-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <p className="text-sm text-muted-foreground">Refreshing players…</p>
                  </div>
                )}

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
                          <div className="font-bold">{p.full_name}</div>
                          <div className="text-xs text-muted">
                            {p.position} — {p.team?.full_name ?? '—'}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex gap-4 items-center mr-4">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-bold text-muted uppercase">Proj</span>
                              <p className="text-right font-bold">{p.projection ?? '—'}</p>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-muted uppercase">Salary</span>
                              <p className="text-right font-bold">
                                {p.salary ? `$${p.salary.toLocaleString('en-US')}` : '—'}
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="px-2 border-card text-accent"
                            onClick={() => handleTarget(p)}
                            disabled={addingIds.has(p.player_id)}
                          >
                            {addingIds.has(p.player_id) ? (
                              <Loader className="animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  }}
                </List>
              </>
            )}
          </div>

          {/* Footer loader */}
          <div className="flex justify-center items-center py-2 h-4">
            {(isFetchingNextPage || isRefetching) && <p className="text-center text-sm">Loading more…</p>}
          </div>
        </div>

        <DialogFooter className="bg-background-secondary p-4 rounded-b border-t-2 border-t-background-darker" />
      </DialogContent>
    </Dialog>
  )
}
