'use client'

import { Hammer } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import { toast } from '@/hooks/use-toast'

import { useAddTargetMutation } from '../../_api'
import { useGetSlateQuery } from '../../_api/slates.api'
import { useGetTargetPoolQuery } from '../../_api/target-pool.api'
import QuickTargetModal from '../../_components/QuickTargetModal'
import { Player } from '../../_types/player'
import { TargetPool as TargetPoolType } from '../../_types/targetPool'
import RosterBuilder from './components/RosterBuilder'
import TargetPool from './components/TargetPool'

type Sport = 'NFL' | 'CFB'

const TABS = {
  NFL: [
    { value: 'ALL', label: 'ALL' },
    { value: 'QB', label: 'QB' },
    { value: 'RB', label: 'RB' },
    { value: 'WR', label: 'WR' },
    { value: 'TE', label: 'TE' },
    { value: 'DST', label: 'DST' },
  ],
  CFB: [
    { value: 'ALL', label: 'ALL' },
    { value: 'QB', label: 'QB' },
    { value: 'RB', label: 'RB' },
    { value: 'WR', label: 'WR' },
  ],
}

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
  const { data: slate, isLoading: isSlateLoading, isError: isSlateError } = useGetSlateQuery(id)
  const [addTarget] = useAddTargetMutation()

  // derive tabs from sport
  const tabs = useMemo(() => {
    const sport = slate?.sport as Sport | undefined
    return sport ? TABS[sport] : []
  }, [slate?.sport])

  // control Tabs value so it updates once sport loads
  const [tabValue, setTabValue] = useState('ALL')
  useEffect(() => {
    if (tabs.length) setTabValue(tabs[0].value)
  }, [tabs])

  const rosteredIds = useMemo(() => {
    // roster: Record<string, TargetPoolType | null>
    // If a slot can hold arrays, flatten here.
    const vals = Object.values(roster).filter(Boolean) as TargetPoolType[]
    return new Set(vals.map(v => v.player_id))
  }, [roster])

  useEffect(() => {
    if (!userTargets) return

    setPlayerPool(prev => {
      // First load: take server as base minus rostered
      if (!hasInitialized.current) {
        hasInitialized.current = true
        return userTargets.filter(t => !rosteredIds.has(t.player_id))
      }

      // Later loads: append only net-new AND not rostered
      const have = new Set(prev.map(t => t.player_id))
      const additions = userTargets.filter(t => !have.has(t.player_id) && !rosteredIds.has(t.player_id))

      return additions.length ? [...prev, ...additions] : prev
    })
  }, [userTargets, rosteredIds])

  useEffect(() => {
    setPlayerPool(prev => prev.filter(p => !rosteredIds.has(p.player_id)))
  }, [rosteredIds])

  const restorePlayerToPool = (player: TargetPoolType) => {
    setPlayerPool(prev => {
      // if userTargets contains the player and they aren't rostered, re-add while preserving order
      const idSet = new Set(prev.map(p => p.player_id))
      if (rosteredIds.has(player.player_id) || idSet.has(player.player_id)) return prev

      const merged = [...prev, player]
      const order = new Map(userTargets.map((p, i) => [p.player_id, i]))
      merged.sort((a, b) => (order.get(a.player_id) ?? 1e9) - (order.get(b.player_id) ?? 1e9))
      return merged
    })
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

  const targetPoolProps = {
    showProjections,
    roster,
    setRoster,
    setPlayerPool,
    tabs,
    tabValue,
    setTabValue,
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
              sport={slate?.sport as Sport}
            />
          </div>
          <div className="w-1/2">
            <RosterBuilder
              {...targetPoolProps}
              userTargets={userTargets}
              restorePlayerToPool={restorePlayerToPool}
              sport={slate?.sport as Sport}
            />
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
          tabs={tabs}
        />
      </div>
    </div>
  )
}
