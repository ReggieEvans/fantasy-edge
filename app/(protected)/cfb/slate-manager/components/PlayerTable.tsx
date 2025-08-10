import { CellContext, ColumnDef } from '@tanstack/react-table'
import { Crosshair } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Player } from '@/types/Player'

import { baseColumns, quarterbackColumns, runningbackColumns, widereceiverColumns } from '../[id]/[matchupId]/columns'

interface Props {
  data: Player[]
  position: 'QB' | 'RB' | 'WR'
  showPlayersWithNoStats?: boolean
}

export default function PlayerTable({ data, position, showPlayersWithNoStats }: Props) {
  const positionCols =
    position === 'QB' ? quarterbackColumns : position === 'RB' ? runningbackColumns : widereceiverColumns

  const columns: ColumnDef<Player>[] = [...baseColumns, ...positionCols]

  const hasStats = (player: Player): boolean => {
    if (position === 'QB') return !!player.passing
    if (position === 'RB') return !!player.rushing
    if (position === 'WR') return !!player.receiving
    return true
  }

  const filteredData = showPlayersWithNoStats ? data : data.filter(hasStats)

  return (
    <Table className="h-[100px] overflow-y-auto">
      <TableHeader>
        <TableRow className="border-b border-background-secondary">
          {/* Fixed Target Column */}
          <TableHead
            className="text-[12px] text-muted font-bold sticky min-w-[60px] right-[199px] z-10 ml-4 px-2 text-center rounded-t-md"
            title="Target Player"
          >
            <Crosshair size={14} className="mx-auto" />
          </TableHead>

          {/* Dynamic Data Columns */}
          {columns.map((col: ColumnDef<Player>) => (
            <TableHead
              title={col.meta as string}
              key={col.id}
              className={`text-[12px] text-muted font-bold text-xs  ${col.id === 'displayName' ? 'text-left min-w-[150px]' : 'text-center'}`}
            >
              {col.header as string}
            </TableHead>
          ))}

          {/* Fixed Action Column */}
          <TableHead
            className="text-xs uppercase text-muted font-bold text-center bg-background-secondary rounded-t"
            title="Target Player"
          >
            Edit
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((player: Player) => (
          <TableRow key={player._id} className="bg-card border-b border-background-secondary">
            <TableCell className="sticky min-w-[60px] right-[199px] z-10 ml-4 px-2 text-center ">
              <Button variant="ghost" size="sm" className="text-accent hover:text-accent-foreground">
                <Crosshair size={14} className="mx-auto" />
              </Button>
            </TableCell>

            {columns.map(col => {
              const cellContent =
                typeof col.cell === 'function'
                  ? col.cell({ row: { original: player } } as CellContext<Player, unknown>)
                  : col.id && typeof col.id === 'string'
                    ? String(player[col.id as keyof Player] ?? '')
                    : ''

              return (
                <TableCell key={col.id} className="text-center">
                  {cellContent}
                </TableCell>
              )
            })}

            {/* Action Column */}
            <TableCell className="text-center ">
              <Button variant="outline" size="sm" className="px-4">
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
