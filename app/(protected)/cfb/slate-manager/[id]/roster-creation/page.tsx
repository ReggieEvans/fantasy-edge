'use client'

import { Hammer } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { toast } from '@/hooks/use-toast'

import { useAddTargetMutation } from '../../_api'
import { useGetTargetPoolQuery } from '../../_api/target-pool.api'
import QuickTargetModal from '../../_components/QuickTargetModal'
import { TargetPool as TargetPoolType } from '../../_types/targetPool'
import RosterBuilder from './components/RosterBuilder'
import TargetPool from './components/TargetPool'

export default function RosterCreation() {
  const { id } = useParams() as { id: string }

  const [showProjections, setShowProjections] = useState(true)
  const [showGroups, setShowGroups] = useState(true)
  const [showQuickTargetsModal, setShowQuickTargetsModal] = useState(false)
  const [roster, setRoster] = useState({})
  const [playerPool, setPlayerPool] = useState<TargetPoolType[]>([])
  const hasInitialized = useRef(false)
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set())

  const { data: userTargets = [], isLoading, isError } = useGetTargetPoolQuery(id)
  const [addTarget] = useAddTargetMutation()

  useEffect(() => {
    if (!userTargets) return

    setPlayerPool(prev => {
      // first load: take server as base
      if (!hasInitialized.current) {
        hasInitialized.current = true
        return userTargets
      }
      // later loads: append only items we don't already have
      const have = new Set(prev.map(t => t.id ?? t.player_id))
      const additions = userTargets.filter(t => !have.has(t.id ?? t.player_id))
      return additions.length ? [...prev, ...additions] : prev
    })
  }, [userTargets])

  const restorePlayerToPool = (player: TargetPoolType) => {
    setPlayerPool(prev => {
      // Create a new set of IDs
      const newSet = [...prev, player].map(p => p.player_id)

      // Preserve original order
      return userTargets.filter(p => newSet.includes(p.player_id))
    })
  }

  const onTargetPlayer = async player => {
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

  const targetPoolProps = {
    showProjections,
    roster,
    setRoster,
    setPlayerPool,
  }

  return (
    <div className="flex flex-col bg-background pt-3 rounded-tl-[40px] min-h-[calc(100vh-90px)] overflow-y-auto">
      <div className="flex flex-col py-4 px-6 text-muted">
        <div className="flex flex-col justify-between mb-2 text-foreground">
          <div className="flex items-center gap-2 mb-2">
            <span>
              <Hammer size={20} />
            </span>
            <h1 className="text-xl font-bold uppercase">Roster Builder</h1>
          </div>
          <p className="text-muted text-sm">
            The roster builder is a tool that allows you to tinker with roster construction for a the current slate.
            Using the player pool you assembled, you can create and save rosters to view, compare and export.
          </p>
        </div>
        <div className="lg:flex hidden">
          <div className="w-1/2 pr-6">
            <TargetPool
              {...targetPoolProps}
              playerPool={playerPool}
              toggleProjections={() => setShowProjections(!showProjections)}
              showGroups={showGroups}
              toggleGroups={() => setShowGroups(!showGroups)}
              openQuickTargetModal={() => setShowQuickTargetsModal(true)}
              isLoading={isLoading}
              isError={isError}
            />
          </div>
          <div className="w-1/2">
            <RosterBuilder {...targetPoolProps} userTargets={userTargets} restorePlayerToPool={restorePlayerToPool} />
          </div>
        </div>
        <div className="lg:hidden">
          <div className="text-lg font-bold text-muted text-center py-24">
            We recommend building your rosters in a desktop browser.
          </div>
        </div>
        <QuickTargetModal
          slateId={id}
          open={showQuickTargetsModal}
          onClose={() => setShowQuickTargetsModal(false)}
          onTargetPlayer={onTargetPlayer}
          addingIds={addingIds}
        />
      </div>
    </div>
  )
}
