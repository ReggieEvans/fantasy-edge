import { Lock, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { TargetPool } from '../../../_types/targetPool'

interface CustomTabPanelProps {
  target: TargetPool
  showProjections: boolean
  addPlayerToRoster: (target: TargetPool) => void
}

export default function CustomTabPanel({ target, showProjections, addPlayerToRoster }: CustomTabPanelProps) {
  return (
    <div className="flex justify-between items-center bg-background-secondary px-3 py-2 rounded-md text-sm text-foreground">
      <div className="flex flex-col">
        <div className="font-medium">
          {target.first_name} {target.last_name}
        </div>
        <div className="text-xs text-muted">
          {target.position} — {target.team_name}
        </div>
      </div>

      <div className="flex items-center gap-8 text-xs">
        <div className="flex gap-6 items-center">
          {showProjections ? (
            <>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-muted uppercase">Proj</span>
                <p className="text-right font-bold">{target.projection ?? '—'}</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-muted uppercase">Proj</span>
                <Lock className="w-4 h-4 mx-auto text-muted" />
              </div>
            </>
          )}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted uppercase">Salary</span>
            <p className="text-right font-bold">{target.salary ? `$${target.salary.toLocaleString('en-US')}` : '—'}</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="px-2 border-card text-accent"
          onClick={() => addPlayerToRoster(target)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
