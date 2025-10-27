'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { ArrowBigLeftDash, ArrowBigRightDash } from 'lucide-react'
import React from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { PlayerTableSkeleton } from './PlayerTableSkeleton'

export interface PlayerWithFlags {
  id: string | number
  isExcluded?: boolean
  isLocked?: boolean
}

interface DataTableProps<TData extends PlayerWithFlags, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  isFetching?: boolean
  initialPageSize?: number
  getRowId?: (row: TData, index: number) => string
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
}

export default function PlayerTable<TData extends PlayerWithFlags, TValue>({
  columns,
  data,
  isLoading = false,
  isFetching = true,
  initialPageSize = 50,
  getRowId,
  columnVisibility,
  onColumnVisibilityChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pageSize, setPageSize] = React.useState<number>(() => {
    const stored =
      typeof window !== 'undefined' ? window.localStorage.getItem('playerTable.pageSize') : null
    return stored ? Number(stored) : initialPageSize
  })

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('playerTable.pageSize', String(pageSize))
    }
  }, [pageSize])

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  // keep state in sync if the user changes the dropdown
  React.useEffect(() => {
    setPagination(p => ({ ...p, pageSize }))
  }, [pageSize])

  const table = useReactTable({
    data,
    columns,
    state: { pagination, sorting, columnVisibility },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    getRowId: getRowId ?? (row => String(row.id)),
    onColumnVisibilityChange,
  })

  const rows = table.getPaginationRowModel().rows
  const hasRows = rows.length > 0

  const showSkeleton = isFetching && !hasRows
  const showOverlay = isFetching && hasRows
  const showEmpty = !showSkeleton && !showOverlay && !hasRows
  const visibleCols = table.getVisibleLeafColumns().length || columns.length

  if (showSkeleton) return <PlayerTableSkeleton />

  return (
    <div className="w-full overflow-x-auto">
      <div className="mt-4 max-h-[800px] overflow-y-auto relative">
        {showOverlay && (
          <div className="pointer-events-none absolute inset-0 z-40 bg-background/30 backdrop-blur-[1px]" />
        )}

        <Table aria-busy={isLoading} className="min-w-max border-separate border-spacing-0">
          <TableHeader
            className={`
              text-xs text-muted font-bold 
              [&_th]:sticky [&_th]:z-20 [&_th]:bg-background-secondary [&_th]:border-b [&_tr]:h-10 
              [&_tr:nth-child(1)_th]:top-0 [&_tr:nth-child(2)_th]:top-10 [&_tr_th:first-child]:left-0 
              [&_tr:nth-child(2)_th]:border-b [&_tr:nth-child(2)_th]:border-accent
              [&_tr:nth-child(2)_th:first-child]:left-0 [&_tr:nth-child(2)_th:first-child]:z-30 [&_tr:nth-child(2)_th:first-child]:bg-background-secondary [&_tr:nth-child(2)_th:first-child]:w-[48px]
              [&_tr:nth-child(2)_th:nth-child(2)]:left-[48px] [&_tr:nth-child(2)_th:nth-child(2)]:z-30 [&_tr:nth-child(2)_th:nth-child(2)]:bg-background-secondary [&_tr:nth-child(2)_th:nth-child(2)]:w-[48px]
              [&_tr:nth-child(2)_th:nth-child(3)]:left-[96px] [&_tr:nth-child(2)_th:nth-child(3)]:z-30 [&_tr:nth-child(2)_th:nth-child(3)]:bg-background-secondary
              [&_svg.lucide.lucide-lock.w-4.h-4.text-muted]:mx-auto
              [&_svg.lucide.lucide-x.w-4.h-4.text-muted]:mx-auto
            `}
          >
            {table.getHeaderGroups().map(group => (
              <TableRow key={group.id}>
                {group.headers.map(header => {
                  const meta = header.column.columnDef.meta as { tooltip?: string } | undefined
                  return (
                    <TableHead
                      key={header.id}
                      title={meta?.tooltip ?? ''}
                      colSpan={header.colSpan}
                      className="first:sticky first:left-0 first:z-30 first:shadow-[inset_-6px_0_6px_-6px_rgba(0,0,0,0.15)] text-[11px] sticky"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className="flex items-center gap-1 cursor-pointer select-none"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽',
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody
            className={`
              bg-card text-xs
              [&_td:first-child]:sticky [&_td:first-child]:left-0 [&_td:first-child]:z-10 [&_td:first-child]:bg-card 
              [&_td:nth-child(2)]:sticky [&_td:nth-child(2)]:left-[48px] [&_td:nth-child(2)]:z-10 [&_td:nth-child(2)]:bg-card 
              [&_td:nth-child(3)]:sticky [&_td:nth-child(3)]:left-[96px] [&_td:nth-child(3)]:z-10 [&_td:nth-child(3)]:bg-card 
              [&_td:nth-child(3)]:border-r 
              [&_td:first-child]:shadow-[inset_-6px_0_6px_-6px_rgba(0,0,0,0.08)]
            `}
          >
            {hasRows ? (
              rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={
                    (row.original as PlayerWithFlags).isExcluded
                      ? 'opacity-20 text-muted'
                      : (row.original as PlayerWithFlags).isLocked
                        ? 'text-accent'
                        : ''
                  }
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : showEmpty ? (
              <TableRow>
                <TableCell colSpan={visibleCols} className="h-96 text-center">
                  No results.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      {/* Pager + page size */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center py-2">
          <div className="text-xs text-muted">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} ·{' '}
            {table.getPrePaginationRowModel().rows.length} rows
          </div>
          <div className="flex items-center ml-auto gap-3">
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 px-2 py-1 rounded border hover:border-accent bg-card uppercase font-bold text-sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ArrowBigLeftDash className="w-4 h-4" /> <span>First</span>
              </button>
              <button
                className="flex items-center gap-2 px-2 py-1 rounded border hover:border-accent bg-card uppercase font-bold text-sm disabled:opacity-50"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Prev
              </button>
              <button
                className="flex items-center gap-2 px-2 py-1 rounded border hover:border-accent bg-card uppercase font-bold text-sm disabled:opacity-50"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </button>
              <button
                className="flex items-center gap-2 px-2 py-1 rounded border hover:border-accent bg-card uppercase font-bold text-sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span>Last</span>
                <ArrowBigRightDash className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center ml-auto gap-3">
            <label className="text-xs">
              Rows per page:{' '}
              <select
                className="ml-1 rounded border px-2 py-1 text-xs bg-card"
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
              >
                {[25, 50, 100, 200].map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
