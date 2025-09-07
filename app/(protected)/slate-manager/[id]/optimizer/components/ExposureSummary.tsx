import { Input } from '@/components/ui/input'

export default function ExposureSummary({ expSearch, setExpSearch, playerExposures, teamExposures, totalLineups }) {
  return (
    <div className="rounded border border-background-darker p-4 h-full bg-card">
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
          <table className="min-w-full text-sm bg-background-secondary">
            <thead className="bg-background">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Player</th>
                <th className="p-2 text-left">Pos</th>
                <th className="p-2 text-left">Team</th>
                <th className="p-2 text-right">Count</th>
                <th className="p-2 text-right">Exp %</th>
              </tr>
            </thead>
            <tbody>
              {playerExposures.map((pe, i) => (
                <tr key={pe.key}>
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2 font-medium">{pe.name}</td>
                  <td className="p-2">{pe.pos ?? '-'}</td>
                  <td className="p-2">{pe.team ?? '-'}</td>
                  <td className="p-2 text-right">{pe.count}</td>
                  <td className="p-2 text-right">{pe.exposurePct.toFixed(1)}%</td>
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
          <table className="min-w-full text-sm">
            <thead className="bg-background">
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
