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

      <div className="flex items-center gap-4 text-xs">
        {showProjections ? (
          <>
            <span className="text-right pr-4">{target.projection ?? '-'}</span>
          </>
        ) : (
          <>
            <span className="text-right text-muted pr-4">
              <Lock className="w-3 h-3 mx-auto text-muted" />
            </span>
          </>
        )}
        <span className="text-right font-bold">${target.salary?.toLocaleString('en-US')}</span>

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
