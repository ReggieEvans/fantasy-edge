import { ColumnDef } from '@tanstack/react-table'

import { PickedContest } from '../libs/pickContests'

export const columns: ColumnDef<PickedContest>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: 'dg',
    header: 'dg',
    enableSorting: false,
    cell: ({ row }) => row.original.dg ?? '—',
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
    accessorKey: 'entered',
    header: 'Entered',
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
  {
    id: 'why',
    header: 'Why',
    enableSorting: false,
    cell: ({ row }) => (
      <ul className="list-disc pl-4 text-sm text-muted-foreground">
        {row.original.reason.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    ),
  },
]
