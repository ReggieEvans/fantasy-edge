'use client'

import { Users } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState } from 'react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import useTargetPoolControls from '@/hooks/use-target-pool-controls'
import { toast } from '@/hooks/use-toast'

import { useGetTargetPoolQuery } from '../../_api/target-pool.api'
import { useUpdateTargetMutation } from '../../_api/targets.api'
import { useRemoveTargetMutation } from '../../_api/targets.api'
import TargetPlayerModal from '../../_components/TargetPlayerModal'
import { TargetPlayerFormValues } from '../../_schema/targetForm.schema'
import { TargetPool } from '../../_types/targetPool'
import { TargetCard } from './components/TargetCard'

type SortKey = 'target_type' | 'position' | 'salary' | 'projection'

export default function PlayerPoolPage() {
  const { id } = useParams() as { id: string }
  const [open, setOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<TargetPool | null>(null)
  const [existingTarget, setExistingTarget] = useState<TargetPool | null>(null)
  const [updateTarget, { isLoading: isUpdating }] = useUpdateTargetMutation()
  const [removeTarget, { isLoading: isRemoving }] = useRemoveTargetMutation()
  const { data: targets, isLoading } = useGetTargetPoolQuery(id)

  const { filterPosition, setFilterPosition, sortKey, setSortKey, groupedTargets } = useTargetPoolControls(
    targets || [],
  )

  const handleTargetingPlayer = (player: TargetPool) => {
    setSelectedPlayer(player)

    const targetForPlayer =
      targets?.find(t => t.slate_player_id === player.id || t.player_id === player.player_id) ?? null

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
        description: `${existingTarget?.first_name} ${existingTarget?.last_name} has been removed from your player pool.`,
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
        id: existingTarget?.id,
        player_id: existingTarget?.player_id,
        slate_id: id,
        target_type: values.target_type ?? undefined,
        stack_candidate: values.stack_candidate,
        target_notes: values.target_notes ?? '',
      }

      await updateTarget({ ...payload }).unwrap()
      setOpen(false)
      toast({
        title: 'Target Updated Successfully!',
        description: `${existingTarget?.first_name} ${existingTarget?.last_name} has been updated.`,
        variant: 'default',
      })
    } catch {
      toast({
        title: 'Error Updating Target',
        description: `There was an error updating the target.`,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex flex-col bg-background pt-3 rounded-tl-[40px] min-h-[calc(100vh-90px)] overflow-y-auto">
      <div className="flex flex-col py-4 px-6 text-muted">
        <div className="flex flex-col justify-between mb-2 text-foreground">
          <div className="flex items-center gap-2 mb-2">
            <span>
              <Users size={20} />
            </span>
            <h1 className="text-xl font-bold uppercase">Player Pool</h1>
          </div>
          <p className="text-muted text-sm">
            The player pool is a list of players that you have targeted for your slate. From here you can filter, sort,
            edit and delete targets in your pool.
          </p>
        </div>
        {/* Filters */}
        <div className="flex gap-4 my-4">
          <Select
            value={filterPosition ?? 'all'}
            onValueChange={value => setFilterPosition(value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-[180px] text-foreground">
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="all">All Positions</SelectItem>
              {[...new Set(targets?.map(t => t.position) ?? [])].map(pos => (
                <SelectItem key={pos} value={pos}>
                  {pos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortKey} onValueChange={value => setSortKey(value as SortKey)}>
            <SelectTrigger className="w-[180px] text-foreground">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="target_type">Target Type</SelectItem>
              <SelectItem value="position">Position</SelectItem>
              <SelectItem value="salary">Salary</SelectItem>
              <SelectItem value="projection">Projection</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Render groups */}
        <div className="space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full bg-card rounded animate-pulse" />)
          ) : targets?.length === 0 ? (
            <div className="flex flex-col items-center justify-center max-w-[350px] mx-auto pt-24 space-y-2">
              <h2 className="text-muted text-center text-lg font-bold opacity-70">No targets found</h2>
              <p className="text-muted text-center text-sm opacity-50">
                You currently have no targets in your player pool. You can add targets by clicking the target icon next
                to a player on the matchup page.
              </p>
            </div>
          ) : (
            groupedTargets.map(([group, items]) => (
              <div key={group} className="mb-6">
                <div className="text-sm font-black text-foreground uppercase mb-2 border-b border-accent pb-1">
                  {group}
                </div>
                <div className="space-y-4">
                  {items.map((target: TargetPool) => (
                    <TargetCard key={target.id} target={target} handleTargetingPlayer={handleTargetingPlayer} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Target Player Modal */}
      <TargetPlayerModal
        open={open}
        onClose={() => setOpen(false)}
        selectedPlayer={selectedPlayer}
        existingTarget={existingTarget}
        isUpdating={isUpdating}
        isRemoving={isRemoving}
        handleSubmitTarget={handleSubmitTarget}
        handleRemoveTarget={handleRemoveTarget}
      />
    </div>
  )
}
