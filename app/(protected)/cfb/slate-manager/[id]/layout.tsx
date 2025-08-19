'use client'

import { Grid2X2, LayoutList, Target, Users } from 'lucide-react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface NavLink {
  href: string
  label: string
  icon: ReactNode
}

const NAVIGATION_LINKS: NavLink[] = [
  {
    href: '',
    label: 'Matchups',
    icon: <Target size={22} />,
  },
  {
    href: '/player-pool',
    label: 'Pool',
    icon: <LayoutList size={22} />,
  },
  {
    href: '/roster-creation',
    label: 'Create',
    icon: <Users size={22} />,
  },
  {
    href: '/roster-view',
    label: 'View',
    icon: <Grid2X2 size={22} />,
  },
]

export default function SlateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { id } = useParams()

  const isLinkActive = (linkHref: string) => {
    const basePath = `/cfb/slate-manager/${id}`
    if (linkHref === '') {
      return (
        pathname === basePath ||
        (pathname.startsWith(basePath) &&
          !NAVIGATION_LINKS.some(link => link.href !== '' && pathname.includes(link.href)))
      )
    }
    return pathname === `${basePath}${linkHref}`
  }

  const renderNavLink = (href: string, label: string, icon: ReactNode) => (
    <Link
      key={label}
      href={`/cfb/slate-manager/${id}/${href}`}
      className={`flex justify-center items-center gap-3 w-full px-8 py-4 border-l-[4px] transition-all duration-300 ${
        isLinkActive(href)
          ? 'text-foreground border-accent'
          : 'text-muted border-transparent hover:bg-background hover:text-foreground hover:border-accent'
      }`}
    >
      <div className={`flex flex-col items-center space-y-2 ${
        isLinkActive(href)
          ? 'text-accent'
          : 'text-muted'
      }`}>{icon} <span className="text-xs text-foreground">{label}</span></div>
    </Link>
  )

  return (
    <div>
      <div className="flex">
        <aside className="bg-background-darker border-r border-border min-h-[calc(100vh-100px)] pt-3">
          <nav className="flex flex-col items-center">
            {NAVIGATION_LINKS.map(link => renderNavLink(link.href, link.label, link.icon))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
