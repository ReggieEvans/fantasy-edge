'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { createClient } from '@/libs/supabase/client'
import { RootState } from '@/store'
import { clearAuth } from '@/store/slices/authSlice'

import { Logout } from './Logout'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './ui/navigation-menu'

const cfbLinks: { title: string; href: string; description: string }[] = [
  {
    title: 'Slate Manager',
    href: '/cfb/slate-manager',
    description: 'Manage DFS Slates with matchups, player pools and roster creation.',
  },
  {
    title: 'Study Hub',
    href: '/cfb/study-hub',
    description: 'Study past contests by analyzing roster contruction across all lineups.',
  },
  {
    title: 'Stats',
    href: '/cfb/stats',
    description: 'College football stats across a multitude of categories.',
  },
  {
    title: 'Props',
    href: '/cfb/props',
    description: 'Analyze player props against odds and projections to build the best prop tickets.',
  },
  {
    title: 'Contest Selection',
    href: '/cfb/contests',
    description: 'A collection of the best DFS contests to enter on a weekly basis.',
  },
  {
    title: 'Teams',
    href: '/cfb/teams',
    description: 'Rosters for every FBS team in college football.',
  },
]

export default function Header() {
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

  return (
    <header className="flex items-center justify-center md:justify-between w-full px-12 py-1 bg-background-darker">
      <div className="flex items-center gap-4">
        {/* Brand */}
        <Link href="/">
          <Image src="/fantasyedge-logo-300-91.png" alt="MyDynastyHub Logo" width={200} height={61} priority />
        </Link>
        <div className="ml-8">
          <NavMenu />
        </div>
      </div>

      {/* Desktop Nav */}
      <div className="hidden sm:flex items-center space-x-6">
        {hasMounted && displayName && <Logout displayName={displayName} logout={handleLogout} />}
      </div>
    </header>
  )
}

function NavMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className="text-xs uppercase font-bold px-4">
            <Link href="/">Home</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent text-xs uppercase font-bold">CFB</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px] p-2 bg-card">
              {cfbLinks.map(link => (
                <ListItem key={link.title} title={link.title} href={link.href}>
                  {link.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger disabled className="bg-transparent text-xs uppercase font-bold">
            NFL
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {cfbLinks.map(link => (
                <ListItem key={link.title} title={link.title} href={link.href}>
                  {link.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
        <NavigationMenuTrigger disabled className="bg-transparent text-xs uppercase font-bold">
            BANKROLL TRACKER
          </NavigationMenuTrigger>
        </NavigationMenuItem>
        <NavigationMenuItem>
        <NavigationMenuTrigger disabled className="bg-transparent text-xs uppercase font-bold">
            PICKEM
          </NavigationMenuTrigger>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function ListItem({ title, children, href, ...props }: React.ComponentPropsWithoutRef<'li'> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="p-4 border border-transparent hover:bg-background-secondary hover:border-background-darker rounded transition-all duration-300">
            <div className="text-sm leading-none font-bold mb-1">{title}</div>
            <p className="text-foreground opacity-60 line-clamp-2 text-sm leading-snug">{children}</p>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
