'use client'

import { Banknote, Brain, Hammer, Home, LucideIcon, Pencil, Pickaxe } from 'lucide-react'
import Link from 'next/link'

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import FeatureHeader from '@/shared/ui/FeatureHeader'

import DashboardLinks from '../ui/DashboardLinks'
import PlayerNews from '../ui/PlayerNews'
import UpcomingSlates from '../ui/UpcomingSlates'
import YearToDateResults from '../ui/YearToDateResults'

const ICONS = {
  hammer: Hammer,
  pickaxe: Pickaxe,
  brain: Brain,
  pencil: Pencil,
  banknote: Banknote,
} satisfies Record<string, LucideIcon>

type NavLink =
  | { href: string; label: string; icon: keyof typeof ICONS; disabled?: boolean }
  | { href: string; label: string; icon: LucideIcon; disabled?: boolean }

const links: NavLink[] = [
  { href: '/slate-manager', label: 'Slate Manager', icon: 'hammer' },
  { href: '/study-hub', label: 'Study Hub', icon: 'brain' },
  { href: '/bankroll-tracker', label: 'Bankroll Tracker', icon: 'banknote' },
  { href: '/pickem', label: 'Pickem', icon: 'pickaxe' },
]

export default function DashboardPage() {
  return (
    <div className="px-6 bg-background pt-8 pb-16">
      <FeatureHeader icon={<Home size={20} />} title="Dashboard" description="" />
      <div className="grid grid-cols-4 grid-rows-4 gap-4">
        <div className="bg-background-secondary rounded border border-muted-bg">
          <h2 className="text-lg font-bold text-foreground px-4 py-3 bg-card border-b border-accent">
            Features
          </h2>
          <div className="p-4">
            <NavigationMenu>
              <NavigationMenuList className="flex flex-col items-start gap-4">
                {links.map(link => {
                  const IconComp: LucideIcon =
                    typeof link.icon === 'string'
                      ? ICONS[link.icon as keyof typeof ICONS]
                      : link.icon

                  return (
                    <NavigationMenuItem key={link.href}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={link.disabled ? '#' : link.href}
                          onClick={e => {
                            if (link.disabled) e.preventDefault()
                          }}
                          className="flex items-center gap-3 text-base hover:text-accent"
                        >
                          <IconComp className="text-accent" size={18} />
                          {link.label}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  )
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        <div className="row-span-3 col-start-1 row-start-2">
          <UpcomingSlates />
        </div>
        <div className="col-span-2 row-span-3 col-start-2 row-start-1">
          <YearToDateResults />
        </div>
        <div className="col-span-2 col-start-2 row-start-4">
          <DashboardLinks />
        </div>
        <div className="row-span-4 col-start-4 row-start-1">
          <PlayerNews />
        </div>
      </div>
    </div>
  )
}
