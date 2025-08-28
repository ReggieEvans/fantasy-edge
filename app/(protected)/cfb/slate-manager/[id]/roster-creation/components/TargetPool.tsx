'use client'

import { Boxes, Component, Loader, Lock, PlusCircle, Unlock, Users } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ROSTER_SLOTS } from '@/constants/slots'

import type { TargetPool } from '../../../_types/targetPool'
import TargetGroup from './TargetGroup'

interface TargetPoolProps {
  showProjections: boolean
  toggleProjections: () => void
  openQuickTargetModal: () => void
  showGroups: boolean
  toggleGroups: () => void
  roster: Record<string, TargetPool | null>
  setRoster: React.Dispatch<React.SetStateAction<Record<string, TargetPool | null>>>
  playerPool: TargetPool[]
  setPlayerPool: React.Dispatch<React.SetStateAction<TargetPool[]>>
  isLoading: boolean
  isError: boolean
}

export default function TargetPool({
  showProjections,
  toggleProjections,
  openQuickTargetModal,
  showGroups,
  toggleGroups,
  roster,
  setRoster,
  playerPool,
  setPlayerPool,
  isLoading,
  isError,
}: TargetPoolProps) {
  const [selectedTab, setSelectedTab] = useState('0')
  const rosterSlots = ROSTER_SLOTS['CFB']

  const tabs = [
    { id: 0, label: 'ALL' },
    { id: 1, label: 'QB' },
    { id: 2, label: 'RB' },
    { id: 3, label: 'WR' },
  ]

  const filteredTargets = playerPool.filter(t => {
    if (selectedTab === '0') return true
    return t.position === tabs.find(tab => String(tab.id) === selectedTab)?.label
  })

  const addPlayerToRoster = (target: TargetPool) => {
    const alreadyAdded = Object.values(roster).some(p => p?.player_id === target.player_id)
    if (alreadyAdded) return

    for (const slot of rosterSlots) {
      const isEmpty = !roster[slot.key]
      const acceptsPosition = slot.eligiblePositions.includes(target.position)

      if (isEmpty && acceptsPosition) {
        setRoster(prev => ({ ...prev, [slot.key]: target }))
        setPlayerPool(prev => prev.filter((p: TargetPool) => p.player_id !== target.player_id))
        return
      }
    }
  }

  const groupProps = {
    showProjections,
    showGroups,
    addPlayerToRoster,
  }

  return (
    <div className="py-4">
      <h4 className="uppercase font-bold mb-2 flex items-center text-sm">
        <Users className="w-4 h-4 mr-2" /> Player Pool
      </h4>
      <Separator className="bg-accent mb-4" />
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleProjections}
            className="text-xs px-4 py-2 duration-300 transition-colors hover:text-foreground hover:bg-background-secondary"
          >
            {!showProjections ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2 text-accent" />}
            {showProjections ? 'Hide Projections' : 'Show Projections'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleGroups}
            className="text-xs px-4 py-2 duration-300 transition-colors hover:text-foreground hover:bg-background-secondary"
          >
            {showGroups ? <Boxes className="w-4 h-4 mr-2 text-accent" /> : <Component className="w-4 h-4 mr-2" />}
            {showGroups ? 'Ungroup Targets' : 'Group Targets'}
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={openQuickTargetModal}
          className="text-xs px-4 py-2 duration-300 transition-colors hover:text-foreground hover:bg-background-secondary"
        >
          <PlusCircle className="w-4 h-4 mr-2 text-accent" /> Quick Target
        </Button>
      </div>

      <Tabs defaultValue={'0'} value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="gap-2 bg-background-secondary">
          {tabs.map(tab => (
            <TabsTrigger key={tab.id} value={String(tab.id)} className="text-xs font-bold">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(tab => {
          const tabLabel = tab.label
          const tabValue = String(tab.id)
          const targetsForTab =
            tabValue === '0' ? filteredTargets : filteredTargets.filter(p => p.position === tabLabel)

          return (
            <TabsContent
              key={tab.id}
              value={tabValue}
              className={`mt-4 ${showGroups ? 'space-y-6' : 'space-y-2'} max-h-[500px] overflow-y-auto`}
            >
              {isLoading ? (
                <div className="flex flex-col gap-2">
                  <p className="flex items-center text-sm text-muted">
                    <Loader className="w-4 h-4 mr-2 animate-spin" /> Loading player pool...
                  </p>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-12 bg-background-secondary rounded animate-pulse" />
                  ))}
                </div>
              ) : isError ? (
                <div className="text-sm text-destructive font-semibold p-4 rounded bg-muted">
                  Failed to load player pool. Please try again later.
                </div>
              ) : targetsForTab.length === 0 ? (
                <div className="text-muted-foreground text-center text-sm py-4">
                  No players available for this position.
                </div>
              ) : (
                <>
                  <TargetGroup label="Top Plays" icon="top" type="top" targets={targetsForTab} {...groupProps} />
                  <TargetGroup label="Cash" icon="dollar-sign" type="cash" targets={targetsForTab} {...groupProps} />
                  <TargetGroup label="Lock" icon="lock" type="lock" targets={targetsForTab} {...groupProps} />
                  <TargetGroup label="GPP" icon="trophy" type="gpp" targets={targetsForTab} {...groupProps} />
                  <TargetGroup label="Fade" icon="fade" type="fade" targets={targetsForTab} {...groupProps} />
                  <TargetGroup label="Pivot" icon="pivot" type="pivot" targets={targetsForTab} {...groupProps} />
                  <TargetGroup label="Injury" icon="ambulance" type="injury" targets={targetsForTab} {...groupProps} />
                  <TargetGroup label="No Type" icon="none" type="none" targets={targetsForTab} {...groupProps} />
                  <TargetGroup label="Bargain" icon="bargain" type="bargain" targets={targetsForTab} {...groupProps} />
                </>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
