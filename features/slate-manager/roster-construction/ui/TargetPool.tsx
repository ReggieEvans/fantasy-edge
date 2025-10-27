'use client'

import { Boxes, Component, Loader, Lock, PlusCircle, Unlock, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ROSTER_SLOTS } from '@/shared/constants/slots'

import type { TargetPool } from '../../_types/targetPool'
import TargetGroup from './TargetGroup'

type Sport = 'NFL' | 'CFB'

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
  sport: Sport
  tabs: { value: string; label: string }[]
  tabValue: string
  setTabValue: React.Dispatch<React.SetStateAction<string>>
  remainingSalary: number
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
  sport,
  tabs,
  tabValue,
  setTabValue,
  remainingSalary,
}: TargetPoolProps) {
  const rosterSlots = ROSTER_SLOTS[sport]

  const filteredTargets = playerPool.filter(t => {
    if (tabValue === 'ALL') return true
    return t.position === tabs.find(tab => String(tab.value) === tabValue)?.label
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
    remainingSalary,
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
            {!showProjections ? (
              <Lock className="w-4 h-4 mr-2" />
            ) : (
              <Unlock className="w-4 h-4 mr-2 text-accent" />
            )}
            {showProjections ? 'Hide Projections' : 'Show Projections'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleGroups}
            className="text-xs px-4 py-2 duration-300 transition-colors hover:text-foreground hover:bg-background-secondary"
          >
            {showGroups ? (
              <Boxes className="w-4 h-4 mr-2 text-accent" />
            ) : (
              <Component className="w-4 h-4 mr-2" />
            )}
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

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <p className="flex items-center text-sm text-muted h-8 p-2 bg-background-secondary rounded-md animate-pulse">
            <Loader className="w-4 h-4 mr-2 animate-spin" /> Loading player pool...
          </p>
          <div>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-12 bg-background-secondary rounded animate-pulse mb-2" />
            ))}
          </div>
        </div>
      ) : (
        <Tabs defaultValue={'ALL'} value={tabValue} onValueChange={setTabValue}>
          <TabsList className="gap-2 bg-background-secondary">
            {tabs.map(tab => (
              <TabsTrigger key={tab.value} value={String(tab.value)} className="text-xs font-bold">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map(tab => {
            const tabLabel = tab.label
            const tabValue = String(tab.value)
            const targetsForTab =
              tabValue === 'ALL'
                ? filteredTargets
                : filteredTargets.filter(p => p.position === tabLabel)

            return (
              <TabsContent
                key={tab.value}
                value={tabValue}
                className={`mt-4 ${showGroups ? 'space-y-6' : 'space-y-2'} max-h-[568px] min-h-[568px] h-[568px] overflow-y-auto`}
              >
                {isError ? (
                  <div className="text-sm text-destructive font-semibold p-4 rounded bg-muted">
                    Failed to load player pool. Please try again later.
                  </div>
                ) : targetsForTab.length === 0 ? (
                  <div className="text-muted-foreground text-center text-sm py-4">
                    No players available for this position.
                  </div>
                ) : (
                  <>
                    <TargetGroup
                      label="Top Plays"
                      icon="top"
                      type="top"
                      targets={targetsForTab}
                      {...groupProps}
                    />
                    <TargetGroup
                      label="Cash"
                      icon="dollar-sign"
                      type="cash"
                      targets={targetsForTab}
                      {...groupProps}
                    />
                    <TargetGroup
                      label="Lock"
                      icon="lock"
                      type="lock"
                      targets={targetsForTab}
                      {...groupProps}
                    />
                    <TargetGroup
                      label="GPP"
                      icon="trophy"
                      type="gpp"
                      targets={targetsForTab}
                      {...groupProps}
                    />
                    <TargetGroup
                      label="Fade"
                      icon="fade"
                      type="fade"
                      targets={targetsForTab}
                      {...groupProps}
                    />
                    <TargetGroup
                      label="Pivot"
                      icon="pivot"
                      type="pivot"
                      targets={targetsForTab}
                      {...groupProps}
                    />
                    <TargetGroup
                      label="Injury"
                      icon="ambulance"
                      type="injury"
                      targets={targetsForTab}
                      {...groupProps}
                    />
                    <TargetGroup
                      label="No Type"
                      icon="none"
                      type="none"
                      targets={targetsForTab}
                      {...groupProps}
                    />
                    <TargetGroup
                      label="Bargain"
                      icon="bargain"
                      type="bargain"
                      targets={targetsForTab}
                      {...groupProps}
                    />
                  </>
                )}
              </TabsContent>
            )
          })}

          <div className="flex justify-between gap-4 mt-6 items-center">
            <div className={`px-2 text-sm font-bold text-foreground`}>
              <div className="flex flex-col items-start gap-1">
                <div className="text-lg">Targets in Pool: {playerPool.length}</div>
              </div>
            </div>
          </div>
        </Tabs>
      )}
    </div>
  )
}
