'use client'

import { Hammer, Loader, Lock, X } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ROSTER_SLOTS } from '@/shared/constants/slots'
import { toast } from '@/shared/hooks/useToast'

import { useSaveRosterMutation } from '../../_api/roster.api'
import { TargetPool } from '../../_types/targetPool'

const SALARY_CAP = 50000

type Sport = 'NFL' | 'CFB'

interface RosterBuilderProps {
  showProjections: boolean
  roster: Record<string, TargetPool | null>
  setRoster: React.Dispatch<React.SetStateAction<Record<string, TargetPool | null>>>
  restorePlayerToPool: (player: TargetPool) => void
  userTargets: TargetPool[]
  setPlayerPool: (playerPool: TargetPool[]) => void
  sport: Sport
}

export default function RosterBuilder({
  showProjections,
  roster,
  setRoster,
  restorePlayerToPool,
  userTargets,
  setPlayerPool,
  sport,
}: RosterBuilderProps) {
  const { id: slateId } = useParams() as { id: string }
  const [saveRoster, { isLoading: isSaving }] = useSaveRosterMutation()
  const [rosterName, setRosterName] = useState('')
  const [rosterType, setRosterType] = useState('')

  const slots = useMemo(() => (sport ? ROSTER_SLOTS[sport] : []), [sport])
  const formDefaults = useMemo(
    () => Object.fromEntries(slots.map(s => [s.key, null] as const)),
    [slots],
  )

  const { control, reset, handleSubmit, watch, setValue } = useForm<
    Record<string, TargetPool | null>
  >({
    defaultValues: formDefaults,
    shouldUnregister: true,
  })

  useEffect(() => {
    reset(formDefaults)
  }, [reset, formDefaults])

  const values = watch()

  useEffect(() => {
    if (!roster || Object.keys(roster).length === 0) return
    Object.entries(roster).forEach(([key, player]) => {
      setValue(key, player as TargetPool | null)
    })
  }, [roster, setValue])

  const getName = (
    first_name: string,
    last_name: string,
    positionKey: string,
    team_name: string,
  ) => {
    if (positionKey === 'DST') return team_name || ''
    if (!first_name || !last_name) return ''
    return `${first_name} ${last_name}`
  }

  const totalSalary = Object.values(values).reduce((sum, player) => sum + (player?.salary || 0), 0)
  const totalProjection = Object.values(values).reduce(
    (sum, player) => sum + (player?.projection || 0),
    0,
  )
  const isOverCap = totalSalary > SALARY_CAP
  const isIncomplete = Object.values(values).some(player => player == null)

  const onSubmit = async (data: Record<string, TargetPool | null>) => {
    try {
      await saveRoster({
        slateId,
        name: rosterName,
        type: rosterType,
        totalSalary: totalSalary,
        roster: Object.fromEntries(
          Object.entries(data).map(([key, player]) => [
            key,
            {
              player_id: player!.player_id!.toString(),
              draftable_id: player!.draftable_id!.toString(),
              player_name: getName(
                player!.first_name || '',
                player!.last_name || '',
                player!.position || '',
                player!.team_name || '',
              ),
              slate_player_id: player!.slate_player_id!,
              slot_key: key,
              position: player!.position || '',
              salary: player!.salary!,
              target_type: player!.target_type!,
              stack_candidate: player!.stack_candidate!,
              team_name: player!.team_name || '',
              slot_position: key,
            },
          ]),
        ),
      })

      toast({
        title: 'Roster Saved Successfully!',
        description: `Your roster has been saved.`,
        variant: 'default',
      })
      reset()
      setRoster({})
      setPlayerPool(userTargets)
      setRosterName('')
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error Saving Roster',
        description: `There was an error saving your roster.`,
        variant: 'default',
      })
    }
  }

  return (
    <div className="py-4">
      <h4 className="uppercase font-semibold mb-2 flex items-center text-sm">
        <Hammer className="w-4 h-4 mr-2" /> Roster Construction
      </h4>
      <Separator className="bg-accent mb-4" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-6 flex gap-4 pt-2">
          {/* Roster Name */}
          <div className="flex-1">
            <p className="text-[11px] text-muted uppercase font-bold">Roster Name</p>
            <Input
              type="text"
              placeholder="Enter Roster Name..."
              className="text-xs placeholder:text-[12px] text-muted mt-2"
              value={rosterName}
              onChange={e => setRosterName(e.target.value)}
            />
          </div>

          {/* Roster Type */}
          <div className="w-[160px]">
            <p className="text-[11px] text-muted uppercase font-bold">Roster Type</p>
            <Select value={rosterType} onValueChange={setRosterType}>
              <SelectTrigger className="text-xs my-2 text-muted">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-background-darker">
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="gpp">GPP</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="20-max">20-Max</SelectItem>
                <SelectItem value="150-max">150-Max</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          {slots?.map(slot => {
            return (
              <Controller
                key={slot.key}
                name={slot.key}
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-center bg-background-secondary px-3 rounded text-sm">
                    <div className="w-20 font-bold text-center">{slot.position}</div>
                    <div className="w-[4px] h-[56px] bg-background mx-2" />
                    <div className="flex flex-col w-full">
                      <input
                        type="text"
                        value={
                          field.value
                            ? getName(
                                field.value.first_name || '',
                                field.value.last_name || '',
                                slot.position,
                                field.value.team_name || '',
                              )
                            : ''
                        }
                        readOnly
                        className="bg-transparent border-none w-full text-foreground px-2 pointer-events-none"
                      />
                      {field.value && (
                        <p className="px-2 text-xs text-muted">
                          {field.value?.position} — {field.value?.team_name}
                        </p>
                      )}
                    </div>
                    <div className="w-14 text-center pr-4">
                      <div className="flex flex-col items-center">
                        {field.value && (
                          <>
                            <span className="text-[11px] font-bold text-muted uppercase">Proj</span>
                            {showProjections && field.value ? (
                              <>
                                <p className="font-bold text-xs">
                                  {field.value?.projection ?? '—'}
                                </p>
                              </>
                            ) : !showProjections && field.value ? (
                              <Lock className="w-4 h-4 mx-auto text-muted" />
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-center mr-4">
                      {field.value && (
                        <>
                          <span className="text-[11px] font-bold text-muted uppercase">Salary</span>
                          <p className="font-bold text-xs">
                            {field.value?.salary
                              ? `$${field.value.salary.toLocaleString('en-US')}`
                              : '—'}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="w-24 text-center">
                      {field.value && (
                        <button
                          type="button"
                          onClick={() => {
                            setValue(slot.key, null)
                            setRoster(prev => {
                              const copy = { ...prev }
                              delete copy[slot.key]
                              return copy
                            })
                            if (field.value) {
                              restorePlayerToPool(field.value)
                            }
                          }}
                          className="bg-background-darker border border-destructive opacity-80 font-black py-1.5 px-2.5 rounded transition-all duration-300 hover:opacity-100"
                        >
                          <X className="w-4 h-4 text-destructive" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              />
            )
          })}
        </div>

        <div className="flex justify-between gap-4 mt-6 items-center">
          <div
            className={`px-2 text-sm font-bold ${isOverCap ? 'text-destructive' : 'text-foreground'}`}
          >
            <div className="flex flex-col items-start gap-1">
              <div className="text-lg">Total Salary: ${totalSalary.toLocaleString('en-US')}</div>
              <div className="text-sm text-muted">
                Remaining: ${(SALARY_CAP - totalSalary).toLocaleString('en-US')}
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset(formDefaults)
                setRoster({})
                setPlayerPool(userTargets)
                setRosterName('')
                setRosterType('')
              }}
              className="hover:bg-background hover:text-destructive"
            >
              Clear Roster
            </Button>
            <Button
              className="btn-accent"
              type="submit"
              disabled={isOverCap || isIncomplete || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                'Save Roster'
              )}
            </Button>
          </div>
        </div>

        <div className="mt-4 text-xs flex justify-end gap-6 text-muted-foreground">
          {/* <div className="flex items-center gap-1">
            <span className="text-muted font-bold">Ownership:</span>{' '}
            {showProjections ? 'N/A' : <Lock className="inline w-3 h-3" />}
          </div> */}
          <div className="flex items-center gap-1">
            <span className="text-muted font-bold">Total Projection:</span>{' '}
            {showProjections ? totalProjection.toFixed(1) : <Lock className="inline w-3 h-3" />}
          </div>
        </div>
      </form>
    </div>
  )
}
