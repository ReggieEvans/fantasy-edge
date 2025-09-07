'use client'

import { CheckCircle, XCircle } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useState } from 'react'

import { Matchup } from '@/app/(protected)/slate-manager/_types/matchup'
import { Slate } from '@/app/(protected)/slate-manager/_types/slate'
import { Info } from '@/components/Info'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

import { setGlobalMaxExposure } from '../../../_state/optimizerConstraints.slice'
import { excludeTeam, includeTeam } from '../../../_state/optimizerPool.slice'

type DialogType = 'game-filters' | 'advanced-options' | 'upload-projections' | 'contest-data' | 'player-pool' | null

export default function OptimizerOptions({
  slate,
  matchups,
}: {
  slate: Slate | undefined
  matchups: Matchup[] | undefined
}) {
  const [openDialog, setOpenDialog] = useState<DialogType>(null)
  const dispatch = useAppDispatch()
  const excludedTeamIds = useAppSelector(s => s.optimizerPool.excludedTeamIds)

  const handleDialogOpen = (dialogType: DialogType) => {
    setOpenDialog(dialogType)
  }

  const handleDialogClose = () => {
    setOpenDialog(null)
  }

  const handleExcludeTeam = (teamId: string) => {
    if (excludedTeamIds.includes(teamId)) {
      dispatch(includeTeam(teamId))
    } else {
      dispatch(excludeTeam(teamId))
    }
  }

  const renderDialogContent = () => {
    switch (openDialog) {
      case 'game-filters':
        return (
          <DialogContent className="sm:min-w-[900px] max-h-[900px] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Game Filters</DialogTitle>
              <DialogDescription>Toggle team filters to narrow your player pool for optimization.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <GameFiltersList
                matchups={matchups}
                excludedTeamIds={excludedTeamIds}
                handleExcludeTeam={handleExcludeTeam}
              />
            </div>
          </DialogContent>
        )
      case 'advanced-options':
        return (
          <DialogContent className="min-w-[80%] min-h-[900px] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Advanced Options</DialogTitle>
              <DialogDescription>Configure advanced optimization settings and parameters.</DialogDescription>
            </DialogHeader>
            <div className="py-2 w-full">
              <AdvancedOptionsList matchups={matchups} excludedTeamIds={excludedTeamIds} />
            </div>
          </DialogContent>
        )
      case 'upload-projections':
        return (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload Projections</DialogTitle>
              <DialogDescription>Upload custom player projections for more accurate optimization.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Projection upload functionality will be implemented here.
                </p>
                {/* Add your projection upload components here */}
              </div>
            </div>
          </DialogContent>
        )
      case 'contest-data':
        return (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Contest Data</DialogTitle>
              <DialogDescription>Configure contest-specific settings and constraints.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Contest data configuration will be implemented here.</p>
                {/* Add your contest data components here */}
              </div>
            </div>
          </DialogContent>
        )
      case 'player-pool':
        return (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Player Pool</DialogTitle>
              <DialogDescription>Manage and configure your player pool for optimization.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Player pool management will be implemented here.</p>
                {/* Add your player pool components here */}
              </div>
            </div>
          </DialogContent>
        )
      default:
        return null
    }
  }

  return (
    <div className="text-sm rounded-t bg-background-secondary">
      <ul className="flex border-b-2 border-background">
        <li
          className="flex items-center justify-center gap-2 w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all duration-300"
          onClick={() => handleDialogOpen('game-filters')}
        >
          <span>Game Filters</span>
          <Badge
            variant="outline"
            className={` text-xs ${excludedTeamIds.length > 0 ? 'bg-destructive' : 'bg-background-darker'}`}
          >
            {excludedTeamIds.length}
          </Badge>
        </li>
        <li
          className="flex items-center justify-center gap-2 w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all duration-300"
          onClick={() => handleDialogOpen('advanced-options')}
        >
          <span>Advanced Options</span>
          <Badge variant="outline" className="bg-background-darker text-xs">
            0
          </Badge>
        </li>
        <li
          className="flex items-center justify-center gap-2 w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all duration-300"
          onClick={() => handleDialogOpen('upload-projections')}
        >
          <span>Upload Projections</span>
          <Badge variant="outline" className="bg-background-darker text-xs">
            {slate?.has_projections ? (
              <CheckCircle size={13} className="text-green-500 mb-[1px]" />
            ) : (
              <XCircle size={13} className="text-destructive mb-[1px]" />
            )}
          </Badge>
        </li>
        <li
          className="w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all duration-300"
          onClick={() => handleDialogOpen('contest-data')}
        >
          Contest Data
        </li>
        <li
          className="w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all duration-300"
          onClick={() => handleDialogOpen('player-pool')}
        >
          Player Pool
        </li>
      </ul>

      <Dialog open={openDialog !== null} onOpenChange={handleDialogClose}>
        {renderDialogContent()}
      </Dialog>
    </div>
  )
}

