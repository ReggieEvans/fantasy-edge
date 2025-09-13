'use client'

import { CellContext, ColumnDef } from '@tanstack/react-table'
import { Crosshair, Loader, UserRoundCheck } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/hooks/use-toast'

import {
  useAddTargetMutation,
  useGetTargetsQuery,
  useRemoveTargetMutation,
  useUpdateTargetMutation,
} from '../../_api/targets.api'
import { TargetPlayerFormValues } from '../../_schema/targetForm.schema'
import { Target } from '../../_types/target'
import TargetPlayerModal from '../../_ui/TargetPlayerModal'
import { Player } from '../types/player'
import { baseColumns, quarterbackColumns, runningbackColumns, widereceiverColumns } from './columns'

interface Props {
  data: Player[]
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'DST'
  showPlayersWithNoStats?: boolean
}

export default function PlayerTable({ data, position, showPlayersWithNoStats }: Props) {
  const { id } = useParams() as { id: string }
  const [open, setOpen] = useState(false)
  const [existingTarget, setExistingTarget] = useState<Target | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [addTarget, { isLoading: isSaving }] = useAddTargetMutation()
  const [updateTarget, { isLoading: isUpdating }] = useUpdateTargetMutation()
  const [removeTarget, { isLoading: isRemoving }] = useRemoveTargetMutation()
  const { data: targets } = useGetTargetsQuery(id)
  const positionCols =
    position === 'QB'
      ? quarterbackColumns
      : position === 'RB'
        ? runningbackColumns
        : widereceiverColumns

  const columns: ColumnDef<Player>[] = [...baseColumns, ...positionCols]

  const hasProjection = (player: Player): boolean => {
    if (position === 'QB') return !!player.projection
    if (position === 'RB') return !!player.projection
    if (position === 'WR') return !!player.projection
    return true
  }

  const withProjection = data.filter(hasProjection)

  // Return atleast 2 players even if they have no stats
  const filteredData = showPlayersWithNoStats
    ? data
    : withProjection.length >= 2
      ? withProjection
      : [
          ...withProjection,
          ...data
            .filter(p => !withProjection.includes(p))
            .sort((a, b) => (b.salary ?? 0) - (a.salary ?? 0))
            .slice(0, 2 - withProjection.length),
        ]

  const handleTargetingPlayer = (player: Player) => {
    setSelectedPlayer(player)

    const targetForPlayer =
      targets?.find(t => t.slate_player_id === player.id || t.player_id === player.player_id) ??
      null

    setExistingTarget(targetForPlayer)
    setOpen(true)
  }

  const handleRemoveTarget = async () => {
    try {
      if (existingTarget) {
        await removeTarget(existingTarget.id).unwrap()
      }
      setOpen(false)
      toast({
        title: 'Target Removed Successfully!',
        description: `${selectedPlayer?.first_name} ${selectedPlayer?.last_name} has been removed from your player pool.`,
        variant: 'default',
      })
    } catch {
      toast({
        title: 'Error Removing Target',
        description: `There was an error removing the target.`,
        variant: 'destructive',
      })
    }
  }

  const handleSubmitTarget = async (values: TargetPlayerFormValues) => {
    try {
      const payload = {
        id: selectedPlayer?.id,
        player_id: selectedPlayer?.player_id,
        slate_id: id,
        target_type: values.target_type ?? undefined,
        stack_candidate: values.stack_candidate,
        target_notes: values.target_notes ?? undefined,
      }

      if (existingTarget) {
        await updateTarget({ ...payload, id: existingTarget.id }).unwrap()
        setOpen(false)
        toast({
          title: 'Target Updated Successfully!',
          description: `${selectedPlayer?.first_name} ${selectedPlayer?.last_name} has been updated.`,
          variant: 'default',
        })
      } else {
        await addTarget(payload).unwrap()
        setOpen(false)
        toast({
          title: 'Target Added Successfully!',
          description: `${selectedPlayer?.first_name} ${selectedPlayer?.last_name} has been added to player pool.`,
          variant: 'default',
        })
      }
    } catch {
      toast({
        title: 'Error Targeting Player',
        description: `There was an error targeting the player.`,
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Table>
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
                className={`text-[12px] text-muted text-center font-bold text-xs  ${col.id === 'displayName' ? 'text-left min-w-[150px]' : 'text-center'}`}
              >
                {col.header as string}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((player: Player) => (
            <TableRow key={player.id} className="bg-card border-b border-background-secondary">
              <TableCell className="sticky min-w-[60px] right-[199px] z-10 ml-4 px-2 text-center ">
                {!targets?.some(target => target.slate_player_id === player.id) ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-accent hover:text-accent-foreground"
                    onClick={() => handleTargetingPlayer(player)}
                  >
                    {isSaving && selectedPlayer?.player_id === player.player_id ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      <Crosshair size={14} className="mx-auto" />
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-400 hover:bg-destructive"
                    onClick={() => handleTargetingPlayer(player)}
                  >
                    {isRemoving && selectedPlayer?.player_id === player.player_id ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      <UserRoundCheck size={14} className="mx-auto" />
                    )}
                  </Button>
                )}
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TargetPlayerModal
        open={open}
        onClose={() => setOpen(false)}
        selectedPlayer={selectedPlayer}
        existingTarget={existingTarget}
        handleSubmitTarget={handleSubmitTarget}
        isSaving={isSaving}
        isUpdating={isUpdating}
        isRemoving={isRemoving}
        handleRemoveTarget={handleRemoveTarget}
      />
    </>
  )
}
