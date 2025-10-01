// import { InjuriesResponse } from './types' // define based on ESPN API

const OFFENSIVE_POSITIONS = ['QB', 'RB', 'FB', 'WR', 'TE', 'K']

export function toPlayerNews(data: any, limit = 50) {
  // Flatten all injuries across teams
  const allInjuries = data.injuries.flatMap(team =>
    team.injuries.map(injury => ({
      ...injury,
      team: {
        id: team.id,
        displayName: team.displayName,
      },
    })),
  )

  // Filter to only offensive positions
  const offensiveInjuries = allInjuries.filter(injury =>
    OFFENSIVE_POSITIONS.includes(injury.athlete.position.abbreviation),
  )

  // Sort descending by injury date
  offensiveInjuries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Return only the top N
  return offensiveInjuries.slice(0, limit)
}
