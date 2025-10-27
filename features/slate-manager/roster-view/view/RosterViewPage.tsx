'use client'

import { ClipboardCheck, Edit, Loader, LucideIcon, Trash2, Upload } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { ROSTER_SLOTS } from '@/shared/constants/slots'
import { ExportLineup, Slot } from '@/shared/types/exportTypes'
import { SkeletonBlocks } from '@/shared/ui/SkeletonBlocks'
import { exportLineupsToCsv } from '@/shared/utils/exportLineupsToCsv'
import { GameType } from '@/types/gameType'

import {
  useDeleteRosterMutation,
  useGetRosterQuery,
  useUpdateRosterMutation,
} from '../../_api/roster.api'
import { useGetSlateQuery } from '../../_api/slates.api'
import { RosterFormValues } from '../../_schema/rosterForm.schema'
import { RosterSlot, RosterView } from '../../_types/roster'
import EditRosterModal from '../ui/EditRosterModal'
import { RosterItem } from '../ui/RosterItem'
import { ROSTER_TYPE_META, RosterType } from '../ui/RosterTypeMeta'

const TYPE_ORDER: (RosterType | 'unknown')[] = ['cash', 'gpp', 'se', 'hybrid', '20-max', 'unknown']

const rankType = (t: RosterType | 'unknown') => {
  const i = TYPE_ORDER.indexOf(t)
  return i === -1 ? TYPE_ORDER.length : i
}

type Sport = 'NFL' | 'CFB'

