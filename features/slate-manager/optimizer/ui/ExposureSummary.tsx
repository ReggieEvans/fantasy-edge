import { Input } from '@/components/ui/input'

type PlayerExposure = {
  key: string
  name: string
  team?: string
  pos?: string
  count: number
  exposurePct: number
  avgSalary?: number
}

type TeamExposure = {
  team: string
  count: number
  exposurePct: number
}

type ExposureSummaryProps = {
  expSearch: string
  setExpSearch: (expSearch: string) => void
  playerExposures: PlayerExposure[]
  teamExposures: TeamExposure[]
  // totalLineups: number
}

export default function ExposureSummary({
  expSearch,
  setExpSearch,
  playerExposures,
  teamExposures,
  // totalLineups,
}: ExposureSummaryProps) {
  return (
    <div className="rounded border border-background-darker px-2 py-4 h-full bg-card">
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Player Exposures</h2>
          <div className="flex items-center gap-2">
            <Input
              id="expSearch"
              type="text"
              className="border rounded p-2 text-sm"
              placeholder="Search..."
              value={expSearch}
              onChange={e => setExpSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-auto rounded-md bg-card">
          <table className="min-w-full text-xs bg-background-secondary">
            <thead className="bg-background-darker border-b border-accent">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Player</th>
                <th className="p-2 text-left">Pos</th>
                <th className="p-2 text-left">Team</th>
                <th className="p-2 text-right">Exp %</th>
              </tr>
            </thead>
            <tbody>
              {playerExposures.map((pe, i) => (
                <tr key={pe.key} className="border-b-2 border-background even:bg-background">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2 font-medium max-w-32 w-32 overflow-hidden">
                    <p className="truncate block">{pe.name}</p>
                  </td>
                  <td className="p-2">{pe.pos ?? '-'}</td>
                  <td className="p-2">{pe.team ?? '-'}</td>
                  <td className="p-2 text-right">
                    {pe.exposurePct.toFixed(1)}% ({pe.count})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 mt-8">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold">Team Exposures</h2>
        </div>
        <div className="overflow-auto rounded bg-background-secondary">
          <table className="min-w-full text-xs">
            <thead className="bg-background-darker border-b border-accent">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Team</th>
                <th className="p-2 text-right">Count</th>
                <th className="p-2 text-right">Exposure %</th>
              </tr>
            </thead>
            <tbody>
              {teamExposures.map((te, i) => (
                <tr key={te.team}>
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2 font-medium">{te.team}</td>
                  <td className="p-2 text-right">{te.count}</td>
                  <td className="p-2 text-right">{te.exposurePct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
