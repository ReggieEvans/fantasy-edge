import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function usePagination<T>(items: T[], initialPageSize = 10) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const startIdx = (page - 1) * pageSize
  const endIdx = startIdx + pageSize

  const pageItems = useMemo(() => items.slice(startIdx, endIdx), [items, startIdx, endIdx])

  useEffect(() => {
    setPage(1)
  }, [items, pageSize])

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    pageCount,
    pageItems,
    total: items.length,
    rangeLabel:
      items.length === 0
        ? '0–0 of 0'
        : `${startIdx + 1}–${Math.min(items.length, endIdx)} of ${items.length}`,
  }
}

export function PaginationBar(props: {
  page: number
  setPage: (p: number) => void
  pageCount: number
  pageSize: number
  setPageSize?: (n: number) => void
  rangeLabel: string
}) {
  const { page, setPage, pageCount, pageSize, setPageSize, rangeLabel } = props
  const canPrev = page > 1
  const canNext = page < pageCount

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 w-full bg-card">
      <div className="text-xs text-muted-foreground w-24">{rangeLabel}</div>

      <div className="flex items-center gap-2 -ml-24">
        <Button variant="outline" size="icon" disabled={!canPrev} onClick={() => setPage(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-xs w-16 text-center">
          {page} / {pageCount}
        </div>
        <Button variant="outline" size="icon" disabled={!canNext} onClick={() => setPage(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {setPageSize && (
          <Select value={String(pageSize)} onValueChange={v => setPageSize(Number(v))}>
            <SelectTrigger className="h-8 w-24 bg-background-secondary">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map(n => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
