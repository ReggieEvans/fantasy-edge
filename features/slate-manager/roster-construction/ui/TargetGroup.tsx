import {
  Ambulance,
  BadgeDollarSign,
  Ban,
  CircleSlash2,
  DollarSign,
  Flame,
  Lock,
  LucideIcon,
  Repeat2,
  Tag,
  Trophy,
  Zap,
} from 'lucide-react'

import { TargetPool } from '../../_types/targetPool'
import CustomTabPanel from './CustomTabPanel'

const ICONS: Record<string, LucideIcon> = {
  top: Flame,
  bargain: Tag,
  fade: Ban,
  pivot: Repeat2,
  cash: BadgeDollarSign,
  gpp: Trophy,
  zap: Zap,
  trophy: Trophy,
  lock: Lock,
  ban: Ban,
  ambulance: Ambulance,
  'dollar-sign': DollarSign,
  none: CircleSlash2,
}

interface TargetGroupProps {
  label: string
  icon: string
  type: string
  targets: TargetPool[]
  showProjections: boolean
  showGroups: boolean
  addPlayerToRoster: (player: TargetPool) => void
}

export default function TargetGroup({
  label,
  icon,
  type,
  targets,
  showProjections,
  showGroups,
  addPlayerToRoster,
}: TargetGroupProps) {
  const Icon = ICONS[icon]
  const filteredTargets =
    type === 'none'
      ? targets.filter(t => !t.target_type) // catches null, undefined, ''
      : targets.filter(t => t.target_type === type)

  if (!filteredTargets.length) return null

  return (
    <div>
      {showGroups && (
        <div className="flex items-center text-xs uppercase text-muted bg-card font-bold p-2 mb-2 rounded border-b-4 border-background-darker">
          <Icon className="w-4 h-4 mr-2" />
          <span>{label}</span>
        </div>
      )}
      <div className="space-y-2">
        {filteredTargets.map(target => (
          <CustomTabPanel
            key={target.id}
            target={target}
            showProjections={showProjections}
            addPlayerToRoster={addPlayerToRoster}
          />
        ))}
      </div>
    </div>
  )
}
