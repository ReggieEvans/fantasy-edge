'use client'

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface PlayerWithFlags {
  isExcluded?: boolean
  isLocked?: boolean
  [key: string]: unknown
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export default function PlayerTable<TData extends PlayerWithFlags, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="w-full overflow-x-auto">
      {/* INNER: vertical scroll cap */}
      <div className="mt-4 max-h-[800px] overflow-y-auto relative">
        <Table className="min-w-max border-separate border-spacing-0">
          {/* --- STICKY DOUBLE HEADER --- */}
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
                {group.headers.map(header => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className="first:sticky first:left-0 first:z-30 first:shadow-[inset_-6px_0_6px_-6px_rgba(0,0,0,0.15)] text-[11px] sticky"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          {/* --- BODY WITH PINNED FIRST COLUMN --- */}
          <TableBody
            className={`
              bg-card
              [&_td:first-child]:sticky [&_td:first-child]:left-0 [&_td:first-child]:z-10 [&_td:first-child]:bg-card 
              [&_td:nth-child(2)]:sticky [&_td:nth-child(2)]:left-[48px] [&_td:nth-child(2)]:z-10 [&_td:nth-child(2)]:bg-card 
              [&_td:nth-child(3)]:sticky [&_td:nth-child(3)]:left-[96px] [&_td:nth-child(3)]:z-10 [&_td:nth-child(3)]:bg-card 
              [&_td:nth-child(3)]:border-r 
              [&_td:first-child]:shadow-[inset_-6px_0_6px_-6px_rgba(0,0,0,0.08)]
        `}
          >
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={
                    row.original.isExcluded ? 'opacity-20 text-muted' : row.original.isLocked ? 'text-accent' : ''
                  }
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