function GameFiltersList({
  matchups,
  excludedTeamIds,
  handleExcludeTeam,
}: {
  matchups: Matchup[] | undefined
  excludedTeamIds: string[]
  handleExcludeTeam: (teamId: string) => void
}) {
  const getTeamLogo = useCallback((url: string | undefined) => {
    if (!url) return '/no_image.png'
    return url.split('&')[0]
  }, [])

  if (!matchups) return null

  return (
    <div className="flex flex-wrap gap-2">
      {matchups?.map(matchup => (
        <div key={matchup.id} className="flex items-center uppercase text-xs my-1">
          <button
            className={`flex flex-col w-52 bg-card rounded-l-md border border-background-darker hover:cursor-pointer hover:brightness-75 transition-all duration-300 ${excludedTeamIds.includes(matchup?.away_team_id ?? '') ? 'opacity-20' : ''}`}
            onClick={() => handleExcludeTeam(matchup?.away_team_id ?? '')}
          >
            <div className="flex items-center gap-2 p-2">
              <Image src={getTeamLogo(matchup.away_team_logo)} alt={matchup.away_team_name} width={30} height={30} />
              <div className="flex flex-col">
                <span className="font-black">{matchup.away_team_city}</span>
                <span>{matchup.away_team_name}</span>
              </div>
            </div>
            <div className="flex justify-between items-center w-full px-2 py-1 border-t border-background-darker bg-background-secondary">
              <span>{matchup.away_team_total}</span>
              {/* <span className="font-black">{matchup.away_team_spread < 0 ? matchup.away_team_spread : null}</span> */}
            </div>
          </button>
          <button
            className={`flex flex-col items-end w-52 bg-card rounded-r-md border border-background-darker hover:cursor-pointer hover:brightness-75 transition-all duration-300 ${excludedTeamIds.includes(matchup.home_team_id ?? '') ? 'opacity-20' : ''}`}
            onClick={() => handleExcludeTeam(matchup.home_team_id ?? '')}
          >
            <div className="flex items-center gap-2 p-2">
              <div className="flex flex-col items-end">
                <span className="font-black">{matchup.home_team_city}</span>
                <span>{matchup.home_team_name}</span>
              </div>
              <Image src={getTeamLogo(matchup.home_team_logo)} alt={matchup.home_team_name} width={30} height={30} />
            </div>
            <div className="flex justify-end items-center w-full px-2 py-1 border-t border-background-darker bg-background-secondary">
              {/* <span className="font-black">{matchup.home_team_spread < 0 ? matchup.home_team_spread : null}</span> */}
              <span>{matchup.home_team_total}</span>
            </div>
          </button>
        </div>
      ))}
    </div>
  )
}

