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
    icon: <Target size={16} />,
  },
  {
    href: '/player-pool',
    label: 'Player Pool',
    icon: <LayoutList size={16} />,
  },
  {
    href: '/roster-creation',
    label: 'Create Rosters',
    icon: <Users size={16} />,
  },
  {
    href: '/roster-view',
    label: 'View Rosters',
    icon: <Grid2X2 size={16} />,
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
      className={`flex items-center md:w-full gap-3 px-5 py-4 border-l-[4px] transition-all duration-300 ${
        isLinkActive(href)
          ? 'bg-[#0a0a13] text-foreground border-accent'
          : 'text-muted border-transparent hover:bg-aside-active hover:text-foreground hover:border-accent'
      }`}
    >
      {icon} <span className="hidden md:block">{label}</span>
    </Link>
  )

  return (
    <div>
      <div className="flex">
        <aside className="md:w-64 bg-background-darker border-r border-border min-h-[calc(100vh-70px)]">
          <nav className="flex flex-col items-center md:items-start">
            {NAVIGATION_LINKS.map(link => renderNavLink(link.href, link.label, link.icon))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
