'use client'

import {
  Binoculars,
  ClipboardCheck,
  Cog,
  Hammer,
  type LucideIcon,
  MousePointerClick,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useMemo } from 'react'

import { useSlateId } from '../_hooks/useSlateId'

// tiny classnames helper (or import your existing `cn`)
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

type NavLink = {
  segment: string // '' means base route
  label: string
  Icon: LucideIcon
}

const NAVIGATION_LINKS: NavLink[] = [
  { segment: '', label: 'Scout', Icon: Binoculars },
  { segment: 'player-pool', label: 'Pool', Icon: Users },
  { segment: 'roster-construction', label: 'Build', Icon: Hammer },
  { segment: 'roster-view', label: 'Export', Icon: ClipboardCheck },
  { segment: 'optimizer', label: 'Optimize', Icon: Cog }, // fixed typo
  { segment: 'contest-selection', label: 'Contests', Icon: MousePointerClick },
]

const startsWithPath = (path: string, href: string) => path === href || path.startsWith(`${href}/`)

export default function SlateManagerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const id = useSlateId()

  const basePath = useMemo(() => `/slate-manager/${id}`, [id])

  const inNamedSection = useMemo(
    () =>
      NAVIGATION_LINKS.filter(l => !!l.segment).some(l =>
        startsWithPath(pathname, `${basePath}/${l.segment}`),
      ),
    [pathname, basePath],
  )

  return (
    <div className="flex">
      <aside className="bg-background-darker border-r border-border min-h-[calc(100vh-100px)] pt-3">
        <nav className="flex flex-col items-center">
          {NAVIGATION_LINKS.map(({ segment, label, Icon }) => {
            const href = segment ? `${basePath}/${segment}` : basePath

            const isActive = segment
              ? startsWithPath(pathname, href)
              : startsWithPath(pathname, basePath) && !inNamedSection

            return (
              <Link
                key={segment || 'root'}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex justify-center items-center gap-3 w-full px-6 py-4 border-l-[4px] transition-all duration-300',
                  isActive
                    ? 'text-foreground border-accent bg-gradient-to-r from-background to-background-darker'
                    : 'text-muted border-transparent hover:bg-background/50 hover:text-foreground hover:border-accent',
                )}
              >
                <div
                  className={cn(
                    'flex flex-col items-center space-y-2',
                    isActive ? 'text-accent' : 'text-muted',
                  )}
                >
                  <Icon size={22} aria-hidden />
                  <span className="text-xs text-foreground">{label}</span>
                </div>
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
