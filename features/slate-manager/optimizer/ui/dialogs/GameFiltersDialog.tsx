import Image from 'next/image'

import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Matchup } from '@/features/slate-manager/matchups/types/matchup'

const getTeamLogo = (url?: string) => (url ? url.split('&')[0] : '/no_image.png')

export default function GameFiltersDialog({
  matchups,
  excludedTeamIds,
  handleExcludeTeam,
}: {
  matchups?: Matchup[]
  excludedTeamIds: string[]
  handleExcludeTeam: (teamId: string) => void
}) {
  if (!matchups) return null
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Game Filters</DialogTitle>
      </DialogHeader>

      <div className="flex flex-wrap gap-2">
        {matchups.map(m => (
          <div key={m.id} className="flex items-center uppercase text-xs my-1">
            <button
              className={`flex flex-col w-52 bg-card rounded-l-md border border-background-darker hover:cursor-pointer hover:brightness-75 transition-all ${excludedTeamIds.includes(m.away_team_id ?? '') ? 'opacity-20' : ''}`}
              onClick={() => handleExcludeTeam(m.away_team_id ?? '')}
            >
              <div className="flex items-center gap-2 p-2">
                <Image
                  src={getTeamLogo(m.away_team_logo)}
                  alt={m.away_team_name}
                  width={30}
                  height={30}
                />
                <div className="flex flex-col">
                  <span className="font-black">{m.away_team_city}</span>
                  <span>{m.away_team_name}</span>
                </div>
              </div>
              <div className="flex justify-between items-center w-full px-2 py-1 border-t border-background-darker bg-background-secondary">
                <span>{m.away_team_total}</span>
              </div>
            </button>
            <button
              className={`flex flex-col items-end w-52 bg-card rounded-r-md border border-background-darker hover:cursor-pointer hover:brightness-75 transition-all ${excludedTeamIds.includes(m.home_team_id ?? '') ? 'opacity-20' : ''}`}
              onClick={() => handleExcludeTeam(m.home_team_id ?? '')}
            >
              <div className="flex items-center gap-2 p-2">
                <div className="flex flex-col items-end">
                  <span className="font-black">{m.home_team_city}</span>
                  <span>{m.home_team_name}</span>
                </div>
                <Image
                  src={getTeamLogo(m.home_team_logo)}
                  alt={m.home_team_name}
                  width={30}
                  height={30}
                />
              </div>
              <div className="flex justify-end items-center w-full px-2 py-1 border-t border-background-darker bg-background-secondary">
                <span>{m.home_team_total}</span>
              </div>
            </button>
          </div>
        ))}
      </div>
    </DialogContent>
  )
}
