import { useMemo } from 'react'

import { ROSTER_SLOTS } from '@/shared/constants/slots'

import { RosterSlot } from '../../_types/roster'

type Sport = 'NFL' | 'CFB'

interface Props {
  player: RosterSlot
  sport: Sport
}

export function RosterItem({ player, sport }: Props) {
  console.log(sport)
  const slots = useMemo(() => (sport ? ROSTER_SLOTS[sport] : []), [sport])
  const slot = slots.find(slot => slot.key === player.slot_key)

  return (
    <div className="flex items-center justify-center bg-background-secondary rounded text-sm border-b border-border mb-[1px] last:mb-0">
      <div className="w-28 font-black px-4 bg-card py-4 overflow-hidden text-[70px]">
        <span className="-ml-6 opacity-10 text-accent">{slot?.position}</span>
      </div>
      <div className="flex flex-col w-full pl-2">
        <span>{player.player_name}</span>
        <p className="text-xs text-muted">
          {player.position} — {player.team_name}
        </p>
      </div>
      <div className="w-14 text-center pr-8">
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-bold text-muted uppercase">Proj</span>
          <p className="font-bold text-xs">{player.projection ?? '—'}</p>
        </div>
      </div>
      <div className="flex flex-col items-center mr-4">
        <>
          <span className="text-[11px] font-bold text-muted uppercase">Salary</span>
          <p className="font-bold text-xs">${player.salary.toLocaleString('en-US')}</p>
        </>
      </div>
    </div>
  )
}
