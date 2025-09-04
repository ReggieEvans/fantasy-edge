import PlayerPoolFilters from './PlayerPoolFilters'
import PlayerPoolTable from './playerPoolTable/PlayerPool'

export default function PlayerPool() {
  return (
    <div className="mx-8 p-4 bg-background-secondary">
      <PlayerPoolFilters />
      <PlayerPoolTable />
    </div>
  )
}