const SLOT_PRESETS = {
  'NFL:classic': ['QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'TE', 'FLEX', 'DST'],
  'NFL:showdown': ['CPT', 'UTIL', 'UTIL', 'UTIL', 'UTIL', 'UTIL'],
  'CFB:classic': ['QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'FLEX', 'SFLX'],
  'CFB:showdown': ['CPT', 'UTIL', 'UTIL', 'UTIL', 'UTIL', 'UTIL'],
} as const satisfies Record<`${Sport}:${GameType}`, readonly Slot[]>

export default function RosterViewPage() {
  const { id } = useParams() as { id: string }
  const { data: slate } = useGetSlateQuery(id)
  const { data: rosters = [], isLoading } = useGetRosterQuery({ slateId: id })
  const [updateRoster, { isLoading: isUpdating }] = useUpdateRosterMutation()
  const [deleteRoster, { isLoading: isDeleting }] = useDeleteRosterMutation()
  const [editRoster, setEditRoster] = useState<RosterView | null>(null)
  const [typeFilter, setTypeFilter] = useState<'ALL' | RosterType>('ALL')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleEditRoster = (roster: RosterView) => setEditRoster(roster)
  const handleSubmitRoster = async (values: RosterFormValues) => {
    if (!editRoster) return

    try {
      await updateRoster({
        rosterId: editRoster.id,
        rosterValues: { name: values.roster_name, type: values.roster_type },
      })
      setEditRoster(null)
      toast({
        title: 'Roster Updated',
        description: 'The roster has been updated successfully',
        variant: 'default',
      })
    } catch {
      toast({ title: 'Update failed', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setEditRoster(null)
    }
  }

  const grouped = useMemo(() => {
    const buckets = new Map<RosterType | 'unknown', RosterView[]>()

    for (const r of rosters) {
      const t = (r.type ?? 'unknown') as RosterType | 'unknown'
      if (!buckets.has(t)) buckets.set(t, [])
      buckets.get(t)!.push(r)
    }

    return Array.from(buckets.entries()).sort(([a], [b]) => rankType(a) - rankType(b))
  }, [rosters])

  const visibleGroups = useMemo(() => {
    if (typeFilter === 'ALL') return grouped
    return grouped.filter(([t]) => t === typeFilter)
  }, [grouped, typeFilter])

  const onExportLineups = useCallback(
    (rosters: RosterView[]) => {
      if (!slate || !rosters) return

      const sport = slate.sport as Sport
      const mode =
        slate.contest_type_id === 94 || slate.contest_type_id === 21 ? 'classic' : 'showdown'

      const key = `${sport}:${mode}` as const
      const slotOrder = SLOT_PRESETS[key as keyof typeof SLOT_PRESETS]

      const lineups: ExportLineup[] = rosters.map(roster => ({
        players: roster.roster_players.map(player => {
          const lineup_position: Slot = ROSTER_SLOTS[sport].find(
            slot => slot.key === player.slot_position,
          )?.position as Slot

          return {
            id: player.player_id,
            name: player.player_name,
            pos: player.position,
            lineup_position: lineup_position,
            fe_draftable_id: player.draftable_id,
          }
        }),
      }))

      exportLineupsToCsv(lineups as unknown as ExportLineup[], {
        slotOrder,
        filename: `${sport}-${mode}-lineups.csv`,
      })
    },
    [slate],
  )

  const handleRemoveRoster = async (rosterId: string) => {
    setDeletingId(rosterId)
    try {
      await deleteRoster({ rosterId }).unwrap()
      setEditRoster(null)
      toast({
        title: 'Roster Deleted',
        description: 'The roster has been deleted successfully',
        variant: 'default',
      })
    } catch {
      toast({ title: 'Delete failed', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col bg-background pt-3 rounded-tl-[40px] min-h-[calc(100vh-90px)] overflow-y-auto">
      <div className="flex flex-col py-4 px-6 text-muted">
        <div className="flex flex-col justify-between mb-2 text-foreground">
          <div className="flex items-center gap-2 mb-2">
            <span>
              <ClipboardCheck size={20} />
            </span>
            <h1 className="text-xl font-bold uppercase">Roster Export</h1>
          </div>
          <p className="text-muted text-sm">
            The player pool is a list of players that you have targeted for your slate. From here
            you can filter, sort, edit and delete targets in your pool.
          </p>
        </div>

        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col gap-3 mt-2">
            <p className="text-[11px] uppercase text-muted font-bold -mb-2 px-1">Filter by Type</p>
            <Select value={typeFilter} onValueChange={v => setTypeFilter(v as 'ALL' | RosterType)}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="ALL" />
              </SelectTrigger>
              <SelectContent className="bg-background-darker">
                <SelectItem value="ALL">ALL</SelectItem>
                {TYPE_ORDER.filter(t => t !== 'unknown').map(t => (
                  <SelectItem key={t} value={t}>
                    {ROSTER_TYPE_META[t as RosterType].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="btn-accent"
            onClick={() => onExportLineups(rosters)}
            disabled={rosters.length === 0}
          >
            <Upload className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      <div className="space-y-6 px-6">
        {isLoading ? (
          <div className="flex flex-wrap gap-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonBlocks key={i} height={600} width={500} />
            ))}
          </div>
        ) : rosters.length === 0 ? (
          <div className="flex flex-col items-center justify-center max-w-[350px] mx-auto pt-24 space-y-2">
            <h2 className="text-muted text-center text-lg font-bold opacity-70">
              No Rosters found
            </h2>
            <p className="text-muted text-center text-sm opacity-50">
              You currently have no rosters for this slate. You can create a roster by selecting the
              build button in the side navigation.
            </p>
          </div>
        ) : visibleGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center max-w-[350px] mx-auto pt-24 space-y-2">
            <h2 className="text-muted text-center text-lg font-bold opacity-70">
              No {typeFilter} rosters found
            </h2>
            <p className="text-muted text-center text-sm opacity-50">
              You currently have no {typeFilter} rosters. Try changing the filter to see other
              types.
            </p>
          </div>
        ) : (
          visibleGroups.map(([typeKey, list]) => {
            const isKnown = typeKey !== 'unknown'
            const meta = isKnown ? ROSTER_TYPE_META[typeKey as RosterType] : null
            const LabelIcon = isKnown ? (meta!.Icon as LucideIcon) : null
            const label = isKnown ? meta!.label : 'Unknown'

            return (
              <section key={typeKey} className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-sm font-bold text-foreground bg-card rounded border-b-4 border-background-darker p-2">
                  <div className="flex items-center gap-2">
                    {LabelIcon && <LabelIcon size={16} className="text-accent" />}
                    <span className="uppercase">{label}</span>
                    <span className="text-muted">({list.length})</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-transparent hover:brightness-125"
                    onClick={() => onExportLineups(list)}
                  >
                    <Upload className="text-accent" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-4">
                  {list.map((roster: RosterView) => {
                    const totalProjections = roster.roster_players.reduce(
                      (acc: number, p: RosterSlot) => acc + (p.projection ?? 0),
                      0,
                    )
                    return (
                      <div key={roster.id} className="mb-6 w-[500px]">
                        <div className="flex items-center justify-between text-sm font-black text-foreground uppercase border-b border-accent py-1 pr-3 pl-3 bg-card rounded-t">
                          <p>{roster.name ? roster.name : 'Unnamed Roster'}</p>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-transparent hover:brightness-125"
                              onClick={() => handleEditRoster(roster)}
                            >
                              <Edit className="text-blue-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-transparent hover:brightness-125"
                              onClick={() => handleRemoveRoster(roster.id)}
                              disabled={deletingId === roster.id}
                            >
                              {deletingId === roster.id || isLoading ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="text-destructive" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          {roster.roster_players.map((player: RosterSlot) => (
                            <RosterItem
                              key={player.id}
                              player={player}
                              sport={slate?.sport as Sport}
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold text-foreground pr-4 pl-3 py-3 bg-card rounded-b border-t border-border">
                          <p>Total Salary: ${roster.total_salary.toLocaleString('en-US')}</p>
                          <p>Projections: {totalProjections.toFixed(1)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })
        )}
      </div>

      {editRoster && (
        <EditRosterModal
          open={!!editRoster}
          onClose={() => setEditRoster(null)}
          selectedRoster={editRoster as RosterView}
          handleSubmitRoster={handleSubmitRoster}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
          handleRemoveRoster={handleRemoveRoster}
        />
      )}
    </div>
  )
}
