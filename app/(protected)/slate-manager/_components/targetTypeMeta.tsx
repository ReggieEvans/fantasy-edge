import type { LucideIcon } from 'lucide-react'
import { Ambulance, BadgeDollarSign, Ban, Flame, Lock, Repeat2, Tag, Trophy } from 'lucide-react'

import type { TargetType } from '../_types/target'

export const TARGET_TYPE_META: Record<TargetType, { label: string; Icon: LucideIcon }> = {
  top: { label: 'Top Play', Icon: Flame },
  bargain: { label: 'Bargain Bin', Icon: Tag },
  fade: { label: 'Fade', Icon: Ban },
  pivot: { label: 'Pivot Play', Icon: Repeat2 },
  cash: { label: 'Cash', Icon: BadgeDollarSign },
  gpp: { label: 'GPP', Icon: Trophy },
  lock: { label: 'Lock', Icon: Lock },
  injury: { label: 'Injury', Icon: Ambulance },
}
