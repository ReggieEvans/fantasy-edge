'use client'

import { PlusCircle, Users } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/shared/hooks/useToast'

import { useGetTargetPoolQuery } from '../../_api/target-pool.api'
import {
  useAddTargetMutation,
  useRemoveTargetMutation,
  useUpdateTargetMutation,
} from '../../_api/targets.api'
import useTargetPoolControls from '../../_hooks/useTargetPoolControls'
import { TargetPlayerFormValues } from '../../_schema/targetForm.schema'
import { Player } from '../../_types/player'
import { TargetPool } from '../../_types/targetPool'
import QuickTargetsModal from '../../_ui/QuickTargetModal'
import TargetPlayerModal from '../../_ui/TargetPlayerModal'
import { TargetCard } from '../ui/TargetCard'

type SortKey = 'target_type' | 'position' | 'salary' | 'projection'

export default function PlayerPoolPage() {
  const { id } = useParams() as { id: string }
  const [open, setOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<TargetPool | null>(null)
  const [existingTarget, setExistingTarget] = useState<TargetPool | null>(null)
  const [updateTarget, { isLoading: isUpdating }] = useUpdateTargetMutation()
  const [removeTarget, { isLoading: isRemoving }] = useRemoveTargetMutation()
  const [showQuickTargetsModal, setShowQuickTargetsModal] = useState(false)
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set())
  const { data: targets, isLoading } = useGetTargetPoolQuery(id)
  const [addTarget] = useAddTargetMutation()

  const { filterPosition, setFilterPosition, sortKey, setSortKey, groupedTargets } =
    useTargetPoolControls(targets || [])

  const handleTargetingPlayer = (player: TargetPool) => {
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

  const onTargetPlayer = async (player: Player) => {
    const id = player.player_id
    setAddingIds(prev => new Set(prev).add(id))

    try {
      const payload = {
        id: player?.id,
        player_id: player?.player_id,
        slate_id: player?.slate_id,
        target_type: undefined,
        stack_candidate: false,
        target_notes: '',
      }

      await addTarget(payload).unwrap()
      toast({
        title: 'Target Added Successfully!',
        description: `${player?.full_name} has been added to player pool.`,
        variant: 'default',
      })
    } catch {
      toast({
        title: 'Error Targeting Player',
        description: `There was an error targeting the player.`,
        variant: 'destructive',
      })
    } finally {
      setAddingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
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
            The player pool is a list of players that you have targeted for your slate. From here
            you can filter, sort, edit and delete targets in your pool.
          </p>
        </div>
        {/* Filters */}
        <div className="flex items-center justify-between">
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQuickTargetsModal(true)}
            className="px-6 py-4 duration-300 text-foreground transition-colors hover:text-foreground hover:bg-background-secondary"
          >
            <PlusCircle className="w-4 h-4 mr-2 text-accent" /> Quick Target
          </Button>
        </div>

        {/* Render groups */}
        <div className="flex flex-col gap-8 max-h-[calc(100vh-300px)] overflow-y-auto">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full bg-card rounded animate-pulse" />
            ))
          ) : targets?.length === 0 ? (
            <div className="flex flex-col items-center justify-center max-w-[350px] mx-auto pt-24 space-y-2">
              <h2 className="text-muted text-center text-lg font-bold opacity-70">
                No targets found
              </h2>
              <p className="text-muted text-center text-sm opacity-50">
                You currently have no targets in your player pool. You can add targets by clicking
                the target icon next to a player on the matchup page.
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
                    <TargetCard
                      key={target.id}
                      target={target}
                      handleTargetingPlayer={handleTargetingPlayer}
                    />
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

      <QuickTargetsModal
        slateId={id}
        open={showQuickTargetsModal}
        onClose={() => setShowQuickTargetsModal(false)}
        onTargetPlayer={onTargetPlayer}
        addingIds={addingIds}
        tabs={[]}
      />
    </div>
  )
}
