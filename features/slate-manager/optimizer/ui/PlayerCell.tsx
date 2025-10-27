import { CircleX, Lock, Square, Unlock } from 'lucide-react'
import { memo } from 'react'

import { getColorByValue, projValueConfig } from '@/shared/utils/colorCoding'
import { cn } from '@/utils/cn'

import { Player } from '../../_types/player'

interface PlayerCellProps {
  player: Player
  field: string
  onToggleExclude?: (id: string, excluded: boolean) => void
  onToggleLock?: (id: string, locked: boolean) => void
}

export const ExcludeCell = memo(
  ({ player, onToggleExclude }: Pick<PlayerCellProps, 'player' | 'onToggleExclude'>) => {
    const isExcluded = !!player.isExcluded

    return (
      <div className="flex justify-center w-8">
        <button
          type="button"
          onClick={() => onToggleExclude?.(player.id, isExcluded)}
          title={isExcluded ? 'Include player' : 'Exclude player'}
          className="hover:scale-150 transition-all duration-300"
        >
          {isExcluded ? (
            <Square className="w-4 h-4 text-muted" />
          ) : (
            <CircleX className="w-4 h-4 text-destructive" />
          )}
        </button>
      </div>
    )
  },
)

ExcludeCell.displayName = 'ExcludeCell'

export const LockCell = memo(
  ({ player, onToggleLock }: Pick<PlayerCellProps, 'player' | 'onToggleLock'>) => {
    const isLocked = !!player.isLocked

    return (
      <div className="flex justify-center w-8">
        <button
          type="button"
          onClick={() => onToggleLock?.(player.id, isLocked)}
          title={isLocked ? 'Unlock player' : 'Lock player'}
          className="hover:scale-150 transition-all duration-300"
        >
          {isLocked ? (
            <Lock className="w-4 h-4 text-accent" />
          ) : (
            <Unlock className="w-4 h-4 text-muted hover:text-accent transition-all duration-300" />
          )}
        </button>
      </div>
    )
  },
)

LockCell.displayName = 'LockCell'

export const PlayerNameCell = memo(({ player }: Pick<PlayerCellProps, 'player'>) => {
  const name = player.first_name + ' ' + player.last_name
  const status = player.status
  return (
    <div className="text-left">
      {name ?? '-'}{' '}
      {status ? (
        <span
          className={cn(
            status === 'None' ? '' : 'ml-2 text-xs bg-destructive rounded-sm px-2 py-0.5 font-bold',
          )}
        >
          {status === 'None' ? null : status}
        </span>
      ) : null}
    </div>
  )
})

PlayerNameCell.displayName = 'PlayerNameCell'

export const PositionCell = memo(({ player }: Pick<PlayerCellProps, 'player'>) => {
  return <div className="text-left">{player.position ?? '-'}</div>
})

PositionCell.displayName = 'PositionCell'

export const ROICell = memo(({ player }: Pick<PlayerCellProps, 'player'>) => {
  const salary = Number(player.salary)
  const projection = Number(player.projection)
  const projVal = (projection / salary) * 1000
  if (!salary || isNaN(salary) || isNaN(projection)) return <div>-</div>
  const val = ((projection / salary) * 1000).toFixed(2)
  return (
    <div
      className={`flex items-center justify-center rounded w-9 ${getColorByValue(projVal, projValueConfig)}`}
    >
      {val}
    </div>
  )
})

ROICell.displayName = 'ROICell'
