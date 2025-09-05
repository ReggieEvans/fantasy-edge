import { Cog } from 'lucide-react'

import ExposureSummary from './components/ExposureSummary'
import GenerateLineups from './components/GenerateLineups'
import LineupResults from './components/LineupResults'
import FantasyEdgeOptimizer from './components/OLD_FantasyEdgeOptimizer'
import PlayerPool from './components/OLD_PlayerPool'
import OptimizerFilters from './components/OptimizerFilters'
import OptimizerOptions from './components/OptimizerOptions'
import PlayerTable from './components/PlayerTable'

export default function OptimizerPage() {
  return (
    <div className="flex flex-col bg-background pt-3 rounded-tl-[40px] min-h-[calc(100vh-90px)] overflow-y-auto">
      <div className="flex flex-col py-4 px-6 text-muted">
        <div className="flex flex-col justify-between mb-2 text-foreground">
          <div className="flex items-center gap-2 mb-2">
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

      <section className="flex flex-col px-6">
        <OptimizerOptions />
        <OptimizerFilters />
        <PlayerTable />
        <GenerateLineups />

        <div className="flex gap-6">
          <ExposureSummary />
          <LineupResults />
        </div>
      </section>
    </div>
  )
}
