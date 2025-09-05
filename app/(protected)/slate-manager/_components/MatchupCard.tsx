'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { Matchup } from '@/app/(protected)/slate-manager/_types/matchup'

export default function MatchupCard({ matchup }: { matchup: Matchup }) {
  const router = useRouter()

  const formatDateTime = useCallback((dateString: string) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      return `${date.toLocaleDateString('en-US', { weekday: 'long' })}, ${date.getMonth() + 1}/${date.getDate()}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    } catch {
      return ''
    }
  }, [])

  const getTeamLogo = useCallback((url: string | undefined) => {
    if (!url) return '/no_image.png'
    return url.split('&')[0]
  }, [])

  return (
    <div
      key={matchup.id}
      className={`max-w-[1400px] flex flex-col rounded cursor-pointer bg-background-secondary border border-background-secondary hover:border-accent transition-all duration-300`}
      onClick={() => {
        router.push(`${matchup.slate_id}/${matchup.id}`)
      }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center py-2 bg-card border-b border-border px-8">
        <div className="flex items-center">
          <p className="text-sm text-foreground md:mb-0">{formatDateTime(matchup.start_time)}</p>
          <span className="hidden md:block mx-2">|</span>
          <p className="text-sm text-foreground md:mb-0">{matchup.tv_network}</p>
        </div>
        <p className="text-sm text-foreground mb-1 md:mb-0">{matchup.venue}</p>
      </div>

      {/* Targets */}
      <div className="flex justify-between px-4">
        <div className="mt-3 text-foreground">
          {0 > 0 && (
            <div className="flex items-center bg-accent text-accent-foreground font-bold text-sm rounded-full px-4">
              0
            </div>
          )}
        </div>
        <div className="mt-3 text-foreground">
          {0 > 0 && <div className="flex items-center bg-blue rounded-full px-4">0</div>}
        </div>
      </div>

      {/* Teams */}
      <div className="flex flex-col px-4 pb-4 pt-2 sm:flex-row items-center justify-between gap-4 sm:gap-0">
        {/* Away Team */}
        <div className="flex items-center w-full sm:w-[40%] text-lg text-center sm:text-left">
          <div className="relative w-[50px] h-[50px] md:w-[100px] md:h-[100px] md:hidden lg:block">
            <Image
              src={getTeamLogo(matchup.away_team_logo)}
              alt={matchup.away_team_name}
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col items-left text-left text-lg font-bold ml-4">
            <div>{matchup.away_team_city}</div>
            <h3 className="uppercase text-3xl font-black hidden md:block">{matchup.away_team_name}</h3>
          </div>
        </div>

        {/* Center Section */}
        <div className="flex-col sm:w-[20%] justify-between items-center hidden md:flex">
          <div className="flex justify-center w-full py-4">
            <Image src="/vs-80-79.png" alt="versus image" width={60} height={60} />
          </div>
        </div>

        {/* Home Team */}
        <div className="flex flex-row md:flex-row-reverse items-center w-full sm:w-[40%] text-lg text-center sm:text-right">
          <div className="relative w-[50px] h-[50px] md:w-[100px] md:h-[100px] md:hidden lg:block">
            <Image
              src={getTeamLogo(matchup.home_team_logo)}
              alt={matchup.home_team_name}
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col items-right text-lg ml-4 md:mr-4">
            <div>{matchup.home_team_city}</div>
            <h3 className="uppercase text-3xl font-bold hidden md:block">{matchup.home_team_name}</h3>
          </div>
        </div>
      </div>

      {/* Vegas Totals */}
      <div className="flex bg-card font-bold text-sm justify-between rounded-t text-muted px-6 py-2 border-t border-border">
        <div>Team Total: {matchup.away_team_total}</div>
        <div>Game Total: {matchup.game_total}</div>
        <div>Team Total: {matchup.home_team_total}</div>
      </div>
    </div>
  )
}
