import Image from 'next/image'

export default function LineupResults({ lineups, error }: { lineups: any[] | null; error: string | null }) {
  if (!lineups) return null
  return (
    <div className="rounded border border-background-darker p-4 h-full bg-card">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Lineup Results</h2>
        </div>
        <div className="flex flex-wrap gap-4">
          {lineups?.map((lineup, idx) => (
            <div key={idx} className="flex flex-col gap-4 items-center border rounded-lg bg-background-secondary">
              <div>
                <div className="text-sm p-2 bg-background mb-2">
                  <p>Lineup #{idx + 1}</p>
                </div>
                {lineup?.players?.map(player => {
                  const position =
                    player.lineup_position === 'FLEX'
                      ? 'FLX'
                      : player.lineup_position === 'SUPER FLEX'
                        ? 'SFLX'
                        : player.lineup_position
                  return (
                    <div
                      key={player.fe_player_id}
                      className="flex gap-4 items-center py-1 justify-between text-sm px-2"
                    >
                      <div className="flex gap-4 items-center">
                        <Image src={player.fe.team_image} alt={player.name} width={25} height={25} />
                        <div className="w-8">{position}</div>
                        <div>{player.name}</div>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="text-muted w-12 text-center">
                          ${player.salary.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-muted w-12 text-center">{player.fe.projection}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-4 justify-end w-full text-sm p-2 bg-background">
                <div className="flex gap-2 items-center text-md font-bold">
                  ${lineup.salary.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-muted font-black">|</p>
                <div className="flex gap-2 items-center text-md font-bold">{lineup.projection}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
