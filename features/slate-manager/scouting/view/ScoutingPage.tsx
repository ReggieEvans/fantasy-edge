'use client'

import { ArrowLeft, CloudSun, GitCompareArrows, UserCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import FeatureHeader from '@/shared/ui/FeatureHeader'
import { NoData } from '@/shared/ui/NoData'
import { formatDateTime, sanitizeLogo } from '@/shared/utils'
import { getErrorMessage } from '@/utils/getErrorMessage'

import { useGetMatchupQuery } from '../api/matchups.api'
import { sportPositions, ToggleValue } from '../constants/sportPositions'
import { createStatKey } from '../helpers'
import { MatchupDTO } from '../types/matchup'
import { TeamStats } from '../types/stats'
import { DiffRow } from '../ui/DiffRow'
import PlayerTable from '../ui/PlayerTable'
import TeamStatRow from '../ui/TeamStatsRow'

export default function ScoutingPage() {
  const { id, mid } = useParams() as { id: string; mid: string }

  const [value, setValue] = useState<ToggleValue>('both')
  const [showPlayersWithNoStats, setShowPlayersWithNoStats] = useState(false)

  const { data, isLoading, isError, error } = useGetMatchupQuery({ id, mid })

  return (
    <div className="bg-background px-6 pt-3 rounded-tl-[40px] min-h-[calc(100vh-90px)]">
      {/* Header */}
      <div className="flex flex-col text-muted mb-4">
        <div className="text-sm py-4">
          <div className="flex items-center gap-2 uppercase font-bold text-xs text-accent">
            <ArrowLeft size={16} aria-hidden />
            <Link href={`/slate-manager/${id}`}>all matchups</Link>
          </div>
        </div>

        <FeatureHeader
          icon={<GitCompareArrows size={20} />}
          title="Matchup"
          description="
            The following stat breakdown provides insights into team performance and can help you
            identify key players for your lineup. See a good matchup? Scroll down and click the target
            icon next to a player to add them to your player pool.
          "
        />
      </div>

      <div className="flex flex-col gap-8 py-4">
        {isLoading ? (
          <Skeleton className="h-[800px] w-[1400px] bg-card rounded" />
        ) : isError ? (
          <div
            className="flex flex-col gap-2 items-center justify-center py-12 w-[600px] mx-auto"
            aria-live="polite"
          >
            <ErrorMessage
              aria-live="polite"
              errorTitle="Something went wrong while loading the matchup."
              errorMessage={getErrorMessage(error)}
            />
          </div>
        ) : !data ? (
          <NoData title="No matchup found." description="No matchup found." />
        ) : (
          <div className="relative max-h-[calc(100vh-300px)] overflow-y-auto max-w-[1400px] pb-20">
            {/* Matchup summary */}
            <section className="flex flex-col max-w-[1400px] bg-background-secondary rounded shadow-md">
              <div className="flex justify-between items-center p-4 bg-card border-b border-border rounded-t text-xs">
                <div className="flex flex-col space-y-1">
                  <div>{data.matchup.venue}</div>
                  <div>
                    <time dateTime={new Date(data.matchup.start_time).toISOString()}>
                      {formatDateTime(data.matchup.start_time)}
                    </time>{' '}
                    {data.matchup.tv_network ? `- ${data.matchup.tv_network}` : ''}
                  </div>
                </div>
                <CloudSun size={40} aria-hidden />
              </div>

              <div className="flex justify-between py-4 px-4">
                {/* Away panel */}
                <TeamPanel
                  side="away"
                  city={data.matchup.away_team_city}
                  name={data.matchup.away_team_name}
                  logo={data.matchup.away_team_logo}
                  data={data as MatchupDTO}
                />

                {/* Center diff */}
                <div className="text-center px-3 py-2 border-l border-r border-border">
                  <div className="flex justify-center w-full py-4">
                    <Image src="/vs-80-79.png" alt="versus" width={60} height={60} />
                  </div>

                  <div className="py-4">
                    <h3 className="font-bold uppercase mb-2">Matchups</h3>
                  </div>

                  {[
                    {
                      label: 'PASSING',
                      homeOffense: createStatKey('teamPassing', 'home'),
                      homeDefense: createStatKey('passingDefense', 'home'),
                      awayOffense: createStatKey('teamPassing', 'away'),
                      awayDefense: createStatKey('passingDefense', 'away'),
                    },
                    {
                      label: 'RUSHING',
                      homeOffense: createStatKey('teamRushing', 'home'),
                      homeDefense: createStatKey('rushingDefense', 'home'),
                      awayOffense: createStatKey('teamRushing', 'away'),
                      awayDefense: createStatKey('rushingDefense', 'away'),
                    },
                  ].map(cfg => (
                    <DiffRow key={cfg.label} data={data} {...cfg} />
                  ))}
                </div>

                {/* Home panel */}
                <TeamPanel
                  side="home"
                  city={data.matchup.home_team_city}
                  name={data.matchup.home_team_name}
                  logo={data.matchup.home_team_logo}
                  reverse
                  data={
                    data as MatchupDTO & {
                      teamPassing: TeamStats
                      teamRushing: TeamStats
                      passingRate: TeamStats
                      rushingRate: TeamStats
                      passingDefense: TeamStats
                      rushingDefense: TeamStats
                    }
                  }
                />
              </div>

              {/* Totals bar */}
              <div className="flex justify-center gap-24 bg-card pb-2 pt-6 border-t border-border">
                <div className="flex flex-col items-center justify-center">
                  <div className="uppercase text-xs font-bold">Team Total</div>
                  <div className="text-3xl font-black py-2">
                    {data.matchup.away_team_total ?? 'N/A'}
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="uppercase text-xs font-bold">Game Total</div>
                  <div className="text-3xl font-black py-2">{data.matchup.game_total ?? 'N/A'}</div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="uppercase text-xs font-bold">Team Total</div>
                  <div className="text-3xl font-black py-2">
                    {data.matchup.home_team_total ?? 'N/A'}
                  </div>
                </div>
              </div>
            </section>

            {/* Target players */}
            <section className="mt-10 max-w-[1400px]">
              <div className="flex items-end justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <UserCheck size={20} aria-hidden />
                  <h2 className="text-xl uppercase font-bold">Target Players</h2>
                </div>

                <div className="flex items-center gap-8">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-foreground">Show all players</span>
                    <Switch
                      className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-[#525361]"
                      checked={showPlayersWithNoStats}
                      onCheckedChange={setShowPlayersWithNoStats}
                    />
                  </div>

                  <ToggleGroup
                    variant="outline"
                    type="single"
                    size="lg"
                    value={value}
                    onValueChange={v => v && setValue(v as ToggleValue)}
                  >
                    <ToggleGroupItem
                      className={`min-w-[100px] ${value === 'away_team' ? 'bg-blue text-foreground' : ''}`}
                      value="away_team"
                      aria-label="Away team"
                    >
                      {data.matchup.away_team_city}
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      className={`min-w-[100px] ${value === 'both' ? 'bg-blue text-foreground' : ''}`}
                      value="both"
                      aria-label="Both teams"
                    >
                      Both
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      className={`min-w-[100px] ${value === 'home_team' ? 'bg-blue text-foreground' : ''}`}
                      value="home_team"
                      aria-label="Home team"
                    >
                      {data.matchup.home_team_city}
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>

              <div className="flex flex-col gap-8">
                {(sportPositions[data.matchup.sport] ?? []).map(pos => (
                  <div className="flex flex-col bg-card rounded" key={pos.positionAbb}>
                    <div className="px-4 py-3">
                      <h5 className="uppercase text-sm font-bold">{pos.position}</h5>
                    </div>

                    <div className="flex flex-row gap-2 bg-background-secondary rounded pb-4 p-2">
                      {(value === 'both' || value === 'away_team') && (
                        <div
                          className={`flex ${value === 'both' ? 'w-1/2' : 'w-full'} px-2 min-w-0`}
                        >
                          <div className="w-full overflow-x-auto border border-background-darker rounded">
                            <PlayerTable
                              data={
                                data.awayRoster[pos.positionAbb as keyof typeof data.awayRoster]
                              }
                              position={pos.positionAbb}
                              showPlayersWithNoStats={showPlayersWithNoStats}
                            />
                          </div>
                        </div>
                      )}

                      {(value === 'both' || value === 'home_team') && (
                        <div
                          className={`flex ${value === 'both' ? 'w-1/2' : 'w-full'} px-2 min-w-0`}
                        >
                          <div className="w-full overflow-x-auto border border-background-darker rounded">
                            <PlayerTable
                              data={
                                data.homeRoster[pos.positionAbb as keyof typeof data.homeRoster]
                              }
                              position={pos.positionAbb}
                              showPlayersWithNoStats={showPlayersWithNoStats}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

function TeamPanel({
  side,
  city,
  name,
  logo,
  reverse = false,
  data,
}: {
  side: 'home' | 'away'
  city: string
  name: string
  logo?: string
  reverse?: boolean
  data: MatchupDTO
}) {
  return (
    <div className="p-2">
      <div className={`flex items-center gap-4 mb-8 ${reverse ? 'flex-row-reverse' : ''}`}>
        <div>
          <Image src={sanitizeLogo(logo)} alt={`${city} ${name} logo`} width={80} height={80} />
        </div>
        <div className={`flex flex-col ${reverse ? 'items-end' : ''}`}>
          <div className="text-xl font-bold uppercase">{city}</div>
          <div className="text-3xl font-black uppercase">{name}</div>
        </div>
      </div>

      {/* Stats */}
      <TeamStatRow stats={data.teamPassing[side]} label="PASSING" isReverse={reverse} />
      <TeamStatRow stats={data.teamRushing[side]} label="RUSHING" isReverse={reverse} />
      <TeamStatRow stats={data.passingRate[side]} label="PASS RATE" isPercent isReverse={reverse} />
      <TeamStatRow stats={data.rushingRate[side]} label="RUSH RATE" isPercent isReverse={reverse} />
      <TeamStatRow stats={data.passingDefense[side]} label="PASS DEF" isReverse={reverse} />
      <TeamStatRow stats={data.rushingDefense[side]} label="RUSH DEF" isReverse={reverse} />
    </div>
  )
}
