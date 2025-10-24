/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronDown, ChevronsUpDown, ChevronUp, Info } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ...inside file:

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: 'reason',
    header: 'Why?',
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="py-1 px-3 h-auto">
                <Info size={14} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-background-darker">
              <p className="text-sm font-medium">WHY?</p>
              <ul className="list-disc pl-4 text-sm text-muted-foreground">
                {row.original.reason.map((r: string, i: number) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        </div>
      )
    },
  },
  {
    accessorKey: 'buyIn',
    header: 'Buy-in',
    cell: ({ getValue }) => `$${(getValue<number>() ?? 0).toFixed(2)}`,
    sortingFn: 'basic',
  },
  {
    accessorKey: 'fieldMax',
    header: 'Field',
    cell: ({ getValue }) => (getValue<number>() ?? 0).toLocaleString(),
  },
  {
    accessorKey: 'fillPct',
    header: 'Fill%',
    cell: ({ getValue }) => `${((getValue<number>() ?? 0) * 100).toFixed(1)}%`,
    sortingFn: (a, b, id) => (a.getValue<number>(id) ?? 0) - (b.getValue<number>(id) ?? 0),
  },
  {
    accessorKey: 'prizePool',
    header: 'Prize Pool',
    cell: ({ getValue }) => `$${(getValue<number>() ?? 0).toLocaleString()}`,
  },
  {
    accessorKey: 'firstPct',
    header: '1st%',
    cell: ({ getValue }) => {
      const v = getValue<number | null>()
      return v != null ? `${(v * 100).toFixed(1)}%` : '—'
    },
    sortingFn: (a, b, id) => {
      const av = a.getValue<number | null>(id) ?? Number.POSITIVE_INFINITY
      const bv = b.getValue<number | null>(id) ?? Number.POSITIVE_INFINITY
      return av - bv
    },
  },
  {
    accessorKey: 'bucket',
    header: 'Bucket',
  },
  //   {
  //     id: 'why',
  //     header: 'Why',
  //     enableSorting: false,
  //     cell: ({ row }) => (
  //       <ul className="list-disc pl-4 text-sm text-muted-foreground">
  //         {row.original.reason.map((r, i) => (
  //           <li key={i}>{r}</li>
  //         ))}
  //       </ul>
  //     ),
  //   },
]

type DataTableProps<TData> = {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  pageSizeOptions?: number[]
  initialPageSize?: number
  className?: string
}

export function DataTable<TData>({
  columns,
  data,
  pageSizeOptions = [10, 25],
  initialPageSize = 10,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pageSize, setPageSize] = React.useState<number>(initialPageSize)

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  React.useEffect(() => {
    table.setPageSize(pageSize)
  }, [pageSize, table])

  const SortIcon = ({ state }: { state: false | 'asc' | 'desc' }) =>
    state === 'asc' ? (
      <ChevronUp className="ml-2 h-3.5 w-3.5" />
    ) : state === 'desc' ? (
      <ChevronDown className="ml-2 h-3.5 w-3.5" />
    ) : (
      <ChevronsUpDown className="ml-2 h-3.5 w-3.5 opacity-60" />
    )

  return (
    <div className={className}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(header => {
                  const canSort = header.column.getCanSort()
                  const sortState = header.column.getIsSorted()
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : canSort ? (
                        <Button
                          variant="ghost"
                          className="p-0 h-auto font-semibold"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <SortIcon state={sortState} />
                        </Button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-3 gap-2">
        <div className="text-sm">
          Page <b>{table.getState().pagination.pageIndex + 1}</b> of <b>{table.getPageCount()}</b>
        </div>

        <div className="flex items-center gap-2">
          <Select value={String(pageSize)} onValueChange={v => setPageSize(Number(v))}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent className="bg-background-darker">
              {pageSizeOptions.map(s => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
            >
              «
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
            >
              »
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
