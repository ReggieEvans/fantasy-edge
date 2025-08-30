import { ROSTER_SLOTS } from '@/constants/slots'

import { RosterSlot } from '../../../_types/roster'

interface Props {
  player: RosterSlot
}

export function RosterItem({ player }: Props) {
  const slot = ROSTER_SLOTS['CFB'].find(slot => slot.key === player.slot_key)
  return (
    <div className="flex items-center justify-center bg-background-secondary px-3 py-2 rounded text-sm border-b border-border">
      <div className="w-28 font-bold text-center px-4">{slot?.position}</div>
      <div className="flex flex-col w-full">
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
