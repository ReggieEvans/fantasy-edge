'use client'
import { CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

import { excludeTeam, includeTeam } from '../../../_state/optimizerPool.slice'
import { Matchup } from '../../../_types/matchup'
import { Slate } from '../../../_types/slate'
import { DialogType } from '../types'
import AdvancedOptionsDialog from './dialogs/AdvancedOptionsDialog'
import ContestDataDialog from './dialogs/ContestDataDialog'
import GameFiltersDialog from './dialogs/GameFiltersDialog'
import PlayerPoolDialog from './dialogs/PlayerPoolDialog'
import UploadProjectionsDialog from './dialogs/UploadProjectionsDialog'

export default function OptimizerOptions({
  slate,
  matchups,
}: {
  slate?: Slate
  matchups?: Matchup[]
  onExcludeTeam?: (teamId: string) => void
}) {
  const [openDialog, setOpenDialog] = useState<DialogType>(null)
  const dispatch = useAppDispatch()

  const excludedTeamIds = useAppSelector(s => s.optimizerPool.excludedTeamIds)
  const handleExcludeTeam = (teamId: string) => {
    if (excludedTeamIds.includes(teamId)) {
      dispatch(includeTeam(teamId))
    } else {
      dispatch(excludeTeam(teamId))
    }
  }

  return (
    <div className="text-sm rounded-t bg-background-secondary">
      <ul className="flex border-b-2 border-background">
        <li
          className="flex items-center justify-center gap-2 w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all"
          onClick={() => setOpenDialog('game-filters')}
        >
          <span>Game Filters</span>
          <Badge
            variant="outline"
            className={`text-xs ${excludedTeamIds.length ? 'bg-destructive' : 'bg-background-darker'}`}
          >
            {excludedTeamIds.length}
          </Badge>
        </li>
        <li
          className="flex items-center justify-center gap-2 w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all"
          onClick={() => setOpenDialog('advanced-options')}
        >
          <span>Advanced Options</span>
          <Badge variant="outline" className="bg-background-darker text-xs">
            0
          </Badge>
        </li>
        <li
          className="flex items-center justify-center gap-2 w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all"
          onClick={() => setOpenDialog('upload-projections')}
        >
          <span>Upload Projections</span>
          <Badge variant="outline" className="bg-background-darker text-xs">
            {slate?.has_projections ? (
              <CheckCircle size={13} className="text-green-500 mb-[1px]" />
            ) : (
              <XCircle size={13} className="text-destructive mb-[1px]" />
            )}
          </Badge>
        </li>
        <li
          className="w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all"
          onClick={() => setOpenDialog('contest-data')}
        >
          Contest Data
        </li>
        <li
          className="w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all"
          onClick={() => setOpenDialog('player-pool')}
        >
          Player Pool
        </li>
      </ul>

      <Dialog open={!!openDialog} onOpenChange={() => setOpenDialog(null)}>
        {openDialog === 'game-filters' && (
          <GameFiltersDialog
            matchups={matchups}
            excludedTeamIds={excludedTeamIds}
            handleExcludeTeam={handleExcludeTeam}
          />
        )}
        {openDialog === 'advanced-options' && (
          <AdvancedOptionsDialog matchups={matchups} excludedTeamIds={excludedTeamIds} />
        )}
        {openDialog === 'upload-projections' && <UploadProjectionsDialog />}
        {openDialog === 'contest-data' && <ContestDataDialog />}
        {openDialog === 'player-pool' && <PlayerPoolDialog />}
      </Dialog>
    </div>
  )
}
