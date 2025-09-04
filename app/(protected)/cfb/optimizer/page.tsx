import { Cog } from 'lucide-react'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'

import FantasyEdgeOptimizer from './components/FantasyEdgeOptimizer'
import PlayerPool from './components/PlayerPool'

export default function OptimizerPage() {
  return (
    <div className="space-y-6 bg-background">
      <div className="flex items-center justify-between mb-4 px-8 py-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span>
              <Cog size={20} />
            </span>
            <h1 className="text-xl font-bold uppercase">FantasyEdge Optimizer</h1>
          </div>
          <p className="text-muted text-sm">
            FantasyEdge Optimizer is a tool that helps you optimize lineups for draftkings. From here you can optimize
            your lineups, view your player pool, and view your targets.
          </p>
        </div>
      </div>

      <div>
        <div className="text-sm mx-8 rounded-t bg-background-secondary">
          <ul className="flex border-b-2 border-background">
            <li className="w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all duration-300">
              Game Filters
            </li>
            <li className="w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all duration-300">
              Advanced Options
            </li>
            <li className="w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all duration-300">
              Upload Projections
            </li>
            <li className="w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all duration-300">
              Contest Data
            </li>
            <li className="w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all duration-300">
              Player Pool
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <PlayerPool />
          <FantasyEdgeOptimizer />
        </div>
      </div>
    </div>
  )
}
