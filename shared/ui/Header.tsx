'use client'

import { Banknote, Brain, Hammer, Home, LucideIcon, Pencil, Pickaxe } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { createClient } from '@/libs/supabase/client'
import { RootState } from '@/store'
import { clearAuth } from '@/store/slices/authSlice'
import { cn } from '@/utils/cn'

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '../../components/ui/navigation-menu'
import { Logout } from './Logout'

const ICONS = {
  home: Home,
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
  { href: '/', label: 'Dashboard', icon: 'home' },
  { href: '/slate-manager', label: 'Slate Manager', icon: 'hammer' },
  { href: '/study-hub', label: 'Study Hub', icon: 'brain' },
  { href: '/bankroll-tracker', label: 'Bankroll Tracker', icon: 'banknote' },
  { href: '/pickem', label: 'Pickem', icon: 'pickaxe' },
]

export default function Header() {
  const pathname = usePathname()
  const displayName = useSelector((state: RootState) => state.auth.user_name)
  const supabase = createClient()
  const dispatch = useDispatch()
  const router = useRouter()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    dispatch(clearAuth())
    router.push('/login')
  }

  const isLinkActive = (href: string) => {
    // Home should only be active on exact "/"
    if (href === '/') return pathname === '/'

    // normalize trailing slashes for non-root paths
    const cur = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname
    const base = href.endsWith('/') && href !== '/' ? href.slice(0, -1) : href

    return cur === base || cur.startsWith(`${base}/`)
  }

  return (
    <header className="flex items-center justify-center md:justify-between w-full px-12 py-3">
      <div className="flex items-center gap-4">
        {/* Brand */}
        <Link href="/">
          <Image
            src="/fantasyedge-logo-300-91.png"
            alt="MyDynastyHub Logo"
            width={200}
            height={61}
            priority
          />
        </Link>
        <div className="ml-8">
          <NavMenu links={links} isLinkActive={isLinkActive} />
        </div>
      </div>

      {/* Desktop Nav */}
      <div className="hidden sm:flex items-center space-x-6">
        {hasMounted && displayName && <Logout displayName={displayName} logout={handleLogout} />}
      </div>
    </header>
  )
}

function NavMenu({
  links,
  isLinkActive,
}: {
  links: NavLink[]
  isLinkActive: (href: string) => boolean
}) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {links.map(link => {
          const IconComp: LucideIcon =
            typeof link.icon === 'string' ? ICONS[link.icon as keyof typeof ICONS] : link.icon

          return (
            <NavigationMenuItem key={link.href}>
              <NavigationMenuLink asChild>
                <Link
                  href={link.disabled ? '#' : link.href}
                  onClick={e => {
                    if (link.disabled) e.preventDefault()
                  }}
                  aria-disabled={link.disabled || undefined}
                  tabIndex={link.disabled ? -1 : undefined}
                  className={cn(
                    'text-xs text-muted uppercase font-bold px-4 py-2 inline-flex items-center gap-2 transition-colors',
                    link.disabled
                      ? 'pointer-events-none text-muted opacity-50'
                      : isLinkActive(link.href)
                        ? 'text-accent'
                        : 'text-muted hover:text-foreground',
                  )}
                  aria-current={isLinkActive(link.href) ? 'page' : undefined}
                >
                  <IconComp className="w-4 h-4" />
                  {link.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
