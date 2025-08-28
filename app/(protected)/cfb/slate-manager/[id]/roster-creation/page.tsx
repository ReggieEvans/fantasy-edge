'use client'

import { Hammer } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { useGetTargetPoolQuery } from '../../_api/target-pool.api'
import QuickTargetModal from '../../_components/QuickTargetModal'
import { TargetPool as TargetPoolType } from '../../_types/targetPool'
import RosterBuilder from './components/RosterBuilder'
import TargetPool from './components/TargetPool'

export default function RosterCreation() {
  const { id } = useParams() as { id: string }

  const [showProjections, setShowProjections] = useState(false)
  const [showGroups, setShowGroups] = useState(true)
  const [showQuickTargetsModal, setShowQuickTargetsModal] = useState(false)
  const [roster, setRoster] = useState({})
  const [playerPool, setPlayerPool] = useState<TargetPoolType[]>([])
  const hasInitialized = useRef(false)

  const { data: userTargets = [], isLoading, isError } = useGetTargetPoolQuery(id)

  useEffect(() => {
    if (!hasInitialized.current && userTargets?.length) {
      setPlayerPool(userTargets)
      hasInitialized.current = true
    }
  }, [userTargets])

  const restorePlayerToPool = (player: TargetPoolType) => {
    setPlayerPool(prev => {
      // Create a new set of IDs
      const newSet = [...prev, player].map(p => p.player_id)

      // Preserve original order
      return userTargets.filter(p => newSet.includes(p.player_id))
    })
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
        <QuickTargetModal slateId={id} open={showQuickTargetsModal} onClose={() => setShowQuickTargetsModal(false)} />
      </div>
    </div>
  )
}
