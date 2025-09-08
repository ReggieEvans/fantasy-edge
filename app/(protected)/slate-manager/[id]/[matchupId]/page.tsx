'use client'

import { ArrowLeft, Bug, CloudSun, GitCompareArrows, UserCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'

import { useGetMatchupQuery } from '@/app/(protected)/slate-manager/_api/matchups.api'
import { NestedStatKey, StatGroupKey, TeamSide } from '@/app/(protected)/slate-manager/_types/diffRow'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { getErrorMessage } from '@/utils/getErrorMessage'

import { DiffRow } from './components/DiffRow'
import PlayerTable from './components/PlayerTable'
import TeamStatRow from './components/TeamStatsRow'

const sportPositions: { [key: string]: { position: string; positionAbb: 'QB' | 'RB' | 'WR' | 'TE' | 'DST' }[] } = {
  NFL: [
    {
      position: 'Quarterback',
      positionAbb: 'QB',
    },
    {
      position: 'Running Back',
      positionAbb: 'RB',
    },
    {
      position: 'Wide Receiver',
      positionAbb: 'WR',
    },
    {
      position: 'Tight End',
      positionAbb: 'TE',
    },
    {
      position: 'Defense',
      positionAbb: 'DST',
    },
  ],
  CFB: [
    {
      position: 'Quarterback',
      positionAbb: 'QB',
    },
    {
      position: 'Running Back',
      positionAbb: 'RB',
    },
    {
      position: 'Wide Receiver',
      positionAbb: 'WR',
    },
  ],
}

export default function MatchupPage() {
  const [value, setValue] = useState('both')
  const [showPlayersWithNoStats, setShowPlayersWithNoStats] = useState(false)
  const { id, matchupId } = useParams() as {
    id: string
    matchupId: string
  }
  const { data, isLoading, isError, error } = useGetMatchupQuery({ id, matchupId })

  const formatDateTime = React.useCallback((dateString: string) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      return `${date.toLocaleDateString('en-US', { weekday: 'long' })}, ${date.getMonth() + 1}/${date.getDate()}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    } catch {
      return ''
    }
  }, [])

  const getTeamLogo = React.useCallback((url: string | undefined) => {
    if (!url) return '/no_image.png'
    return url.split('&')[0]
  }, [])

  return (
    <div className="bg-background px-6 pt-3 rounded-tl-[40px] min-h-[calc(100vh-90px)]">
      <div className="flex flex-col text-muted mb-4">
        <div className="text-sm text-muted py-4">
          <div className="flex items-center gap-2 uppercase font-bold text-xs text-accent">
            <ArrowLeft size={16} />
            <Link href={`/slate-manager/${id}`}>all matchups</Link>
          </div>
        </div>
        <div className="flex flex-col justify-between mb-4 text-foreground">
          <div className="flex items-center gap-2">
            <span>
              <GitCompareArrows size={20} />
            </span>
            <h1 className="text-xl font-bold uppercase">Matchup</h1>
          </div>
        </div>
        <p className="max-w-[1200px] text-sm">
          The following stat breakdown provides insights into team performance and can help you identify key players for
          your lineup. See a good matchup? Scroll down and click the target icon next to a player to add them to your
          player pool.
        </p>
      </div>

      <div className="flex flex-col gap-8 py-4">
        {isLoading ? (
          // Loading skeletons
          [...Array(1)].map((_, i) => (
            <Skeleton key={i} className="h-[800px] w-[1400px] bg-card rounded animate-pulse" />
          ))
        ) : isError ? (
          // Error state
          <div className="flex flex-col gap-2 items-center justify-center py-12 w-[600px] mx-auto">
            <Alert variant="destructive">
              <Bug size={20} />
              <AlertTitle className="text-lg font-bold">Something went wrong while loading the matchup.</AlertTitle>
              <AlertDescription className="py-2">
                <p>{getErrorMessage(error)}</p>
              </AlertDescription>
            </Alert>
          </div>
        ) : !data ? (
          // Empty state
          <p>No matchup found.</p>
        ) : (
          // Success state
          <div className="relative max-h-[calc(100vh-300px)] overflow-y-auto max-w-[1400px] pb-20">
            <section className="flex flex-col max-w-[1400px] bg-background-secondary rounded shadow-md">
              <div className="flex justify-between items-center p-4 bg-card border-b border-border rounded-t text-xs">
                <div className="flex flex-col space-y-1">
                  <div>{data.matchup.venue}</div>
                  <div>
                    {formatDateTime(data.matchup.start_time)}{' '}
                    {data.matchup.tv_network ? `- ${data.matchup.tv_network}` : ''}
                  </div>
                </div>
                <div>
                  <CloudSun size={40} />
                </div>
              </div>
              <div className="flex justify-between py-4 px-4">
                <div className="p-2">
                  <div className="flex items-center gap-4 mb-8">
                    <div>
                      <Image src={getTeamLogo(data.matchup.away_team_logo)} alt="Team Logo" width={80} height={80} />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-xl font-bold uppercase">{data.matchup.away_team_city}</div>
                      <div className="text-3xl font-black uppercase">{data.matchup.away_team_name}</div>
                    </div>
                  </div>
                  <TeamStatRow stats={data.teamPassing.away} label="PASSING" />
                  <TeamStatRow stats={data.teamRushing.away} label="RUSHING" />
                  <TeamStatRow stats={data.passingRate.away} label="PASS RATE" isPercent={true} />
                  <TeamStatRow stats={data.rushingRate.away} label="RUSH RATE" isPercent={true} />
                  <TeamStatRow stats={data.passingDefense.away} label="PASS DEF" />
                  <TeamStatRow stats={data.rushingDefense.away} label="RUSH DEF" />
                </div>

                <div className="text-center px-3 py-2 border-l border-r border-border">
                  <div className="flex justify-center w-full py-4">
                    <Image src="/vs-80-79.png" alt="versus image" width={60} height={60} />
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
                  ].map(config => (
                    <DiffRow key={config.label} data={data} {...config} />
                  ))}
                </div>

                <div className="p-2">
                  <div className="flex flex-row-reverse items-center gap-4 mb-8">
                    <div>
                      <Image src={getTeamLogo(data.matchup.home_team_logo)} alt="Team Logo" width={80} height={80} />
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xl uppercase font-bold">{data.matchup.home_team_city}</div>
                      <div className="text-3xl font-black uppercase">{data.matchup.home_team_name}</div>
                    </div>
                  </div>
                  <TeamStatRow stats={data.teamPassing.home} label="PASSING" isReverse={true} />
                  <TeamStatRow stats={data.teamRushing.home} label="RUSHING" isReverse={true} />
                  <TeamStatRow stats={data.passingRate.home} label="PASS RATE" isPercent={true} isReverse={true} />
                  <TeamStatRow stats={data.rushingRate.home} label="RUSH RATE" isPercent={true} isReverse={true} />
                  <TeamStatRow stats={data.passingDefense.home} label="PASS DEF" isReverse={true} />
                  <TeamStatRow stats={data.rushingDefense.home} label="RUSH DEF" isReverse={true} />
                </div>
              </div>
              <div className="flex justify-center gap-24 bg-card pb-2 pt-6 border-t border-border">
                <div className="flex flex-col items-center justify-center">
                  <div className="uppercase text-xs font-bold">Team Total</div>
                  <div className="text-3xl font-black py-2">{data.matchup.away_team_total ?? 'N/A'}</div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="uppercase text-xs font-bold">Game Total</div>
                  <div className="text-3xl font-black py-2">{data.matchup.game_total ?? 'N/A'}</div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="uppercase text-xs font-bold">Team Total</div>
                  <div className="text-3xl font-black py-2">{data.matchup.home_team_total ?? 'N/A'}</div>
                </div>
              </div>
            </section>

            <section className="mt-10 max-w-[1400px]">
              <div className="flex items-end justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <UserCheck size={20} />
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
                  <div>
                    <ToggleGroup
                      variant="outline"
                      type="single"
                      size="lg"
                      value={value}
                      onValueChange={value => {
                        if (value) setValue(value)
                      }}
                    >
                      <ToggleGroupItem
                        className={`min-w-[100px] ${value === 'away_team' ? 'bg-blue text-foreground' : ''}`}
                        value="away_team"
                        aria-label="Toggle bold"
                      >
                        {data.matchup.away_team_city}
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        className={`min-w-[100px] ${value === 'both' ? 'bg-blue text-foreground' : ''}`}
                        value="both"
                        aria-label="Toggle italic"
                      >
                        Both
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        className={`min-w-[100px] ${value === 'home_team' ? 'bg-blue text-foreground' : ''}`}
                        value="home_team"
                        aria-label="Toggle strikethrough"
                      >
                        {data.matchup.home_team_city}
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-8">
                {sportPositions[data.matchup.sport].map((position: { position: string; positionAbb: string }) => (
                  <div className="flex flex-col bg-card rounded" key={position.positionAbb}>
                    <div className="px-4 py-3">
                      <h5 className="uppercase text-sm font-bold">{position.position}</h5>
                    </div>
                    <div className="flex flex-row gap-2 bg-background-secondary rounded pb-4 p-2">
                      {(value === 'both' || value === 'away_team') && (
                        <div className={`flex ${value === 'both' ? 'w-1/2' : 'w-full'} px-2 min-w-0`}>
                          <div className="w-full overflow-x-auto border border-background-darker rounded">
                            <PlayerTable
                              data={data.awayRoster[position.positionAbb as keyof typeof data.awayRoster]}
                              position={position.positionAbb as 'QB' | 'RB' | 'WR' | 'TE' | 'DST'}
                              showPlayersWithNoStats={showPlayersWithNoStats}
                            />
                          </div>
                        </div>
                      )}
                      {(value === 'both' || value === 'home_team') && (
                        <div className={`flex ${value === 'both' ? 'w-1/2' : 'w-full'} px-2 min-w-0`}>
                          <div className="w-full overflow-x-auto border border-background-darker rounded">
                            <PlayerTable
                              data={data.homeRoster[position.positionAbb as keyof typeof data.homeRoster]}
                              position={position.positionAbb as 'QB' | 'RB' | 'WR' | 'TE' | 'DST'}
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

function createStatKey<K extends StatGroupKey>(key: K, side: TeamSide): NestedStatKey {
  return [key, side]
}