function AdvancedOptionsList({
  matchups,
  excludedTeamIds,
}: {
  matchups: Matchup[] | undefined
  excludedTeamIds: string[]
}) {
  // Stacks
  const [teamStacks, setTeamStacks] = useState<string>('')
  // example line per stack: size=3 for_teams=KC|BAL for_positions=QB|WR|TE spacing=2 max_exposure=0.5
  const [posStacks, setPosStacks] = useState<string>('')
  // example line per stack: positions=QB|WR for_teams=KC|NO max_exposure=0.5
  const [gameStacks, setGameStacks] = useState<string>('')
  // example line per stack: size=3 min_from_team=1

  const [busy, setBusy] = useState(false)
  const [sport, setSport] = useState<'NFL' | 'CFB'>('NFL')
  const [mode, setMode] = useState<'classic' | 'showdown'>('classic')
  const [nLineups, setNLineups] = useState(20)
  const [uniquePlayersPerLineup, setUniquePlayersPerLineup] = useState<string>('1')
  const [offensivePlayersVsDefense, setOffensivePlayersVsDefense] = useState<string>('3')
  const [minSalaryPct, setMinSalaryPct] = useState<string>('')
  const [maxRepeating, setMaxRepeating] = useState<string>('')
  const [randomness, setRandomness] = useState<string>('')
  const [locks, setLocks] = useState<string>('') // comma separated names
  const [excludes, setExcludes] = useState<string>('') // comma separated names
  const [teamMaxRaw, setTeamMaxRaw] = useState<string>('') // e.g. DAL:3,PHI:2

  const dispatch = useAppDispatch()
  const globalMaxExposure = useAppSelector(s => s.optimizerConstraints.constraints.global_max_exposure)
  const [localGlobalMaxExposure, setLocalGlobalMaxExposure] = useState<number>(globalMaxExposure)

  const getTeamLogo = useCallback((url: string | undefined) => {
    if (!url) return '/no_image.png'
    return url.split('&')[0]
  }, [])

  return (
    <div className="flex w-full flex-col gap-4">
      <Tabs defaultValue="general">
        <TabsList className="gap-2 bg-card">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="position-stacks">Position Stacks</TabsTrigger>
          <TabsTrigger value="team-stacks">Team Stacks</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <div className="flex gap-6 w-full">
            <div className="flex flex-col gap-2 mt-4">
              <p className="text-lg font-bold">General Rules</p>
              <div className="flex flex-col gap-6 py-2 px-1 pr-6">
                {/* Maximum Repeating Players*/}
                <div>
                  <Label className="flex items-center gap-2 mb-1 px-1">
                    Maximum Repeating Players{' '}
                    <span>
                      <Info
                        title="Maximum Repeating Players"
                        content="This rule adds a constraint that restricts player combinations that were used in previous lineups."
                      />
                    </span>
                  </Label>
                  <Select value={uniquePlayersPerLineup}>
                    <SelectTrigger className="w-56 border border-muted">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background-darker">
                      <SelectItem value="1">1 Player</SelectItem>
                      <SelectItem value="2">2 Players</SelectItem>
                      <SelectItem value="3">3 Players</SelectItem>
                      <SelectItem value="4">4 Players</SelectItem>
                      <SelectItem value="5">5 Players</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator className="bg-muted opacity-50" />
                {/* Maximum Repeating Players*/}
                <div>
                  <Label className="flex items-center gap-2 mb-1 px-1">
                    Number of Specific Positions{' '}
                    <span>
                      <Info
                        title="Number of Specific Positions"
                        content="This rule sets a specific number of players for multi-position slots."
                      />
                    </span>
                  </Label>
                  <div className="flex gap-3 mt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span>QB:</span>{' '}
                      <Input
                        type="number"
                        className="w-16 text-center border border-muted rounded p-2"
                        min={0}
                        max={2}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span>RB:</span>{' '}
                      <Input
                        type="number"
                        className="w-16 text-center border border-muted rounded p-2"
                        min={0}
                        max={4}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span>WR:</span>{' '}
                      <Input
                        type="number"
                        className="w-16 text-center border border-muted rounded p-2"
                        min={0}
                        max={4}
                      />
                    </div>
                  </div>
                </div>
                <Separator className="bg-muted opacity-50" />
                {/* Minimum Salary Cap - $50,000 */}
                <div>
                  <Label className="flex items-center gap-2 mb-1 px-1">
                    Minimum Salary Cap{' '}
                    <span>
                      <Info
                        title="Minimum Salary Cap"
                        content="This rule sets a minimum salary for the entire lineup."
                      />
                    </span>
                  </Label>
                  <div className="flex items-center gap-2 text-xs">
                    <span>$</span>
                    <Input className="mt-1 w-56 border border-muted rounded p-2" placeholder="50000" />
                  </div>
                </div>
                <Separator className="bg-muted opacity-50" />
                {/* Global Max Exposure (0-1) */}
                <div>
                  <Label className="flex items-center gap-2 mb-1 px-1">
                    Global Max Exposure (0-1)
                    <span>
                      <Info
                        title="Global Max Exposure"
                        content="This rule sets a maximum exposure for a set of lineups."
                      />
                    </span>
                  </Label>
                  <div className="flex items-center gap-2 text-xs">
                    <Input
                      className="mt-1 w-56 border border-muted rounded p-2"
                      type="number"
                      min={0}
                      max={1}
                      value={localGlobalMaxExposure}
                      onChange={e => setLocalGlobalMaxExposure(Number(e.target.value))}
                      onBlur={() => dispatch(setGlobalMaxExposure(localGlobalMaxExposure))}
                    />
                    <span>%</span>
                  </div>
                </div>
                <Separator className="bg-muted opacity-50" />
                {/* Ownership projections constraint */}
                <div>
                  <Label className="flex items-center gap-2 mb-1 px-1">
                    Ownership Projections Constraint{' '}
                    <span>
                      <Info
                        title="Ownership Projections Constraint"
                        content="This rule allows you to set max/min percent of average ownership in generated lineup."
                      />
                    </span>
                  </Label>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span>Min:</span>{' '}
                      <Input type="number" className="w-16 text-center border border-muted rounded p-2" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Max:</span>{' '}
                      <Input type="number" className="w-16 text-center border border-muted rounded p-2" />
                    </div>
                  </div>
                </div>
                <Separator className="bg-muted opacity-50" />
                <div className="mt-2">
                  <Label className="flex items-center gap-2 mb-1 px-1">
                    Randomness:
                    <span>
                      <Info title="Randomness" content="This rule sets the randomness for the lineup." />
                    </span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Select value={randomness} onValueChange={v => setRandomness(v as any)}>
                      <SelectTrigger className="w-48 border border-muted">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent className="bg-background-darker">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="random">Random</SelectItem>
                        <SelectItem value="progressive">Progressive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Scale"
                      // value={randomScale}
                      // onChange={e => setRandomScale(e.target.value)}
                      className="ml-2 border border-muted rounded w-20"
                      disabled={randomness !== 'progressive'}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-4 flex-1 w-full">
              <div>
                <p className="text-lg font-bold">Team Settings</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchups?.map(matchup => (
                  <div key={matchup.id}>
                    <div className="flex items-center uppercase text-xs">
                      <div
                        className={`flex flex-col w-52 bg-card ${excludedTeamIds.includes(matchup?.away_team_id ?? '') ? 'opacity-20' : ''}`}
                      >
                        <div className="flex items-center gap-2 p-2">
                          <Image
                            src={getTeamLogo(matchup.away_team_logo)}
                            alt={matchup.away_team_name}
                            width={30}
                            height={30}
                          />
                          <div className="flex flex-col">
                            <span className="font-black">{matchup.away_team_city}</span>
                            <span>{matchup.away_team_name}</span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`flex flex-col items-end w-52 bg-card ${excludedTeamIds.includes(matchup.home_team_id ?? '') ? 'opacity-20' : ''}`}
                      >
                        <div className="flex items-center gap-2 p-2">
                          <div className="flex flex-col items-end">
                            <span className="font-black">{matchup.home_team_city}</span>
                            <span>{matchup.home_team_name}</span>
                          </div>
                          <Image
                            src={getTeamLogo(matchup.home_team_logo)}
                            alt={matchup.home_team_name}
                            width={30}
                            height={30}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col w-full px-2 py-1 border-t border-background-darker bg-background-secondary">
                      <div className="flex justify-center w-full mb-2">
                        <p className="text-xs">Players from each team</p>
                      </div>
                      <div className="flex justify-around w-full">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Min"
                              className="w-16 text-center border border-muted rounded p-2"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Max"
                              className="w-16 text-center border border-muted rounded p-2"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Min"
                              className="w-16 text-center border border-muted rounded p-2"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Max"
                              className="w-16 text-center border border-muted rounded p-2"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-around w-full pb-2">
                        <div className="flex items-center justify-center gap-2 w-1/2 mt-2">
                          <div className="text-center">
                            <p className="text-xs mb-2">Players from game</p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  placeholder="Min"
                                  className="w-16 text-center border border-muted rounded p-2"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  placeholder="Max"
                                  className="w-16 text-center border border-muted rounded p-2"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center w-1/2 mt-2">
                          <div className="text-center">
                            <p className="text-xs mb-2">Limit Opposing Players</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Min"
                              className="w-16 text-center border border-muted rounded p-2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="position-stacks">Position Stacks content</TabsContent>
        <TabsContent value="team-stacks">Team Stacks content</TabsContent>
        <TabsContent value="groups">Groups content</TabsContent>
      </Tabs>
    </div>
  )
}
