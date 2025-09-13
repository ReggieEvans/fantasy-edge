'use client'

import { Bolt } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import FeatureHeader from '@/shared/ui/FeatureHeader'
import { NoData } from '@/shared/ui/NoData'
import { GameType } from '@/types/gameType'
import { Sport } from '@/types/sport'
import { getErrorMessage } from '@/utils/getErrorMessage'

import { useGetSlatesQuery } from '../_api/slates.api'
import { useSlateManagerModals } from '../_hooks/useSlateManagerModals'
import { Slate as SlateType } from '../_types/slate'
import AddProjectionsModal from '../_ui/AddProjectionsModal'
import AddSlateModal from '../_ui/AddSlateModal'
import DeleteSlateModal from '../_ui/DeleteSlateModal'
import FilterBar from '../_ui/FilterBar'
import SlatesList from '../_ui/SlatesList'

export default function SlateListPage() {
  const { data: slates, isLoading, isError, error } = useGetSlatesQuery()
  const [sport, setSport] = useState<Sport>('NFL')
  const [gameType, setGameType] = useState<GameType>('classic')
  const { modal, openAdd, openDelete, openProjections, close } = useSlateManagerModals()

  const filteredSlates = useMemo(() => {
    if (!slates) return []
    return slates.filter((s: SlateType) => s.sport === sport && s.game_type === gameType)
  }, [slates, sport, gameType])

  const onDeleteSlate = useCallback(
    (slate: SlateType) => {
      openDelete(slate)
    },
    [openDelete],
  )

  const onAddProjections = useCallback(
    (slate: SlateType) => {
      openProjections(slate)
    },
    [openProjections],
  )

  if (isError) {
    return (
      <ErrorMessage errorMessage={getErrorMessage(error)} errorTitle={'Failed to load slates'} />
    )
  }

  return (
    <div className="min-h-[calc(100vh-90px)] overflow-y-auto bg-background px-6 pt-8">
      <FeatureHeader
        icon={<Bolt size={20} />}
        title="Slate Manager"
        description="Scout matchups and target players, refine your player pool, build optimized rosters, and export your final lineups — all in one streamlined workflow."
      />

      <FilterBar
        sport={sport}
        setSport={setSport}
        gameType={gameType}
        setGameType={setGameType}
        onAddClick={() => openAdd()}
      />

      <SlatesList
        slates={filteredSlates}
        isLoading={isLoading}
        onDelete={onDeleteSlate}
        onAddProjections={onAddProjections}
      />

      {filteredSlates.length === 0 && (
        <NoData
          title="No slates found."
          description="You currently have no slates. Click “Add Slate” above to create one."
        />
      )}

      {/* Modals */}
      {modal.type === 'add' && (
        <AddSlateModal
          sport={sport}
          setSport={setSport}
          gameType={gameType}
          setGameType={setGameType}
          open
          onClose={close}
        />
      )}

      {modal.type === 'projections' && modal.slate && (
        <AddProjectionsModal open slate={modal.slate} onClose={close} />
      )}

      {modal.type === 'delete' && modal.slate && (
        <DeleteSlateModal open slate={modal.slate} onClose={close} />
      )}
    </div>
  )
}
