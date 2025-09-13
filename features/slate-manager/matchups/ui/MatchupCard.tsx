'use client'

import Image from 'next/image'
import Link from 'next/link'

import { formatReadableDate, sanitizeLogo, toISO } from '@/shared/utils'
import { Sport } from '@/types/sport'

import { isFireGameTotal, isFireTeamTotal } from '../helpers'
import { Matchup } from '../types/matchup'
import { FireOverlay } from './FireOverlay'

export default function MatchupCard({ matchup }: { matchup: Matchup }) {
  const href = `${matchup.slate_id}/${matchup.id}`
  const startISO = toISO(matchup.start_time)
  const startReadable = formatReadableDate(matchup.start_time)
  const sport = matchup.sport as Sport

  return (
    <Link
      href={href}
      className="relative max-w-[1400px] flex flex-col rounded
                 bg-background-secondary border-2 border-background-secondary
                 hover:border-accent hover:scale-[1.01] transition-all duration-300 ease-in-out"
    >
      {/* header strip */}
      <div className="flex flex-col md:flex-row justify-between items-center py-2 bg-card border-b border-border px-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-foreground">
            <time dateTime={startISO}>{startReadable}</time>
          </p>
          <span className="hidden md:block text-muted">|</span>
          <p className="text-sm text-foreground">{matchup.tv_network}</p>
        </div>
        <p className="text-sm text-foreground">{matchup.venue}</p>
      </div>

      {/* teams row */}
      <div className="flex flex-col px-4 pb-4 pt-2 sm:flex-row items-center justify-between gap-4 sm:gap-0 overflow-hidden">
        {/* away */}
        <div className="flex items-center w-full sm:w-[40%] text-lg text-center sm:text-left">
          <div className="relative w-[50px] h-[50px] md:w-[100px] md:h-[100px] md:hidden lg:block">
            <Image
              src={sanitizeLogo(matchup.away_team_logo)}
              alt={`${matchup.away_team_city} ${matchup.away_team_name} logo`}
              width={100}
              height={100}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col items-start text-left text-lg font-bold ml-4">
            <div>{matchup.away_team_city}</div>
            <h3 className="uppercase text-3xl font-black hidden md:block">
              {matchup.away_team_name}
            </h3>
          </div>
        </div>

        {/* center */}
        <div className="relative hidden md:flex flex-col sm:w-[20%] items-center justify-between">
          <div className="flex justify-center w-full py-4 z-10">
            <Image src="/vs-80-79.png" alt="versus" width={60} height={60} />
          </div>
          {isFireGameTotal(sport, matchup.game_total) && <FireOverlay />}
        </div>

        {/* home */}
        <div className="flex flex-row md:flex-row-reverse items-center w-full sm:w-[40%] text-lg text-center sm:text-right">
          <div className="relative w-[50px] h-[50px] md:w-[100px] md:h-[100px] md:hidden lg:block">
            <Image
              src={sanitizeLogo(matchup.home_team_logo)}
              alt={`${matchup.home_team_city} ${matchup.home_team_name} logo`}
              width={100}
              height={100}
              className="object-contain z-20"
              priority
            />
          </div>
          <div className="flex flex-col items-end text-lg ml-4 md:mr-4">
            <div>{matchup.home_team_city}</div>
            <h3 className="uppercase text-3xl font-bold hidden md:block">
              {matchup.home_team_name}
            </h3>
          </div>
        </div>
      </div>

      {/* vegas strip */}
      <div className="flex items-end bg-card font-bold text-sm justify-between rounded-t text-muted px-4 py-2 border-t border-border overflow-hidden">
        {/* away total */}
        <div className="relative">
          <div className="z-20 relative text-foreground">
            Team Total: {matchup.away_team_total ?? 'N/A'}
          </div>
          {isFireTeamTotal(sport, matchup.away_team_total) && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60 z-0">
              <Image src="/fire.png" alt="" width={100} height={100} aria-hidden />
            </div>
          )}
        </div>

        {/* game total */}
        <div className="relative flex items-center gap-2">
          <span className="z-10 text-foreground">Game Total: {matchup.game_total ?? 'N/A'}</span>
        </div>

        {/* home total */}
        <div className="relative">
          <div className="z-20 relative text-foreground">
            Team Total: {matchup.home_team_total ?? 'N/A'}
          </div>
          {isFireTeamTotal(sport, matchup.home_team_total) && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60 z-0">
              <Image src="/fire.png" alt="" width={100} height={100} aria-hidden />
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
