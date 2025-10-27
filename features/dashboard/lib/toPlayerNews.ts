/* eslint-disable @typescript-eslint/no-explicit-any */

const OFFENSIVE_POSITIONS = ['QB', 'RB', 'FB', 'WR', 'TE', 'K']

export function toPlayerNews(data: any, limit = 50) {
  const allInjuries = data.injuries.flatMap((team: any) =>
    team.injuries.map((injury: any) => ({
      ...injury,
      team: {
        id: team.id,
        displayName: team.displayName,
      },
    })),
  )

  const offensiveInjuries = allInjuries.filter((injury: any) =>
    OFFENSIVE_POSITIONS.includes(injury.athlete.position.abbreviation),
  )

  offensiveInjuries.sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return offensiveInjuries.slice(0, limit)
}
