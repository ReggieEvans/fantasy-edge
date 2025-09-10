import Image from 'next/image'
import { useReducer } from 'react'

import { setConstraints } from '@/app/(protected)/slate-manager/_state/optimizerConstraints.slice'
import { Matchup } from '@/app/(protected)/slate-manager/_types/matchup'
import { Info } from '@/components/Info'
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { SelectTrigger } from '@/components/ui/select'
import { SelectValue } from '@/components/ui/select'
import { SelectContent } from '@/components/ui/select'
import { SelectItem } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList } from '@/components/ui/tabs'
import { TabsTrigger } from '@/components/ui/tabs'
import { TabsContent } from '@/components/ui/tabs'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

import { constraintsFromForm, formFromConstraints, parseNum, reducer } from '../../hooks/useOptimizerForm'
import { RandomnessMode } from '../../types'

const getTeamLogo = (url?: string) => (url ? url.split('&')[0] : '/no_image.png')

export default function AdvancedOptionsDialog({
  matchups,
  excludedTeamIds,
}: {
  matchups?: Matchup[]
  excludedTeamIds: string[]
}) {
  const dispatch = useAppDispatch()
  const constraints = useAppSelector(s => s.optimizerConstraints.constraints)
  const [state, dispatchForm] = useReducer(reducer, formFromConstraints(constraints))

  const save = () => dispatch(setConstraints(constraintsFromForm(state)))

  return (
    <DialogContent className="max-w-[95vw] h-[90vh] max-h-[95vh] flex flex-col overflow-hidden bg-card">
      <DialogHeader>
        <DialogTitle>Advanced Options</DialogTitle>
      </DialogHeader>
      <div className="flex w-full flex-col h-full flex-1 min-h-0 overflow-hidden">
        <Tabs defaultValue="general" className="h-full flex-1 min-h-0 flex flex-col space-y-0">
          <TabsList className="gap-2 bg-card rounded-none w-full border-b-2 border-background">
            {['general', 'position-stacks', 'team-stacks', 'groups'].map(v => (
              <TabsTrigger
                key={v}
                value={v}
                className="w-48 px-6 rounded-b-none rounded-t-md py-2 font-bold uppercase text-muted-foreground border-b-2 border-transparent hover:text-foreground hover:bg-background-darker data-[state=active]:text-foreground data-[state=active]:border-accent data-[state=active]:bg-background"
              >
                {v.replace('-', ' ')}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* General */}
          <TabsContent value="general" className="px-2 flex-1 min-h-0 flex pt-4">
            <div className="flex gap-6 w-full flex-1 min-h-0">
              <div className="flex flex-col gap-2 mt-4 bg-background rounded-md min-h-0 w-[420px] flex-shrink-0 border border-background-darker shadow-lg shadow-black/50">
                <div className="bg-background-darker px-4 py-2 border-b border-accent rounded-t-md">
                  <p className="text-lg font-bold">General Settings</p>
                </div>

                <div className="flex-1 min-h-0 flex flex-col gap-6 pt-2 pb-12 px-6 overflow-y-auto">
                  {/* Maximum Repeating Players (implemented as unique players per lineup) */}
                  <div>
                    <Label className="flex items-center gap-2 mb-1 px-1 text-xs">
                      Maximum Repeating Players
                      <Info
                        title="Maximum Repeating Players"
                        content="Restricts reuse of player combinations across lineups."
                      />
                    </Label>
                    <Select
                      value={String(state.uniquePlayersPerLineup)}
                      onValueChange={v =>
                        dispatchForm({ type: 'SET_STRING_NUMBER', key: 'uniquePlayersPerLineup', value: v })
                      }
                    >
                      <SelectTrigger className="w-56 border border-muted">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background-darker">
                        {[1, 2, 3, 4, 5].map(n => (
                          <SelectItem key={n} value={String(n)}>
                            {n} Player{n > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="bg-muted opacity-50" />

                  {/* FLEX specific counts */}
                  <div>
                    <Label className="flex items-center gap-2 mb-1 px-1 text-xs">
                      Number of Specific Positions in FLEX
                      <Info
                        title="Number of Specific Positions"
                        content="Set fixed counts for multi-position slot distribution."
                      />
                    </Label>
                    <div className="flex gap-3 mt-1 text-xs">
                      {(['QB', 'RB', 'WR', 'TE'] as const).map(pos => (
                        <div key={pos} className="flex items-center gap-2">
                          <span>{pos}:</span>
                          <Input
                            type="number"
                            className="w-12 text-center border border-muted rounded p-2"
                            min={0}
                            onChange={e =>
                              dispatchForm({
                                type: 'SET_STRING_NUMBER',
                                key: `flex${pos}` as any,
                                value: e.target.value,
                              })
                            }
                            value={String((state as any)[`flex${pos}`] ?? '')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-muted opacity-50" />

                  {/* Salary Min/Max */}
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-2">
                      <Label className="flex items-center gap-2 mb-1 px-1 text-xs">
                        Salary Cap Min/Max
                        <Info
                          title="Salary Cap Range"
                          content="Set none, one, or both values to constrain salary usage."
                        />
                      </Label>
                      <div className="flex gap-8">
                        <div className="flex items-center gap-2 text-xs">
                          <span>$</span>
                          <Input
                            className="mt-1 w-24 border border-muted rounded p-2"
                            placeholder="Min"
                            inputMode="numeric"
                            value={state.minSalary ?? ''}
                            onChange={e =>
                              dispatchForm({ type: 'SET_STRING_NUMBER', key: 'minSalary', value: e.target.value })
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span>$</span>
                          <Input
                            className="mt-1 w-24 border border-muted rounded p-2"
                            placeholder="Max"
                            inputMode="numeric"
                            value={state.maxSalary ?? ''}
                            onChange={e =>
                              dispatchForm({ type: 'SET_STRING_NUMBER', key: 'maxSalary', value: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-muted opacity-50" />

                  {/* Global Max Exposure */}
                  <div>
                    <Label className="flex items-center gap-2 mb-1 px-1 text-xs">
                      Global Max Exposure (0-1)
                      <Info
                        title="Global Max Exposure"
                        content="Upper bound for any single player's exposure across builds."
                      />
                    </Label>
                    <div className="flex items-center gap-2 text-xs">
                      <Input
                        className="mt-1 w-56 border border-muted rounded p-2"
                        type="number"
                        min={0}
                        max={1}
                        step={0.01}
                        value={state.globalMaxExposure ?? ''}
                        onChange={e =>
                          dispatchForm({ type: 'SET_STRING_NUMBER', key: 'globalMaxExposure', value: e.target.value })
                        }
                      />
                      <span>%</span>
                    </div>
                  </div>

                  <Separator className="bg-muted opacity-50" />

                  {/* Ownership constraints */}
                  <div>
                    <Label className="flex items-center gap-2 mb-1 px-1 text-xs">
                      Ownership Projections Constraint
                      <Info
                        title="Ownership Projections Constraint"
                        content="Set max/min average ownership for generated lineups."
                      />
                    </Label>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span>Min:</span>
                        <Input
                          type="number"
                          className="w-16 text-center border border-muted rounded p-2"
                          value={state.ownershipMin ?? ''}
                          onChange={e =>
                            dispatchForm({ type: 'SET_STRING_NUMBER', key: 'ownershipMin', value: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Max:</span>
                        <Input
                          type="number"
                          className="w-16 text-center border border-muted rounded p-2"
                          value={state.ownershipMax ?? ''}
                          onChange={e =>
                            dispatchForm({ type: 'SET_STRING_NUMBER', key: 'ownershipMax', value: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-muted opacity-50" />

                  {/* Randomness */}
                  <div className="mt-2">
                    <Label className="flex items-center gap-2 mb-1 px-1 text-xs">
                      Randomness:
                      <Info
                        title="Randomness"
                        content="Choose none/random/progressive and an optional scale for progressive."
                      />
                    </Label>
                    <div className="flex items-center gap-2">
                      <Select
                        value={state.randomnessMode}
                        onValueChange={v => dispatchForm({ type: 'SET_RANDOMNESS_MODE', value: v as RandomnessMode })}
                      >
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
                        className="ml-2 border border-muted rounded w-20"
                        disabled={state.randomnessMode !== 'progressive'}
                        value={state.randomnessScale ?? ''}
                        onChange={e =>
                          dispatchForm({ type: 'SET_STRING_NUMBER', key: 'randomnessScale', value: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-accent bg-background rounded-b-md">
                  <button className="w-full btn-accent disabled:opacity-50" onClick={save}>
                    Save General Settings
                  </button>
                </div>
              </div>

              {/* Team settings panel (keeping structure, wiring into reducer if you like) */}
              <div className="flex flex-col gap-2 mt-4 flex-1 w-full min-h-0 bg-background border border-background-darker rounded-md shadow-lg shadow-black/50">
                <div className="bg-background-darker px-4 py-2 border-b border-accent">
                  <p className="text-lg font-bold">Team Settings</p>
                </div>
                <div className="flex flex-wrap gap-2 p-2 flex-1 min-h-0 overflow-y-auto">
                  {matchups?.map(m => (
                    <div key={m.id}>
                      <div className="flex items-center uppercase text-xs">
                        <div
                          className={`flex flex-col w-52 bg-card rounded-tl-md ${excludedTeamIds.includes(m.away_team_id ?? '') ? 'opacity-20' : ''}`}
                        >
                          <div className="flex items-center gap-2 p-2">
                            <Image src={getTeamLogo(m.away_team_logo)} alt={m.away_team_name} width={50} height={50} />
                            <div className="flex flex-col">
                              <span className="font-black text-sm">{m.away_team_city}</span>
                              <span>{m.away_team_name}</span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`flex flex-col items-end w-52 bg-card rounded-tr-md ${excludedTeamIds.includes(m.home_team_id ?? '') ? 'opacity-20' : ''}`}
                        >
                          <div className="flex items-center gap-2 p-2">
                            <div className="flex flex-col items-end">
                              <span className="font-black text-sm">{m.home_team_city}</span>
                              <span>{m.home_team_name}</span>
                            </div>
                            <Image src={getTeamLogo(m.home_team_logo)} alt={m.home_team_name} width={50} height={50} />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col w-full px-2 py-1 border-t border-background-darker bg-background-secondary rounded-b-md">
                        <div className="flex justify-center w-full mb-2">
                          <p className="text-xs">Players from each team</p>
                        </div>

                        {/* Away team limits */}
                        <div className="flex justify-around w-full">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Min"
                              className="w-16 text-center border border-muted rounded p-2"
                              value={state.teamLimits[m.away_team_id ?? '']?.min ?? ''}
                              onChange={e =>
                                dispatchForm({
                                  type: 'SET_TEAM_LIMIT',
                                  teamId: m.away_team_id ?? '',
                                  field: 'min',
                                  value: parseNum(e.target.value),
                                })
                              }
                            />
                            <Input
                              type="number"
                              placeholder="Max"
                              className="w-16 text-center border border-muted rounded p-2"
                              value={state.teamLimits[m.away_team_id ?? '']?.max ?? ''}
                              onChange={e =>
                                dispatchForm({
                                  type: 'SET_TEAM_LIMIT',
                                  teamId: m.away_team_id ?? '',
                                  field: 'max',
                                  value: parseNum(e.target.value),
                                })
                              }
                            />
                          </div>

                          {/* Home team limits */}
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Min"
                              className="w-16 text-center border border-muted rounded p-2"
                              value={state.teamLimits[m.home_team_id ?? '']?.min ?? ''}
                              onChange={e =>
                                dispatchForm({
                                  type: 'SET_TEAM_LIMIT',
                                  teamId: m.home_team_id ?? '',
                                  field: 'min',
                                  value: parseNum(e.target.value),
                                })
                              }
                            />
                            <Input
                              type="number"
                              placeholder="Max"
                              className="w-16 text-center border border-muted rounded p-2"
                              value={state.teamLimits[m.home_team_id ?? '']?.max ?? ''}
                              onChange={e =>
                                dispatchForm({
                                  type: 'SET_TEAM_LIMIT',
                                  teamId: m.home_team_id ?? '',
                                  field: 'max',
                                  value: parseNum(e.target.value),
                                })
                              }
                            />
                          </div>
                        </div>

                        {/* Game-level totals + limit opposing */}
                        <div className="flex justify-around w-full pb-2">
                          <div className="flex items-center justify-center gap-2 w-1/2 mt-2">
                            <div className="text-center">
                              <p className="text-xs mb-2">Players from game</p>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  placeholder="Min"
                                  className="w-16 text-center border border-muted rounded p-2"
                                  value={state.gameLimits[m.id]?.min ?? ''}
                                  onChange={e =>
                                    dispatchForm({
                                      type: 'SET_GAME_LIMIT',
                                      matchupId: m.id,
                                      field: 'min',
                                      value: parseNum(e.target.value),
                                    })
                                  }
                                />
                                <Input
                                  type="number"
                                  placeholder="Max"
                                  className="w-16 text-center border border-muted rounded p-2"
                                  value={state.gameLimits[m.id]?.max ?? ''}
                                  onChange={e =>
                                    dispatchForm({
                                      type: 'SET_GAME_LIMIT',
                                      matchupId: m.id,
                                      field: 'max',
                                      value: parseNum(e.target.value),
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center w-1/2 mt-2">
                            <div className="text-center">
                              <p className="text-xs mb-2">Limit Opposing Players (vs. QB/RB/WR/TE)</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="Max"
                                className="w-16 text-center border border-muted rounded p-2"
                                value={state.limitOpposing[m.id] ?? ''}
                                onChange={e =>
                                  dispatchForm({
                                    type: 'SET_LIMIT_OPPOSING',
                                    teamId: m.id, // or use teamId as needed for your downstream logic
                                    value: parseNum(e.target.value),
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-3 border-t border-accent bg-background rounded-b-md">
                  <button className="w-full btn-accent disabled:opacity-50" onClick={save} disabled={true}>
                    Save Team Settings
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="position-stacks">Position Stacks content</TabsContent>
          <TabsContent value="team-stacks">Team Stacks content</TabsContent>
          <TabsContent value="groups">Groups content</TabsContent>
        </Tabs>
      </div>
    </DialogContent>
  )
}
