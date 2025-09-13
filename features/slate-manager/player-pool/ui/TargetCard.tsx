import { Edit, Layers } from 'lucide-react'
import Image from 'next/image'

import { TargetPool } from '../../_types/targetPool'

interface Props {
  target: TargetPool
  handleTargetingPlayer: (target: TargetPool) => void
}

export function TargetCard({ target, handleTargetingPlayer }: Props) {
  return (
    <div className="flex bg-card rounded-lg overflow-hidden">
      <div className="relative p-4">
        <Image
          src={target.player_image || '/player.png'}
          width={100}
          height={100}
          alt="Player"
          className="relative z-20 rounded"
        />
        <div className="absolute top-1 left-2 text-3xl font-black text-foreground opacity-10 z-10">
          {target.position}
        </div>
        <div className="absolute top-2 right-4 text-blue-400 text-xs z-10 brightness-125">
          {target.stack_candidate && <Layers className="w-4 h-4" />}
        </div>
      </div>

      <div className="w-[550px] pr-2 flex flex-col">
        <div className="flex justify-between items-end border-b border-background pt-4">
          <div className="text-2xl font-black uppercase text-foreground">
            {target.first_name} {target.last_name}{' '}
            <small className="text-muted">({target.team_abbreviation})</small>
          </div>
          <div className="flex">
            <button
              onClick={() => handleTargetingPlayer(target)}
              className="p-1 mr-2 mb-2 text-destructive border border-destructive rounded-md px-2 hover:text-accent/80"
            >
              <Edit className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex space-x-8 items-center pt-3">
          <div className="mr-5">
            <div className="text-[11px] uppercase text-muted">Salary</div>
            <div className="text-lg font-bold text-foreground">
              ${target.salary.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="mr-5">
            <div className="text-[11px] uppercase text-muted">Proj</div>
            <div className="text-lg font-bold text-white">{target.projection || 0}</div>
          </div>
          <div className="mr-5">
            <div className="text-[11px] uppercase text-muted">Own %</div>
            <div className="text-lg font-bold text-white">{target.ownership || 0}</div>
          </div>
        </div>
      </div>

      <div className="relative p-2 border-l-4 border-background flex flex-col justify-start">
        <div className="text-sm font-bold text-foreground opacity-50 uppercase">Notes</div>
        <div className="text-foreground">{target.target_notes}</div>
      </div>
    </div>
  )
}
