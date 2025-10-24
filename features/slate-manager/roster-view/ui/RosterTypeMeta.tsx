import type { LucideIcon } from 'lucide-react'
import { BadgeDollarSign, Ban, Boxes, BoxIcon, SquaresExclude, Trophy } from 'lucide-react'

export const ROSTER_TYPE_VALUES = ['cash', 'gpp', 'se', 'hybrid', '20-max', ''] as const

export type RosterType = (typeof ROSTER_TYPE_VALUES)[number]

export const ROSTER_TYPE_META: Record<RosterType, { label: string; Icon: LucideIcon }> = {
  cash: { label: 'Cash', Icon: BadgeDollarSign },
  gpp: { label: 'GPP', Icon: Trophy },
  se: { label: 'Single Entry', Icon: BoxIcon },
  hybrid: { label: 'Hybrid', Icon: SquaresExclude },
  '20-max': { label: '20-Max', Icon: Boxes },
  '': { label: 'No Type', Icon: Ban },
}
